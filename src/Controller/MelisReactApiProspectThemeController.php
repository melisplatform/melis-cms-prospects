<?php

namespace MelisCmsProspects\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;
use MelisCore\Controller\MelisReactKeysetListTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour l'outil Thèmes de MelisCmsProspects (table melis_cms_prospects_themes).
 *
 * Couche API (shared) du back-office React ; l'UI est livrée par une BRIQUE du module
 * MelisCmsProspects (gating modulaire). Calqué sur MelisReactApiProspectController
 * (gabarit "module tool, brick-hosted"), mais FULL CRUD (l'outil Thèmes permet la
 * création, contrairement à Prospects).
 *
 * Routes :
 *   GET    /melis/react-api/prospect-themes            → liste paginée + recherche
 *   GET    /melis/react-api/prospect-themes/stats      → statistiques (cartes KPI)
 *   GET    /melis/react-api/prospect-themes/:id        → détail
 *   POST   /melis/react-api/prospect-themes/save       → créer / mettre à jour
 *   DELETE /melis/react-api/prospect-themes/delete/:id → supprimer (+ items + trads)
 *
 * Règles métier (reprises du legacy MelisCmsProspectsThemesController) :
 *   - pros_theme_name requis, max 45, UNIQUE.
 *   - pros_theme_code optionnel, max 45, UNIQUE quand renseigné.
 *   - suppression : cascade sur melis_cms_prospects_theme_items (+ *_trans) du thème.
 */
class MelisReactApiProspectThemeController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;
    use MelisReactKeysetListTrait;

    /** melisKey of the RIGHTS-BEARING menu node — the access guard AND the capability key.
     *  MUST stay in sync with config/react.capabilities.php. NOT `MelisCmsProspects_tool_themes`
     *  (that is the `conf.type` target, kept as the renderable ZONE key / iframe) — guarding on it
     *  would 403 every request since it is not granted on its own. Cf. gabarit Prospects. */
    private const MELIS_KEY = 'melisprospects_tool_themes_section';

    private const LOG_ADD    = 'CMS_PROSPECTS_THEME_ADD';
    private const LOG_UPDATE = 'CMS_PROSPECTS_THEME_UPDATE';
    private const LOG_DELETE = 'CMS_PROSPECTS_THEME_DELETE';

    private const LOG_ITEM_ADD    = 'CMS_PROSPECTS_THEME_ITEM_ADD';
    private const LOG_ITEM_UPDATE = 'CMS_PROSPECTS_THEME_ITEM_UPDATE';
    private const LOG_ITEM_DELETE = 'CMS_PROSPECTS_THEME_ITEM_DELETE';

    // ─── GET /prospect-themes ───────────────────────────────────────────────────

    public function listAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $limit  = min(9999, max(1, (int) $this->params()->fromQuery('limit', 25)));
            $search = trim((string) ($this->params()->fromQuery('search', '') ?? ''));
            $sort   = (string) $this->params()->fromQuery('sort', 'id');
            $dir    = (string) $this->params()->fromQuery('dir', 'desc');
            $after  = (string) $this->params()->fromQuery('after', '');

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            $where  = [];
            $params = [];
            if ($search !== '') {
                $like    = '%' . $search . '%';
                $where[] = '(t.pros_theme_name LIKE ? OR t.pros_theme_code LIKE ?)';
                $params  = array_merge($params, [$like, $like]);
            }

            // item_count via sous-requête corrélée (au lieu de JOIN + GROUP BY) → une seule ligne
            // par thème, pour que le COUNT(*) du trait reste juste et que le keyset fonctionne.
            $itemCountExpr = '(SELECT COUNT(*) FROM melis_cms_prospects_theme_items i WHERE i.pros_theme_id = t.pros_theme_id)';

            // Whitelist des colonnes triables (expr SQL NON-NULL).
            $sortMap = [
                'id'    => 't.pros_theme_id',
                'name'  => "COALESCE(t.pros_theme_name,'')",
                'items' => 'COALESCE(' . $itemCountExpr . ', 0)',
            ];

            [$rows, $total, $next] = $this->keysetList([
                'db'           => $db,
                'from'         => 'melis_cms_prospects_themes t',
                'joins'        => '',
                'selectCols'   => "t.pros_theme_id, t.pros_theme_name, t.pros_theme_code, $itemCountExpr AS item_count",
                'filterWhere'  => $where,
                'filterParams' => $params,
                'sortMap'      => $sortMap,
                'idCol'        => 't.pros_theme_id',
                'idAlias'      => 'pros_theme_id',
                'sortKey'      => $sort,
                'dir'          => $dir,
                'after'        => $after,
                'limit'        => $limit,
            ]);

            $items = [];
            foreach ($rows as $row) {
                $items[] = $this->formatTheme((array) $row);
            }

            return $this->jsonResponse([
                'success' => true,
                'data'    => ['items' => $items, 'total' => $total, 'nextCursor' => $next],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /prospect-themes/stats ─────────────────────────────────────────────

    public function statsAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            $total = (int) (iterator_to_array($db->query(
                'SELECT COUNT(*) AS total FROM melis_cms_prospects_themes', []
            ))[0]['total'] ?? 0);

            $withCode = (int) (iterator_to_array($db->query(
                "SELECT COUNT(*) AS total FROM melis_cms_prospects_themes
                 WHERE pros_theme_code IS NOT NULL AND pros_theme_code <> ''",
                []
            ))[0]['total'] ?? 0);

            $itemsTotal = (int) (iterator_to_array($db->query(
                'SELECT COUNT(*) AS total FROM melis_cms_prospects_theme_items', []
            ))[0]['total'] ?? 0);

            return $this->jsonResponse([
                'success' => true,
                'data'    => ['total' => $total, 'withCode' => $withCode, 'items' => $itemsTotal],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /prospect-themes/:id ───────────────────────────────────────────────

    public function getAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }

        $id = (int) $this->params()->fromRoute('id', 0);
        if ($id <= 0) {
            return $this->jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
        }

        try {
            $db   = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $rows = iterator_to_array($db->query(
                "SELECT t.pros_theme_id, t.pros_theme_name, t.pros_theme_code,
                        (SELECT COUNT(*) FROM melis_cms_prospects_theme_items i WHERE i.pros_theme_id = t.pros_theme_id) AS item_count
                 FROM melis_cms_prospects_themes t
                 WHERE t.pros_theme_id = ?",
                [$id]
            ));
            if (!$rows) {
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }
            return $this->jsonResponse([
                'success' => true,
                'data'    => $this->formatTheme((array) $rows[0]),
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /prospect-themes/save ─────────────────────────────────────────────

    public function saveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }

        try {
            $body = json_decode($this->getRequest()->getContent(), true) ?? [];
            $id   = (int) ($body['id'] ?? 0);

            // Création (id=0) → capacité `create` ; édition → `edit`.
            if ($denyCap = $this->denyUnlessCan($id > 0 ? 'edit' : 'create')) { return $denyCap; }

            $name = trim((string) ($body['name'] ?? ''));
            // Le formulaire React (parité legacy `prospects_theme_form`) ne saisit PAS le code.
            // Quand `code` est absent du payload : ne pas toucher `pros_theme_code`
            // (préservé en édition, NULL en création) — comme le save legacy.
            $hasCode = array_key_exists('code', $body);
            $code    = trim((string) ($body['code'] ?? ''));

            // Le legacy journalise AUSSI les échecs de save (success=0). Ce helper fire l'event
            // puis renvoie le 400 — parité MelisCmsProspectsThemesController::saveAction.
            $failType = $id > 0 ? self::LOG_UPDATE : self::LOG_ADD;
            $fail = function (string $error, string $messageKey = 'tr_melis_cms_prospects_theme_failed') use ($failType, $id) {
                $this->fireLog('meliscmsprospects_theme_save_end', 0, 'tr_melis_cms_prospects_theme', $messageKey, $failType, $id);
                return $this->jsonResponse(['success' => false, 'error' => $error], 400);
            };

            if ($name === '') {
                return $fail('Le nom du thème est obligatoire.');
            }
            if (mb_strlen($name) > 45) {
                return $fail('Le nom du thème ne peut dépasser 45 caractères.');
            }
            if ($hasCode && mb_strlen($code) > 45) {
                return $fail('Le code du thème ne peut dépasser 45 caractères.');
            }

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            if ($id > 0) {
                $current = iterator_to_array($db->query(
                    'SELECT pros_theme_id FROM melis_cms_prospects_themes WHERE pros_theme_id = ?', [$id]
                ));
                if (!$current) {
                    return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
                }
            }

            // Unicité du nom (hors ligne courante).
            $dupName = iterator_to_array($db->query(
                'SELECT pros_theme_id FROM melis_cms_prospects_themes WHERE pros_theme_name = ? AND pros_theme_id <> ?',
                [$name, $id]
            ));
            if ($dupName) {
                return $fail('Un thème portant ce nom existe déjà.');
            }

            // Unicité du code (hors ligne courante) quand renseigné.
            if ($hasCode && $code !== '') {
                $dupCode = iterator_to_array($db->query(
                    'SELECT pros_theme_id FROM melis_cms_prospects_themes WHERE pros_theme_code = ? AND pros_theme_id <> ?',
                    [$code, $id]
                ));
                if ($dupCode) {
                    return $fail('Un thème portant ce code existe déjà.', 'tr_melis_cms_prospects_theme_code_exists');
                }
            }

            if ($id > 0) {
                if ($hasCode) {
                    $db->query(
                        'UPDATE melis_cms_prospects_themes SET pros_theme_name = ?, pros_theme_code = ? WHERE pros_theme_id = ?',
                        [$name, $code !== '' ? $code : null, $id]
                    );
                } else {
                    // `code` non fourni → on préserve `pros_theme_code` existant (parité legacy).
                    $db->query(
                        'UPDATE melis_cms_prospects_themes SET pros_theme_name = ? WHERE pros_theme_id = ?',
                        [$name, $id]
                    );
                }
                $logType = self::LOG_UPDATE;
            } else {
                $db->query(
                    'INSERT INTO melis_cms_prospects_themes (pros_theme_name, pros_theme_code) VALUES (?, ?)',
                    [$name, ($hasCode && $code !== '') ? $code : null]
                );
                $id = (int) iterator_to_array($db->query('SELECT LAST_INSERT_ID() AS id', []))[0]['id'];
                $logType = self::LOG_ADD;
            }

            // Journalisation legacy (listeners du module) — parité MelisCmsProspectsThemesController::saveAction.
            $this->fireLog('meliscmsprospects_theme_save_end', 1, 'tr_melis_cms_prospects_theme', 'tr_melis_cms_prospects_theme_success', $logType, $id);

            return $this->jsonResponse(['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── DELETE /prospect-themes/delete/:id ─────────────────────────────────────

    public function deleteAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('delete')) { return $denyCap; }

        $id = (int) $this->params()->fromRoute('id', 0);
        if ($id <= 0) {
            return $this->jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
        }

        try {
            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            if (!iterator_to_array($db->query('SELECT pros_theme_id FROM melis_cms_prospects_themes WHERE pros_theme_id = ?', [$id]))) {
                // Échec journalisé aussi (parité legacy removeAction : success=0 si introuvable).
                $this->fireLog('meliscmsprospects_theme_delete_end', 0, 'tr_melis_cms_prospects_theme', 'tr_melis_cms_prospects_theme_delete_failed', self::LOG_DELETE, $id);
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }

            // Cascade : traductions des items → items → thème (parité legacy removeAction, qui
            // supprimait thème + items ; on nettoie AUSSI les traductions pour éviter les orphelins).
            $db->query(
                'DELETE tr FROM melis_cms_prospects_theme_items_trans tr
                 INNER JOIN melis_cms_prospects_theme_items i ON i.pros_theme_item_id = tr.item_trans_theme_item_id
                 WHERE i.pros_theme_id = ?',
                [$id]
            );
            $db->query('DELETE FROM melis_cms_prospects_theme_items WHERE pros_theme_id = ?', [$id]);
            $db->query('DELETE FROM melis_cms_prospects_themes WHERE pros_theme_id = ?', [$id]);

            $this->fireLog('meliscmsprospects_theme_delete_end', 1, 'tr_melis_cms_prospects_theme', 'tr_melis_cms_prospects_theme_delete_success', self::LOG_DELETE, $id);

            return $this->jsonResponse(['success' => true, 'data' => null]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  ÉLÉMENTS DU THÈME (theme items) — sous-outil natif React
    //  Un « élément » = une ligne melis_cms_prospects_theme_items + un texte PAR LANGUE
    //  dans melis_cms_prospects_theme_items_trans (item_trans_lang_id = lang_cms_id).
    //  Capacités : sous-onglet `items.*` (cf. config/react.capabilities.php).
    // ════════════════════════════════════════════════════════════════════════════

    // ─── GET /prospect-themes/languages ─────────────────────────────────────────

    public function languagesAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }

        try {
            $db   = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $rows = iterator_to_array($db->query(
                'SELECT lang_cms_id, lang_cms_name, lang_cms_locale FROM melis_cms_lang ORDER BY lang_cms_id ASC',
                []
            ));
            $langs = array_map(fn ($r) => [
                'id'     => (int) $r['lang_cms_id'],
                'name'   => (string) $r['lang_cms_name'],
                'locale' => (string) $r['lang_cms_locale'],
            ], $rows);

            return $this->jsonResponse(['success' => true, 'data' => ['languages' => $langs]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /prospect-themes/items?themeId=X ───────────────────────────────────

    public function itemsAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('items.list')) { return $denyCap; }

        try {
            $themeId = (int) $this->params()->fromQuery('themeId', 0);
            if ($themeId <= 0) {
                return $this->jsonResponse(['success' => false, 'error' => 'Invalid themeId'], 400);
            }
            $search = trim((string) ($this->params()->fromQuery('search', '') ?? ''));

            $db     = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $langId = $this->currentCmsLangId($db);

            // Nom affiché = traduction de la langue courante, à défaut la 1ʳᵉ traduction disponible.
            $rows = iterator_to_array($db->query(
                "SELECT i.pros_theme_item_id,
                        COALESCE(cur.item_trans_text, fb.item_trans_text) AS name
                 FROM melis_cms_prospects_theme_items i
                 LEFT JOIN melis_cms_prospects_theme_items_trans cur
                        ON cur.item_trans_theme_item_id = i.pros_theme_item_id AND cur.item_trans_lang_id = ?
                 LEFT JOIN melis_cms_prospects_theme_items_trans fb
                        ON fb.item_trans_id = (
                            SELECT MIN(t2.item_trans_id) FROM melis_cms_prospects_theme_items_trans t2
                            WHERE t2.item_trans_theme_item_id = i.pros_theme_item_id
                        )
                 WHERE i.pros_theme_id = ?
                 ORDER BY i.pros_theme_item_id DESC",
                [$langId, $themeId]
            ));

            $items = [];
            foreach ($rows as $r) {
                $name = trim((string) ($r['name'] ?? ''));
                $items[] = [
                    'id'   => (int) $r['pros_theme_item_id'],
                    'name' => $name !== '' ? $name : ('#' . (int) $r['pros_theme_item_id']),
                ];
            }
            if ($search !== '') {
                $s = mb_strtolower($search);
                $items = array_values(array_filter($items, fn ($it) => mb_strpos(mb_strtolower($it['name']), $s) !== false));
            }

            return $this->jsonResponse(['success' => true, 'data' => ['items' => $items, 'total' => count($items)]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /prospect-themes/items/:id ─────────────────────────────────────────

    public function itemGetAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('items.edit')) { return $denyCap; }

        $id = (int) $this->params()->fromRoute('id', 0);
        if ($id <= 0) {
            return $this->jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
        }

        try {
            $db   = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $item = iterator_to_array($db->query(
                'SELECT pros_theme_item_id, pros_theme_id FROM melis_cms_prospects_theme_items WHERE pros_theme_item_id = ?',
                [$id]
            ));
            if (!$item) {
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }
            $trans = iterator_to_array($db->query(
                'SELECT item_trans_lang_id, item_trans_text FROM melis_cms_prospects_theme_items_trans WHERE item_trans_theme_item_id = ?',
                [$id]
            ));
            $translations = new \stdClass();
            foreach ($trans as $t) {
                $translations->{(string) (int) $t['item_trans_lang_id']} = (string) $t['item_trans_text'];
            }

            return $this->jsonResponse(['success' => true, 'data' => [
                'id'           => (int) $item[0]['pros_theme_item_id'],
                'themeId'      => (int) $item[0]['pros_theme_id'],
                'translations' => $translations,   // { langId: text }
            ]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /prospect-themes/items/save ───────────────────────────────────────

    public function itemSaveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }

        try {
            $body    = json_decode($this->getRequest()->getContent(), true) ?? [];
            $id      = (int) ($body['id'] ?? 0);
            $themeId = (int) ($body['themeId'] ?? 0);
            $trans   = is_array($body['translations'] ?? null) ? $body['translations'] : [];

            if ($denyCap = $this->denyUnlessCan($id > 0 ? 'items.edit' : 'items.create')) { return $denyCap; }

            if ($themeId <= 0) {
                return $this->jsonResponse(['success' => false, 'error' => 'Invalid themeId'], 400);
            }

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            if (!iterator_to_array($db->query('SELECT pros_theme_id FROM melis_cms_prospects_themes WHERE pros_theme_id = ?', [$themeId]))) {
                return $this->jsonResponse(['success' => false, 'error' => 'Theme not found'], 404);
            }

            // Normalise { langId: texte } (trim + coupe à 255).
            $clean = [];
            foreach ($trans as $langId => $text) {
                $lid = (int) $langId;
                if ($lid > 0) {
                    $clean[$lid] = mb_substr(trim((string) $text), 0, 255);
                }
            }
            // Au moins une traduction non vide (parité legacy saveItemAction : inputValidator).
            $hasAny = false;
            foreach ($clean as $txt) { if ($txt !== '') { $hasAny = true; break; } }
            if (!$hasAny) {
                $this->fireLog('meliscmsprospects_theme_item_save_end', 0, 'tr_melis_cms_prospects_theme_items', 'tr_melis_cms_prospects_theme_items_save_failed', $id > 0 ? self::LOG_ITEM_UPDATE : self::LOG_ITEM_ADD, $id);
                return $this->jsonResponse(['success' => false, 'error' => 'Au moins un nom (dans une langue) est obligatoire.'], 400);
            }

            if ($id > 0) {
                if (!iterator_to_array($db->query('SELECT pros_theme_item_id FROM melis_cms_prospects_theme_items WHERE pros_theme_item_id = ?', [$id]))) {
                    return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
                }
                $logType = self::LOG_ITEM_UPDATE;
            } else {
                $db->query('INSERT INTO melis_cms_prospects_theme_items (pros_theme_id) VALUES (?)', [$themeId]);
                $id = (int) iterator_to_array($db->query('SELECT LAST_INSERT_ID() AS id', []))[0]['id'];
                $logType = self::LOG_ITEM_ADD;
            }

            // Upsert par langue : texte vide → on supprime la traduction ; sinon insert/update.
            foreach ($clean as $lid => $txt) {
                $existing = iterator_to_array($db->query(
                    'SELECT item_trans_id FROM melis_cms_prospects_theme_items_trans WHERE item_trans_theme_item_id = ? AND item_trans_lang_id = ?',
                    [$id, $lid]
                ));
                if ($txt === '') {
                    if ($existing) {
                        $db->query('DELETE FROM melis_cms_prospects_theme_items_trans WHERE item_trans_id = ?', [(int) $existing[0]['item_trans_id']]);
                    }
                    continue;
                }
                if ($existing) {
                    $db->query('UPDATE melis_cms_prospects_theme_items_trans SET item_trans_text = ? WHERE item_trans_id = ?', [$txt, (int) $existing[0]['item_trans_id']]);
                } else {
                    $db->query(
                        'INSERT INTO melis_cms_prospects_theme_items_trans (item_trans_text, item_trans_lang_id, item_trans_theme_item_id) VALUES (?, ?, ?)',
                        [$txt, $lid, $id]
                    );
                }
            }

            // Journalisation legacy (listeners) — parité MelisCmsProspectsThemeItemsController::saveItemAction.
            $this->fireLog('meliscmsprospects_theme_item_save_end', 1, 'tr_melis_cms_prospects_theme_items', 'tr_melis_cms_prospects_theme_items_save_success', $logType, $id);

            return $this->jsonResponse(['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── DELETE /prospect-themes/items/delete/:id ───────────────────────────────

    public function itemDeleteAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('items.delete')) { return $denyCap; }

        $id = (int) $this->params()->fromRoute('id', 0);
        if ($id <= 0) {
            return $this->jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
        }

        try {
            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            if (!iterator_to_array($db->query('SELECT pros_theme_item_id FROM melis_cms_prospects_theme_items WHERE pros_theme_item_id = ?', [$id]))) {
                $this->fireLog('meliscmsprospects_theme_delete_end', 0, 'tr_melis_cms_prospects_theme_items', 'tr_melis_cms_prospects_theme_item_delete_failed', self::LOG_ITEM_DELETE, $id);
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }
            $db->query('DELETE FROM melis_cms_prospects_theme_items_trans WHERE item_trans_theme_item_id = ?', [$id]);
            $db->query('DELETE FROM melis_cms_prospects_theme_items WHERE pros_theme_item_id = ?', [$id]);

            // ⚠️ Le legacy (MelisCmsProspectsThemeItemsController::removeAction) déclenche
            // `meliscmsprospects_theme_delete_end` (PAS `_item_delete_end`) pour la suppression d'un
            // ÉLÉMENT — et c'est CE nom que MelisCmsProspectFlashMessengerListener écoute. On le
            // reprend tel quel (typeCode CMS_PROSPECTS_THEME_ITEM_DELETE) sinon rien n'est journalisé.
            $this->fireLog('meliscmsprospects_theme_delete_end', 1, 'tr_melis_cms_prospects_theme_items', 'tr_melis_cms_prospects_theme_item_delete_success', self::LOG_ITEM_DELETE, $id);

            return $this->jsonResponse(['success' => true, 'data' => null]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    /** Id de langue CMS (lang_cms_id) courant, dérivé du locale de session BO. */
    private function currentCmsLangId($db): int
    {
        try {
            $c      = new \Laminas\Session\Container('meliscore');
            $locale = (string) ($c['melis-lang-locale'] ?? 'en_EN');
            $row    = iterator_to_array($db->query('SELECT lang_cms_id FROM melis_cms_lang WHERE lang_cms_locale = ? LIMIT 1', [$locale]));
            if ($row) {
                return (int) $row[0]['lang_cms_id'];
            }
        } catch (\Throwable) {}
        return 1;
    }

    private function formatTheme(array $r): array
    {
        return [
            'id'        => (int) $r['pros_theme_id'],
            'name'      => (string) $r['pros_theme_name'],
            'code'      => isset($r['pros_theme_code']) && $r['pros_theme_code'] !== null ? (string) $r['pros_theme_code'] : null,
            'itemCount' => isset($r['item_count']) ? (int) $r['item_count'] : 0,
        ];
    }

    private function isAuthenticated(): bool
    {
        return $this->getServiceManager()->get('MelisCoreAuth')->hasIdentity();
    }

    /** Traduit une clé `tr_...` dans la locale courante — parité exacte avec le legacy, qui
     *  journalise le TEXTE résolu (`$this->tool()->getTranslation(...)`), pas la clé brute. */
    private function tr(string $key): string
    {
        try {
            return (string) $this->getServiceManager()->get('translator')->translate($key);
        } catch (\Throwable) {
            return $key;
        }
    }

    /**
     * Déclenche l'événement de journalisation legacy (→ MelisCmsProspectFlashMessengerListener →
     * MelisGeneralListener::logMessages → MelisFlashMessengerController::log → MelisCoreLogService).
     * Le listener n'écoute QUE : meliscmsprospects_theme_save_end / _delete_end /
     * meliscmsprospects_theme_item_save_end / _theme_code_save_end — n'inventez pas d'autre nom.
     * Fire sur SUCCÈS et sur ÉCHEC (success=0), comme le legacy.
     */
    private function fireLog(string $event, int $success, string $titleKey, string $messageKey, string $typeCode, int $itemId): void
    {
        $this->getEventManager()->trigger($event, $this, [
            'success'     => $success,
            'errors'      => [],
            'textTitle'   => $this->tr($titleKey),
            'textMessage' => $this->tr($messageKey),
            'typeCode'    => $typeCode,
            'itemId'      => $itemId,
        ]);
    }

    /**
     * Garde de droits : chaque endpoint exige l'ACCÈS à l'outil (rights key
     * `melisprospects_tool_themes_section`), pas seulement une session — ferme la back-door
     * API/URL (cf. gabarit Users/Prospects). 401/403/null.
     */
    private function denyUnlessAccess(): ?HttpResponse
    {
        if (!$this->isAuthenticated()) {
            return $this->jsonResponse(['success' => false, 'error' => 'Unauthenticated'], 401);
        }
        try {
            if (!$this->getServiceManager()->get('MelisCoreRights')->canAccess(self::MELIS_KEY)) {
                return $this->jsonResponse(['success' => false, 'error' => 'Forbidden'], 403);
            }
        } catch (\Throwable) {}
        return null;
    }

    private function jsonResponse(array $data, int $status = 200): HttpResponse
    {
        /** @var HttpResponse $response */
        $response = $this->getResponse();
        $response->setStatusCode($status);
        $response->getHeaders()->addHeaders([
            'Content-Type'           => 'application/json; charset=utf-8',
            'X-Content-Type-Options' => 'nosniff',
        ]);
        $response->setContent(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return $response;
    }

    private function errorResponse(\Throwable $e, int $status = 500): HttpResponse
    {
        return $this->jsonResponse([
            'success' => false,
            'error'   => $e->getMessage(),
            'file'    => basename($e->getFile()) . ':' . $e->getLine(),
        ], $status);
    }
}
