(function(react, react_router_dom, react_jsx_runtime) {
	//#region src/prospects-api.ts
	/**
	* Client de l'API Prospects pour la brique MelisCmsProspects.
	*
	* Appelle la couche REST partagée (module MelisReactApi, routes déclarées par ce module) :
	*   /melis/react-api/prospects[/...]
	* Contrat `{ success, data, error }` (comme les outils natifs). La brique ne peut pas
	* importer les modules de l'hôte (`@/lib/...`) — ce client est donc autonome.
	*/
	var XHR_HEADER$1 = { "X-Requested-With": "XMLHttpRequest" };
	var _prospectsListStale = false;
	function markProspectsListStale() {
		_prospectsListStale = true;
	}
	function consumeProspectsListStale() {
		const stale = _prospectsListStale;
		_prospectsListStale = false;
		return stale;
	}
	async function apiFetch$1(url, opts) {
		const res = await fetch(url, {
			...opts,
			headers: {
				...XHR_HEADER$1,
				...opts?.headers ?? {}
			},
			credentials: "include"
		});
		if (!res.ok) {
			let msg = `HTTP ${res.status}`;
			try {
				const d = await res.json();
				if (d.error) msg = d.error;
			} catch {}
			throw new Error(msg);
		}
		const data = await res.json();
		if (!data.success) throw new Error(data.error ?? "API error");
		return data.data;
	}
	async function fetchProspects(params = {}) {
		const qs = new URLSearchParams();
		if (params.limit) qs.set("limit", String(params.limit));
		if (params.search) qs.set("search", params.search);
		if (params.site) qs.set("site", String(params.site));
		if (params.type) qs.set("type", params.type);
		if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
		if (params.dateTo) qs.set("dateTo", params.dateTo);
		if (params.sort) qs.set("sort", params.sort);
		if (params.dir) qs.set("dir", params.dir);
		if (params.after) qs.set("after", params.after);
		return apiFetch$1(`/melis/react-api/prospects?${qs}`);
	}
	async function fetchProspectById(id) {
		return apiFetch$1(`/melis/react-api/prospects/${id}`);
	}
	async function fetchProspectStats() {
		return apiFetch$1("/melis/react-api/prospects/stats");
	}
	async function fetchSites() {
		return (await apiFetch$1("/melis/react-api/prospects/sites")).sites;
	}
	async function fetchTypes() {
		return (await apiFetch$1("/melis/react-api/prospects/types")).types;
	}
	async function fetchThemes$1() {
		return (await apiFetch$1("/melis/react-api/prospects/themes")).themes;
	}
	async function saveProspect(payload) {
		return apiFetch$1("/melis/react-api/prospects/save", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		});
	}
	async function deleteProspect(id) {
		await apiFetch$1(`/melis/react-api/prospects/delete/${id}`, { method: "DELETE" });
	}
	//#endregion
	//#region src/use-keyset-list.ts
	function useKeysetList(opts) {
		const LIMIT = opts.limit ?? 25;
		const [items, setItems] = (0, react.useState)(opts.initial?.items ?? []);
		const [total, setTotal] = (0, react.useState)(opts.initial?.total ?? 0);
		const [loading, setLoading] = (0, react.useState)(false);
		const [hasMore, setHasMore] = (0, react.useState)(opts.initial?.hasMore ?? false);
		const [sortCol, setSortCol] = (0, react.useState)(opts.initial?.sortCol ?? opts.defaultSort ?? "id");
		const [sortDir, setSortDir] = (0, react.useState)(opts.initial?.sortDir ?? opts.defaultDir ?? "desc");
		const cursorRef = (0, react.useRef)(opts.initial?.cursor ?? null);
		const loadingRef = (0, react.useRef)(false);
		const reqIdRef = (0, react.useRef)(0);
		const sentinelRef = (0, react.useRef)(null);
		const fetcherRef = (0, react.useRef)(opts.fetcher);
		fetcherRef.current = opts.fetcher;
		const runLoad = (0, react.useCallback)(async (reset) => {
			if (!reset && loadingRef.current) return;
			const myReq = ++reqIdRef.current;
			loadingRef.current = true;
			setLoading(true);
			const after = reset ? void 0 : cursorRef.current ?? void 0;
			try {
				const res = await fetcherRef.current({
					limit: LIMIT,
					sort: sortCol,
					dir: sortDir,
					after
				});
				if (myReq !== reqIdRef.current) return;
				cursorRef.current = res.nextCursor;
				setHasMore(res.nextCursor !== null);
				setTotal(res.total);
				setItems((prev) => reset ? res.items : [...prev, ...res.items]);
			} catch {} finally {
				if (myReq === reqIdRef.current) {
					setLoading(false);
					loadingRef.current = false;
				}
			}
		}, [
			sortCol,
			sortDir,
			LIMIT
		]);
		const didInitRef = (0, react.useRef)(false);
		(0, react.useEffect)(() => {
			if (!didInitRef.current) {
				didInitRef.current = true;
				if (opts.skipInitial) return;
			}
			runLoad(true);
		}, [
			...opts.deps,
			sortCol,
			sortDir
		]);
		(0, react.useEffect)(() => {
			if (!sentinelRef.current || !hasMore) return;
			const obs = new IntersectionObserver(([entry]) => {
				if (entry.isIntersecting) runLoad(false);
			}, { rootMargin: "120px" });
			obs.observe(sentinelRef.current);
			return () => obs.disconnect();
		}, [hasMore, runLoad]);
		const toggleSort = (0, react.useCallback)((id) => {
			setSortCol((cur) => {
				if (cur === id) {
					setSortDir((d) => d === "asc" ? "desc" : "asc");
					return cur;
				}
				setSortDir(id === "id" ? "desc" : "asc");
				return id;
			});
		}, []);
		/** Force un rechargement depuis le début (refresh / reset filtres). */
		const reload = (0, react.useCallback)(() => {
			cursorRef.current = null;
			runLoad(true);
		}, [runLoad]);
		/** Retire un élément localement (après delete) sans recharger. */
		const removeLocal = (0, react.useCallback)((pred) => {
			setItems((prev) => prev.filter((it) => !pred(it)));
			setTotal((t) => Math.max(0, t - 1));
		}, []);
		/** Snapshot pour le cache module-level. */
		const snapshot = () => ({
			items,
			total,
			cursor: cursorRef.current,
			hasMore,
			sortCol,
			sortDir
		});
		return {
			items,
			setItems,
			total,
			loading,
			hasMore,
			sentinelRef,
			sortCol,
			sortDir,
			setSortCol,
			setSortDir,
			toggleSort,
			reload,
			removeLocal,
			snapshot
		};
	}
	//#endregion
	//#region src/shared/use-drag-reorder.ts
	function useDragReorder({ cols, onChange }) {
		const [draggingId, setDraggingId] = (0, react.useState)(null);
		const [overTarget, setOverTarget] = (0, react.useState)(null);
		const [dragPos, setDragPos] = (0, react.useState)(null);
		const colsRef = (0, react.useRef)(cols);
		colsRef.current = cols;
		const onChangeRef = (0, react.useRef)(onChange);
		onChangeRef.current = onChange;
		const draggingRef = (0, react.useRef)(null);
		const overRef = (0, react.useRef)(null);
		const active = (0, react.useRef)(null);
		function commitDrop(target, dragId) {
			const cur = colsRef.current;
			const shown = cur.filter((c) => c.visible);
			const hidden = cur.filter((c) => !c.visible);
			const srcItem = cur.find((c) => c.id === dragId);
			if (!srcItem) return;
			const updatedItem = {
				...srcItem,
				visible: target.panel === "visible"
			};
			let vList = shown.filter((c) => c.id !== dragId);
			const hList = hidden.filter((c) => c.id !== dragId);
			if (target.panel === "visible") {
				const dstId = target.id;
				if (dstId === "__panel__") vList = [...vList, updatedItem];
				else {
					const idx = vList.findIndex((c) => c.id === dstId);
					vList = idx === -1 ? [...vList, updatedItem] : [
						...vList.slice(0, idx),
						updatedItem,
						...vList.slice(idx)
					];
				}
				onChangeRef.current([...vList, ...hList]);
			} else onChangeRef.current([
				...vList,
				...hList,
				updatedItem
			]);
		}
		function endDrag(commit) {
			const dragId = draggingRef.current;
			const target = overRef.current;
			if (active.current) {
				document.removeEventListener("mousemove", active.current.move);
				document.removeEventListener("mouseup", active.current.up);
				document.removeEventListener("touchmove", active.current.move);
				document.removeEventListener("touchend", active.current.up);
				document.removeEventListener("touchcancel", active.current.cancel);
				active.current = null;
			}
			draggingRef.current = null;
			overRef.current = null;
			setDraggingId(null);
			setOverTarget(null);
			setDragPos(null);
			if (commit && dragId && target) commitDrop(target, dragId);
		}
		function hitTest(x, y) {
			const el = document.elementFromPoint(x, y);
			const itemEl = el?.closest("[data-col-item]") ?? null;
			const panelEl = el?.closest("[data-col-panel]") ?? null;
			let next = null;
			if (itemEl && itemEl.dataset.colItem !== draggingRef.current) {
				const panel = itemEl.closest("[data-col-panel]")?.dataset.colPanel;
				if (panel) next = {
					id: itemEl.dataset.colItem,
					panel
				};
			} else if (panelEl) next = {
				id: "__panel__",
				panel: panelEl.dataset.colPanel
			};
			if (next?.id !== overRef.current?.id || next?.panel !== overRef.current?.panel) {
				overRef.current = next;
				setOverTarget(next);
			}
		}
		function beginDrag(colId, x, y) {
			draggingRef.current = colId;
			overRef.current = null;
			setDraggingId(colId);
			setDragPos({
				x,
				y
			});
		}
		/** Mouse path — desktop. */
		function startDragMouse(colId) {
			return (e) => {
				if (e.button !== 0) return;
				e.preventDefault();
				beginDrag(colId, e.clientX, e.clientY);
				const onMove = (ev) => {
					const me = ev;
					setDragPos({
						x: me.clientX,
						y: me.clientY
					});
					hitTest(me.clientX, me.clientY);
				};
				const onUp = () => endDrag(true);
				active.current = {
					move: onMove,
					up: onUp,
					cancel: onUp
				};
				document.addEventListener("mousemove", onMove);
				document.addEventListener("mouseup", onUp);
			};
		}
		/** Touch path — mobile. Plain Touch Events (not Pointer Events), for maximum compatibility
		*  with older mobile Safari/WebView versions that may not fully support Pointer Events. */
		function startDragTouch(colId) {
			return (e) => {
				const t = e.touches[0];
				if (!t) return;
				e.preventDefault();
				beginDrag(colId, t.clientX, t.clientY);
				const onMove = (ev) => {
					const te = ev;
					const touch = te.touches[0];
					if (!touch) return;
					if (te.cancelable) te.preventDefault();
					setDragPos({
						x: touch.clientX,
						y: touch.clientY
					});
					hitTest(touch.clientX, touch.clientY);
				};
				const onEnd = () => endDrag(true);
				const onCancel = () => endDrag(false);
				active.current = {
					move: onMove,
					up: onEnd,
					cancel: onCancel
				};
				document.addEventListener("touchmove", onMove, { passive: false });
				document.addEventListener("touchend", onEnd);
				document.addEventListener("touchcancel", onCancel);
			};
		}
		return {
			draggingId,
			overTarget,
			dragPos,
			startDragMouse,
			startDragTouch
		};
	}
	//#endregion
	//#region src/ExportModal.tsx
	function getXLSX() {
		return window.MelisXLSX ?? null;
	}
	function currentLang$2() {
		return (document.documentElement.lang || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
	}
	var DICT$2 = {
		fr: {
			export: "Exporter",
			title: "Exporter les données",
			subtitle: "{n} lignes avec les filtres actifs",
			included: "Incluses",
			excluded: "Exclues",
			drag_here: "Glisser ici",
			download: "Télécharger {fmt}",
			exporting: "Export…",
			error: "Erreur lors de l’export",
			cancel: "Annuler"
		},
		en: {
			export: "Export",
			title: "Export data",
			subtitle: "{n} rows with the active filters",
			included: "Included",
			excluded: "Excluded",
			drag_here: "Drag here",
			download: "Download {fmt}",
			exporting: "Exporting…",
			error: "Error during export",
			cancel: "Cancel"
		}
	};
	function tr(key, vars) {
		let s = DICT$2[currentLang$2()][key] ?? key;
		if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
		return s;
	}
	var card$2 = {
		border: "1px solid var(--color-border)",
		background: "var(--color-card)",
		borderRadius: 12,
		boxShadow: "0 1px 2px rgba(0,0,0,.04)"
	};
	var panelCss$2 = {
		display: "flex",
		flexDirection: "column",
		gap: 2,
		minHeight: 100,
		maxHeight: "min(48vh, 320px)",
		overflowY: "auto",
		minWidth: 0,
		borderRadius: 8,
		border: "1px dashed var(--color-border)",
		padding: 6
	};
	var panelTitle$2 = {
		padding: "0 6px 4px",
		fontSize: 10,
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: ".06em",
		color: "var(--color-muted-foreground)"
	};
	var btnGhost$2 = {
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		height: 34,
		padding: "0 12px",
		borderRadius: 8,
		border: "1px solid var(--color-border)",
		background: "var(--color-card)",
		color: "var(--color-foreground)",
		fontSize: 14,
		cursor: "pointer"
	};
	var btnPrimary$2 = {
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		height: 34,
		padding: "0 14px",
		borderRadius: 8,
		border: 0,
		background: "var(--color-primary)",
		color: "var(--color-primary-foreground,#fff)",
		fontSize: 14,
		fontWeight: 500,
		cursor: "pointer"
	};
	var GripIcon$2 = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: {
			width: 13,
			height: 13,
			flexShrink: 0,
			color: "var(--color-muted-foreground)"
		},
		viewBox: "0 0 24 24",
		fill: "currentColor",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "9",
				cy: "6",
				r: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "15",
				cy: "6",
				r: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "9",
				cy: "12",
				r: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "15",
				cy: "12",
				r: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "9",
				cy: "18",
				r: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "15",
				cy: "18",
				r: "1.5"
			})
		]
	});
	var DownloadIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		style: {
			width: 15,
			height: 15,
			flexShrink: 0
		},
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" })
	});
	var ExcelIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: {
			width: 16,
			height: 16,
			flexShrink: 0
		},
		viewBox: "0 0 24 24",
		fill: "none",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "1",
				y: "1",
				width: "22",
				height: "22",
				rx: "3",
				fill: "#217346"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
				x1: "7.5",
				y1: "7.5",
				x2: "16.5",
				y2: "16.5",
				stroke: "white",
				strokeWidth: "2.5",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
				x1: "16.5",
				y1: "7.5",
				x2: "7.5",
				y2: "16.5",
				stroke: "white",
				strokeWidth: "2.5",
				strokeLinecap: "round"
			})
		]
	});
	var CsvIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: {
			width: 16,
			height: 16,
			flexShrink: 0
		},
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M14 2v6h6M16 13H8M16 17H8M10 9H8" })]
	});
	function ExportModal({ cols: colsProp, labelFor, fetchAll, getCell, filename, sheetName, total, onClose }) {
		const xlsx = getXLSX();
		const [cols, setCols] = (0, react.useState)(colsProp);
		const [format, setFormat] = (0, react.useState)(xlsx ? "xlsx" : "csv");
		const [exporting, setExporting] = (0, react.useState)(false);
		const { draggingId: dragId, overTarget: over, dragPos, startDragMouse, startDragTouch } = useDragReorder({
			cols,
			onChange: setCols
		});
		const included = cols.filter((c) => c.visible);
		const excluded = cols.filter((c) => !c.visible);
		function item(col, panel) {
			const isOver = over?.id === col.id && over?.panel === panel;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				"data-col-item": col.id,
				onMouseDown: startDragMouse(col.id),
				onTouchStart: startDragTouch(col.id),
				style: {
					display: "flex",
					alignItems: "center",
					gap: 8,
					borderRadius: 8,
					padding: "6px 8px",
					fontSize: 14,
					cursor: "grab",
					userSelect: "none",
					touchAction: "none",
					opacity: dragId === col.id ? .4 : 1,
					background: isOver ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "transparent",
					boxShadow: isOver ? "0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent)" : "none"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(GripIcon$2, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						flex: 1,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap"
					},
					children: labelFor(col.id)
				})]
			}, col.id);
		}
		const ph = () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			style: {
				flex: 1,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: 11,
				color: "var(--color-muted-foreground)",
				opacity: .5,
				padding: "12px 0"
			},
			children: tr("drag_here")
		});
		async function doExport() {
			if (included.length === 0) return;
			setExporting(true);
			try {
				const all = await fetchAll();
				const header = included.map((c) => labelFor(c.id));
				const rows = all.map((it) => included.map((c) => getCell(it, c.id)));
				const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
				if (format === "xlsx" && xlsx) {
					const ws = xlsx.utils.aoa_to_sheet([header, ...rows]);
					const wb = xlsx.utils.book_new();
					xlsx.utils.book_append_sheet(wb, ws, sheetName);
					xlsx.writeFile(wb, `${filename}-${dateStr}.xlsx`);
				} else {
					const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, "\"\"")}"`).join(",")).join("\n");
					const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
					const url = URL.createObjectURL(blob);
					const a = Object.assign(document.createElement("a"), {
						href: url,
						download: `${filename}-${dateStr}.csv`
					});
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					URL.revokeObjectURL(url);
				}
				onClose();
			} catch (e) {
				alert(e instanceof Error ? e.message : tr("error"));
			} finally {
				setExporting(false);
			}
		}
		const tab = (active) => ({
			flex: 1,
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			gap: 8,
			height: 36,
			borderRadius: 6,
			border: 0,
			fontSize: 14,
			fontWeight: 500,
			cursor: "pointer",
			background: active ? "var(--color-card)" : "transparent",
			color: active ? "var(--color-foreground)" : "var(--color-muted-foreground)",
			boxShadow: active ? "0 1px 2px rgba(0,0,0,.06)" : "none"
		});
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				position: "fixed",
				inset: 0,
				zIndex: 60,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "rgba(0,0,0,.5)",
				padding: 16
			},
			onClick: (e) => {
				if (e.target === e.currentTarget) onClose();
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					...card$2,
					width: "100%",
					maxWidth: 480
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "flex-start",
							justifyContent: "space-between",
							padding: "16px 20px",
							borderBottom: "1px solid var(--color-border)"
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
							style: {
								fontSize: 14,
								fontWeight: 600,
								margin: 0
							},
							children: tr("title")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: {
								fontSize: 12,
								color: "var(--color-muted-foreground)",
								margin: "2px 0 0"
							},
							children: tr("subtitle", { n: total })
						})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: {
								border: 0,
								background: "transparent",
								cursor: "pointer",
								color: "var(--color-muted-foreground)",
								fontSize: 16
							},
							onClick: onClose,
							children: "✕"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							padding: 16,
							display: "flex",
							flexDirection: "column",
							gap: 16
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: 4,
								padding: 4,
								borderRadius: 8,
								border: "1px solid var(--color-border)",
								background: "color-mix(in srgb, var(--color-muted,#888) 12%, transparent)"
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								style: tab(format === "xlsx"),
								disabled: !xlsx,
								onClick: () => xlsx && setFormat("xlsx"),
								title: xlsx ? "" : "XLSX indisponible",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExcelIcon, {}), "Excel (.xlsx)"]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								style: tab(format === "csv"),
								onClick: () => setFormat("csv"),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CsvIcon, {}), "CSV (.csv)"]
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 8
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								"data-col-panel": "hidden",
								style: {
									...panelCss$2,
									...over?.id === "__panel__" && over.panel === "hidden" ? {
										borderColor: "color-mix(in srgb, var(--color-primary) 40%, transparent)",
										background: "color-mix(in srgb, var(--color-primary) 5%, transparent)"
									} : {}
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									style: panelTitle$2,
									children: tr("excluded")
								}), excluded.length === 0 ? ph() : excluded.map((c) => item(c, "hidden"))]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								"data-col-panel": "visible",
								style: {
									...panelCss$2,
									...over?.id === "__panel__" && over.panel === "visible" ? {
										borderColor: "color-mix(in srgb, var(--color-primary) 40%, transparent)",
										background: "color-mix(in srgb, var(--color-primary) 5%, transparent)"
									} : {}
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									style: panelTitle$2,
									children: tr("included")
								}), included.length === 0 ? ph() : included.map((c) => item(c, "visible"))]
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "flex-end",
							gap: 8,
							padding: "12px 16px",
							borderTop: "1px solid var(--color-border)"
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: btnGhost$2,
							onClick: onClose,
							disabled: exporting,
							children: tr("cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							style: {
								...btnPrimary$2,
								opacity: included.length === 0 || exporting ? .6 : 1
							},
							onClick: doExport,
							disabled: exporting || included.length === 0,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DownloadIcon, {}), exporting ? tr("exporting") : tr("download", { fmt: format.toUpperCase() })]
						})]
					})
				]
			}), dragId && dragPos && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					position: "fixed",
					zIndex: 61,
					left: dragPos.x,
					top: dragPos.y,
					transform: "translate(-50%, -50%)",
					pointerEvents: "none",
					display: "flex",
					alignItems: "center",
					gap: 8,
					borderRadius: 8,
					padding: "6px 10px",
					fontSize: 14,
					fontWeight: 500,
					background: "var(--color-card)",
					border: "1px solid color-mix(in srgb, var(--color-primary) 40%, transparent)",
					boxShadow: "0 4px 16px rgba(0,0,0,.25)"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(GripIcon$2, {}), labelFor(dragId)]
			})]
		});
	}
	//#endregion
	//#region src/ViewToggle.tsx
	var sIcon$3 = {
		width: 15,
		height: 15,
		flexShrink: 0
	};
	var MelisM = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: sIcon$3,
		viewBox: "0 0 70 70",
		fill: "currentColor",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M57.4,0c-4.8,0-8.6,3.9-8.6,8.6v49.2c0,4.8,3.9,8.6,8.6,8.6s8.6-3.9,8.6-8.6V8.7C66,3.9,62.2,0,57.4,0Z" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M16.3,4.6C14,.4,8.8-1.2,4.6,1,.4,3.2-1.2,8.5,1,12.7l26.1,49.3c2.2,4.2,7.4,5.8,11.7,3.6,4.2-2.2,5.8-7.4,3.6-11.7L16.3,4.6Z" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "8.8",
				cy: "57.7",
				r: "8.8"
			})
		]
	});
	var LayoutIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: sIcon$3,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
			x: "3",
			y: "3",
			width: "18",
			height: "18",
			rx: "2"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 9h18M9 21V9" })]
	});
	function ViewToggle({ mode, onChange, compact = false, labels = {
		react: "New",
		iframe: "Old"
	} }) {
		const tab = (active) => ({
			display: "inline-flex",
			alignItems: "center",
			gap: compact ? 0 : 6,
			height: 30,
			padding: compact ? "0 8px" : "0 12px",
			borderRadius: 6,
			border: 0,
			fontSize: 12,
			fontWeight: 500,
			cursor: "pointer",
			background: active ? "var(--color-card)" : "transparent",
			color: active ? "var(--color-foreground)" : "var(--color-muted-foreground)",
			boxShadow: active ? "0 1px 2px rgba(0,0,0,.06)" : "none"
		});
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				display: "inline-flex",
				gap: 4,
				padding: 4,
				borderRadius: 8,
				border: "1px solid var(--color-border)",
				background: "color-mix(in srgb, var(--color-muted,#888) 12%, transparent)"
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				style: tab(mode === "react"),
				onClick: () => onChange("react"),
				title: compact ? labels.react : void 0,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MelisM, {}), !compact && labels.react]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				style: tab(mode === "iframe"),
				onClick: () => onChange("iframe"),
				title: compact ? labels.iframe : void 0,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(LayoutIcon, {}), !compact && labels.iframe]
			})]
		});
	}
	//#endregion
	//#region src/shared/useIsNarrow.ts
	function useIsNarrow(breakpoint = 640) {
		const [narrow, setNarrow] = (0, react.useState)(() => window.innerWidth < breakpoint);
		(0, react.useEffect)(() => {
			const onResize = () => setNarrow(window.innerWidth < breakpoint);
			window.addEventListener("resize", onResize);
			return () => window.removeEventListener("resize", onResize);
		}, [breakpoint]);
		return narrow;
	}
	//#endregion
	//#region src/shared/ExpandableRow.tsx
	var sIcon$2 = {
		width: 13,
		height: 13,
		flexShrink: 0
	};
	var PlusIcon$1 = () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		style: sIcon$2,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 5v14M5 12h14" })
	});
	var MinusIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		style: sIcon$2,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 12h14" })
	});
	var toggleBtn = {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		width: 24,
		height: 24,
		borderRadius: 6,
		border: "1px solid var(--color-border)",
		background: "var(--color-card)",
		color: "var(--color-muted-foreground)",
		cursor: "pointer",
		padding: 0
	};
	function ExpandToggle({ expanded, onClick }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			style: toggleBtn,
			onClick,
			title: expanded ? "−" : "+",
			children: expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MinusIcon, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlusIcon$1, {})
		});
	}
	function HiddenColsRow({ colSpan, cols }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
			colSpan,
			style: {
				padding: "4px 16px 12px",
				borderTop: "1px solid var(--color-border)",
				background: "var(--color-muted,rgba(0,0,0,.02))"
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 6
				},
				children: cols.map((c) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						gap: 12,
						fontSize: 13
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							color: "var(--color-muted-foreground)",
							flexShrink: 0
						},
						children: c.label
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							textAlign: "right",
							color: "var(--color-foreground)",
							overflowWrap: "anywhere"
						},
						children: c.value
					})]
				}, c.label))
			})
		}) });
	}
	//#endregion
	//#region src/ProspectsPage.tsx
	var MELIS_KEY$1 = "MelisCmsProspects_tool_prospects";
	var CAPS_KEY$1 = "melisprospects_tool_prospects_section";
	function can$1(cap) {
		return window.MelisCan?.(CAPS_KEY$1, cap) ?? true;
	}
	function currentLang$1() {
		return (document.documentElement.lang || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
	}
	var DICT$1 = {
		fr: {
			title: "Prospects",
			subtitle: "Demandes de contact reçues via le site",
			search: "Rechercher un prospect…",
			empty: "Aucun prospect trouvé",
			count: "{n} prospects — fin de la liste",
			kpi_total: "Total",
			kpi_month: "Ce mois-ci",
			kpi_avg: "Moyenne / mois",
			kpi_anon: "Anonymisés",
			all_sites: "Tous les sites",
			all_types: "Tous les types",
			col_id: "ID",
			col_name: "Nom",
			col_email: "Email",
			col_phone: "Téléphone",
			col_site: "Site",
			col_type: "Type",
			col_date: "Date",
			col_theme: "Thème",
			col_message: "Message",
			columns: "Colonnes",
			export: "Exporter",
			cols_visible: "Visibles",
			cols_hidden: "Masquées",
			drag_here: "Glisser ici",
			reset: "Réinitialiser",
			reset_filters: "Réinitialiser les filtres",
			edit: "Modifier",
			del: "Supprimer",
			cancel: "Annuler",
			save: "Enregistrer",
			back: "retour",
			refresh: "Rafraîchir",
			loading: "Chargement…",
			saved: "Enregistré ✓",
			del_title: "Supprimer le prospect",
			del_confirm: "Supprimer « {u} » ? Cette action est irréversible.",
			edit_title: "Prospect",
			sec_contact: "Coordonnées",
			sec_message: "Message",
			sec_details: "Détails",
			f_name: "Nom",
			f_email: "Email",
			f_phone: "Téléphone",
			f_company: "Société",
			f_country: "Pays",
			f_site: "Site",
			f_site_ph: "— Aucun site —",
			f_type: "Type",
			f_date: "Date de contact",
			f_theme: "Thème",
			err_save: "Erreur lors de la sauvegarde",
			err_required: "Le nom, l’email, le téléphone et le message sont obligatoires.",
			no_access: "Vous n’avez pas les droits pour consulter cette liste.",
			none: "—",
			dr_label: "Date",
			dr_all: "Toutes les dates",
			dr_today: "Aujourd'hui",
			dr_yesterday: "Hier",
			dr_last7: "7 derniers jours",
			dr_last30: "30 derniers jours",
			dr_thismonth: "Ce mois-ci",
			dr_lastmonth: "Le mois dernier",
			dr_custom: "Plage personnalisée",
			dr_from: "Du",
			dr_to: "Au",
			dr_apply: "Appliquer",
			view_new: "Nouveau",
			view_old: "Ancien"
		},
		en: {
			title: "Prospects",
			subtitle: "Contact requests received via the site",
			search: "Search a prospect…",
			empty: "No prospect found",
			count: "{n} prospects — end of list",
			kpi_total: "Total",
			kpi_month: "This month",
			kpi_avg: "Average / month",
			kpi_anon: "Anonymized",
			all_sites: "All sites",
			all_types: "All types",
			col_id: "ID",
			col_name: "Name",
			col_email: "Email",
			col_phone: "Phone",
			col_site: "Site",
			col_type: "Type",
			col_date: "Date",
			col_theme: "Theme",
			col_message: "Message",
			columns: "Columns",
			export: "Export",
			cols_visible: "Visible",
			cols_hidden: "Hidden",
			drag_here: "Drag here",
			reset: "Reset",
			reset_filters: "Reset filters",
			edit: "Edit",
			del: "Delete",
			cancel: "Cancel",
			save: "Save",
			back: "back",
			refresh: "Refresh",
			loading: "Loading…",
			saved: "Saved ✓",
			del_title: "Delete prospect",
			del_confirm: "Delete “{u}”? This action is irreversible.",
			edit_title: "Prospect",
			sec_contact: "Contact information",
			sec_message: "Message",
			sec_details: "Details",
			f_name: "Name",
			f_email: "Email",
			f_phone: "Phone",
			f_company: "Company",
			f_country: "Country",
			f_site: "Site",
			f_site_ph: "— No site —",
			f_type: "Type",
			f_date: "Contact date",
			f_theme: "Theme",
			err_save: "Error while saving",
			err_required: "Name, email, phone and message are required.",
			no_access: "You do not have permission to view this list.",
			none: "—",
			dr_label: "Date",
			dr_all: "All dates",
			dr_today: "Today",
			dr_yesterday: "Yesterday",
			dr_last7: "Last 7 days",
			dr_last30: "Last 30 days",
			dr_thismonth: "This month",
			dr_lastmonth: "Last month",
			dr_custom: "Custom range",
			dr_from: "From",
			dr_to: "To",
			dr_apply: "Apply",
			view_new: "New",
			view_old: "Old"
		}
	};
	function useT$1() {
		const lang = currentLang$1();
		return (key, vars) => {
			let s = DICT$1[lang][key] ?? key;
			if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
			return s;
		};
	}
	function notify$1(kind, title, message) {
		window.postMessage({
			__melisNotif: true,
			kind,
			title,
			message
		}, "*");
	}
	var card$1 = {
		border: "1px solid var(--color-border)",
		background: "var(--color-card)",
		borderRadius: 12,
		boxShadow: "0 1px 2px rgba(0,0,0,.04)"
	};
	var inputCss$1 = {
		height: 40,
		width: "100%",
		boxSizing: "border-box",
		borderRadius: 8,
		border: "1px solid var(--color-input,var(--color-border))",
		background: "var(--color-card)",
		color: "var(--color-foreground)",
		padding: "0 12px",
		fontSize: 14,
		outline: "none"
	};
	var btnPrimary$1 = {
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		height: 36,
		padding: "0 14px",
		borderRadius: 8,
		border: 0,
		background: "var(--color-primary)",
		color: "var(--color-primary-foreground,#fff)",
		fontSize: 14,
		fontWeight: 500,
		cursor: "pointer"
	};
	var btnGhost$1 = {
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		height: 36,
		padding: "0 12px",
		borderRadius: 8,
		border: "1px solid var(--color-border)",
		background: "var(--color-card)",
		color: "var(--color-foreground)",
		fontSize: 14,
		cursor: "pointer"
	};
	var iconBtn$1 = {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		width: 28,
		height: 28,
		borderRadius: 6,
		border: 0,
		background: "transparent",
		color: "var(--color-muted-foreground)",
		cursor: "pointer"
	};
	var th$1 = {
		textAlign: "left",
		padding: "10px 16px",
		fontSize: 11,
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: ".04em",
		color: "var(--color-muted-foreground)",
		whiteSpace: "nowrap"
	};
	var td$1 = {
		padding: "10px 16px",
		fontSize: 14,
		color: "var(--color-foreground)",
		borderTop: "1px solid var(--color-border)"
	};
	var label$1 = {
		display: "block",
		fontSize: 13,
		fontWeight: 500,
		marginBottom: 4,
		color: "var(--color-foreground)"
	};
	var secTitle = {
		fontSize: 14,
		fontWeight: 600,
		margin: "0 0 14px",
		color: "var(--color-foreground)"
	};
	var sIcon$1 = {
		width: 15,
		height: 15,
		flexShrink: 0
	};
	var PencilIcon$1 = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: sIcon$1,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 20h9" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" })]
	});
	var TrashIcon$1 = () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		style: sIcon$1,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" })
	});
	var GripIcon$1 = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: {
			width: 13,
			height: 13,
			flexShrink: 0,
			color: "var(--color-muted-foreground)"
		},
		viewBox: "0 0 24 24",
		fill: "currentColor",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "9",
				cy: "6",
				r: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "15",
				cy: "6",
				r: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "9",
				cy: "12",
				r: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "15",
				cy: "12",
				r: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "9",
				cy: "18",
				r: "1.5"
			})
		]
	});
	var UserIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: {
			width: 20,
			height: 20
		},
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "7",
			r: "4"
		})]
	});
	var CalendarIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: sIcon$1,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
			x: "3",
			y: "4",
			width: "18",
			height: "18",
			rx: "2"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M16 2v4M8 2v4M3 10h18" })]
	});
	var ChevronDownIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		style: {
			width: 12,
			height: 12,
			flexShrink: 0
		},
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.5",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m6 9 6 6 6-6" })
	});
	var Columns3Icon$1 = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: sIcon$1,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
			width: "18",
			height: "18",
			x: "3",
			y: "3",
			rx: "2"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 3v18M15 3v18" })]
	});
	var RotateCcwIcon$1 = ({ spinning }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: {
			...sIcon$1,
			animation: spinning ? "melis-prospects-spin 0.8s linear infinite" : void 0,
			transformOrigin: "center"
		},
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: "@keyframes melis-prospects-spin { to { transform: rotate(360deg) } }" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 3v5h5" })
		]
	});
	function SortIcon$1({ dir }) {
		const p = {
			width: 12,
			height: 12,
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: 2,
			strokeLinecap: "round",
			strokeLinejoin: "round",
			style: {
				flexShrink: 0,
				opacity: dir ? 1 : .3
			}
		};
		if (dir === "asc") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
			...p,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m5 12 7-7 7 7" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 19V5" })]
		});
		if (dir === "desc") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
			...p,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 5v14" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m19 12-7 7-7-7" })]
		});
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
			...p,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m21 16-4 4-4-4" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M17 20V4" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m3 8 4-4 4 4" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M7 4v16" })
			]
		});
	}
	var Spinner$1 = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: {
			width: 14,
			height: 14,
			animation: "melis-prospects-spin 0.8s linear infinite"
		},
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.5",
		strokeLinecap: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: "@keyframes melis-prospects-spin { to { transform: rotate(360deg) } }" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })]
	});
	var UsersKpiIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		width: 20,
		height: 20,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "9",
				cy: "7",
				r: "4"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" })
		]
	});
	var CalendarDaysKpiIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		width: 20,
		height: 20,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "3",
				y: "4",
				width: "18",
				height: "18",
				rx: "2"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M16 2v4M8 2v4M3 10h18" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 14h.01M12 14h.01M16 14h.01" })
		]
	});
	var TrendingUpKpiIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		width: 20,
		height: 20,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M22 7 13.5 15.5 8.5 10.5 2 17" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M16 7h6v6" })]
	});
	var EyeOffKpiIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		width: 20,
		height: 20,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-4.13 5.19M6.61 6.61A13.53 13.53 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5-1.36" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M14.12 14.12a3 3 0 1 1-4.24-4.24" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 2l20 20" })
		]
	});
	var SORTABLE$1 = new Set([
		"id",
		"site",
		"name",
		"email",
		"type",
		"phone",
		"date",
		"theme"
	]);
	var COL_ORDER$1 = [
		"id",
		"site",
		"name",
		"email",
		"type",
		"phone",
		"date",
		"theme",
		"message"
	];
	var COL_LABEL$1 = {
		id: "col_id",
		name: "col_name",
		email: "col_email",
		phone: "col_phone",
		site: "col_site",
		type: "col_type",
		theme: "col_theme",
		date: "col_date",
		message: "col_message"
	};
	var DEFAULT_COLS$1 = COL_ORDER$1.map((id) => ({
		id,
		visible: true
	}));
	var COL_KEY$1 = "melis-prospects-cols-v2";
	function loadCols$1() {
		try {
			const raw = localStorage.getItem(COL_KEY$1);
			if (!raw) return DEFAULT_COLS$1;
			const saved = JSON.parse(raw);
			const ordered = saved.map((s) => {
				const d = DEFAULT_COLS$1.find((c) => c.id === s.id);
				return d ? {
					id: d.id,
					visible: s.visible
				} : null;
			}).filter(Boolean);
			const missing = DEFAULT_COLS$1.filter((d) => !saved.find((s) => s.id === d.id));
			return [...ordered, ...missing];
		} catch {
			return DEFAULT_COLS$1;
		}
	}
	function saveCols$1(c) {
		try {
			localStorage.setItem(COL_KEY$1, JSON.stringify(c));
		} catch {}
	}
	var visibleCols$1 = (c) => c.filter((x) => x.visible);
	var panelCss$1 = {
		display: "flex",
		flexDirection: "column",
		gap: 2,
		minHeight: 130,
		maxHeight: "min(48vh, 320px)",
		overflowY: "auto",
		minWidth: 0,
		borderRadius: 8,
		border: "1px dashed var(--color-border)",
		padding: 6
	};
	var panelTitle$1 = {
		padding: "0 6px 4px",
		fontSize: 10,
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: ".06em",
		color: "var(--color-muted-foreground)"
	};
	function ColManager$1({ anchorRef, cols, labelFor, onChange, onClose }) {
		const t = useT$1();
		const { draggingId: dragId, overTarget: over, dragPos, startDragMouse, startDragTouch } = useDragReorder({
			cols,
			onChange: (next) => {
				onChange(next);
				saveCols$1(next);
			}
		});
		const [pos, setPos] = (0, react.useState)(null);
		const shown = cols.filter((c) => c.visible);
		const hidden = cols.filter((c) => !c.visible);
		(0, react.useLayoutEffect)(() => {
			const anchor = anchorRef.current;
			if (!anchor) return;
			const rect = anchor.getBoundingClientRect();
			const margin = 8;
			const spaceBelow = window.innerHeight - rect.bottom - margin;
			const spaceAbove = rect.top - margin;
			const width = Math.min(380, window.innerWidth - margin * 2);
			const left = Math.min(Math.max(margin, rect.right - width), window.innerWidth - width - margin);
			if (spaceBelow >= 200 || spaceBelow >= spaceAbove) setPos({
				top: rect.bottom + 6,
				left,
				width,
				maxHeight: Math.max(160, spaceBelow - 6)
			});
			else setPos({
				bottom: window.innerHeight - rect.top + 6,
				left,
				width,
				maxHeight: Math.max(160, spaceAbove - 6)
			});
		}, [anchorRef]);
		function item(col, panel) {
			const isOver = over?.id === col.id && over?.panel === panel;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				"data-col-item": col.id,
				onMouseDown: startDragMouse(col.id),
				onTouchStart: startDragTouch(col.id),
				style: {
					display: "flex",
					alignItems: "center",
					gap: 8,
					borderRadius: 8,
					padding: "6px 8px",
					fontSize: 14,
					cursor: "grab",
					userSelect: "none",
					touchAction: "none",
					opacity: dragId === col.id ? .4 : 1,
					background: isOver ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "transparent",
					boxShadow: isOver ? "0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent)" : "none"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(GripIcon$1, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						flex: 1,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap"
					},
					children: labelFor(col.id)
				})]
			}, col.id);
		}
		if (!pos) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				...card$1,
				position: "fixed",
				left: pos.left,
				width: pos.width,
				zIndex: 50,
				maxHeight: pos.maxHeight,
				overflowY: "auto",
				display: "flex",
				flexDirection: "column",
				...pos.top != null ? { top: pos.top } : { bottom: pos.bottom }
			},
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "10px 12px",
						borderBottom: "1px solid var(--color-border)"
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							fontSize: 14,
							fontWeight: 600
						},
						children: t("columns")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						style: {
							...iconBtn$1,
							width: 22,
							height: 22
						},
						onClick: onClose,
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 8,
						padding: 12
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-col-panel": "hidden",
						style: {
							...panelCss$1,
							...over?.id === "__panel__" && over.panel === "hidden" ? {
								borderColor: "color-mix(in srgb, var(--color-primary) 40%, transparent)",
								background: "color-mix(in srgb, var(--color-primary) 5%, transparent)"
							} : {}
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: panelTitle$1,
							children: t("cols_hidden")
						}), hidden.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: {
								flex: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 11,
								color: "var(--color-muted-foreground)",
								opacity: .5,
								padding: "16px 0"
							},
							children: t("drag_here")
						}) : hidden.map((c) => item(c, "hidden"))]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-col-panel": "visible",
						style: {
							...panelCss$1,
							...over?.id === "__panel__" && over.panel === "visible" ? {
								borderColor: "color-mix(in srgb, var(--color-primary) 40%, transparent)",
								background: "color-mix(in srgb, var(--color-primary) 5%, transparent)"
							} : {}
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: panelTitle$1,
							children: t("cols_visible")
						}), shown.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: {
								flex: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 11,
								color: "var(--color-muted-foreground)",
								opacity: .5,
								padding: "16px 0"
							},
							children: t("drag_here")
						}) : shown.map((c) => item(c, "visible"))]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						borderTop: "1px solid var(--color-border)",
						padding: 6
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						style: {
							...btnGhost$1,
							width: "100%",
							height: 30,
							border: 0,
							justifyContent: "center",
							color: "var(--color-muted-foreground)"
						},
						onClick: () => {
							onChange(DEFAULT_COLS$1);
							saveCols$1(DEFAULT_COLS$1);
						},
						children: t("reset")
					})
				})
			]
		}), dragId && dragPos && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				position: "fixed",
				zIndex: 60,
				left: dragPos.x,
				top: dragPos.y,
				transform: "translate(-50%, -50%)",
				pointerEvents: "none",
				display: "flex",
				alignItems: "center",
				gap: 8,
				borderRadius: 8,
				padding: "6px 10px",
				fontSize: 14,
				fontWeight: 500,
				background: "var(--color-card)",
				border: "1px solid color-mix(in srgb, var(--color-primary) 40%, transparent)",
				boxShadow: "0 4px 16px rgba(0,0,0,.25)"
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(GripIcon$1, {}), labelFor(dragId)]
		})] });
	}
	function Kpi$1({ label: lbl, value, icon, tint }) {
		const color = tint ?? "var(--color-primary)";
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				...card$1,
				display: "flex",
				alignItems: "center",
				gap: 12,
				padding: 16,
				flex: 1,
				minWidth: 120
			},
			children: [icon && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: {
					width: 38,
					height: 38,
					borderRadius: 10,
					display: "grid",
					placeItems: "center",
					flexShrink: 0,
					color,
					background: `color-mix(in srgb, ${color} 14%, transparent)`
				},
				children: icon
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 2,
					minWidth: 0
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						fontSize: 12,
						color: "var(--color-muted-foreground)"
					},
					children: lbl
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						fontSize: 22,
						fontWeight: 700
					},
					children: value == null ? "…" : value
				})]
			})]
		});
	}
	/** yyyy-mm-dd (heure locale) */
	function fmtYmd(d) {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
	}
	function DateRangeFilter({ from, to, onChange, fullWidth }) {
		const t = useT$1();
		const [open, setOpen] = (0, react.useState)(false);
		const [custom, setCustom] = (0, react.useState)(false);
		const ref = (0, react.useRef)(null);
		(0, react.useEffect)(() => {
			if (!open) return;
			const onDown = (e) => {
				if (ref.current && !ref.current.contains(e.target)) setOpen(false);
			};
			document.addEventListener("mousedown", onDown);
			return () => document.removeEventListener("mousedown", onDown);
		}, [open]);
		const today = /* @__PURE__ */ new Date();
		today.setHours(0, 0, 0, 0);
		const shift = (n) => {
			const x = new Date(today);
			x.setDate(x.getDate() + n);
			return x;
		};
		const y = today.getFullYear(), m = today.getMonth();
		const presets = [
			{
				key: "all",
				label: t("dr_all"),
				from: "",
				to: ""
			},
			{
				key: "today",
				label: t("dr_today"),
				from: fmtYmd(today),
				to: fmtYmd(today)
			},
			{
				key: "yesterday",
				label: t("dr_yesterday"),
				from: fmtYmd(shift(-1)),
				to: fmtYmd(shift(-1))
			},
			{
				key: "last7",
				label: t("dr_last7"),
				from: fmtYmd(shift(-6)),
				to: fmtYmd(today)
			},
			{
				key: "last30",
				label: t("dr_last30"),
				from: fmtYmd(shift(-29)),
				to: fmtYmd(today)
			},
			{
				key: "thismonth",
				label: t("dr_thismonth"),
				from: fmtYmd(new Date(y, m, 1)),
				to: fmtYmd(new Date(y, m + 1, 0))
			},
			{
				key: "lastmonth",
				label: t("dr_lastmonth"),
				from: fmtYmd(new Date(y, m - 1, 1)),
				to: fmtYmd(new Date(y, m, 0))
			}
		];
		const activePreset = presets.find((p) => p.from === from && p.to === to);
		const buttonLabel = activePreset && activePreset.key !== "all" ? activePreset.label : from || to ? `${from || "…"} → ${to || "…"}` : t("dr_label");
		function pick(p) {
			onChange(p.from, p.to);
			setCustom(false);
			setOpen(false);
		}
		const itemStyle = (active) => ({
			display: "block",
			width: "100%",
			textAlign: "left",
			padding: "8px 12px",
			border: 0,
			borderRadius: 6,
			background: active ? "var(--color-primary)" : "transparent",
			color: active ? "var(--color-primary-foreground,#fff)" : "var(--color-foreground)",
			fontSize: 13,
			cursor: "pointer",
			whiteSpace: "nowrap"
		});
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			ref,
			style: {
				position: "relative",
				display: fullWidth ? "flex" : "inline-flex",
				width: fullWidth ? "100%" : void 0
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				style: {
					...btnGhost$1,
					height: 36,
					gap: 8,
					...fullWidth ? { width: "100%" } : {}
				},
				onClick: () => setOpen((o) => !o),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CalendarIcon, {}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							maxWidth: fullWidth ? void 0 : 160,
							flex: fullWidth ? 1 : void 0,
							textAlign: fullWidth ? "left" : void 0,
							overflow: "hidden",
							textOverflow: "ellipsis"
						},
						children: buttonLabel
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronDownIcon, {})
				]
			}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					...card$1,
					position: "absolute",
					top: "100%",
					left: 0,
					marginTop: 6,
					zIndex: 60,
					padding: 6,
					minWidth: 200
				},
				children: [
					presets.map((p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						style: itemStyle(!!activePreset && activePreset.key === p.key && !custom),
						onClick: () => pick(p),
						children: p.label
					}, p.key)),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						style: itemStyle(custom),
						onClick: () => setCustom(true),
						children: t("dr_custom")
					}),
					custom && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							borderTop: "1px solid var(--color-border)",
							marginTop: 6,
							paddingTop: 8,
							display: "flex",
							flexDirection: "column",
							gap: 8
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								style: {
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									gap: 8,
									fontSize: 12,
									color: "var(--color-muted-foreground)"
								},
								children: [t("dr_from"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "date",
									style: {
										...inputCss$1,
										height: 32,
										width: 150
									},
									value: from,
									onChange: (e) => onChange(e.target.value, to)
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								style: {
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									gap: 8,
									fontSize: 12,
									color: "var(--color-muted-foreground)"
								},
								children: [t("dr_to"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "date",
									style: {
										...inputCss$1,
										height: 32,
										width: 150
									},
									value: to,
									onChange: (e) => onChange(from, e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: {
									...btnGhost$1,
									height: 32,
									justifyContent: "center"
								},
								onClick: () => setOpen(false),
								children: t("dr_apply")
							})
						]
					})
				]
			})]
		});
	}
	function ProspectsPage() {
		const { id } = (0, react_router_dom.useParams)();
		const location = (0, react_router_dom.useLocation)();
		const base = id ? location.pathname.slice(0, location.pathname.length - id.length - 1) : location.pathname;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			style: {
				display: id ? "none" : "block",
				height: "100%"
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProspectList, { base })
		}), id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProspectForm, {
			id,
			base
		})] });
	}
	function ProspectList({ base }) {
		const t = useT$1();
		const narrow = useIsNarrow();
		const navigate = (0, react_router_dom.useNavigate)();
		const location = (0, react_router_dom.useLocation)();
		const [stats, setStats] = (0, react.useState)(null);
		const [sites, setSites] = (0, react.useState)([]);
		const [types, setTypes] = (0, react.useState)([]);
		const [searchInput, setSearchInput] = (0, react.useState)("");
		const [search, setSearch] = (0, react.useState)("");
		const [site, setSite] = (0, react.useState)(null);
		const [type, setType] = (0, react.useState)("");
		const [dateFrom, setDateFrom] = (0, react.useState)("");
		const [dateTo, setDateTo] = (0, react.useState)("");
		const [toDelete, setToDelete] = (0, react.useState)(null);
		const [refreshKey, setRefreshKey] = (0, react.useState)(0);
		const [refreshing, setRefreshing] = (0, react.useState)(false);
		const [cols, setCols] = (0, react.useState)(loadCols$1);
		const colsAnchorRef = (0, react.useRef)(null);
		const [showCols, setShowCols] = (0, react.useState)(false);
		const [showExport, setShowExport] = (0, react.useState)(false);
		const [mode, setMode] = (0, react.useState)("react");
		const [frameLoaded, setFrameLoaded] = (0, react.useState)(false);
		const [expandedIds, setExpandedIds] = (0, react.useState)(/* @__PURE__ */ new Set());
		function toggleExpand(id) {
			setExpandedIds((prev) => {
				const next = new Set(prev);
				next.has(id) ? next.delete(id) : next.add(id);
				return next;
			});
		}
		const { items, total, loading, hasMore, sentinelRef, sortCol, sortDir, toggleSort, reload, removeLocal } = useKeysetList({
			fetcher: (a) => fetchProspects({
				...a,
				sort: a.sort,
				search,
				site,
				type,
				dateFrom,
				dateTo
			}),
			deps: [
				search,
				site,
				type,
				dateFrom,
				dateTo,
				refreshKey
			],
			defaultSort: "date",
			defaultDir: "desc"
		});
		(0, react.useEffect)(() => {
			if (!loading) setRefreshing(false);
		}, [loading]);
		(0, react.useEffect)(() => {
			if (location.pathname === base && consumeProspectsListStale()) setRefreshKey((x) => x + 1);
		}, [location.pathname, base]);
		(0, react.useEffect)(() => {
			fetchProspectStats().then(setStats).catch(() => null);
		}, [refreshKey]);
		(0, react.useEffect)(() => {
			fetchSites().then(setSites).catch(() => null);
		}, []);
		(0, react.useEffect)(() => {
			fetchTypes().then(setTypes).catch(() => null);
		}, []);
		function handleRefresh() {
			setRefreshing(true);
			setRefreshKey((x) => x + 1);
		}
		function resetFilters() {
			setSearchInput("");
			setSearch("");
			setSite(null);
			setType("");
			setDateFrom("");
			setDateTo("");
			setRefreshing(true);
			setRefreshKey((x) => x + 1);
		}
		async function confirmDelete() {
			if (!toDelete) return;
			try {
				await deleteProspect(toDelete.id);
				window.__melisCloseSubTab?.(base, `${base}/${toDelete.id}`);
				removeLocal((r) => r.id === toDelete.id);
				setToDelete(null);
				reload();
			} catch {
				setToDelete(null);
			}
		}
		function fmtDate(v) {
			try {
				return new Date(v.replace(" ", "T")).toLocaleDateString(currentLang$1() === "fr" ? "fr-FR" : "en-GB", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
				});
			} catch {
				return v;
			}
		}
		function cellValue(r, id) {
			if (id === "id") return r.id;
			if (id === "name") return r.name;
			if (id === "email") return r.email;
			if (id === "phone") return r.telephone;
			if (id === "site") return r.siteName ?? t("none");
			if (id === "type") return r.type ?? t("none");
			if (id === "theme") return r.themeName ?? t("none");
			if (id === "date") return fmtDate(r.contactDate);
			if (id === "message") return r.message;
			return "";
		}
		const shownColsList = cols.filter((c) => c.visible);
		const displayCols = narrow ? shownColsList.map((c, i) => ({
			...c,
			visible: i === 0
		})) : shownColsList;
		const hasHidden = narrow && shownColsList.length > 1;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				flexDirection: "column",
				gap: 20,
				padding: 24,
				height: "100%",
				boxSizing: "border-box",
				overflow: "auto"
			},
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 16
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: { minWidth: 0 },
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
							style: {
								fontSize: 20,
								fontWeight: 700,
								margin: 0,
								...narrow ? {
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap"
								} : {}
							},
							children: t("title")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: {
								fontSize: 14,
								color: "var(--color-muted-foreground)",
								margin: "2px 0 0",
								...narrow ? {
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap"
								} : {}
							},
							children: t("subtitle")
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 8,
							flexShrink: 0
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ViewToggle, {
							mode,
							onChange: (m) => {
								setMode(m);
								if (m === "iframe") setFrameLoaded(true);
							},
							compact: narrow,
							labels: {
								react: t("view_new"),
								iframe: t("view_old")
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: btnGhost$1,
							onClick: handleRefresh,
							disabled: refreshing,
							title: t("refresh"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RotateCcwIcon$1, { spinning: refreshing })
						})]
					})]
				}),
				frameLoaded && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						...card$1,
						display: mode === "iframe" ? "flex" : "none",
						flex: 1,
						minHeight: 480,
						overflow: "hidden"
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("iframe", {
						src: `/melis/react-tool-page?key=${encodeURIComponent(MELIS_KEY$1)}`,
						style: {
							flex: 1,
							width: "100%",
							border: 0
						},
						title: "Prospects — Vue Melis",
						sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						display: mode === "react" ? "flex" : "none",
						flexDirection: "column",
						gap: 20
					},
					children: !can$1("list") ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							...card$1,
							padding: "40px 16px",
							textAlign: "center",
							fontSize: 14,
							color: "var(--color-muted-foreground)"
						},
						children: t("no_access")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: 12,
								flexWrap: "wrap"
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kpi$1, {
									label: t("kpi_total"),
									value: stats?.total ?? null,
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsersKpiIcon, {}),
									tint: "var(--color-primary)"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kpi$1, {
									label: t("kpi_month"),
									value: stats?.thisMonth ?? null,
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CalendarDaysKpiIcon, {}),
									tint: "#2563eb"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kpi$1, {
									label: t("kpi_avg"),
									value: stats?.avgPerMonth ?? null,
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrendingUpKpiIcon, {}),
									tint: "#7c3aed"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kpi$1, {
									label: t("kpi_anon"),
									value: stats?.anonymized ?? null,
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EyeOffKpiIcon, {}),
									tint: "#d97706"
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: 8,
								flexWrap: "wrap",
								alignItems: "center"
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									style: {
										...inputCss$1,
										height: 36,
										...narrow ? { width: "100%" } : {
											flex: 1,
											minWidth: 220
										}
									},
									value: searchInput,
									onChange: (e) => setSearchInput(e.target.value),
									onKeyDown: (e) => e.key === "Enter" && setSearch(searchInput.trim()),
									placeholder: t("search")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									style: {
										...inputCss$1,
										height: 36,
										width: narrow ? "100%" : "auto"
									},
									value: site ?? "",
									onChange: (e) => setSite(e.target.value ? Number(e.target.value) : null),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: "",
										children: t("all_sites")
									}), sites.map((s) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: s.id,
										children: s.name
									}, s.id))]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									style: {
										...inputCss$1,
										height: 36,
										width: narrow ? "100%" : "auto"
									},
									value: type,
									onChange: (e) => setType(e.target.value),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: "",
										children: t("all_types")
									}), types.map((tp) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: tp,
										children: tp
									}, tp))]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DateRangeFilter, {
									from: dateFrom,
									to: dateTo,
									onChange: (f, tt) => {
										setDateFrom(f);
										setDateTo(tt);
									},
									fullWidth: narrow
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: 8,
										...narrow ? {
											width: "100%",
											flexWrap: "wrap"
										} : { marginLeft: "auto" }
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											style: {
												...btnGhost$1,
												height: 36,
												...narrow ? {
													flex: "1 1 100%",
													justifyContent: "center"
												} : {}
											},
											onClick: resetFilters,
											disabled: refreshing,
											title: t("reset_filters"),
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RotateCcwIcon$1, { spinning: refreshing }), t("reset_filters")]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											ref: colsAnchorRef,
											style: {
												position: "relative",
												...narrow ? { flex: "1 1 calc(50% - 4px)" } : {}
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
												style: {
													...btnGhost$1,
													height: 36,
													...narrow ? {
														width: "100%",
														justifyContent: "center"
													} : {}
												},
												onClick: () => setShowCols((v) => !v),
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Columns3Icon$1, {}), t("columns")]
											}), showCols && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ColManager$1, {
												anchorRef: colsAnchorRef,
												cols,
												labelFor: (id) => t(COL_LABEL$1[id]),
												onChange: setCols,
												onClose: () => setShowCols(false)
											})]
										}),
										can$1("export") && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											style: {
												...btnGhost$1,
												height: 36,
												...narrow ? {
													flex: "1 1 calc(50% - 4px)",
													justifyContent: "center"
												} : {}
											},
											onClick: () => setShowExport(true),
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DownloadIcon, {}), t("export")]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								...card$1,
								overflow: "auto"
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
									style: {
										width: "100%",
										borderCollapse: "collapse",
										...!narrow ? { minWidth: 1040 } : {}
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", {
										style: { background: "var(--color-muted,rgba(0,0,0,.03))" },
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
											hasHidden && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { style: {
												...th$1,
												width: 36
											} }),
											visibleCols$1(displayCols).map(({ id }) => {
												const sortable = SORTABLE$1.has(id);
												return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
													style: {
														...th$1,
														...id === "id" ? { width: 70 } : {},
														...sortable ? { cursor: "pointer" } : {}
													},
													onClick: sortable ? () => toggleSort(id) : void 0,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
														style: {
															display: "inline-flex",
															alignItems: "center",
															gap: 4
														},
														children: [t(COL_LABEL$1[id]), sortable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SortIcon$1, { dir: sortCol === id ? sortDir : null })]
													})
												}, id);
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { style: {
												...th$1,
												width: 80
											} })
										] })
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: items.length === 0 && !loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
										style: {
											...td$1,
											textAlign: "center",
											color: "var(--color-muted-foreground)",
											padding: "40px 16px"
										},
										colSpan: visibleCols$1(displayCols).length + 1 + (hasHidden ? 1 : 0),
										children: t("empty")
									}) }) : items.map((r) => {
										const expanded = expandedIds.has(r.id);
										return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
											hasHidden && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
												style: td$1,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExpandToggle, {
													expanded,
													onClick: () => toggleExpand(r.id)
												})
											}),
											visibleCols$1(displayCols).map(({ id }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
												style: {
													...td$1,
													...id === "id" ? {
														color: "var(--color-muted-foreground)",
														fontVariantNumeric: "tabular-nums"
													} : {},
													...id === "message" ? {
														maxWidth: 240,
														whiteSpace: "nowrap",
														overflow: "hidden",
														textOverflow: "ellipsis"
													} : {}
												},
												title: id === "message" ? r.message : void 0,
												children: cellValue(r, id)
											}, id)),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
												style: td$1,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: {
														display: "flex",
														justifyContent: "flex-end",
														gap: 4
													},
													children: [can$1("edit") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														style: iconBtn$1,
														title: t("edit"),
														onClick: () => navigate(`${base}/${r.id}`),
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PencilIcon$1, {})
													}), can$1("delete") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														style: {
															...iconBtn$1,
															color: "var(--color-destructive,#ef4444)"
														},
														title: t("del"),
														onClick: () => setToDelete(r),
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrashIcon$1, {})
													})]
												})
											})
										] }), hasHidden && expanded && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HiddenColsRow, {
											colSpan: visibleCols$1(displayCols).length + 2,
											cols: COL_ORDER$1.filter((id) => id !== "name").map((id) => ({
												label: t(COL_LABEL$1[id]),
												value: cellValue(r, id)
											}))
										})] }, r.id);
									}) })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									ref: sentinelRef,
									style: { height: 1 }
								}),
								loading && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: 8,
										padding: "14px 16px",
										fontSize: 12,
										color: "var(--color-muted-foreground)"
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner$1, {}), t("loading")]
								}),
								!hasMore && items.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									style: {
										padding: "10px 16px",
										textAlign: "center",
										fontSize: 12,
										color: "var(--color-muted-foreground)"
									},
									children: t("count", { n: total })
								})
							]
						})
					] })
				}),
				toDelete && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						position: "fixed",
						inset: 0,
						zIndex: 50,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: "rgba(0,0,0,.5)",
						padding: 16
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							...card$1,
							padding: 24,
							width: "100%",
							maxWidth: 360
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								style: {
									fontSize: 16,
									fontWeight: 600,
									margin: 0
								},
								children: t("del_title")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								style: {
									fontSize: 14,
									color: "var(--color-muted-foreground)",
									marginTop: 8
								},
								children: t("del_confirm", { u: toDelete.name })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "flex-end",
									gap: 8,
									marginTop: 20
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: btnGhost$1,
									onClick: () => setToDelete(null),
									children: t("cancel")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: {
										...btnGhost$1,
										borderColor: "#fca5a5",
										color: "#dc2626"
									},
									onClick: confirmDelete,
									children: t("del")
								})]
							})
						]
					})
				}),
				showExport && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExportModal, {
					cols,
					labelFor: (id) => t(COL_LABEL$1[id]),
					fetchAll: async () => {
						const all = [];
						let after = null;
						do {
							const r = await fetchProspects({
								search,
								site,
								type,
								dateFrom,
								dateTo,
								sort: sortCol,
								dir: sortDir,
								limit: 100,
								after
							});
							all.push(...r.items);
							after = r.nextCursor;
						} while (after);
						return all;
					},
					getCell: (r, id) => {
						if (id === "id") return r.id;
						if (id === "name") return r.name;
						if (id === "email") return r.email;
						if (id === "phone") return r.telephone;
						if (id === "site") return r.siteName ?? "";
						if (id === "type") return r.type ?? "";
						if (id === "theme") return r.themeName ?? "";
						if (id === "date") return fmtDate(r.contactDate);
						if (id === "message") return r.message;
						return "";
					},
					filename: currentLang$1() === "fr" ? "prospects" : "prospects",
					sheetName: t("title"),
					total,
					onClose: () => setShowExport(false)
				})
			]
		});
	}
	function ProspectForm({ id, base }) {
		const t = useT$1();
		const narrow = useIsNarrow();
		const navigate = (0, react_router_dom.useNavigate)();
		const prospectId = parseInt(id);
		const path = `${base}/${id}`;
		const [item, setItem] = (0, react.useState)(null);
		const [siteId, setSiteId] = (0, react.useState)("");
		const [name, setName] = (0, react.useState)("");
		const [email, setEmail] = (0, react.useState)("");
		const [telephone, setTelephone] = (0, react.useState)("");
		const [company, setCompany] = (0, react.useState)("");
		const [country, setCountry] = (0, react.useState)("");
		const [message, setMessage] = (0, react.useState)("");
		const [theme, setTheme] = (0, react.useState)("");
		const [sites, setSites] = (0, react.useState)([]);
		const [themes, setThemes] = (0, react.useState)([]);
		const [loading, setLoading] = (0, react.useState)(false);
		const [saving, setSaving] = (0, react.useState)(false);
		const [error, setError] = (0, react.useState)(null);
		const subTabRegistered = (0, react.useRef)(false);
		(0, react.useEffect)(() => {
			if (!can$1("edit")) navigate(base);
		}, [base, navigate]);
		(0, react.useEffect)(() => {
			fetchSites().then(setSites).catch(() => null);
		}, []);
		(0, react.useEffect)(() => {
			fetchThemes$1().then(setThemes).catch(() => null);
		}, []);
		(0, react.useEffect)(() => {
			if (!subTabRegistered.current) {
				window.__melisOpenSubTab?.(base, {
					id: path,
					label: t("loading"),
					path
				});
				subTabRegistered.current = true;
			}
		}, [
			base,
			path,
			t
		]);
		(0, react.useEffect)(() => {
			setLoading(true);
			fetchProspectById(prospectId).then((r) => {
				setItem(r);
				setSiteId(r.siteId ?? "");
				setName(r.name);
				setEmail(r.email);
				setTelephone(r.telephone);
				setCompany(r.company ?? "");
				setCountry(r.country ?? "");
				setMessage(r.message);
				setTheme(r.theme ?? "");
				window.__melisUpdateSubTabLabel?.(base, path, r.name);
			}).catch(() => navigate(base)).finally(() => setLoading(false));
		}, [prospectId]);
		async function submit() {
			setError(null);
			if (!name.trim() || !email.trim() || !telephone.trim() || !message.trim()) {
				setError(t("err_required"));
				return;
			}
			setSaving(true);
			try {
				await saveProspect({
					id: prospectId,
					siteId: siteId === "" ? null : Number(siteId),
					name: name.trim(),
					email: email.trim(),
					telephone: telephone.trim(),
					message: message.trim(),
					company: company.trim(),
					country: country.trim(),
					theme: theme === "" ? null : Number(theme)
				});
				markProspectsListStale();
				notify$1("ok", t("title"), t("saved"));
				window.__melisUpdateSubTabLabel?.(base, path, name.trim());
				setTimeout(() => navigate(base), 600);
			} catch (e) {
				setError(e instanceof Error ? e.message : t("err_save"));
			} finally {
				setSaving(false);
			}
		}
		function fmtDate(v) {
			try {
				return new Date(v.replace(" ", "T")).toLocaleString(currentLang$1() === "fr" ? "fr-FR" : "en-GB", {
					dateStyle: "medium",
					timeStyle: "short"
				});
			} catch {
				return v;
			}
		}
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				flexDirection: "column",
				gap: 20,
				padding: 24,
				height: "100%",
				boxSizing: "border-box",
				overflow: "auto"
			},
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 16
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 10,
							minWidth: 0
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: {
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: 32,
								height: 32,
								borderRadius: 8,
								background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
								color: "var(--color-primary)",
								flexShrink: 0
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UserIcon, {})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
							style: {
								fontSize: 20,
								fontWeight: 700,
								margin: 0,
								...narrow ? {
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap"
								} : {}
							},
							children: item?.name || t("edit_title")
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 10,
							flexShrink: 0
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: btnPrimary$1,
							onClick: submit,
							disabled: saving || loading,
							children: saving ? "…" : t("save")
						})
					})]
				}),
				error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						...card$1,
						borderColor: "#fca5a5",
						background: "#fef2f2",
						color: "#b91c1c",
						padding: "8px 14px",
						fontSize: 14
					},
					children: error
				}),
				loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						padding: 48,
						textAlign: "center",
						color: "var(--color-muted-foreground)"
					},
					children: t("loading")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: narrow ? "1fr" : "1fr minmax(240px,280px)",
						gap: 20,
						alignItems: "start"
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							flexDirection: "column",
							gap: 20
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								...card$1,
								padding: 20
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								style: secTitle,
								children: t("sec_contact")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: narrow ? "1fr" : "1fr 1fr",
									gap: 16
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										style: label$1,
										children: t("f_name")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										style: inputCss$1,
										value: name,
										onChange: (e) => setName(e.target.value),
										maxLength: 255,
										autoComplete: "off"
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										style: label$1,
										children: t("f_email")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										style: inputCss$1,
										type: "email",
										value: email,
										onChange: (e) => setEmail(e.target.value),
										maxLength: 255,
										autoComplete: "off"
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										style: label$1,
										children: t("f_phone")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										style: inputCss$1,
										value: telephone,
										onChange: (e) => setTelephone(e.target.value),
										autoComplete: "off"
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										style: label$1,
										children: t("f_company")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										style: inputCss$1,
										value: company,
										onChange: (e) => setCompany(e.target.value),
										maxLength: 45,
										autoComplete: "off"
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										style: label$1,
										children: t("f_country")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										style: inputCss$1,
										value: country,
										onChange: (e) => setCountry(e.target.value),
										maxLength: 45,
										autoComplete: "off"
									})] })
								]
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								...card$1,
								padding: 20
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								style: secTitle,
								children: t("sec_message")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								style: {
									...inputCss$1,
									height: "auto",
									minHeight: 140,
									padding: 12,
									resize: "vertical"
								},
								value: message,
								onChange: (e) => setMessage(e.target.value)
							})]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							flexDirection: "column",
							gap: 16
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								...card$1,
								padding: 16
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
									style: {
										fontSize: 11,
										fontWeight: 600,
										textTransform: "uppercase",
										letterSpacing: ".06em",
										color: "var(--color-muted-foreground)",
										margin: "0 0 12px"
									},
									children: t("sec_details")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: { marginBottom: 14 },
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										style: label$1,
										children: t("f_site")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										style: inputCss$1,
										value: siteId,
										onChange: (e) => setSiteId(e.target.value ? Number(e.target.value) : ""),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "",
											children: t("f_site_ph")
										}), sites.map((s) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: s.id,
											children: s.name
										}, s.id))]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: { marginBottom: 14 },
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										style: label$1,
										children: t("f_theme")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										style: inputCss$1,
										value: theme,
										onChange: (e) => setTheme(e.target.value ? Number(e.target.value) : ""),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "",
											children: t("none")
										}), themes.map((th) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: th.id,
											children: th.name
										}, th.id))]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									style: label$1,
									children: t("f_date")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									style: {
										...inputCss$1,
										color: "var(--color-muted-foreground)"
									},
									value: item ? fmtDate(item.contactDate) : "",
									disabled: true
								})] })
							]
						})
					})]
				})
			]
		});
	}
	//#endregion
	//#region src/prospect-themes-api.ts
	/**
	* Client de l'API Thèmes pour la brique MelisCmsProspects.
	*
	* Appelle la couche REST partagée (module MelisReactApi, routes déclarées par ce module) :
	*   /melis/react-api/prospect-themes[/...]
	* Contrat `{ success, data, error }` (comme les outils natifs). La brique ne peut pas
	* importer les modules de l'hôte (`@/lib/...`) — ce client est donc autonome.
	*/
	var XHR_HEADER = { "X-Requested-With": "XMLHttpRequest" };
	var _themesListStale = false;
	function markThemesListStale() {
		_themesListStale = true;
	}
	function consumeThemesListStale() {
		const stale = _themesListStale;
		_themesListStale = false;
		return stale;
	}
	async function apiFetch(url, opts) {
		const res = await fetch(url, {
			...opts,
			headers: {
				...XHR_HEADER,
				...opts?.headers ?? {}
			},
			credentials: "include"
		});
		if (!res.ok) {
			let msg = `HTTP ${res.status}`;
			try {
				const d = await res.json();
				if (d.error) msg = d.error;
			} catch {}
			throw new Error(msg);
		}
		const data = await res.json();
		if (!data.success) throw new Error(data.error ?? "API error");
		return data.data;
	}
	async function fetchThemes(params = {}) {
		const qs = new URLSearchParams();
		if (params.limit) qs.set("limit", String(params.limit));
		if (params.search) qs.set("search", params.search);
		if (params.sort) qs.set("sort", params.sort);
		if (params.dir) qs.set("dir", params.dir);
		if (params.after) qs.set("after", params.after);
		return apiFetch(`/melis/react-api/prospect-themes?${qs}`);
	}
	async function fetchThemeById(id) {
		return apiFetch(`/melis/react-api/prospect-themes/${id}`);
	}
	async function fetchThemeStats() {
		return apiFetch("/melis/react-api/prospect-themes/stats");
	}
	async function saveTheme(payload) {
		return apiFetch("/melis/react-api/prospect-themes/save", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		});
	}
	async function deleteTheme(id) {
		await apiFetch(`/melis/react-api/prospect-themes/delete/${id}`, { method: "DELETE" });
	}
	async function fetchThemeItems(themeId, params = {}) {
		const qs = new URLSearchParams();
		qs.set("themeId", String(themeId));
		if (params.search) qs.set("search", params.search);
		return (await apiFetch(`/melis/react-api/prospect-themes/items?${qs}`)).items;
	}
	async function fetchThemeItemById(id) {
		return apiFetch(`/melis/react-api/prospect-themes/items/${id}`);
	}
	async function fetchCmsLanguages() {
		return (await apiFetch("/melis/react-api/prospect-themes/languages")).languages;
	}
	async function saveThemeItem(payload) {
		return apiFetch("/melis/react-api/prospect-themes/items/save", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		});
	}
	async function deleteThemeItem(id) {
		await apiFetch(`/melis/react-api/prospect-themes/items/delete/${id}`, { method: "DELETE" });
	}
	//#endregion
	//#region src/ProspectThemesPage.tsx
	var MELIS_KEY = "MelisCmsProspects_tool_themes";
	var CAPS_KEY = "melisprospects_tool_themes_section";
	function can(cap) {
		return window.MelisCan?.(CAPS_KEY, cap) ?? true;
	}
	function currentLang() {
		return (document.documentElement.lang || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
	}
	var DICT = {
		fr: {
			title: "Thèmes",
			subtitle: "Thèmes de contact (formulaires de prospects)",
			search: "Rechercher un thème…",
			empty: "Aucun thème trouvé",
			count: "{n} thèmes — fin de la liste",
			kpi_total: "Total",
			kpi_code: "Avec code",
			kpi_items: "Éléments",
			col_id: "ID",
			col_name: "Nom",
			col_code: "Code",
			col_items: "Éléments",
			columns: "Colonnes",
			export: "Exporter",
			cols_visible: "Visibles",
			cols_hidden: "Masquées",
			drag_here: "Glisser ici",
			reset: "Réinitialiser",
			reset_filters: "Réinitialiser les filtres",
			rename: "Renommer",
			edit: "Éditer",
			del: "Supprimer",
			cancel: "Annuler",
			save: "Enregistrer",
			back: "Retour",
			add: "Nouveau thème",
			items_title: "Éléments — {u}",
			items_add: "Nouvel élément",
			items_empty: "Aucun élément",
			items_count: "{n} éléments",
			items_search: "Rechercher un élément…",
			items_new_title: "Nouvel élément",
			items_edit_title: "Élément",
			items_name: "Nom",
			tab_theme: "Thème",
			tab_items: "Éléments",
			items_content_per_lang: "Contenu par langue",
			items_required: "Au moins un nom (dans une langue) est obligatoire.",
			items_del_title: "Supprimer l’élément",
			items_del_confirm: "Supprimer « {u} » ? Cette action est irréversible.",
			refresh: "Rafraîchir",
			loading: "Chargement…",
			saved: "Enregistré ✓",
			del_title: "Supprimer le thème",
			del_confirm: "Supprimer « {u} » ? Ses éléments et traductions seront aussi supprimés. Cette action est irréversible.",
			edit_title: "Thème",
			new_title: "Nouveau thème",
			sec_identity: "Identité",
			sec_info: "Information",
			f_name: "Nom",
			f_code: "Code",
			f_code_ph: "Optionnel — identifiant technique",
			info_note: "Le nom identifie le thème dans le back-office (formulaires de prospects).",
			err_save: "Erreur lors de la sauvegarde",
			err_required: "Le nom du thème est obligatoire.",
			no_access: "Vous n’avez pas les droits pour consulter cette liste.",
			none: "—",
			view_new: "Nouveau",
			view_old: "Ancien"
		},
		en: {
			title: "Themes",
			subtitle: "Contact themes (prospect forms)",
			search: "Search a theme…",
			empty: "No theme found",
			count: "{n} themes — end of list",
			kpi_total: "Total",
			kpi_code: "With code",
			kpi_items: "Items",
			col_id: "ID",
			col_name: "Name",
			col_code: "Code",
			col_items: "Items",
			columns: "Columns",
			export: "Export",
			cols_visible: "Visible",
			cols_hidden: "Hidden",
			drag_here: "Drag here",
			reset: "Reset",
			reset_filters: "Reset filters",
			rename: "Rename",
			edit: "Edit",
			del: "Delete",
			cancel: "Cancel",
			save: "Save",
			back: "Back",
			add: "New theme",
			items_title: "Items — {u}",
			items_add: "New item",
			items_empty: "No item",
			items_count: "{n} items",
			items_search: "Search an item…",
			items_new_title: "New item",
			items_edit_title: "Item",
			items_name: "Name",
			tab_theme: "Theme",
			tab_items: "Items",
			items_content_per_lang: "Content per language",
			items_required: "At least one name (in one language) is required.",
			items_del_title: "Delete item",
			items_del_confirm: "Delete “{u}”? This action is irreversible.",
			refresh: "Refresh",
			loading: "Loading…",
			saved: "Saved ✓",
			del_title: "Delete theme",
			del_confirm: "Delete “{u}”? Its items and translations will also be removed. This action is irreversible.",
			edit_title: "Theme",
			new_title: "New theme",
			sec_identity: "Identity",
			sec_info: "Information",
			f_name: "Name",
			f_code: "Code",
			f_code_ph: "Optional — technical identifier",
			info_note: "The name identifies the theme in the back-office (prospect forms).",
			err_save: "Error while saving",
			err_required: "The theme name is required.",
			no_access: "You do not have permission to view this list.",
			none: "—",
			view_new: "New",
			view_old: "Old"
		}
	};
	function useT() {
		const lang = currentLang();
		return (key, vars) => {
			let s = DICT[lang][key] ?? key;
			if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
			return s;
		};
	}
	function notify(kind, title, message) {
		window.postMessage({
			__melisNotif: true,
			kind,
			title,
			message
		}, "*");
	}
	var card = {
		border: "1px solid var(--color-border)",
		background: "var(--color-card)",
		borderRadius: 12,
		boxShadow: "0 1px 2px rgba(0,0,0,.04)"
	};
	var inputCss = {
		height: 40,
		width: "100%",
		boxSizing: "border-box",
		borderRadius: 8,
		border: "1px solid var(--color-input,var(--color-border))",
		background: "var(--color-card)",
		color: "var(--color-foreground)",
		padding: "0 12px",
		fontSize: 14,
		outline: "none"
	};
	var btnPrimary = {
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		height: 36,
		padding: "0 14px",
		borderRadius: 8,
		border: 0,
		background: "var(--color-primary)",
		color: "var(--color-primary-foreground,#fff)",
		fontSize: 14,
		fontWeight: 500,
		cursor: "pointer"
	};
	var btnGhost = {
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		height: 36,
		padding: "0 12px",
		borderRadius: 8,
		border: "1px solid var(--color-border)",
		background: "var(--color-card)",
		color: "var(--color-foreground)",
		fontSize: 14,
		cursor: "pointer"
	};
	var iconBtn = {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		width: 28,
		height: 28,
		borderRadius: 6,
		border: 0,
		background: "transparent",
		color: "var(--color-muted-foreground)",
		cursor: "pointer"
	};
	var th = {
		textAlign: "left",
		padding: "10px 16px",
		fontSize: 11,
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: ".04em",
		color: "var(--color-muted-foreground)",
		whiteSpace: "nowrap"
	};
	var td = {
		padding: "10px 16px",
		fontSize: 14,
		color: "var(--color-foreground)",
		borderTop: "1px solid var(--color-border)"
	};
	var label = {
		display: "block",
		fontSize: 13,
		fontWeight: 500,
		marginBottom: 4,
		color: "var(--color-foreground)"
	};
	var langTab = {
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		height: 30,
		padding: "0 12px",
		borderRadius: 6,
		border: "1px solid var(--color-border)",
		background: "transparent",
		color: "var(--color-muted-foreground)",
		fontSize: 13,
		cursor: "pointer"
	};
	var langTabActive = {
		background: "var(--color-card)",
		color: "var(--color-foreground)",
		borderColor: "var(--color-primary,#e11d48)"
	};
	function LangFlag({ locale, size = 15 }) {
		const short = (locale || "").split("_")[0].toLowerCase();
		if (!short) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
			src: `/MelisCore/assets/images/lang/${short}.png`,
			alt: "",
			width: size,
			height: Math.round(size * 2 / 3),
			style: {
				display: "inline-block",
				borderRadius: 2,
				objectFit: "cover",
				boxShadow: "0 0 0 1px rgba(0,0,0,.10)",
				flexShrink: 0
			},
			onError: (e) => {
				e.currentTarget.style.display = "none";
			}
		});
	}
	var sIcon = {
		width: 15,
		height: 15,
		flexShrink: 0
	};
	var PencilIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: sIcon,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 20h9" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" })]
	});
	var TrashIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		style: sIcon,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" })
	});
	var PlusIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		style: sIcon,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 5v14M5 12h14" })
	});
	var RenameIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: sIcon,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13 20h-1a3 3 0 0 1-3-3 3 3 0 0 1-3 3H5" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 7v10" })
		]
	});
	var GripIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: {
			width: 13,
			height: 13,
			flexShrink: 0,
			color: "var(--color-muted-foreground)"
		},
		viewBox: "0 0 24 24",
		fill: "currentColor",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "9",
				cy: "6",
				r: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "15",
				cy: "6",
				r: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "9",
				cy: "12",
				r: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "15",
				cy: "12",
				r: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "9",
				cy: "18",
				r: "1.5"
			})
		]
	});
	var SearchIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: {
			width: 16,
			height: 16,
			flexShrink: 0
		},
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "11",
			cy: "11",
			r: "8"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m21 21-4.3-4.3" })]
	});
	var TagIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: {
			width: 20,
			height: 20
		},
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "7.5",
			cy: "7.5",
			r: "1.5",
			fill: "currentColor"
		})]
	});
	var Columns3Icon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: sIcon,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
			width: "18",
			height: "18",
			x: "3",
			y: "3",
			rx: "2"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 3v18M15 3v18" })]
	});
	var RotateCcwIcon = ({ spinning }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: {
			...sIcon,
			animation: spinning ? "melis-themes-spin 0.8s linear infinite" : void 0,
			transformOrigin: "center"
		},
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: "@keyframes melis-themes-spin { to { transform: rotate(360deg) } }" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 3v5h5" })
		]
	});
	function SortIcon({ dir }) {
		const p = {
			width: 12,
			height: 12,
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: 2,
			strokeLinecap: "round",
			strokeLinejoin: "round",
			style: {
				flexShrink: 0,
				opacity: dir ? 1 : .3
			}
		};
		if (dir === "asc") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
			...p,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m5 12 7-7 7 7" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 19V5" })]
		});
		if (dir === "desc") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
			...p,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 5v14" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m19 12-7 7-7-7" })]
		});
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
			...p,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m21 16-4 4-4-4" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M17 20V4" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m3 8 4-4 4 4" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M7 4v16" })
			]
		});
	}
	var Spinner = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: {
			width: 14,
			height: 14,
			animation: "melis-themes-spin 0.8s linear infinite"
		},
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.5",
		strokeLinecap: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: "@keyframes melis-themes-spin { to { transform: rotate(360deg) } }" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })]
	});
	var LayoutGridKpiIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		width: 20,
		height: 20,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "3",
				y: "3",
				width: "7",
				height: "7",
				rx: "1"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "14",
				y: "3",
				width: "7",
				height: "7",
				rx: "1"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "3",
				y: "14",
				width: "7",
				height: "7",
				rx: "1"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "14",
				y: "14",
				width: "7",
				height: "7",
				rx: "1"
			})
		]
	});
	var ListKpiIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		width: 20,
		height: 20,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 6h13M8 12h13M8 18h13" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 6h.01M3 12h.01M3 18h.01" })]
	});
	var SORTABLE = new Set([
		"id",
		"name",
		"items"
	]);
	var COL_ORDER = [
		"id",
		"name",
		"items"
	];
	var COL_LABEL = {
		id: "col_id",
		name: "col_name",
		items: "col_items"
	};
	var DEFAULT_COLS = COL_ORDER.map((id) => ({
		id,
		visible: true
	}));
	var COL_KEY = "melis-prospect-themes-cols-v2";
	function loadCols() {
		try {
			const raw = localStorage.getItem(COL_KEY);
			if (!raw) return DEFAULT_COLS;
			const saved = JSON.parse(raw);
			const ordered = saved.map((s) => {
				const d = DEFAULT_COLS.find((c) => c.id === s.id);
				return d ? {
					id: d.id,
					visible: s.visible
				} : null;
			}).filter(Boolean);
			const missing = DEFAULT_COLS.filter((d) => !saved.find((s) => s.id === d.id));
			return [...ordered, ...missing];
		} catch {
			return DEFAULT_COLS;
		}
	}
	function saveCols(c) {
		try {
			localStorage.setItem(COL_KEY, JSON.stringify(c));
		} catch {}
	}
	var visibleCols = (c) => c.filter((x) => x.visible);
	var panelCss = {
		display: "flex",
		flexDirection: "column",
		gap: 2,
		minHeight: 130,
		maxHeight: "min(48vh, 320px)",
		overflowY: "auto",
		minWidth: 0,
		borderRadius: 8,
		border: "1px dashed var(--color-border)",
		padding: 6
	};
	var panelTitle = {
		padding: "0 6px 4px",
		fontSize: 10,
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: ".06em",
		color: "var(--color-muted-foreground)"
	};
	function ColManager({ anchorRef, cols, labelFor, onChange, onClose }) {
		const t = useT();
		const { draggingId: dragId, overTarget: over, dragPos, startDragMouse, startDragTouch } = useDragReorder({
			cols,
			onChange: (next) => {
				onChange(next);
				saveCols(next);
			}
		});
		const [pos, setPos] = (0, react.useState)(null);
		const shown = cols.filter((c) => c.visible);
		const hidden = cols.filter((c) => !c.visible);
		(0, react.useLayoutEffect)(() => {
			const anchor = anchorRef.current;
			if (!anchor) return;
			const rect = anchor.getBoundingClientRect();
			const margin = 8;
			const spaceBelow = window.innerHeight - rect.bottom - margin;
			const spaceAbove = rect.top - margin;
			const width = Math.min(380, window.innerWidth - margin * 2);
			const left = Math.min(Math.max(margin, rect.right - width), window.innerWidth - width - margin);
			if (spaceBelow >= 200 || spaceBelow >= spaceAbove) setPos({
				top: rect.bottom + 6,
				left,
				width,
				maxHeight: Math.max(160, spaceBelow - 6)
			});
			else setPos({
				bottom: window.innerHeight - rect.top + 6,
				left,
				width,
				maxHeight: Math.max(160, spaceAbove - 6)
			});
		}, [anchorRef]);
		function item(col, panel) {
			const isOver = over?.id === col.id && over?.panel === panel;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				"data-col-item": col.id,
				onMouseDown: startDragMouse(col.id),
				onTouchStart: startDragTouch(col.id),
				style: {
					display: "flex",
					alignItems: "center",
					gap: 8,
					borderRadius: 8,
					padding: "6px 8px",
					fontSize: 14,
					cursor: "grab",
					userSelect: "none",
					touchAction: "none",
					opacity: dragId === col.id ? .4 : 1,
					background: isOver ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "transparent",
					boxShadow: isOver ? "0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent)" : "none"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(GripIcon, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						flex: 1,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap"
					},
					children: labelFor(col.id)
				})]
			}, col.id);
		}
		if (!pos) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				...card,
				position: "fixed",
				left: pos.left,
				width: pos.width,
				zIndex: 50,
				maxHeight: pos.maxHeight,
				overflowY: "auto",
				display: "flex",
				flexDirection: "column",
				...pos.top != null ? { top: pos.top } : { bottom: pos.bottom }
			},
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "10px 12px",
						borderBottom: "1px solid var(--color-border)"
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							fontSize: 14,
							fontWeight: 600
						},
						children: t("columns")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						style: {
							...iconBtn,
							width: 22,
							height: 22
						},
						onClick: onClose,
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 8,
						padding: 12
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-col-panel": "hidden",
						style: {
							...panelCss,
							...over?.id === "__panel__" && over.panel === "hidden" ? {
								borderColor: "color-mix(in srgb, var(--color-primary) 40%, transparent)",
								background: "color-mix(in srgb, var(--color-primary) 5%, transparent)"
							} : {}
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: panelTitle,
							children: t("cols_hidden")
						}), hidden.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: {
								flex: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 11,
								color: "var(--color-muted-foreground)",
								opacity: .5,
								padding: "16px 0"
							},
							children: t("drag_here")
						}) : hidden.map((c) => item(c, "hidden"))]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-col-panel": "visible",
						style: {
							...panelCss,
							...over?.id === "__panel__" && over.panel === "visible" ? {
								borderColor: "color-mix(in srgb, var(--color-primary) 40%, transparent)",
								background: "color-mix(in srgb, var(--color-primary) 5%, transparent)"
							} : {}
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: panelTitle,
							children: t("cols_visible")
						}), shown.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: {
								flex: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 11,
								color: "var(--color-muted-foreground)",
								opacity: .5,
								padding: "16px 0"
							},
							children: t("drag_here")
						}) : shown.map((c) => item(c, "visible"))]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						borderTop: "1px solid var(--color-border)",
						padding: 6
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						style: {
							...btnGhost,
							width: "100%",
							height: 30,
							border: 0,
							justifyContent: "center",
							color: "var(--color-muted-foreground)"
						},
						onClick: () => {
							onChange(DEFAULT_COLS);
							saveCols(DEFAULT_COLS);
						},
						children: t("reset")
					})
				})
			]
		}), dragId && dragPos && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				position: "fixed",
				zIndex: 60,
				left: dragPos.x,
				top: dragPos.y,
				transform: "translate(-50%, -50%)",
				pointerEvents: "none",
				display: "flex",
				alignItems: "center",
				gap: 8,
				borderRadius: 8,
				padding: "6px 10px",
				fontSize: 14,
				fontWeight: 500,
				background: "var(--color-card)",
				border: "1px solid color-mix(in srgb, var(--color-primary) 40%, transparent)",
				boxShadow: "0 4px 16px rgba(0,0,0,.25)"
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(GripIcon, {}), labelFor(dragId)]
		})] });
	}
	function Kpi({ label: lbl, value, icon, tint }) {
		const color = tint ?? "var(--color-primary)";
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				...card,
				display: "flex",
				alignItems: "center",
				gap: 12,
				padding: 16,
				flex: 1,
				minWidth: 120
			},
			children: [icon && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: {
					width: 38,
					height: 38,
					borderRadius: 10,
					display: "grid",
					placeItems: "center",
					flexShrink: 0,
					color,
					background: `color-mix(in srgb, ${color} 14%, transparent)`
				},
				children: icon
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 2,
					minWidth: 0
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						fontSize: 12,
						color: "var(--color-muted-foreground)"
					},
					children: lbl
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						fontSize: 22,
						fontWeight: 700
					},
					children: value == null ? "…" : value
				})]
			})]
		});
	}
	function ProspectThemesPage() {
		const { id } = (0, react_router_dom.useParams)();
		const location = (0, react_router_dom.useLocation)();
		const base = id ? location.pathname.slice(0, location.pathname.length - id.length - 1) : location.pathname;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			style: {
				display: id ? "none" : "block",
				height: "100%"
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ThemeList, { base })
		}), id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ThemeForm, {
			id,
			base
		})] });
	}
	function ThemeList({ base }) {
		const t = useT();
		const narrow = useIsNarrow();
		const navigate = (0, react_router_dom.useNavigate)();
		const location = (0, react_router_dom.useLocation)();
		const [stats, setStats] = (0, react.useState)(null);
		const [searchInput, setSearchInput] = (0, react.useState)("");
		const [search, setSearch] = (0, react.useState)("");
		const [toDelete, setToDelete] = (0, react.useState)(null);
		const [editingTheme, setEditingTheme] = (0, react.useState)(null);
		const [refreshKey, setRefreshKey] = (0, react.useState)(0);
		const [refreshing, setRefreshing] = (0, react.useState)(false);
		const [cols, setCols] = (0, react.useState)(loadCols);
		const colsAnchorRef = (0, react.useRef)(null);
		const [showCols, setShowCols] = (0, react.useState)(false);
		const [showExport, setShowExport] = (0, react.useState)(false);
		const [mode, setMode] = (0, react.useState)("react");
		const [frameLoaded, setFrameLoaded] = (0, react.useState)(false);
		const [expandedIds, setExpandedIds] = (0, react.useState)(/* @__PURE__ */ new Set());
		function toggleExpand(id) {
			setExpandedIds((prev) => {
				const next = new Set(prev);
				next.has(id) ? next.delete(id) : next.add(id);
				return next;
			});
		}
		const { items, total, loading, hasMore, sentinelRef, sortCol, sortDir, toggleSort, reload, removeLocal } = useKeysetList({
			fetcher: (a) => fetchThemes({
				...a,
				sort: a.sort,
				search
			}),
			deps: [search, refreshKey],
			defaultSort: "id",
			defaultDir: "desc"
		});
		(0, react.useEffect)(() => {
			if (!loading) setRefreshing(false);
		}, [loading]);
		(0, react.useEffect)(() => {
			window.__melisSetToolView?.(MELIS_KEY, mode);
		}, [mode]);
		(0, react.useEffect)(() => {
			if (location.pathname === base && consumeThemesListStale()) setRefreshKey((x) => x + 1);
		}, [location.pathname, base]);
		(0, react.useEffect)(() => {
			fetchThemeStats().then(setStats).catch(() => null);
		}, [refreshKey]);
		function handleRefresh() {
			setRefreshing(true);
			setRefreshKey((x) => x + 1);
		}
		function resetFilters() {
			setSearchInput("");
			setSearch("");
			setRefreshing(true);
			setRefreshKey((x) => x + 1);
		}
		async function confirmDelete() {
			if (!toDelete) return;
			try {
				await deleteTheme(toDelete.id);
				window.__melisCloseSubTab?.(base, `${base}/${toDelete.id}`);
				removeLocal((r) => r.id === toDelete.id);
				setToDelete(null);
				reload();
			} catch {
				setToDelete(null);
			}
		}
		function cellText(r, id) {
			if (id === "id") return r.id;
			if (id === "name") return r.name;
			if (id === "items") return r.itemCount;
			return "";
		}
		const shownColsList = cols.filter((c) => c.visible);
		const displayCols = narrow ? shownColsList.map((c, i) => ({
			...c,
			visible: i === 0
		})) : shownColsList;
		const hasHidden = narrow && shownColsList.length > 1;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				flexDirection: "column",
				gap: 20,
				padding: 24,
				height: "100%",
				boxSizing: "border-box",
				overflow: "auto"
			},
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: narrow ? "flex-start" : "center",
						justifyContent: "space-between",
						gap: 16
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: { minWidth: 0 },
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
							style: {
								fontSize: 20,
								fontWeight: 700,
								margin: 0,
								...narrow ? {
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap"
								} : {}
							},
							children: t("title")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: {
								fontSize: 14,
								color: "var(--color-muted-foreground)",
								margin: "2px 0 0",
								...narrow ? {
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap"
								} : {}
							},
							children: t("subtitle")
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: narrow ? {
							display: "flex",
							flexDirection: "column",
							gap: 8,
							flexShrink: 0
						} : {
							display: "flex",
							alignItems: "center",
							gap: 8,
							flexShrink: 0
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 8,
								justifyContent: narrow ? "flex-end" : void 0
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ViewToggle, {
								mode,
								onChange: (m) => {
									setMode(m);
									if (m === "iframe") setFrameLoaded(true);
								},
								compact: narrow,
								labels: {
									react: t("view_new"),
									iframe: t("view_old")
								}
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: btnGhost,
								onClick: handleRefresh,
								disabled: refreshing,
								title: t("refresh"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RotateCcwIcon, { spinning: refreshing })
							})]
						}), can("create") && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							style: {
								...btnPrimary,
								...narrow ? {
									width: "100%",
									justifyContent: "center"
								} : {}
							},
							onClick: () => setEditingTheme("new"),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlusIcon, {}), t("add")]
						})]
					})]
				}),
				frameLoaded && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						...card,
						display: mode === "iframe" ? "flex" : "none",
						flex: 1,
						minHeight: 480,
						overflow: "hidden"
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("iframe", {
						src: `/melis/react-tool-page?key=${encodeURIComponent(MELIS_KEY)}`,
						style: {
							flex: 1,
							width: "100%",
							border: 0
						},
						title: "Thèmes — Vue Melis",
						sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						display: mode === "react" ? "flex" : "none",
						flexDirection: "column",
						gap: 20,
						flex: 1,
						minHeight: 0
					},
					children: !can("list") ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							...card,
							padding: "40px 16px",
							textAlign: "center",
							fontSize: 14,
							color: "var(--color-muted-foreground)"
						},
						children: t("no_access")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: 12,
								flexWrap: "wrap"
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kpi, {
								label: t("kpi_total"),
								value: stats?.total ?? null,
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LayoutGridKpiIcon, {}),
								tint: "var(--color-primary)"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kpi, {
								label: t("kpi_items"),
								value: stats?.items ?? null,
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ListKpiIcon, {}),
								tint: "#2563eb"
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: 8,
								flexWrap: "wrap",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								style: {
									...inputCss,
									height: 36,
									...narrow ? { width: "100%" } : {
										flex: 1,
										minWidth: 220
									}
								},
								value: searchInput,
								onChange: (e) => setSearchInput(e.target.value),
								onKeyDown: (e) => e.key === "Enter" && setSearch(searchInput.trim()),
								placeholder: t("search")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: 8,
									...narrow ? {
										width: "100%",
										flexWrap: "wrap"
									} : { marginLeft: "auto" }
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										style: {
											...btnGhost,
											height: 36,
											...narrow ? {
												flex: "1 1 100%",
												justifyContent: "center"
											} : {}
										},
										onClick: resetFilters,
										disabled: refreshing,
										title: t("reset_filters"),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RotateCcwIcon, { spinning: refreshing }), t("reset_filters")]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										ref: colsAnchorRef,
										style: {
											position: "relative",
											...narrow ? { flex: "1 1 calc(50% - 4px)" } : {}
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											style: {
												...btnGhost,
												height: 36,
												...narrow ? {
													width: "100%",
													justifyContent: "center"
												} : {}
											},
											onClick: () => setShowCols((v) => !v),
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Columns3Icon, {}), t("columns")]
										}), showCols && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ColManager, {
											anchorRef: colsAnchorRef,
											cols,
											labelFor: (id) => t(COL_LABEL[id]),
											onChange: setCols,
											onClose: () => setShowCols(false)
										})]
									}),
									can("export") && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										style: {
											...btnGhost,
											height: 36,
											...narrow ? {
												flex: "1 1 calc(50% - 4px)",
												justifyContent: "center"
											} : {}
										},
										onClick: () => setShowExport(true),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DownloadIcon, {}), t("export")]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								...card,
								overflow: "auto"
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
									style: {
										width: "100%",
										borderCollapse: "collapse",
										...!narrow ? { minWidth: 640 } : {}
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", {
										style: { background: "var(--color-muted,rgba(0,0,0,.03))" },
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
											hasHidden && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { style: {
												...th,
												width: 36
											} }),
											visibleCols(displayCols).map(({ id }) => {
												const sortable = SORTABLE.has(id);
												return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
													style: {
														...th,
														...id === "id" ? { width: 70 } : {},
														...id === "items" ? { width: 100 } : {},
														...sortable ? { cursor: "pointer" } : {}
													},
													onClick: sortable ? () => toggleSort(id) : void 0,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
														style: {
															display: "inline-flex",
															alignItems: "center",
															gap: 4
														},
														children: [t(COL_LABEL[id]), sortable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SortIcon, { dir: sortCol === id ? sortDir : null })]
													})
												}, id);
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { style: {
												...th,
												width: 120
											} })
										] })
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: items.length === 0 && !loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
										style: {
											...td,
											textAlign: "center",
											color: "var(--color-muted-foreground)",
											padding: "40px 16px"
										},
										colSpan: visibleCols(displayCols).length + 1 + (hasHidden ? 1 : 0),
										children: t("empty")
									}) }) : items.map((r) => {
										const expanded = expandedIds.has(r.id);
										return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
											hasHidden && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
												style: td,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExpandToggle, {
													expanded,
													onClick: () => toggleExpand(r.id)
												})
											}),
											visibleCols(displayCols).map(({ id }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", {
												style: {
													...td,
													...id === "id" ? {
														color: "var(--color-muted-foreground)",
														fontVariantNumeric: "tabular-nums"
													} : {},
													...id === "name" ? { fontWeight: 500 } : {}
												},
												children: [
													id === "id" && r.id,
													id === "name" && r.name,
													id === "items" && r.itemCount
												]
											}, id)),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
												style: td,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: {
														display: "flex",
														justifyContent: "flex-end",
														gap: 4
													},
													children: [
														can("edit") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															style: iconBtn,
															title: t("rename"),
															onClick: () => setEditingTheme(r),
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RenameIcon, {})
														}),
														can("items") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															style: iconBtn,
															title: t("edit"),
															onClick: () => navigate(`${base}/${r.id}`),
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PencilIcon, {})
														}),
														can("delete") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															style: {
																...iconBtn,
																color: "var(--color-destructive,#ef4444)"
															},
															title: t("del"),
															onClick: () => setToDelete(r),
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrashIcon, {})
														})
													]
												})
											})
										] }), hasHidden && expanded && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HiddenColsRow, {
											colSpan: visibleCols(displayCols).length + 2,
											cols: COL_ORDER.filter((id) => id !== "name").map((id) => ({
												label: t(COL_LABEL[id]),
												value: cellText(r, id)
											}))
										})] }, r.id);
									}) })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									ref: sentinelRef,
									style: { height: 1 }
								}),
								loading && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: 8,
										padding: "14px 16px",
										fontSize: 12,
										color: "var(--color-muted-foreground)"
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}), t("loading")]
								}),
								!hasMore && items.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									style: {
										padding: "10px 16px",
										textAlign: "center",
										fontSize: 12,
										color: "var(--color-muted-foreground)"
									},
									children: t("count", { n: total })
								})
							]
						})
					] })
				}),
				editingTheme && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ThemeModal, {
					theme: editingTheme,
					onClose: () => setEditingTheme(null),
					onSaved: () => {
						setEditingTheme(null);
						setRefreshKey((x) => x + 1);
					}
				}),
				toDelete && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						position: "fixed",
						inset: 0,
						zIndex: 50,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: "rgba(0,0,0,.5)",
						padding: 16
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							...card,
							padding: 24,
							width: "100%",
							maxWidth: 380
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								style: {
									fontSize: 16,
									fontWeight: 600,
									margin: 0
								},
								children: t("del_title")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								style: {
									fontSize: 14,
									color: "var(--color-muted-foreground)",
									marginTop: 8
								},
								children: t("del_confirm", { u: toDelete.name })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "flex-end",
									gap: 8,
									marginTop: 20
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: btnGhost,
									onClick: () => setToDelete(null),
									children: t("cancel")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: {
										...btnGhost,
										borderColor: "#fca5a5",
										color: "#dc2626"
									},
									onClick: confirmDelete,
									children: t("del")
								})]
							})
						]
					})
				}),
				showExport && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExportModal, {
					cols,
					labelFor: (id) => t(COL_LABEL[id]),
					fetchAll: async () => {
						const all = [];
						let after = null;
						do {
							const r = await fetchThemes({
								search,
								sort: sortCol,
								dir: sortDir,
								limit: 100,
								after
							});
							all.push(...r.items);
							after = r.nextCursor;
						} while (after);
						return all;
					},
					getCell: (r, id) => cellText(r, id),
					filename: "prospect-themes",
					sheetName: t("title"),
					total,
					onClose: () => setShowExport(false)
				})
			]
		});
	}
	function ThemeModal({ theme, onClose, onSaved }) {
		const t = useT();
		const isNew = theme === "new";
		const [name, setName] = (0, react.useState)(isNew ? "" : theme.name);
		const [saving, setSaving] = (0, react.useState)(false);
		const [error, setError] = (0, react.useState)(null);
		async function submit() {
			setError(null);
			if (!name.trim()) {
				setError(t("err_required"));
				return;
			}
			setSaving(true);
			try {
				await saveTheme({
					id: isNew ? 0 : theme.id,
					name: name.trim()
				});
				notify("ok", t("title"), t("saved"));
				onSaved();
			} catch (e) {
				setError(e instanceof Error ? e.message : t("err_save"));
			} finally {
				setSaving(false);
			}
		}
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			style: {
				position: "fixed",
				inset: 0,
				zIndex: 50,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "rgba(0,0,0,.5)",
				padding: 16
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					...card,
					padding: 24,
					width: "100%",
					maxWidth: 420
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						style: {
							fontSize: 16,
							fontWeight: 600,
							margin: "0 0 16px"
						},
						children: isNew ? t("new_title") : t("rename")
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							...card,
							borderColor: "#fca5a5",
							background: "#fef2f2",
							color: "#b91c1c",
							padding: "8px 14px",
							fontSize: 14,
							marginBottom: 14
						},
						children: error
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						style: label,
						children: t("f_name")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						style: inputCss,
						value: name,
						maxLength: 45,
						autoComplete: "off",
						autoFocus: true,
						onChange: (e) => setName(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter" && !saving) submit();
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "flex-end",
							gap: 8,
							marginTop: 20
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: btnGhost,
							onClick: onClose,
							children: t("cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: btnPrimary,
							onClick: submit,
							disabled: saving,
							children: saving ? "…" : t("save")
						})]
					})
				]
			})
		});
	}
	function ThemeForm({ id, base }) {
		const t = useT();
		const navigate = (0, react_router_dom.useNavigate)();
		const themeId = parseInt(id);
		const path = `${base}/${id}`;
		const [item, setItem] = (0, react.useState)(null);
		const [loading, setLoading] = (0, react.useState)(true);
		const subTabRegistered = (0, react.useRef)(false);
		(0, react.useEffect)(() => {
			if (id === "new" || !can("items")) navigate(base);
		}, [
			id,
			base,
			navigate
		]);
		(0, react.useEffect)(() => {
			if (!subTabRegistered.current) {
				window.__melisOpenSubTab?.(base, {
					id: path,
					label: t("loading"),
					path
				});
				subTabRegistered.current = true;
			}
		}, [
			base,
			path,
			t
		]);
		(0, react.useEffect)(() => {
			if (id === "new") return;
			setLoading(true);
			fetchThemeById(themeId).then((r) => {
				setItem(r);
				window.__melisUpdateSubTabLabel?.(base, path, r.name);
			}).catch(() => navigate(base)).finally(() => setLoading(false));
		}, [themeId]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				flexDirection: "column",
				gap: 20,
				padding: 24,
				height: "100%",
				boxSizing: "border-box",
				overflow: "auto"
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 10,
					minWidth: 0
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: 32,
						height: 32,
						borderRadius: 8,
						background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
						color: "var(--color-primary)",
						flexShrink: 0
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TagIcon, {})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: { minWidth: 0 },
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
						style: {
							fontSize: 20,
							fontWeight: 700,
							margin: 0,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap"
						},
						children: item?.name || t("edit_title")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: {
							fontSize: 13,
							color: "var(--color-muted-foreground)",
							margin: "2px 0 0"
						},
						children: t("tab_items")
					})]
				})]
			}), loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: {
					padding: 48,
					textAlign: "center",
					color: "var(--color-muted-foreground)"
				},
				children: t("loading")
			}) : item ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ThemeItemsPanel, { theme: item }) : null]
		});
	}
	function ThemeItemsPanel({ theme }) {
		const t = useT();
		const narrow = useIsNarrow();
		const [rows, setRows] = (0, react.useState)([]);
		const [langs, setLangs] = (0, react.useState)([]);
		const [loading, setLoading] = (0, react.useState)(false);
		const [searchInput, setSearchInput] = (0, react.useState)("");
		const [search, setSearch] = (0, react.useState)("");
		const [tick, setTick] = (0, react.useState)(0);
		const [editing, setEditing] = (0, react.useState)(null);
		const [toDelete, setToDelete] = (0, react.useState)(null);
		(0, react.useEffect)(() => {
			const id = setTimeout(() => setSearch(searchInput.trim()), 300);
			return () => clearTimeout(id);
		}, [searchInput]);
		(0, react.useEffect)(() => {
			fetchCmsLanguages().then(setLangs).catch(() => null);
		}, []);
		(0, react.useEffect)(() => {
			setLoading(true);
			fetchThemeItems(theme.id, { search }).then(setRows).catch(() => null).finally(() => setLoading(false));
		}, [
			theme.id,
			search,
			tick
		]);
		const resetFilters = () => {
			setSearchInput("");
			setSearch("");
			setTick((x) => x + 1);
		};
		async function confirmDelete() {
			if (!toDelete) return;
			try {
				await deleteThemeItem(toDelete.id);
				setToDelete(null);
				setTick((x) => x + 1);
				markThemesListStale();
			} catch {
				setToDelete(null);
			}
		}
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				flexDirection: "column",
				gap: 16,
				flex: 1,
				minHeight: 0
			},
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: 8,
						flexWrap: "wrap"
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								position: "relative",
								...narrow ? { flex: "1 1 100%" } : {
									flex: 1,
									minWidth: 220
								}
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: {
									position: "absolute",
									left: 10,
									top: "50%",
									transform: "translateY(-50%)",
									pointerEvents: "none",
									color: "var(--color-muted-foreground)",
									display: "inline-flex"
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchIcon, {})
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								style: {
									...inputCss,
									height: 36,
									width: "100%",
									paddingLeft: 34
								},
								value: searchInput,
								onChange: (e) => setSearchInput(e.target.value),
								placeholder: t("items_search")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							style: {
								...btnGhost,
								height: 36,
								...narrow ? {
									flex: "1 1 100%",
									justifyContent: "center"
								} : {}
							},
							onClick: resetFilters,
							title: t("reset_filters"),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RotateCcwIcon, {}), t("reset_filters")]
						}),
						can("items.create") && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							style: {
								...btnPrimary,
								...narrow ? {
									flex: "1 1 100%",
									justifyContent: "center"
								} : {}
							},
							onClick: () => setEditing("new"),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlusIcon, {}), t("items_add")]
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						...card,
						overflow: "auto"
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
						style: {
							width: "100%",
							borderCollapse: "collapse",
							...!narrow ? { minWidth: 480 } : {}
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", {
							style: { background: "var(--color-muted,rgba(0,0,0,.03))" },
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
									style: {
										...th,
										width: 70
									},
									children: t("col_id")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
									style: th,
									children: t("items_name")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { style: {
									...th,
									width: 90
								} })
							] })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: rows.length === 0 && !loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							style: {
								...td,
								textAlign: "center",
								color: "var(--color-muted-foreground)",
								padding: "40px 16px"
							},
							colSpan: 3,
							children: t("items_empty")
						}) }) : rows.map((r) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
								style: {
									...td,
									color: "var(--color-muted-foreground)",
									fontVariantNumeric: "tabular-nums"
								},
								children: r.id
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
								style: {
									...td,
									fontWeight: 500
								},
								children: r.name
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
								style: td,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "flex-end",
										gap: 4
									},
									children: [can("items.edit") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										style: iconBtn,
										title: t("edit"),
										onClick: () => setEditing(r.id),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PencilIcon, {})
									}), can("items.delete") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										style: {
											...iconBtn,
											color: "var(--color-destructive,#ef4444)"
										},
										title: t("del"),
										onClick: () => setToDelete(r),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrashIcon, {})
									})]
								})
							})
						] }, r.id)) })]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							padding: "10px 16px",
							textAlign: "center",
							fontSize: 12,
							color: "var(--color-muted-foreground)"
						},
						children: loading ? t("loading") : t("items_count", { n: rows.length })
					})]
				}),
				editing !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ThemeItemForm, {
					theme,
					itemId: editing === "new" ? 0 : editing,
					langs,
					onClose: () => setEditing(null),
					onSaved: () => {
						setEditing(null);
						setTick((x) => x + 1);
						markThemesListStale();
					}
				}),
				toDelete && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						position: "fixed",
						inset: 0,
						zIndex: 50,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: "rgba(0,0,0,.5)",
						padding: 16
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							...card,
							padding: 24,
							width: "100%",
							maxWidth: 380
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								style: {
									fontSize: 16,
									fontWeight: 600,
									margin: 0
								},
								children: t("items_del_title")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								style: {
									fontSize: 14,
									color: "var(--color-muted-foreground)",
									marginTop: 8
								},
								children: t("items_del_confirm", { u: toDelete.name })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "flex-end",
									gap: 8,
									marginTop: 20
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: btnGhost,
									onClick: () => setToDelete(null),
									children: t("cancel")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: {
										...btnGhost,
										borderColor: "#fca5a5",
										color: "#dc2626"
									},
									onClick: confirmDelete,
									children: t("del")
								})]
							})
						]
					})
				})
			]
		});
	}
	function ThemeItemForm({ theme, itemId, langs, onClose, onSaved }) {
		const t = useT();
		const isNew = itemId === 0;
		const [texts, setTexts] = (0, react.useState)({});
		const [activeLang, setActiveLang] = (0, react.useState)(langs[0]?.id ?? 1);
		const [loading, setLoading] = (0, react.useState)(!isNew);
		const [saving, setSaving] = (0, react.useState)(false);
		const [error, setError] = (0, react.useState)(null);
		(0, react.useEffect)(() => {
			if (langs.length && !langs.some((l) => l.id === activeLang)) setActiveLang(langs[0].id);
		}, [langs]);
		(0, react.useEffect)(() => {
			if (isNew) return;
			setLoading(true);
			fetchThemeItemById(itemId).then((d) => setTexts(d.translations ?? {})).catch(() => onClose()).finally(() => setLoading(false));
		}, [itemId]);
		async function submit() {
			setError(null);
			if (!Object.values(texts).some((v) => v && v.trim() !== "")) {
				setError(t("items_required"));
				return;
			}
			setSaving(true);
			try {
				await saveThemeItem({
					id: itemId,
					themeId: theme.id,
					translations: texts
				});
				notify("ok", t("items_edit_title"), t("saved"));
				onSaved();
			} catch (e) {
				setError(e instanceof Error ? e.message : t("err_save"));
			} finally {
				setSaving(false);
			}
		}
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			style: {
				position: "fixed",
				inset: 0,
				zIndex: 50,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "rgba(0,0,0,.5)",
				padding: 16
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					...card,
					padding: 24,
					width: "100%",
					maxWidth: 460,
					maxHeight: "90vh",
					overflow: "auto"
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						style: {
							fontSize: 16,
							fontWeight: 600,
							margin: "0 0 16px"
						},
						children: isNew ? t("items_new_title") : t("items_edit_title")
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							...card,
							borderColor: "#fca5a5",
							background: "#fef2f2",
							color: "#b91c1c",
							padding: "8px 14px",
							fontSize: 14,
							marginBottom: 14
						},
						children: error
					}),
					loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							padding: 32,
							textAlign: "center",
							color: "var(--color-muted-foreground)"
						},
						children: t("loading")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							flexDirection: "column",
							gap: 12
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									fontWeight: 600,
									textTransform: "uppercase",
									letterSpacing: ".06em",
									color: "var(--color-muted-foreground)"
								},
								children: t("items_content_per_lang")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									flexWrap: "wrap",
									gap: 6,
									borderBottom: "1px solid var(--color-border)",
									paddingBottom: 12
								},
								children: langs.map((l) => {
									const filled = (texts[String(l.id)] ?? "").trim() !== "";
									return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setActiveLang(l.id),
										style: {
											...langTab,
											...activeLang === l.id ? langTabActive : {}
										},
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(LangFlag, {
												locale: l.locale,
												size: 15
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: { textAlign: "left" },
												children: l.name
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												title: filled ? void 0 : t("items_required"),
												style: {
													width: 6,
													height: 6,
													borderRadius: 999,
													flexShrink: 0,
													background: filled ? "#22c55e" : "var(--color-border)"
												}
											})
										]
									}, l.id);
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
								style: label,
								children: t("items_name")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								style: inputCss,
								value: texts[String(activeLang)] ?? "",
								maxLength: 255,
								autoComplete: "off",
								autoFocus: true,
								onChange: (e) => setTexts((p) => ({
									...p,
									[String(activeLang)]: e.target.value
								}))
							})] })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "flex-end",
							gap: 8,
							marginTop: 20
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: btnGhost,
							onClick: onClose,
							children: t("cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: btnPrimary,
							onClick: submit,
							disabled: saving || loading,
							children: saving ? "…" : t("save")
						})]
					})
				]
			})
		});
	}
	//#endregion
	//#region src/brick.tsx
	window.__melisRegisterBrick?.({
		id: "prospects",
		Component: ProspectsPage
	});
	window.__melisRegisterBrick?.({
		id: "prospect-themes",
		Component: ProspectThemesPage
	});
	//#endregion
})(MelisReact, MelisReactRouterDOM, MelisReactJsxRuntime);
