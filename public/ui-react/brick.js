(function(react, react_jsx_runtime) {
	//#region src/ProspectsPage.tsx
	var MELIS_KEY = "MelisCmsProspects_tool_prospects";
	var FRAME_ID = "melis-brick-frame-prospects";
	/**
	* Renders the legacy MelisCmsProspects tool in an iframe via the shared loading mechanism
	* (/melis/react-tool-page?key=<melisKey>).
	*
	* PERSISTENT iframe (no reload on tab switch): React unmounts a route's component when you
	* navigate away, which would destroy the iframe and reload it on return. So the iframe is
	* created ONCE and kept in <body> forever (a module singleton); this component only
	* positions it over its anchor and toggles visibility. Re-parenting an iframe reloads it,
	* so it is NEVER moved — only shown/hidden + repositioned. No sandbox: same-origin trusted
	* Melis content (a sandbox propagates to nested legacy iframes and breaks them).
	*/
	function getFrame() {
		let f = document.getElementById(FRAME_ID);
		if (!f) {
			f = document.createElement("iframe");
			f.id = FRAME_ID;
			f.src = `/melis/react-tool-page?key=${encodeURIComponent(MELIS_KEY)}`;
			f.title = "Prospects";
			f.style.cssText = "position:fixed;border:0;display:none;z-index:1;";
			document.body.appendChild(f);
		}
		return f;
	}
	function ProspectsPage() {
		const anchorRef = (0, react.useRef)(null);
		(0, react.useEffect)(() => {
			const f = getFrame();
			const anchor = anchorRef.current;
			const sync = () => {
				const r = anchor.getBoundingClientRect();
				f.style.left = `${r.left}px`;
				f.style.top = `${r.top}px`;
				f.style.width = `${r.width}px`;
				f.style.height = `${r.height}px`;
				f.style.display = "block";
			};
			sync();
			const ro = new ResizeObserver(sync);
			ro.observe(anchor);
			window.addEventListener("resize", sync);
			window.addEventListener("scroll", sync, true);
			return () => {
				f.style.display = "none";
				ro.disconnect();
				window.removeEventListener("resize", sync);
				window.removeEventListener("scroll", sync, true);
			};
		}, []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			ref: anchorRef,
			style: {
				height: "100%",
				width: "100%",
				minHeight: 0
			}
		});
	}
	//#endregion
	//#region src/brick.tsx
	window.__melisRegisterBrick?.({
		id: "prospects",
		Component: ProspectsPage
	});
	//#endregion
})(MelisReact, MelisReactJsxRuntime);
