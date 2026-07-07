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
	var XHR_HEADER = { "X-Requested-With": "XMLHttpRequest" };
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
	async function fetchProspects(params = {}) {
		const qs = new URLSearchParams();
		qs.set("limit", "9999");
		if (params.search) qs.set("search", params.search);
		if (params.site) qs.set("site", String(params.site));
		if (params.type) qs.set("type", params.type);
		if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
		if (params.dateTo) qs.set("dateTo", params.dateTo);
		return apiFetch(`/melis/react-api/prospects?${qs}`);
	}
	async function fetchProspectById(id) {
		return apiFetch(`/melis/react-api/prospects/${id}`);
	}
	async function fetchProspectStats() {
		return apiFetch("/melis/react-api/prospects/stats");
	}
	async function fetchSites() {
		return (await apiFetch("/melis/react-api/prospects/sites")).sites;
	}
	async function fetchTypes() {
		return (await apiFetch("/melis/react-api/prospects/types")).types;
	}
	async function fetchThemes() {
		return (await apiFetch("/melis/react-api/prospects/themes")).themes;
	}
	async function saveProspect(payload) {
		return apiFetch("/melis/react-api/prospects/save", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		});
	}
	async function deleteProspect(id) {
		await apiFetch(`/melis/react-api/prospects/delete/${id}`, { method: "DELETE" });
	}
	//#endregion
	//#region src/ExportModal.tsx
	function getXLSX() {
		return window.MelisXLSX ?? null;
	}
	function currentLang$1() {
		return (document.documentElement.lang || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
	}
	var DICT$1 = {
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
		let s = DICT$1[currentLang$1()][key] ?? key;
		if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
		return s;
	}
	var card$1 = {
		border: "1px solid var(--color-border)",
		background: "var(--color-card)",
		borderRadius: 12,
		boxShadow: "0 1px 2px rgba(0,0,0,.04)"
	};
	var panelCss$1 = {
		display: "flex",
		flexDirection: "column",
		gap: 2,
		minHeight: 100,
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
	var btnGhost$1 = {
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
	var btnPrimary$1 = {
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
	function ExportModal({ cols, labelFor, fetchAll, getCell, filename, sheetName, total, onClose }) {
		const xlsx = getXLSX();
		const [included, setIncluded] = (0, react.useState)(() => cols.filter((c) => c.visible));
		const [excluded, setExcluded] = (0, react.useState)(() => cols.filter((c) => !c.visible));
		const [format, setFormat] = (0, react.useState)(xlsx ? "xlsx" : "csv");
		const [exporting, setExporting] = (0, react.useState)(false);
		const [dragId, setDragId] = (0, react.useState)(null);
		const [over, setOver] = (0, react.useState)(null);
		function drop(panel) {
			if (!dragId) return;
			const src = [...included, ...excluded].find((c) => c.id === dragId);
			let inc = included.filter((c) => c.id !== dragId);
			let exc = excluded.filter((c) => c.id !== dragId);
			if (panel === "included") {
				const dst = over?.id;
				if (!dst || dst === "__panel__") inc = [...inc, src];
				else {
					const i = inc.findIndex((c) => c.id === dst);
					inc = i === -1 ? [...inc, src] : [
						...inc.slice(0, i),
						src,
						...inc.slice(i)
					];
				}
			} else exc = [...exc, src];
			setIncluded(inc);
			setExcluded(exc);
			setDragId(null);
			setOver(null);
		}
		function item(col, panel) {
			const isOver = over?.id === col.id && over?.panel === panel;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				draggable: true,
				onDragStart: () => setDragId(col.id),
				onDragEnd: () => {
					setDragId(null);
					setOver(null);
				},
				onDragOver: (e) => {
					e.preventDefault();
					e.stopPropagation();
					if (over?.id !== col.id || over?.panel !== panel) setOver({
						id: col.id,
						panel
					});
				},
				onDrop: (e) => {
					e.preventDefault();
					drop(panel);
				},
				style: {
					display: "flex",
					alignItems: "center",
					gap: 8,
					borderRadius: 8,
					padding: "6px 8px",
					fontSize: 14,
					cursor: "grab",
					userSelect: "none",
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
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			style: {
				position: "fixed",
				inset: 0,
				zIndex: 60,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "rgba(0,0,0,.5)"
			},
			onClick: (e) => {
				if (e.target === e.currentTarget) onClose();
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					...card$1,
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
								style: panelCss$1,
								onDragOver: (e) => {
									e.preventDefault();
									if (over?.id !== "__panel__" || over?.panel !== "excluded") setOver({
										id: "__panel__",
										panel: "excluded"
									});
								},
								onDrop: (e) => {
									e.preventDefault();
									drop("excluded");
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									style: panelTitle$1,
									children: tr("excluded")
								}), excluded.length === 0 ? ph() : excluded.map((c) => item(c, "excluded"))]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: panelCss$1,
								onDragOver: (e) => {
									e.preventDefault();
									if (over?.id !== "__panel__" || over?.panel !== "included") setOver({
										id: "__panel__",
										panel: "included"
									});
								},
								onDrop: (e) => {
									e.preventDefault();
									drop("included");
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									style: panelTitle$1,
									children: tr("included")
								}), included.length === 0 ? ph() : included.map((c) => item(c, "included"))]
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
							style: btnGhost$1,
							onClick: onClose,
							disabled: exporting,
							children: tr("cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							style: {
								...btnPrimary$1,
								opacity: included.length === 0 || exporting ? .6 : 1
							},
							onClick: doExport,
							disabled: exporting || included.length === 0,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DownloadIcon, {}), exporting ? tr("exporting") : tr("download", { fmt: format.toUpperCase() })]
						})]
					})
				]
			})
		});
	}
	//#endregion
	//#region src/ViewToggle.tsx
	var sIcon$1 = {
		width: 15,
		height: 15,
		flexShrink: 0
	};
	var SparkIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		style: sIcon$1,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" })
	});
	var LayoutIcon = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		style: sIcon$1,
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
	function ViewToggle({ mode, onChange }) {
		const tab = (active) => ({
			display: "inline-flex",
			alignItems: "center",
			gap: 6,
			height: 30,
			padding: "0 12px",
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
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SparkIcon, {}), "New"]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				style: tab(mode === "iframe"),
				onClick: () => onChange("iframe"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(LayoutIcon, {}), "Old"]
			})]
		});
	}
	//#endregion
	//#region src/ProspectsPage.tsx
	var MELIS_KEY = "MelisCmsProspects_tool_prospects";
	function can(cap) {
		return window.MelisCan?.(MELIS_KEY, cap) ?? true;
	}
	function currentLang() {
		return (document.documentElement.lang || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
	}
	var DICT = {
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
			dr_apply: "Appliquer"
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
			dr_apply: "Apply"
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
	var secTitle = {
		fontSize: 14,
		fontWeight: 600,
		margin: "0 0 14px",
		color: "var(--color-foreground)"
	};
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
		style: sIcon,
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
	var COL_ORDER = [
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
	var COL_LABEL = {
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
	var DEFAULT_COLS = COL_ORDER.map((id) => ({
		id,
		visible: true
	}));
	var COL_KEY = "melis-prospects-cols-v2";
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
	function ColManager({ cols, labelFor, onChange, onClose }) {
		const t = useT();
		const [dragId, setDragId] = (0, react.useState)(null);
		const [over, setOver] = (0, react.useState)(null);
		const shown = cols.filter((c) => c.visible);
		const hidden = cols.filter((c) => !c.visible);
		function drop(panel) {
			if (!dragId) return;
			const upd = {
				...cols.find((c) => c.id === dragId),
				visible: panel === "visible"
			};
			let vList = shown.filter((c) => c.id !== dragId);
			const hList = hidden.filter((c) => c.id !== dragId);
			if (panel === "visible") {
				const dst = over?.id;
				if (!dst || dst === "__panel__") vList = [...vList, upd];
				else {
					const i = vList.findIndex((c) => c.id === dst);
					vList = i === -1 ? [...vList, upd] : [
						...vList.slice(0, i),
						upd,
						...vList.slice(i)
					];
				}
				const next = [...vList, ...hList];
				onChange(next);
				saveCols(next);
			} else {
				const next = [
					...vList,
					...hList,
					upd
				];
				onChange(next);
				saveCols(next);
			}
			setDragId(null);
			setOver(null);
		}
		function item(col, panel) {
			const isOver = over?.id === col.id && over?.panel === panel;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				draggable: true,
				onDragStart: () => setDragId(col.id),
				onDragEnd: () => {
					setDragId(null);
					setOver(null);
				},
				onDragOver: (e) => {
					e.preventDefault();
					e.stopPropagation();
					if (over?.id !== col.id || over?.panel !== panel) setOver({
						id: col.id,
						panel
					});
				},
				onDrop: (e) => {
					e.preventDefault();
					drop(panel);
				},
				style: {
					display: "flex",
					alignItems: "center",
					gap: 8,
					borderRadius: 8,
					padding: "6px 8px",
					fontSize: 14,
					cursor: "grab",
					userSelect: "none",
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
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				...card,
				position: "absolute",
				right: 0,
				top: "100%",
				marginTop: 6,
				zIndex: 50,
				width: 380,
				maxWidth: "calc(100vw - 1rem)"
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
						style: panelCss,
						onDragOver: (e) => {
							e.preventDefault();
							if (over?.id !== "__panel__" || over?.panel !== "hidden") setOver({
								id: "__panel__",
								panel: "hidden"
							});
						},
						onDrop: (e) => {
							e.preventDefault();
							drop("hidden");
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
						style: panelCss,
						onDragOver: (e) => {
							e.preventDefault();
							if (over?.id !== "__panel__" || over?.panel !== "visible") setOver({
								id: "__panel__",
								panel: "visible"
							});
						},
						onDrop: (e) => {
							e.preventDefault();
							drop("visible");
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
		});
	}
	function Kpi({ label: lbl, value }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				...card,
				display: "flex",
				flexDirection: "column",
				gap: 2,
				padding: 16,
				flex: 1,
				minWidth: 140
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
		});
	}
	/** yyyy-mm-dd (heure locale) */
	function fmtYmd(d) {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
	}
	function DateRangeFilter({ from, to, onChange }) {
		const t = useT();
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
				display: "inline-flex"
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				style: {
					...btnGhost,
					height: 36,
					gap: 8
				},
				onClick: () => setOpen((o) => !o),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CalendarIcon, {}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							maxWidth: 160,
							overflow: "hidden",
							textOverflow: "ellipsis"
						},
						children: buttonLabel
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronDownIcon, {})
				]
			}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					...card,
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
										...inputCss,
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
										...inputCss,
										height: 32,
										width: 150
									},
									value: to,
									onChange: (e) => onChange(from, e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: {
									...btnGhost,
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
		if (id) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProspectForm, {
			id,
			base
		});
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProspectList, { base });
	}
	function ProspectList({ base }) {
		const t = useT();
		const navigate = (0, react_router_dom.useNavigate)();
		const [items, setItems] = (0, react.useState)([]);
		const [stats, setStats] = (0, react.useState)(null);
		const [sites, setSites] = (0, react.useState)([]);
		const [types, setTypes] = (0, react.useState)([]);
		const [loading, setLoading] = (0, react.useState)(false);
		const [searchInput, setSearchInput] = (0, react.useState)("");
		const [search, setSearch] = (0, react.useState)("");
		const [site, setSite] = (0, react.useState)(null);
		const [type, setType] = (0, react.useState)("");
		const [dateFrom, setDateFrom] = (0, react.useState)("");
		const [dateTo, setDateTo] = (0, react.useState)("");
		const [sortAsc, setSortAsc] = (0, react.useState)(false);
		const [toDelete, setToDelete] = (0, react.useState)(null);
		const [tick, setTick] = (0, react.useState)(0);
		const [cols, setCols] = (0, react.useState)(loadCols);
		const [showCols, setShowCols] = (0, react.useState)(false);
		const [showExport, setShowExport] = (0, react.useState)(false);
		const [mode, setMode] = (0, react.useState)("react");
		const [frameLoaded, setFrameLoaded] = (0, react.useState)(false);
		(0, react.useEffect)(() => {
			fetchProspectStats().then(setStats).catch(() => null);
		}, [tick]);
		(0, react.useEffect)(() => {
			fetchSites().then(setSites).catch(() => null);
		}, []);
		(0, react.useEffect)(() => {
			fetchTypes().then(setTypes).catch(() => null);
		}, []);
		(0, react.useEffect)(() => {
			setLoading(true);
			fetchProspects({
				search,
				site,
				type,
				dateFrom,
				dateTo
			}).then((r) => setItems(r.items)).catch(() => null).finally(() => setLoading(false));
		}, [
			search,
			site,
			type,
			dateFrom,
			dateTo,
			tick
		]);
		const sorted = (0, react.useMemo)(() => [...items].sort((a, b) => sortAsc ? a.id - b.id : b.id - a.id), [items, sortAsc]);
		async function confirmDelete() {
			if (!toDelete) return;
			try {
				await deleteProspect(toDelete.id);
				window.__melisCloseSubTab?.(base, `${base}/${toDelete.id}`);
				setToDelete(null);
				setTick((x) => x + 1);
			} catch {
				setToDelete(null);
			}
		}
		function fmtDate(v) {
			try {
				return new Date(v.replace(" ", "T")).toLocaleDateString(currentLang() === "fr" ? "fr-FR" : "en-GB", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
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
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
						style: {
							fontSize: 20,
							fontWeight: 700,
							margin: 0
						},
						children: t("title")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: {
							fontSize: 14,
							color: "var(--color-muted-foreground)",
							margin: "2px 0 0"
						},
						children: t("subtitle")
					})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 8
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ViewToggle, {
							mode,
							onChange: (m) => {
								setMode(m);
								if (m === "iframe") setFrameLoaded(true);
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: btnGhost,
							onClick: () => setTick((x) => x + 1),
							title: t("refresh"),
							children: "↻"
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
						title: "Prospects — Vue Melis",
						sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						display: mode === "react" ? "flex" : "none",
						flexDirection: "column",
						gap: 20
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
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kpi, {
									label: t("kpi_total"),
									value: stats?.total ?? null
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kpi, {
									label: t("kpi_month"),
									value: stats?.thisMonth ?? null
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kpi, {
									label: t("kpi_avg"),
									value: stats?.avgPerMonth ?? null
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kpi, {
									label: t("kpi_anon"),
									value: stats?.anonymized ?? null
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
										...inputCss,
										height: 36,
										flex: 1,
										minWidth: 220
									},
									value: searchInput,
									onChange: (e) => setSearchInput(e.target.value),
									onKeyDown: (e) => e.key === "Enter" && setSearch(searchInput.trim()),
									placeholder: t("search")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									style: {
										...inputCss,
										height: 36,
										width: "auto"
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
										...inputCss,
										height: 36,
										width: "auto"
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
									}
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: { position: "relative" },
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										style: {
											...btnGhost,
											height: 36
										},
										onClick: () => setShowCols((v) => !v),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(GripIcon, {}), t("columns")]
									}), showCols && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ColManager, {
										cols,
										labelFor: (id) => t(COL_LABEL[id]),
										onChange: setCols,
										onClose: () => setShowCols(false)
									})]
								}),
								can("export") && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									style: {
										...btnGhost,
										height: 36
									},
									onClick: () => setShowExport(true),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DownloadIcon, {}), t("export")]
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
									minWidth: 1040
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", {
									style: { background: "var(--color-muted,rgba(0,0,0,.03))" },
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [visibleCols(cols).map(({ id }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("th", {
										style: {
											...th,
											...id === "id" ? {
												cursor: "pointer",
												width: 70
											} : {}
										},
										onClick: id === "id" ? () => setSortAsc((v) => !v) : void 0,
										children: [t(COL_LABEL[id]), id === "id" ? ` ${sortAsc ? "↑" : "↓"}` : ""]
									}, id)), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { style: {
										...th,
										width: 80
									} })] })
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: sorted.length === 0 && !loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
									style: {
										...td,
										textAlign: "center",
										color: "var(--color-muted-foreground)",
										padding: "40px 16px"
									},
									colSpan: visibleCols(cols).length + 1,
									children: t("empty")
								}) }) : sorted.map((r) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [visibleCols(cols).map(({ id }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", {
									style: {
										...td,
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
									children: [
										id === "id" && r.id,
										id === "name" && r.name,
										id === "email" && r.email,
										id === "phone" && r.telephone,
										id === "site" && (r.siteName ?? t("none")),
										id === "type" && (r.type ?? t("none")),
										id === "theme" && (r.themeName ?? t("none")),
										id === "date" && fmtDate(r.contactDate),
										id === "message" && r.message
									]
								}, id)), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
									style: td,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "flex-end",
											gap: 4
										},
										children: [can("edit") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											style: iconBtn,
											title: t("edit"),
											onClick: () => navigate(`${base}/${r.id}`),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PencilIcon, {})
										}), can("delete") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											style: {
												...iconBtn,
												color: "var(--color-destructive,#ef4444)"
											},
											title: t("del"),
											onClick: () => setToDelete(r),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrashIcon, {})
										})]
									})
								})] }, r.id)) })]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: {
									padding: "10px 16px",
									textAlign: "center",
									fontSize: 12,
									color: "var(--color-muted-foreground)"
								},
								children: loading ? t("loading") : t("count", { n: items.length })
							})]
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
						background: "rgba(0,0,0,.5)"
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							...card,
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
					fetchAll: async () => (await fetchProspects({
						search,
						site,
						type,
						dateFrom,
						dateTo
					})).items,
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
					filename: currentLang() === "fr" ? "prospects" : "prospects",
					sheetName: t("title"),
					total: items.length,
					onClose: () => setShowExport(false)
				})
			]
		});
	}
	function ProspectForm({ id, base }) {
		const t = useT();
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
		const [saved, setSaved] = (0, react.useState)(false);
		const subTabRegistered = (0, react.useRef)(false);
		(0, react.useEffect)(() => {
			if (!can("edit")) navigate(base);
		}, [base, navigate]);
		(0, react.useEffect)(() => {
			fetchSites().then(setSites).catch(() => null);
		}, []);
		(0, react.useEffect)(() => {
			fetchThemes().then(setThemes).catch(() => null);
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
				setSaved(true);
				notify("ok", t("title"), t("saved"));
				window.__melisUpdateSubTabLabel?.(base, path, name.trim());
				setTimeout(() => setSaved(false), 2e3);
			} catch (e) {
				setError(e instanceof Error ? e.message : t("err_save"));
			} finally {
				setSaving(false);
			}
		}
		function fmtDate(v) {
			try {
				return new Date(v.replace(" ", "T")).toLocaleString(currentLang() === "fr" ? "fr-FR" : "en-GB", {
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
							gap: 10
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
								color: "var(--color-primary)"
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UserIcon, {})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
							style: {
								fontSize: 20,
								fontWeight: 700,
								margin: 0
							},
							children: item?.name || t("edit_title")
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 10
						},
						children: [saved && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: {
								fontSize: 14,
								color: "#059669"
							},
							children: t("saved")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: btnPrimary,
							onClick: submit,
							disabled: saving || loading,
							children: saving ? "…" : t("save")
						})]
					})]
				}),
				error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						...card,
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
						gridTemplateColumns: "1fr minmax(240px,280px)",
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
								...card,
								padding: 20
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								style: secTitle,
								children: t("sec_contact")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: 16
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										style: label,
										children: t("f_name")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										style: inputCss,
										value: name,
										onChange: (e) => setName(e.target.value),
										maxLength: 255,
										autoComplete: "off"
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										style: label,
										children: t("f_email")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										style: inputCss,
										type: "email",
										value: email,
										onChange: (e) => setEmail(e.target.value),
										maxLength: 255,
										autoComplete: "off"
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										style: label,
										children: t("f_phone")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										style: inputCss,
										value: telephone,
										onChange: (e) => setTelephone(e.target.value),
										autoComplete: "off"
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										style: label,
										children: t("f_company")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										style: inputCss,
										value: company,
										onChange: (e) => setCompany(e.target.value),
										maxLength: 45,
										autoComplete: "off"
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										style: label,
										children: t("f_country")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										style: inputCss,
										value: country,
										onChange: (e) => setCountry(e.target.value),
										maxLength: 45,
										autoComplete: "off"
									})] })
								]
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								...card,
								padding: 20
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								style: secTitle,
								children: t("sec_message")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								style: {
									...inputCss,
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
								...card,
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
										style: label,
										children: t("f_site")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										style: inputCss,
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
										style: label,
										children: t("f_theme")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										style: inputCss,
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
									style: label,
									children: t("f_date")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									style: {
										...inputCss,
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
	//#region src/brick.tsx
	window.__melisRegisterBrick?.({
		id: "prospects",
		Component: ProspectsPage
	});
	//#endregion
})(MelisReact, MelisReactRouterDOM, MelisReactJsxRuntime);
