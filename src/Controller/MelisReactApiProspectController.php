<?php

namespace MelisCmsProspects\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour l'outil Prospects de MelisCmsProspects (table melis_cms_prospects).
 *
 * Couche API (shared) du back-office React ; l'UI est livrée par une BRIQUE du module
 * MelisCmsProspects (gating modulaire). Calqué sur MelisReactApiSiteRedirectController
 * (gabarit "module tool, brick-hosted").
 *
 * Routes :
 *   GET    /melis/react-api/prospects              → liste paginée + recherche + filtres site/type
 *   GET    /melis/react-api/prospects/stats        → statistiques (cartes KPI)
 *   GET    /melis/react-api/prospects/sites        → options du filtre de site
 *   GET    /melis/react-api/prospects/types        → options du filtre de type (valeurs distinctes)
 *   GET    /melis/react-api/prospects/:id          → détail
 *   POST   /melis/react-api/prospects/save         → mettre à jour (PAS de création : un
 *          prospect est créé uniquement par le formulaire de contact public)
 *   DELETE /melis/react-api/prospects/delete/:id   → supprimer
 *
 * Règles métier (reprises du legacy ToolProspectsController::updateProspectDataAction) :
 *   - pros_name / pros_email / pros_telephone / pros_message requis.
 *   - pros_email : format email valide.
 *   - pros_telephone : caractères autorisés ^[0-9()/+ -]*$.
 *   - pros_contact_date et pros_type sont IMMUABLES depuis ce formulaire — ils sont fixés
 *     à la création par le plugin de contact front-office et ne doivent JAMAIS être modifiés
 *     par un admin ; le payload envoyé pour ces deux champs est toujours ignoré côté serveur.
 */
class MelisReactApiProspectController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;

    /** melisKey de l'outil — utilisé par le garde de droits (cf. denyUnlessAccess). */
    private const MELIS_KEY = 'MelisCmsProspects_tool_prospects';

    // ─── GET /prospects ────────────────────────────────────────────────────────

    public function listAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $page   = max(1, (int) $this->params()->fromQuery('page', 1));
            $limit  = min(9999, max(1, (int) $this->params()->fromQuery('limit', 25)));
            $search = trim((string) ($this->params()->fromQuery('search', '') ?? ''));
            $siteId = (int) $this->params()->fromQuery('site', 0) ?: null;
            $type   = trim((string) ($this->params()->fromQuery('type', '') ?? ''));
            $dateFrom = trim((string) ($this->params()->fromQuery('dateFrom', '') ?? ''));
            $dateTo   = trim((string) ($this->params()->fromQuery('dateTo', '') ?? ''));
            $offset = ($page - 1) * $limit;

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            $where = [];
            $params = [];
            if ($search !== '') {
                $like    = '%' . $search . '%';
                $where[] = '(p.pros_name LIKE ? OR p.pros_email LIKE ? OR p.pros_telephone LIKE ? OR p.pros_company LIKE ?)';
                $params  = array_merge($params, [$like, $like, $like, $like]);
            }
            if ($siteId) {
                $where[] = 'p.pros_site_id = ?';
                $params[] = $siteId;
            }
            if ($type !== '') {
                $where[] = 'p.pros_type = ?';
                $params[] = $type;
            }
            if ($dateFrom !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFrom)) {
                $where[] = 'p.pros_contact_date >= ?';
                $params[] = $dateFrom . ' 00:00:00';
            }
            if ($dateTo !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateTo)) {
                $where[] = 'p.pros_contact_date <= ?';
                $params[] = $dateTo . ' 23:59:59';
            }
            $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

            $countRow = iterator_to_array($db->query(
                "SELECT COUNT(*) AS total
                 FROM melis_cms_prospects p
                 LEFT JOIN melis_cms_site s ON s.site_id = p.pros_site_id
                 $whereClause",
                $params
            ));
            $total = (int) ($countRow[0]['total'] ?? 0);

            $rows = $db->query(
                "SELECT p.pros_id, p.pros_site_id, p.pros_type, p.pros_theme, p.pros_name, p.pros_email,
                        p.pros_telephone, p.pros_message, p.pros_company, p.pros_country,
                        p.pros_contact_date, p.pros_anonymized,
                        s.site_name, s.site_label,
                        it.item_trans_text AS theme_name
                 FROM melis_cms_prospects p
                 LEFT JOIN melis_cms_site s ON s.site_id = p.pros_site_id
                 LEFT JOIN melis_cms_prospects_theme_items_trans it ON it.item_trans_theme_item_id = p.pros_theme
                 $whereClause
                 ORDER BY p.pros_contact_date DESC
                 LIMIT ? OFFSET ?",
                array_merge($params, [$limit, $offset])
            );

            $items = [];
            foreach ($rows as $row) {
                $items[] = $this->formatProspect((array) $row);
            }

            return $this->jsonResponse([
                'success' => true,
                'data'    => ['items' => $items, 'total' => $total, 'page' => $page, 'limit' => $limit],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /prospects/stats ──────────────────────────────────────────────────

    public function statsAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            $total = (int) (iterator_to_array($db->query(
                'SELECT COUNT(*) AS total FROM melis_cms_prospects',
                []
            ))[0]['total'] ?? 0);

            $thisMonth = (int) (iterator_to_array($db->query(
                "SELECT COUNT(*) AS total FROM melis_cms_prospects
                 WHERE YEAR(pros_contact_date) = YEAR(CURDATE()) AND MONTH(pros_contact_date) = MONTH(CURDATE())",
                []
            ))[0]['total'] ?? 0);

            // Moyenne mensuelle sur l'historique complet (nombre de mois distincts depuis le premier contact).
            $monthsRow = iterator_to_array($db->query(
                "SELECT COUNT(DISTINCT DATE_FORMAT(pros_contact_date, '%Y-%m')) AS months
                 FROM melis_cms_prospects",
                []
            ));
            $months = max(1, (int) ($monthsRow[0]['months'] ?? 1));
            $avgPerMonth = $total > 0 ? round($total / $months, 1) : 0;

            $anonymized = (int) (iterator_to_array($db->query(
                'SELECT COUNT(*) AS total FROM melis_cms_prospects WHERE pros_anonymized = 1',
                []
            ))[0]['total'] ?? 0);

            return $this->jsonResponse([
                'success' => true,
                'data'    => [
                    'total' => $total, 'thisMonth' => $thisMonth, 'avgPerMonth' => $avgPerMonth,
                    'anonymized' => $anonymized,
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /prospects/sites ──────────────────────────────────────────────────

    public function sitesAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $db   = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $rows = iterator_to_array($db->query(
                'SELECT site_id, site_name, site_label FROM melis_cms_site ORDER BY site_label ASC, site_name ASC',
                []
            ));
            $sites = array_map(fn ($r) => [
                'id'   => (int) $r['site_id'],
                'name' => trim((string) $r['site_label']) !== '' ? (string) $r['site_label'] : (string) $r['site_name'],
            ], $rows);

            return $this->jsonResponse(['success' => true, 'data' => ['sites' => $sites]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /prospects/types ──────────────────────────────────────────────────

    public function typesAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $db   = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $rows = iterator_to_array($db->query(
                "SELECT DISTINCT pros_type FROM melis_cms_prospects WHERE pros_type IS NOT NULL AND pros_type <> '' ORDER BY pros_type ASC",
                []
            ));
            $types = array_map(fn ($r) => (string) $r['pros_type'], $rows);

            return $this->jsonResponse(['success' => true, 'data' => ['types' => $types]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /prospects/themes ──────────────────────────────────────────────────

    public function themesAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $db   = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $langContainer = new \Laminas\Session\Container('meliscore');
            $langId = (int) ($langContainer['melis-lang-id'] ?? 1) ?: 1;
            $rows = iterator_to_array($db->query(
                "SELECT ti.pros_theme_item_id, ti.pros_theme_id, th.pros_theme_name,
                        COALESCE(tr.item_trans_text, tr_fallback.item_trans_text) AS item_name
                 FROM melis_cms_prospects_theme_items ti
                 LEFT JOIN melis_cms_prospects_themes th ON th.pros_theme_id = ti.pros_theme_id
                 LEFT JOIN melis_cms_prospects_theme_items_trans tr
                        ON tr.item_trans_theme_item_id = ti.pros_theme_item_id AND tr.item_trans_lang_id = ?
                 LEFT JOIN melis_cms_prospects_theme_items_trans tr_fallback
                        ON tr_fallback.item_trans_theme_item_id = ti.pros_theme_item_id
                 GROUP BY ti.pros_theme_item_id
                 ORDER BY ti.pros_theme_id, ti.pros_theme_item_id",
                [$langId]
            ));
            $themes = array_map(fn ($r) => [
                'id'        => (int) $r['pros_theme_item_id'],
                'name'      => trim((string) ($r['item_name'] ?? '')) !== '' ? (string) $r['item_name'] : ('#' . (int) $r['pros_theme_item_id']),
                'themeName' => (string) ($r['pros_theme_name'] ?? ''),
            ], $rows);

            return $this->jsonResponse(['success' => true, 'data' => ['themes' => $themes]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /prospects/:id ────────────────────────────────────────────────────

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
                "SELECT p.pros_id, p.pros_site_id, p.pros_type, p.pros_theme, p.pros_name, p.pros_email,
                        p.pros_telephone, p.pros_message, p.pros_company, p.pros_country,
                        p.pros_contact_date, p.pros_anonymized,
                        s.site_name, s.site_label,
                        it.item_trans_text AS theme_name
                 FROM melis_cms_prospects p
                 LEFT JOIN melis_cms_site s ON s.site_id = p.pros_site_id
                 LEFT JOIN melis_cms_prospects_theme_items_trans it ON it.item_trans_theme_item_id = p.pros_theme
                 WHERE p.pros_id = ?",
                [$id]
            ));
            if (!$rows) {
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }
            return $this->jsonResponse([
                'success' => true,
                'data'    => $this->formatProspect((array) $rows[0]),
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /prospects/save ──────────────────────────────────────────────────

    public function saveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }

        try {
            $body = json_decode($this->getRequest()->getContent(), true) ?? [];
            $id   = (int) ($body['id'] ?? 0);
            if ($id <= 0) {
                return $this->jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
            }

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $current = iterator_to_array($db->query('SELECT * FROM melis_cms_prospects WHERE pros_id = ?', [$id]));
            if (!$current) {
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }

            $name      = trim((string) ($body['name'] ?? ''));
            $email     = trim((string) ($body['email'] ?? ''));
            $telephone = trim((string) ($body['telephone'] ?? ''));
            $message   = trim((string) ($body['message'] ?? ''));
            $company   = trim((string) ($body['company'] ?? ''));
            $country   = trim((string) ($body['country'] ?? ''));
            $siteId    = isset($body['siteId']) && $body['siteId'] ? (int) $body['siteId'] : null;
            $theme     = isset($body['theme']) && $body['theme'] ? (int) $body['theme'] : null;

            // Validations (parité legacy — ToolProspectsController::updateProspectDataAction).
            if ($name === '' || $email === '' || $telephone === '' || $message === '') {
                return $this->jsonResponse(['success' => false, 'error' => 'Le nom, l\'email, le téléphone et le message sont obligatoires.'], 400);
            }
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $this->jsonResponse(['success' => false, 'error' => 'L\'adresse email n\'est pas valide.'], 400);
            }
            if (!preg_match('/^[0-9()\/+ -]*$/', $telephone)) {
                return $this->jsonResponse(['success' => false, 'error' => 'Le téléphone contient des caractères non autorisés.'], 400);
            }
            if (mb_strlen($name) > 255 || mb_strlen($email) > 255) {
                return $this->jsonResponse(['success' => false, 'error' => 'Le nom ou l\'email dépasse 255 caractères.'], 400);
            }

            // pros_contact_date et pros_type sont IMMUABLES depuis cet écran : on ne les
            // reprend JAMAIS du payload client, seulement de la ligne existante.
            $db->query(
                'UPDATE melis_cms_prospects
                 SET pros_site_id = ?, pros_name = ?, pros_email = ?, pros_telephone = ?,
                     pros_message = ?, pros_company = ?, pros_country = ?, pros_theme = ?
                 WHERE pros_id = ?',
                [$siteId, $name, $email, $telephone, $message, $company ?: null, $country ?: null, $theme, $id]
            );

            return $this->jsonResponse(['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── DELETE /prospects/delete/:id ──────────────────────────────────────────

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
            if (!iterator_to_array($db->query('SELECT pros_id FROM melis_cms_prospects WHERE pros_id = ?', [$id]))) {
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }
            $db->query('DELETE FROM melis_cms_prospects WHERE pros_id = ?', [$id]);
            return $this->jsonResponse(['success' => true, 'data' => null]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private function formatProspect(array $r): array
    {
        $siteName = trim((string) ($r['site_label'] ?? ''));
        if ($siteName === '') { $siteName = (string) ($r['site_name'] ?? ''); }
        $message = strip_tags((string) ($r['pros_message'] ?? ''));

        return [
            'id'          => (int)    $r['pros_id'],
            'siteId'      => isset($r['pros_site_id']) && $r['pros_site_id'] !== null ? (int) $r['pros_site_id'] : null,
            'siteName'    => $siteName !== '' ? $siteName : null,
            'type'        => $r['pros_type'] !== null ? (string) $r['pros_type'] : null,
            'theme'       => isset($r['pros_theme']) && $r['pros_theme'] !== null ? (int) $r['pros_theme'] : null,
            'themeName'   => $r['theme_name'] !== null ? (string) $r['theme_name'] : null,
            'name'        => (string) $r['pros_name'],
            'email'       => (string) $r['pros_email'],
            'telephone'   => (string) $r['pros_telephone'],
            'message'     => $message,
            'company'     => $r['pros_company'] !== null ? (string) $r['pros_company'] : null,
            'country'     => $r['pros_country'] !== null ? (string) $r['pros_country'] : null,
            'contactDate' => (string) $r['pros_contact_date'],
            'anonymized'  => (bool) ((int) ($r['pros_anonymized'] ?? 0)),
        ];
    }

    private function isAuthenticated(): bool
    {
        return $this->getServiceManager()->get('MelisCoreAuth')->hasIdentity();
    }

    /**
     * Garde de droits : chaque endpoint exige l'ACCÈS à l'outil (`MelisCmsProspects_tool_prospects`),
     * pas seulement une session — ferme la back-door API/URL (cf. gabarit Users). 401/403/null.
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
