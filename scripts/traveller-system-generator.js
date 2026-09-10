//#region src/core/ehex.ts
var e = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function t(t) {
	if (!Number.isInteger(t) || t < 0 || t >= 34) throw Error(`Value out of eHex range: ${t}`);
	return e[t];
}
function n(t) {
	let n = e.indexOf(t.toUpperCase());
	if (n < 0) throw Error(`Invalid eHex character: ${t}`);
	return n;
}
//#endregion
//#region src/rules/system/mainworldAccess.ts
function r(e, t, n) {
	return {
		...e,
		id: t.sourceId ?? `${e.id}.moon-${n + 1}`,
		worldKind: "Terrestrial Planet",
		physical: t.physical,
		social: t.social,
		isMainworld: !!t.isMainworld,
		eccentricity: t.eccentricity,
		generationNotes: [`Significant moon of ${e.id}.`]
	};
}
function i(e, t, n) {
	return t.sourceId ?? `${e.id}.moon-${n + 1}`;
}
function a(e, t) {
	if (t) {
		for (let n of e) {
			if (n.id === t) return {
				body: n,
				parent: null,
				moon: null
			};
			let e = n.physical?.details?.satellites?.moons ?? [];
			for (let a = 0; a < e.length; a += 1) {
				let o = e[a];
				if (i(n, o, a) === t) return {
					body: r(n, o, a),
					parent: n,
					moon: o
				};
			}
		}
		return null;
	}
	let n = e.find((e) => e.isMainworld);
	if (n) return {
		body: n,
		parent: null,
		moon: null
	};
	for (let t of e) {
		let e = t.physical?.details?.satellites?.moons ?? [];
		for (let n = 0; n < e.length; n += 1) {
			let i = e[n];
			if (i.isMainworld) return {
				body: r(t, i, n),
				parent: t,
				moon: i
			};
		}
	}
	return null;
}
function o(e) {
	return a(e.worlds, e.summary.mainworldId ?? null);
}
//#endregion
//#region src/exporters/twodsixActorExport.ts
var s = "systems/twodsix/assets/icons/default_world.png";
function c(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function l(e, t = 3) {
	return e === void 0 || Number.isNaN(e) ? "-" : Number(e.toFixed(t)).toString();
}
function u(e) {
	return `${e.spectralType}${e.subtype ?? ""} ${e.luminosityClass}`;
}
function d(e) {
	return e.social?.uwp ?? e.physical?.uwpPhysical ?? "-";
}
function f(e) {
	return `<p>${c(e)}</p>`;
}
function p(e, t) {
	return e.length ? e.join("; ") : t;
}
function m(e) {
	return o(e)?.body;
}
function h(e) {
	if (!e?.physical) return "No mainworld climate profile was generated.";
	let t = e.physical, n = t.details?.climate;
	if (n?.temperatureClass) {
		let e = n.meanTemperatureC === null || n.meanTemperatureC === void 0 ? "" : `; mean temperature ${Number(n.meanTemperatureC.toFixed(1))}°C`;
		return `${n.temperatureClass} climate${e}; orbit lies in the ${t.zone.toLowerCase()}; physical profile ${t.uwpPhysical}.`;
	}
	return `${t.temperatureBand} provisional climate classification; orbit lies in the ${t.zone.toLowerCase()}; physical profile ${t.uwpPhysical}.`;
}
function g(e) {
	if (!e?.physical) return "No environmental hazards were generated.";
	let t = e.physical, n = [];
	(t.atmosphereCode ?? 0) === 0 ? n.push("vacuum exposure") : (t.atmosphereCode ?? 0) <= 3 ? n.push("hostile or trace atmosphere") : (t.atmosphereCode ?? 0) >= 10 && n.push("exotic or corrosive atmosphere");
	let r = t.details?.atmosphere;
	return r?.oxygenSafety === "low" ? n.push(`low oxygen partial pressure${typeof r.oxygenPartialPressureBar == "number" ? ` (${r.oxygenPartialPressureBar} bar)` : ""}; Referee review required`) : r?.oxygenSafety === "high" && n.push(`high oxygen partial pressure${typeof r.oxygenPartialPressureBar == "number" ? ` (${r.oxygenPartialPressureBar} bar)` : ""}; Referee review required`), t.zone === "Inferno" && n.push("extreme heat"), t.zone === "Frozen" && n.push("extreme cold"), (t.hydrographicsCode ?? 0) === 10 && n.push("minimal exposed land"), p(n, "No exceptional environmental hazards were identified by the generated profile.");
}
function _(e) {
	if (!e?.social) return "No inhabited mainworld economy was generated.";
	let n = e.social, r = n.tradeCodes.length ? n.tradeCodes.join(", ") : "no assigned trade classifications";
	return `Population ${n.populationTotal.toLocaleString("en-US")}; tech level ${t(n.techLevel)}; importance ${n.importance}; ${r}.`;
}
function v(e) {
	if (!e?.social) return "Uninhabited or socially unprofiled market.";
	let n = e.social;
	return `Starport ${n.starport}; population code ${t(n.populationCode)} with multiplier ${n.populationMultiplier}; law ${t(n.lawLevelCode)}; government ${t(n.governmentCode)}.`;
}
function y(e) {
	let t = e.filter((e) => e.severity !== "info");
	return t.length ? `<ul>${t.map((e) => `<li><strong>${c(e.severity.toUpperCase())}:</strong> ${c(e.message)}${e.recommendation ? ` <em>${c(e.recommendation)}</em>` : ""}</li>`).join("")}</ul>` : "<p>No generation warnings or errors.</p>";
}
function b(e) {
	let t = m(e), n = e.stars.map((e) => `
    <tr>
      <td>${c(e.designation)}</td>
      <td>${c(u(e))}</td>
      <td>${c(e.stellarNature ?? "-")}</td>
      <td>${c(e.orbitClass)}</td>
      <td>${c(l(e.orbitAu))}</td>
      <td>${c(l(e.massSolar))}</td>
      <td>${c(l(e.luminositySolar))}</td>
    </tr>`).join(""), r = e.worlds.filter((e) => e.worldKind !== "Empty Orbit").map((e) => `
      <tr>
        <td>${c(e.id)}${e.isMainworld ? " ★" : ""}</td>
        <td>${c(e.aroundDesignation)}</td>
        <td>${c(e.worldKind)}</td>
        <td>${c(e.physical?.zone ?? "-")}</td>
        <td>${c(d(e))}</td>
        <td>${c(e.social?.populationTotal ?? "-")}</td>
        <td>${c(e.social?.tradeCodes.join(" ") || "-")}</td>
        <td>${c(l(e.au))}</td>
      </tr>`).join(""), i = e.generationSettings ? `${e.generationSettings.starDistribution}; ${e.generationSettings.detailLevel} detail; unusual primaries ${e.generationSettings.allowUnusualPrimaries ? "allowed" : "disabled"}` : "default settings";
	return [
		`<h2>${c(e.name)} System</h2>`,
		"<h3>Mainworld</h3>",
		`<p><strong>World:</strong> ${c(t?.id ?? "None")} &nbsp; <strong>UWP:</strong> ${c(t?.social?.uwp ?? e.summary.preliminaryUwp ?? "-")} &nbsp; <strong>Trade Codes:</strong> ${c(t?.social?.tradeCodes.join(" ") || e.summary.tradeCodes?.join(" ") || "-")}</p>`,
		`<p>${c(h(t))}</p>`,
		"<h3>System Summary</h3>",
		`<p><strong>Stars:</strong> ${e.stars.length} &nbsp; <strong>Terrestrial Worlds:</strong> ${e.summary.terrestrialPlanets} &nbsp; <strong>Gas Giants:</strong> ${e.summary.gasGiants} &nbsp; <strong>Planetoid Belts:</strong> ${e.summary.planetoidBelts}</p>`,
		"<h3>Stars</h3>",
		"<table><thead><tr><th>Designation</th><th>Class</th><th>Nature</th><th>Orbit</th><th>AU</th><th>Mass</th><th>Luminosity</th></tr></thead>",
		`<tbody>${n}</tbody></table>`,
		"<h3>Worlds</h3>",
		"<table><thead><tr><th>ID</th><th>Around</th><th>Kind</th><th>Zone</th><th>UWP</th><th>Population</th><th>Trade</th><th>AU</th></tr></thead>",
		`<tbody>${r}</tbody></table>`,
		"<h3>Generation Notes</h3>",
		`<p><strong>Method:</strong> ${c(e.generationMethod ?? "expanded")} &nbsp; <strong>Settings:</strong> ${c(i)} &nbsp; <strong>Schema:</strong> ${c(e.schemaVersion)}</p>`,
		y(e.validation)
	].join("");
}
function x(e) {
	let n = m(e), r = n?.social, i = n?.physical, a = e.name, o = r?.tradeCodes.join(" ") ?? e.summary.tradeCodes?.join(" ") ?? "";
	return {
		name: a,
		type: "world",
		img: e.imageUrl || s,
		system: {
			name: e.name,
			uwp: r?.uwp ?? e.summary.preliminaryUwp ?? "",
			starport: r?.starport ?? "X",
			size: i?.sizeCode === null || i?.sizeCode === void 0 ? "0" : t(i.sizeCode),
			atmosphere: i?.atmosphereCode === null || i?.atmosphereCode === void 0 ? "0" : t(i.atmosphereCode),
			hydrographics: i?.hydrographicsCode === null || i?.hydrographicsCode === void 0 ? "0" : t(i.hydrographicsCode),
			population: r ? t(r.populationCode) : "0",
			government: r ? t(r.governmentCode) : "0",
			lawLevel: r ? t(r.lawLevelCode) : "0",
			techLevel: r ? t(r.techLevel) : "0",
			coordinates: "",
			allegiance: "N/A",
			features: [],
			tradeCodes: o,
			travelZone: "none",
			description: b(e),
			worldImage: e.imageUrl ?? "",
			mainExports: o || "No trade classifications generated.",
			mainImports: "Not generated; assign during campaign preparation.",
			economicLevel: _(n),
			marketProfile: v(n),
			localCurrency: "Not generated.",
			portFees: `Starport ${r?.starport ?? "X"}; fees not generated.`,
			climate: f(h(n)),
			hazards: f(g(n)),
			specialRules: f(n?.generationNotes?.join("; ") || "No special world rules generated."),
			adventureHooks: "<p>Not generated; add campaign-specific hooks here.</p>",
			notes: f(e.refereeNotes || "Generated by Traveller System Generator."),
			relatedActors: "",
			populationModifier: r?.populationMultiplier ?? 0,
			numPlanetoidBelts: e.summary.planetoidBelts,
			numGasGiants: e.summary.gasGiants
		},
		prototypeToken: {
			name: e.name,
			displayName: 0,
			actorLink: !1,
			width: 1,
			height: 1,
			depth: 1,
			texture: {
				src: e.imageUrl || s,
				anchorX: .5,
				anchorY: .5,
				fit: "contain",
				scaleX: 1,
				scaleY: 1,
				tint: "#ffffff",
				alphaThreshold: .75
			},
			lockRotation: !1,
			rotation: 0,
			alpha: 1,
			disposition: -1,
			displayBars: 0,
			bar1: { attribute: "hits" },
			bar2: { attribute: null },
			light: {
				negative: !1,
				priority: 0,
				alpha: .5,
				angle: 360,
				bright: 0,
				color: null,
				coloration: 1,
				dim: 0,
				attenuation: .5,
				luminosity: .5,
				saturation: 0,
				contrast: 0,
				shadows: 0,
				animation: {
					type: null,
					speed: 5,
					intensity: 5,
					reverse: !1
				},
				darkness: {
					min: 0,
					max: 1
				}
			},
			sight: {
				enabled: !1,
				range: 0,
				angle: 360,
				visionMode: "basic",
				color: null,
				attenuation: .1,
				brightness: 0,
				saturation: 0,
				contrast: 0
			},
			detectionModes: {},
			occludable: { radius: 0 },
			ring: {
				enabled: !1,
				colors: {
					ring: null,
					background: null
				},
				effects: 1,
				subject: {
					scale: 1,
					texture: null
				}
			},
			turnMarker: {
				mode: 1,
				animation: null,
				src: null,
				disposition: !1
			},
			movementAction: null,
			flags: {},
			randomImg: !1,
			appendNumber: !1,
			prependAdjective: !1
		},
		items: [],
		effects: [],
		folder: null,
		flags: { "traveller-system-generator": {
			sourceSystemId: e.id,
			schemaVersion: e.schemaVersion,
			generationMethod: e.generationMethod ?? "expanded",
			sourceUwp: e.sourceUwp ?? null,
			generationSettings: e.generationSettings ?? null
		} },
		ownership: { default: 0 }
	};
}
//#endregion
//#region src/core/dice.ts
var S = class e {
	state;
	constructor(e = 1) {
		this.state = e >>> 0;
	}
	nextFloat() {
		return this.state = 1664525 * this.state + 1013904223 >>> 0, this.state / 4294967296;
	}
	fork(t) {
		let n = (this.state ^ 2166136261) >>> 0;
		for (let e = 0; e < t.length; e += 1) n ^= t.charCodeAt(e), n = Math.imul(n, 16777619) >>> 0;
		return new e(n);
	}
	die(e) {
		if (!Number.isInteger(e) || e < 2) throw Error(`Invalid die sides: ${e}`);
		return Math.floor(this.nextFloat() * e) + 1;
	}
	roll(e, t, n = 0) {
		let r = Array.from({ length: e }, () => this.die(t)), i = r.reduce((e, t) => e + t, 0) + n;
		return {
			notation: `${e}D${t}${n === 0 ? "" : n > 0 ? `+${n}` : `${n}`}`,
			rolls: r,
			modifier: n,
			total: i
		};
	}
	d6() {
		return this.die(6);
	}
	d10ZeroToNine() {
		return this.die(10) % 10;
	}
};
//#endregion
//#region src/rules/worlds/wbhCommonTechnology.ts
function ee(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function te(e) {
	let t = Math.max(2, Math.min(12, Math.trunc(e)));
	return t === 2 ? -3 : t === 3 ? -2 : t === 4 ? -1 : t <= 9 ? 0 : t === 10 ? 1 : t === 11 ? 2 : 3;
}
function ne(e) {
	let t = e.roll(2, 6).total;
	return {
		roll: t,
		modifier: te(t)
	};
}
function re(e) {
	return e === null ? null : [
		0,
		1,
		10
	].includes(e) ? 8 : [
		2,
		3,
		13,
		14
	].includes(e) ? 5 : [
		4,
		7,
		9
	].includes(e) ? 3 : e === 11 ? 9 : e === 12 ? 10 : e === 15 ? 8 : [16, 17].includes(e) ? 14 : null;
}
function ie(e) {
	return e === null ? null : e === 0 ? 8 : e <= 2 ? 5 : e <= 7 ? 3 : null;
}
function ae(e, t) {
	let n = re(e), r = ie(t), i = Math.max(n ?? 0, r ?? 0), a = ["May 2024 WBH minimum sustainable Tech Level uses the highest applicable Atmosphere and Habitability minimum.", "Atmosphere F uses the published minimum floor of TL8; specific conditions may justify TL10 or higher at Referee discretion."];
	return n === null && r === null && a.push("No listed environmental minimum applies; the WBH table contributes no minimum above TL0."), {
		method: "WBH minimum sustainable Tech Level",
		atmosphereCode: e,
		habitabilityRating: t,
		atmosphereMinimum: n,
		habitabilityMinimum: r,
		minimumTechLevel: i,
		prosperousLowCommonMinimum: Math.max(0, i - 2),
		generationNotes: a
	};
}
function oe(e, t, n) {
	let r = [];
	return e >= 1 && e <= 5 ? r.push({
		source: `Population ${e}`,
		dm: 1
	}) : e >= 9 && r.push({
		source: `Population ${e}`,
		dm: -1
	}), [
		0,
		6,
		13,
		14
	].includes(t) ? r.push({
		source: `Government ${t}`,
		dm: -1
	}) : t === 5 ? r.push({
		source: "Government 5",
		dm: 1
	}) : t === 7 && r.push({
		source: "Government 7",
		dm: -2
	}), n !== null && (n <= 2 ? r.push({
		source: `PCR ${n}`,
		dm: -1
	}) : n >= 7 && r.push({
		source: `PCR ${n}`,
		dm: 1
	})), r;
}
function se(e, t) {
	let n = Math.max(0, Math.trunc(t.highCommonTechLevel)), r = ne(e), i = oe(t.populationCode, t.governmentCode, t.pcr), a = i.reduce((e, t) => e + t.dm, 0), o = Math.floor(n / 2), s = n, c = n + r.modifier + a, l = Math.max(o, Math.min(s, c)), u = ae(t.atmosphereCode, t.habitabilityRating);
	return {
		method: "WBH common Tech Levels",
		highCommonTechLevel: n,
		lowCommonTechLevel: l,
		lowCommonTlm: r,
		lowCommonDmTotal: a,
		lowCommonDmBreakdown: i,
		lowCommonUnbounded: c,
		lowCommonLowerBound: o,
		lowCommonUpperBound: s,
		minimumSustainable: u,
		highCommonMeetsSustainableMinimum: n >= u.minimumTechLevel,
		lowCommonMeetsProsperousMinimum: l >= u.prosperousLowCommonMinimum,
		generationNotes: [
			"High Common TL equals the UWP Tech Level.",
			"Low Common TL = High Common TL + TLM + DMs, bounded from floor(High Common TL / 2) through High Common TL.",
			"The minimum-sustainable checks are recorded as audit results; this phase does not silently rewrite the established UWP Tech Level."
		]
	};
}
function ce(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function le(e) {
	let t = ce(e.populationConcentration);
	return typeof t?.rating == "number" ? t.rating : null;
}
function ue(e) {
	let t = e.physical?.details?.habitabilityRating?.rating;
	return typeof t == "number" ? t : null;
}
function de(e, t, n) {
	if (n.populationCode === 0) return {
		...n,
		commonTechnologyDetails: null
	};
	let r = se(new S(ee(`wbh-social-common-technology-v1|${e}|${t.id}|${n.uwp}`)), {
		highCommonTechLevel: n.techLevel,
		populationCode: n.populationCode,
		governmentCode: n.governmentCode,
		pcr: le(n),
		atmosphereCode: t.physical?.atmosphereCode ?? null,
		habitabilityRating: ue(t)
	});
	return {
		...n,
		commonTechnologyDetails: r
	};
}
function fe(e, t, n, r) {
	if (!n.social) return n;
	let i = n.sourceId ?? `${t.id}.moon-${r + 1}`, a = {
		...t,
		id: i,
		worldKind: "Terrestrial Planet",
		physical: n.physical,
		social: n.social,
		isMainworld: !!n.isMainworld
	};
	return {
		...n,
		social: de(e, a, n.social)
	};
}
function pe(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.physical?.details?.satellites, r = t.social ? de(e.id, t, t.social) : t.social;
			return n ? {
				...t,
				social: r,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...n,
							moons: n.moons.map((n, r) => fe(e.id, t, n, r))
						}
					}
				}
			} : {
				...t,
				social: r
			};
		})
	};
}
//#endregion
//#region src/rules/worlds/wbhBalkanisedCommonTechnology.ts
function me(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function he(e) {
	return e === 5 ? [{
		source: "Government 5",
		dm: 2
	}] : [
		0,
		6,
		13,
		14
	].includes(e) ? [{
		source: `Government ${e}`,
		dm: -2
	}] : [];
}
function ge(e, t) {
	return {
		status: "complete",
		highCommonTechLevel: e,
		highCommonTlm: null,
		highCommonDmBreakdown: [],
		highCommonDmTotal: 0,
		highCommonUnbounded: e,
		highCommonLowerBound: t,
		highCommonUpperBound: e,
		lowCommonTechLevel: t,
		lowCommonDmBreakdown: [],
		lowCommonDmTotal: 0,
		lowCommonUnbounded: t,
		lowCommonLowerBound: t,
		lowCommonUpperBound: e,
		generationNotes: ["The nation hosting or adjacent to the starport uses the world High and Low Common Tech Levels."]
	};
}
function _e(e, t) {
	let n = Math.max(0, Math.trunc(t.worldHighCommonTechLevel)), r = Math.max(0, Math.min(n, Math.trunc(t.worldLowCommonTechLevel))), i = Math.max(0, Math.trunc(t.faction.governmentCode)), a = ne(e), o = he(i), s = o.reduce((e, t) => e + t.dm, 0), c = n - 2 + a.modifier + s, l = Math.max(r, Math.min(n, c)), u = he(i);
	t.factionPcr !== null && t.factionPcr >= 7 && u.push({
		source: `Faction PCR ${t.factionPcr}`,
		dm: 1
	});
	let d = u.reduce((e, t) => e + t.dm, 0), f = t.factionPcr !== null, p = f ? r + d : null, m = p === null ? null : Math.max(r, Math.min(l, p));
	return {
		factionId: t.faction.id,
		governmentCode: i,
		hostOrAdjacentCandidate: ge(n, r),
		nonHostCandidate: {
			status: f ? "complete" : "incomplete",
			highCommonTechLevel: l,
			highCommonTlm: a,
			highCommonDmBreakdown: o,
			highCommonDmTotal: s,
			highCommonUnbounded: c,
			highCommonLowerBound: r,
			highCommonUpperBound: n,
			lowCommonTechLevel: m,
			lowCommonDmBreakdown: u,
			lowCommonDmTotal: d,
			lowCommonUnbounded: p,
			lowCommonLowerBound: r,
			lowCommonUpperBound: l,
			generationNotes: f ? ["Non-starport faction High Common TL = World High Common TL - 2 + TLM + DMs, bounded by the world Low and High Common TLs.", "Non-starport faction Low Common TL = World Low Common TL + DMs, bounded by World Low Common TL and faction High Common TL."] : ["Non-starport faction High Common TL is complete.", "Non-starport faction Low Common TL remains incomplete because the WBH PCR 7+ DM requires a faction-specific PCR; TSG does not substitute the world PCR."]
		}
	};
}
function ve(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function ye(e, t, n) {
	let r = ve(n.commonTechnologyDetails), i = ve(n.balkanisation), a = Array.isArray(i?.factions) ? i.factions : [];
	if (n.governmentCode !== 7 || !r || !a.length) return {
		...n,
		balkanisedCommonTechnologyDetails: null
	};
	let o = typeof r.highCommonTechLevel == "number" ? r.highCommonTechLevel : n.techLevel, s = typeof r.lowCommonTechLevel == "number" ? r.lowCommonTechLevel : n.techLevel, c = {
		method: "WBH balkanised common Tech Levels",
		status: "candidate-only",
		worldHighCommonTechLevel: o,
		worldLowCommonTechLevel: s,
		hostFactionId: null,
		factions: a.flatMap((r) => {
			let i = ve(r);
			return !i || typeof i.id != "string" || typeof i.governmentCode != "number" ? [] : [_e(new S(me(`wbh-social-balkanised-common-technology-v1|${e}|${t}|${i.id}|${n.uwp}`)), {
				faction: {
					id: i.id,
					governmentCode: i.governmentCode
				},
				worldHighCommonTechLevel: o,
				worldLowCommonTechLevel: s,
				factionPcr: null
			})];
		}),
		generationNotes: [
			"WBH requires one faction/nation to host or be adjacent to the starport; TSG leaves that choice to the Referee rather than assigning a sovereign faction automatically.",
			"Each faction therefore records both its starport-host candidate and non-host candidate.",
			"Faction-specific PCR is not yet generated, so non-host Low Common TL remains incomplete while its High Common TL is still valid."
		]
	};
	return {
		...n,
		balkanisedCommonTechnologyDetails: c
	};
}
function be(e, t, n, r) {
	if (!n.social) return n;
	let i = n.sourceId ?? `${t.id}.moon-${r + 1}`;
	return {
		...n,
		social: ye(e, i, n.social)
	};
}
function xe(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.social ? ye(e.id, t.id, t.social) : t.social, r = t.physical?.details?.satellites;
			return r ? {
				...t,
				social: n,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...r,
							moons: r.moons.map((n, r) => be(e.id, t, n, r))
						}
					}
				}
			} : {
				...t,
				social: n
			};
		})
	};
}
//#endregion
//#region src/rules/worlds/wbhDeathPenalty.ts
function Se(e, t, n) {
	let r = Math.max(0, Math.trunc(t)), i = Math.max(0, Math.trunc(n)), a = e.roll(2, 6).total, o = r === 0 ? -4 : 0, s = i >= 9 ? 4 : 0, c = o + s, l = a + c, u = l >= 8;
	return {
		method: "WBH death penalty",
		governmentCode: r,
		lawLevelCode: i,
		roll: a,
		governmentDm: o,
		lawLevelDm: s,
		dmTotal: c,
		total: l,
		deathPenaltyExists: u,
		code: u ? "Y" : "N",
		generationNotes: ["Death penalty exists on 8+ from 2D + DMs; Government 0 DM-4 and Law Level 9+ DM+4."]
	};
}
function Ce(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function we(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Te(e, t, n) {
	if (n.populationCode === 0) return {
		method: "WBH death penalty audit",
		world: null,
		balkanisedFactions: [],
		generationNotes: ["Not applicable: Population 0 has no inhabited society or formal criminal penalties."]
	};
	if (n.governmentCode !== 7) return {
		method: "WBH death penalty audit",
		world: Se(new S(Ce(`wbh-social-death-penalty-v1|${e}|${t}|${n.uwp}`)), n.governmentCode, n.lawLevelCode),
		balkanisedFactions: [],
		generationNotes: []
	};
	let r = we(n.judicialSystemDetails), i = Array.isArray(r?.balkanisedFactions) ? r.balkanisedFactions : [], a = [];
	for (let r of i) {
		let i = we(r), o = typeof i?.factionId == "string" ? i.factionId : null, s = we(i?.details), c = typeof s?.governmentCode == "number" ? s.governmentCode : null, l = typeof s?.lawLevelCode == "number" ? s.lawLevelCode : null;
		!o || c === null || l === null || a.push({
			factionId: o,
			details: Se(new S(Ce(`wbh-social-death-penalty-v1|${e}|${t}|${n.uwp}|${o}`)), c, l)
		});
	}
	return {
		method: "WBH death penalty audit",
		world: null,
		balkanisedFactions: a,
		generationNotes: ["Government 7 determines death-penalty status separately for each represented sovereign faction."]
	};
}
function Ee(e, t) {
	t.social && (t.social.deathPenaltyDetails = Te(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		i.social && (i.social.deathPenaltyDetails = Te(e, i.sourceId ?? `${t.id}.moon-${r + 1}`, i.social));
	}
}
function De(e) {
	for (let t of e.worlds) Ee(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhJusticeProfile.ts
function Oe(e) {
	let { primaryJudicialSystemCode: t, secondaryJudicialSystemCode: n, lawUniformityCode: r, presumptionOfInnocenceCode: i, deathPenaltyCode: a } = e, o = t !== null && n !== null && r !== null && i !== null && a !== null;
	return {
		method: "WBH justice profile",
		status: o ? "complete" : "incomplete",
		primaryJudicialSystemCode: t,
		secondaryJudicialSystemCode: n,
		lawUniformityCode: r,
		presumptionOfInnocenceCode: i,
		deathPenaltyCode: a,
		profile: o ? `${t}${n}${r}-${i}-${a}` : null,
		generationNotes: o ? ["Justice Profile uses the WBH PSU-I-D format."] : ["One or more WBH justice prerequisites are unavailable; no partial Justice Profile string is fabricated."]
	};
}
function C(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function ke(e) {
	return e === "N" || e === "I" || e === "A" || e === "T" ? e : null;
}
function Ae(e) {
	return e === "P" || e === "T" || e === "U" ? e : null;
}
function je(e) {
	return e === "Y" || e === "N" ? e : null;
}
function Me(e) {
	let t = C(C(e.judicialSystemDetails)?.world), n = C(t?.secondarySystem), r = C(C(e.lawUniformityDetails)?.world), i = C(C(e.presumptionOfInnocenceDetails)?.world), a = C(C(e.deathPenaltyDetails)?.world);
	return {
		primaryJudicialSystemCode: ke(t?.code),
		secondaryJudicialSystemCode: ke(n?.code),
		lawUniformityCode: Ae(r?.code),
		presumptionOfInnocenceCode: je(i?.code),
		deathPenaltyCode: je(a?.code)
	};
}
function Ne(e, t) {
	let n = C(e), r = Array.isArray(n?.balkanisedFactions) ? n.balkanisedFactions : [];
	for (let e of r) {
		let n = C(e);
		if (n?.factionId === t) return n;
	}
	return null;
}
function Pe(e, t) {
	let n = C(Ne(e.judicialSystemDetails, t)?.details), r = C(n?.secondarySystem), i = C(Ne(e.lawUniformityDetails, t)?.details), a = C(Ne(e.presumptionOfInnocenceDetails, t)?.details), o = C(Ne(e.deathPenaltyDetails, t)?.details);
	return {
		primaryJudicialSystemCode: ke(n?.code),
		secondaryJudicialSystemCode: ke(r?.code),
		lawUniformityCode: Ae(i?.code),
		presumptionOfInnocenceCode: je(a?.code),
		deathPenaltyCode: je(o?.code)
	};
}
function Fe(e) {
	if (e.governmentCode !== 7) {
		let t = Oe(Me(e));
		return {
			method: "WBH justice profile audit",
			world: t,
			balkanisedFactions: [],
			generationNotes: t.status === "complete" ? [] : ["Justice Profile prerequisites are incomplete."]
		};
	}
	let t = C(e.judicialSystemDetails), n = Array.isArray(t?.balkanisedFactions) ? t.balkanisedFactions : [], r = [];
	for (let t of n) {
		let n = C(t), i = typeof n?.factionId == "string" ? n.factionId : null;
		i && r.push({
			factionId: i,
			details: Oe(Pe(e, i))
		});
	}
	return {
		method: "WBH justice profile audit",
		world: null,
		balkanisedFactions: r,
		generationNotes: ["Government 7 derives a separate Justice Profile for each represented sovereign faction."]
	};
}
function Ie(e) {
	e.social && (e.social.justiceProfileDetails = Fe(e.social));
	let t = e.physical?.details?.satellites?.moons ?? [];
	for (let e of t) e.social && (e.social.justiceProfileDetails = Fe(e.social));
}
function Le(e) {
	for (let t of e.worlds) Ie(t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhJudicialSystem.ts
function Re(e) {
	return e <= 5 ? {
		code: "I",
		judicialSystem: "Inquisitorial"
	} : e <= 8 ? {
		code: "A",
		judicialSystem: "Adversarial"
	} : {
		code: "T",
		judicialSystem: "Traditional"
	};
}
function ze(e) {
	return e === 1 || e >= 8 && e <= 12 || e === 15 ? -2 : e === 13 || e === 14 ? 4 : 0;
}
function Be(e, t, n) {
	if (t === "N") return {
		method: "WBH secondary judicial system",
		scope: "economic and regulatory",
		primaryCode: t,
		roll: null,
		lawLevelDm: 0,
		total: null,
		code: "N",
		judicialSystem: "None",
		changedFromPrimary: !1,
		generationNotes: ["No established primary judicial system exists, so no separate economic/regulatory system is generated."]
	};
	if (t === "I") return {
		method: "WBH secondary judicial system",
		scope: "economic and regulatory",
		primaryCode: t,
		roll: null,
		lawLevelDm: 0,
		total: null,
		code: "I",
		judicialSystem: "Inquisitorial",
		changedFromPrimary: !1,
		generationNotes: ["The primary system is already Inquisitorial; no secondary-system roll is required."]
	};
	let r = Math.max(0, Math.trunc(n)), i = e.roll(2, 6).total, a = i + r, o = a >= 12, s = o ? "I" : t;
	return {
		method: "WBH secondary judicial system",
		scope: "economic and regulatory",
		primaryCode: t,
		roll: i,
		lawLevelDm: r,
		total: a,
		code: s,
		judicialSystem: s === "A" ? "Adversarial" : s === "T" ? "Traditional" : "Inquisitorial",
		changedFromPrimary: o,
		generationNotes: [o ? "2D + Law Level reached 12+; economic/regulatory matters use an Inquisitorial administrative procedure." : "2D + Law Level was below 12; economic/regulatory matters retain the primary judicial system."]
	};
}
function Ve(e, t) {
	let n = Math.max(0, Math.trunc(t.governmentCode)), r = Math.max(0, Math.trunc(t.lawLevelCode)), i = Math.max(0, Math.trunc(t.techLevel));
	if (n === 0) {
		let a = Be(e, "N", r);
		return {
			method: "WBH system of justice",
			governmentCode: n,
			lawLevelCode: r,
			techLevel: i,
			judicialAuthoritative: t.judicialAuthoritative,
			status: "none",
			roll: null,
			dmTotal: 0,
			dmBreakdown: [],
			total: null,
			code: "N",
			judicialSystem: "None",
			secondarySystem: a,
			generationNotes: ["Government 0 has no established judicial system; community standards and informal proceedings may still apply."]
		};
	}
	if (t.judicialAuthoritative === null) return {
		method: "WBH system of justice",
		governmentCode: n,
		lawLevelCode: r,
		techLevel: i,
		judicialAuthoritative: null,
		status: "incomplete",
		roll: null,
		dmTotal: 0,
		dmBreakdown: [],
		total: null,
		code: null,
		judicialSystem: null,
		secondarySystem: null,
		generationNotes: ["Government Authority is required before applying the Judicial-authoritative DM; no judicial-system result is fabricated."]
	};
	let a = [], o = ze(n);
	o !== 0 && a.push({
		source: `Government ${n}`,
		dm: o
	}), r >= 10 && n !== 13 && n !== 14 && a.push({
		source: `Law Level ${r} (A+)`,
		dm: -4
	}), i === 0 ? a.push({
		source: "Tech Level 0",
		dm: 4
	}) : i <= 2 && a.push({
		source: `Tech Level ${i}`,
		dm: 2
	}), t.judicialAuthoritative && a.push({
		source: "Judicial authoritative government",
		dm: -2
	});
	let s = e.roll(2, 6).total, c = a.reduce((e, t) => e + t.dm, 0), l = s + c, u = Re(l), d = Be(e, u.code, r);
	return {
		method: "WBH system of justice",
		governmentCode: n,
		lawLevelCode: r,
		techLevel: i,
		judicialAuthoritative: t.judicialAuthoritative,
		status: "generated",
		roll: s,
		dmTotal: c,
		dmBreakdown: a,
		total: l,
		...u,
		secondarySystem: d,
		generationNotes: ["2D + DMs: 5- Inquisitorial, 6-8 Adversarial, 9+ Traditional."]
	};
}
function He(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Ue(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function We(e) {
	let t = Ue(Ue(e)?.authority);
	return typeof t?.code == "string" ? t.code === "J" : null;
}
function Ge(e, t, n) {
	if (n.populationCode <= 0) return {
		method: "WBH judicial system audit",
		world: Ve(new S(He(`wbh-social-judicial-system-v1|${e}|${t}|${n.uwp}`)), {
			governmentCode: n.governmentCode,
			lawLevelCode: n.lawLevelCode,
			techLevel: n.techLevel,
			judicialAuthoritative: !1
		}),
		balkanisedFactions: [],
		generationNotes: ["Population 0 carries no established government or judicial system."]
	};
	if (n.governmentCode !== 7) return {
		method: "WBH judicial system audit",
		world: Ve(new S(He(`wbh-social-judicial-system-v1|${e}|${t}|${n.uwp}`)), {
			governmentCode: n.governmentCode,
			lawLevelCode: n.lawLevelCode,
			techLevel: n.techLevel,
			judicialAuthoritative: We(n.governmentCentralisation)
		}),
		balkanisedFactions: [],
		generationNotes: []
	};
	let r = Ue(n.lawLevelDetails), i = Array.isArray(r?.balkanisedFactionLawLevels) ? r.balkanisedFactionLawLevels : [], a = Ue(n.balkanisation), o = Array.isArray(a?.factions) ? a.factions : [], s = /* @__PURE__ */ new Map();
	for (let e of o) {
		let t = Ue(e);
		typeof t?.id == "string" && s.set(t.id, t);
	}
	let c = [];
	for (let r of i) {
		let i = Ue(r), a = typeof i?.factionId == "string" ? i.factionId : null, o = typeof i?.governmentCode == "number" ? i.governmentCode : null, l = typeof i?.lawLevelCode == "number" ? i.lawLevelCode : null;
		if (!a || o === null || l === null) continue;
		let u = s.get(a), d = new S(He(`wbh-social-judicial-system-v1|${e}|${t}|${n.uwp}|${a}`));
		c.push({
			factionId: a,
			details: Ve(d, {
				governmentCode: o,
				lawLevelCode: l,
				techLevel: n.techLevel,
				judicialAuthoritative: We(u?.centralisation)
			})
		});
	}
	return {
		method: "WBH judicial system audit",
		world: null,
		balkanisedFactions: c,
		generationNotes: ["Government 7 has no single world government judicial system; each represented sovereign faction uses its own Government and Law Level."]
	};
}
function Ke(e, t) {
	t.social && (t.social.judicialSystemDetails = Ge(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		if (!i.social) continue;
		let a = i.sourceId ?? `${t.id}.moon-${r + 1}`;
		i.social.judicialSystemDetails = Ge(e, a, i.social);
	}
}
function qe(e) {
	for (let t of e.worlds) Ke(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhLawLevel.ts
function Je(e) {
	return Math.max(0, Math.min(18, Math.trunc(e)));
}
function Ye(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Xe(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Ze(e) {
	if (e.populationCode <= 0) return {
		roll: null,
		modifier: null,
		unclampedTotal: 0,
		clampingMayHaveOccurred: !1
	};
	let t = e.governmentCode - 7;
	if (e.lawLevelCode > 0 && e.lawLevelCode < 18) {
		let n = e.lawLevelCode - t;
		if (n >= 2 && n <= 12) return {
			roll: n,
			modifier: t,
			unclampedTotal: e.lawLevelCode,
			clampingMayHaveOccurred: !1
		};
	}
	return {
		roll: null,
		modifier: t,
		unclampedTotal: null,
		clampingMayHaveOccurred: e.lawLevelCode === 0 || e.lawLevelCode === 18
	};
}
function Qe(e, t, n) {
	if (n.populationCode <= 0 || n.governmentCode !== 7) return [];
	let r = Xe(n.balkanisation);
	return (Array.isArray(r?.factions) ? r.factions : []).flatMap((r) => {
		let i = Xe(r), a = typeof i?.id == "string" ? i.id : null, o = typeof i?.governmentCode == "number" && Number.isFinite(i.governmentCode) ? Math.max(0, Math.trunc(i.governmentCode)) : null;
		if (!a || o === null) return [];
		let s = new S(Ye(`wbh-social-law-level-balkanisation-v1|${e}|${t}|${n.uwp}|${a}`)).roll(2, 6).total, c = o - 7, l = s + c;
		return [{
			factionId: a,
			governmentCode: o,
			roll: s,
			modifier: c,
			unclampedTotal: l,
			lawLevelCode: Je(l)
		}];
	});
}
function $e(e, t, n, r) {
	let i = r === "generated" ? Ze(n) : {
		roll: null,
		modifier: null,
		unclampedTotal: null,
		clampingMayHaveOccurred: !1
	}, a = Qe(e, t, n);
	return {
		method: "WBH Law Level",
		source: r,
		populationCode: n.populationCode,
		governmentCode: n.governmentCode,
		lawLevelCode: n.lawLevelCode,
		...i,
		balkanisedFactionLawLevels: a,
		generationNotes: n.populationCode <= 0 ? ["Population 0 has Government 0 and Law Level 0."] : [
			r === "imported-uwp" ? "Overall Law Level is preserved from the source UWP, as required by the WBH checklist." : "Overall Law Level uses the existing 2D-7 + Government result; this audit layer does not reroll or replace it.",
			...i.clampingMayHaveOccurred ? ["The stored endpoint Law Level may have been clamped; the original 2D total cannot be recovered safely and is not fabricated."] : [],
			...n.governmentCode === 7 ? ["Government 7 repeats Law Level generation for each represented sovereign faction.", "The overall UWP Law Level remains the world value. Which faction or nation is nearest to or hosts the starport is a Referee determination and is not inferred here."] : []
		]
	};
}
function et(e, t) {
	return e.generationMethod === "continuation" && t ? "imported-uwp" : "generated";
}
function tt(e, t) {
	t.social && (t.social.lawLevelDetails = $e(e.id, t.id, t.social, et(e, t.isMainworld === !0)));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		if (!i.social) continue;
		let a = i.sourceId ?? `${t.id}.moon-${r + 1}`;
		i.social.lawLevelDetails = $e(e.id, a, i.social, et(e, i.isMainworld === !0));
	}
}
function nt(e) {
	for (let t of e.worlds) tt(e, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhLawSubclassifications.ts
var rt = {
	W: "Weapons and Armour",
	E: "Economic",
	C: "Criminal",
	P: "Private",
	R: "Personal Rights"
};
function it(e) {
	return Math.max(0, Math.min(18, Math.trunc(e)));
}
function at(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[e] ?? String(e);
}
function ot(e) {
	return e === 0 ? -2 : e === 1 ? 2 : e === 2 ? -1 : +(e === 9);
}
function st(e) {
	return e === 3 || e === 5 || e === 12 ? -1 : 0;
}
function ct(e) {
	return e === 0 || e === 2 ? -1 : e === 1 ? 2 : 0;
}
function lt(e, t) {
	let n = [];
	if (e === "W") {
		if (t.pcr === null) return {
			incompleteReason: "Weapons and Armour Law requires a Population Concentration Rating (PCR).",
			dms: n
		};
		t.pcr <= 3 ? n.push({
			source: `PCR ${t.pcr}`,
			dm: -1
		}) : t.pcr >= 8 && n.push({
			source: `PCR ${t.pcr}`,
			dm: 1
		});
	} else if (e === "E") {
		let e = ot(t.governmentCode);
		e !== 0 && n.push({
			source: `Government ${at(t.governmentCode)}`,
			dm: e
		});
	} else if (e === "C") {
		if (t.primaryJudicialSystemCode === null) return {
			incompleteReason: "Criminal Law requires the primary judicial system before the Inquisitorial DM can be evaluated.",
			dms: n
		};
		t.primaryJudicialSystemCode === "I" && n.push({
			source: "Inquisitorial primary judicial system",
			dm: 1
		});
	} else if (e === "P") {
		let e = st(t.governmentCode);
		e !== 0 && n.push({
			source: `Government ${at(t.governmentCode)}`,
			dm: e
		});
	} else {
		let e = ct(t.governmentCode);
		e !== 0 && n.push({
			source: `Government ${at(t.governmentCode)}`,
			dm: e
		});
	}
	return {
		incompleteReason: null,
		dms: n
	};
}
function ut(e, t, n) {
	let r = it(n.overallLawLevel), { incompleteReason: i, dms: a } = lt(t, n);
	if (i) return {
		method: "WBH Law Level subclassification",
		categoryCode: t,
		categoryName: rt[t],
		status: "incomplete",
		overallLawLevel: r,
		roll: null,
		variance: null,
		dmTotal: a.reduce((e, t) => e + t.dm, 0),
		dmBreakdown: a,
		unclampedTotal: null,
		lawLevel: null,
		generationNotes: [i]
	};
	let o = e.roll(2, 3).total, s = o - 4, c = a.reduce((e, t) => e + t.dm, 0), l = r + s + c, u = it(l);
	return {
		method: "WBH Law Level subclassification",
		categoryCode: t,
		categoryName: rt[t],
		status: "generated",
		overallLawLevel: r,
		roll: o,
		variance: s,
		dmTotal: c,
		dmBreakdown: a,
		unclampedTotal: l,
		lawLevel: u,
		generationNotes: ["WBH subclassification uses Overall Law Level + 2D3 - 4 + category DMs, bounded to 0..J(18)."]
	};
}
function dt(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function ft(e, t) {
	return new S(dt(`${e}|${t}`));
}
function pt(e, t) {
	let n = {
		overallLawLevel: it(t.overallLawLevel),
		governmentCode: Math.max(0, Math.trunc(t.governmentCode)),
		pcr: t.pcr === null ? null : Math.max(0, Math.min(9, Math.trunc(t.pcr))),
		primaryJudicialSystemCode: t.primaryJudicialSystemCode
	}, r = ut(ft(e, "W"), "W", n), i = ut(ft(e, "E"), "E", n), a = ut(ft(e, "C"), "C", n), o = ut(ft(e, "P"), "P", n), s = ut(ft(e, "R"), "R", n), c = [
		r,
		i,
		a,
		o,
		s
	], l = c.every((e) => e.status === "generated" && e.lawLevel !== null), u = l ? `${at(n.overallLawLevel)}-${c.map((e) => at(e.lawLevel)).join("")}` : null;
	return {
		method: "WBH Law Level subclassifications",
		status: l ? "complete" : "incomplete",
		overallLawLevel: n.overallLawLevel,
		governmentCode: n.governmentCode,
		pcr: n.pcr,
		primaryJudicialSystemCode: n.primaryJudicialSystemCode,
		weaponsAndArmour: r,
		economic: i,
		criminal: a,
		privateLaw: o,
		personalRights: s,
		profile: u,
		generationNotes: l ? ["Law Level Profile uses the WBH O-WECPR format."] : ["One or more subclassification prerequisites are unavailable; no partial Law Level Profile string is fabricated."]
	};
}
function mt(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function ht(e) {
	return e === "N" || e === "I" || e === "A" || e === "T" ? e : null;
}
function gt(e) {
	let t = mt(e.populationConcentration);
	return typeof t?.rating == "number" ? t.rating : null;
}
function _t(e, t) {
	let n = mt(e), r = Array.isArray(n?.balkanisedFactions) ? n.balkanisedFactions : [];
	for (let e of r) {
		let n = mt(e);
		if (n?.factionId === t) return n;
	}
	return null;
}
function vt(e, t, n) {
	if (n.populationCode <= 0) return {
		method: "WBH Law Level subclassifications audit",
		world: null,
		balkanisedFactions: [],
		generationNotes: ["Population 0 has no inhabited society for which Law Level subclassifications are generated."]
	};
	if (n.governmentCode !== 7) {
		let r = mt(mt(n.judicialSystemDetails)?.world);
		return {
			method: "WBH Law Level subclassifications audit",
			world: pt(`wbh-social-law-subclassifications-v1|${e}|${t}|${n.uwp}`, {
				overallLawLevel: n.lawLevelCode,
				governmentCode: n.governmentCode,
				pcr: gt(n),
				primaryJudicialSystemCode: ht(r?.code)
			}),
			balkanisedFactions: [],
			generationNotes: []
		};
	}
	let r = mt(n.lawLevelDetails), i = Array.isArray(r?.balkanisedFactionLawLevels) ? r.balkanisedFactionLawLevels : [], a = [];
	for (let r of i) {
		let i = mt(r), o = typeof i?.factionId == "string" ? i.factionId : null, s = typeof i?.governmentCode == "number" ? i.governmentCode : null, c = typeof i?.lawLevelCode == "number" ? i.lawLevelCode : null;
		if (!o || s === null || c === null) continue;
		let l = mt(_t(n.judicialSystemDetails, o)?.details);
		a.push({
			factionId: o,
			details: pt(`wbh-social-law-subclassifications-v1|${e}|${t}|${n.uwp}|${o}`, {
				overallLawLevel: c,
				governmentCode: s,
				pcr: null,
				primaryJudicialSystemCode: ht(l?.code)
			})
		});
	}
	return {
		method: "WBH Law Level subclassifications audit",
		world: null,
		balkanisedFactions: a,
		generationNotes: ["Government 7 is represented per sovereign faction. Weapons and Armour remains incomplete until faction-specific population/PCR is modeled; world PCR is not substituted silently."]
	};
}
function yt(e, t) {
	t.social && (t.social.lawSubclassificationsDetails = vt(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		if (!i.social) continue;
		let a = i.sourceId ?? `${t.id}.moon-${r + 1}`;
		i.social.lawSubclassificationsDetails = vt(e, a, i.social);
	}
}
function bt(e) {
	for (let t of e.worlds) yt(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhLawUniformity.ts
function xt(e) {
	return e === "P" ? "Personal" : e === "T" ? "Territorial" : "Universal";
}
function St(e) {
	return e === 2 ? 1 : e === 3 || e === 5 || e >= 10 ? -1 : 0;
}
function Ct(e, t, n) {
	if (n === "C") return {
		method: "WBH law uniformity",
		governmentCode: t,
		centralisationCode: n,
		roll: null,
		dm: 0,
		total: null,
		code: "T",
		uniformity: "Territorial",
		generationNotes: ["Confederal governments are always Territorial at the overall government level."]
	};
	if (n === "F") {
		let r = e.die(6), i = r === 6 ? "P" : "T";
		return {
			method: "WBH law uniformity",
			governmentCode: t,
			centralisationCode: n,
			roll: r,
			dm: 0,
			total: r,
			code: i,
			uniformity: xt(i),
			generationNotes: ["Federal governments are Territorial on 1-5 and Personal on 6."]
		};
	}
	let r = e.die(6), i = St(t), a = r + i, o = a <= 2 ? "P" : a === 3 ? "T" : "U";
	return {
		method: "WBH law uniformity",
		governmentCode: t,
		centralisationCode: n,
		roll: r,
		dm: i,
		total: a,
		code: o,
		uniformity: xt(o),
		generationNotes: ["Unitary governments use the WBH 1D+DM Law Uniformity table: 2- Personal, 3 Territorial, 4+ Universal."]
	};
}
function wt(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Tt(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Et(e) {
	let t = Tt(e);
	return t?.code === "C" || t?.code === "F" || t?.code === "U" ? t.code : null;
}
function Dt(e, t, n) {
	if (n.populationCode <= 0 || n.governmentCode === 0) return {
		method: "WBH law uniformity audit",
		world: null,
		balkanisedFactions: [],
		generationNotes: ["No established government means no formal overall law-uniformity result is generated."]
	};
	if (n.governmentCode !== 7) {
		let r = Et(n.governmentCentralisation), i = r ? Ct(new S(wt(`wbh-social-law-uniformity-v1|${e}|${t}|${n.uwp}`)), n.governmentCode, r) : null;
		return {
			method: "WBH law uniformity audit",
			world: i,
			balkanisedFactions: [],
			generationNotes: i ? [] : ["Government centralisation is required before Law Uniformity can be determined."]
		};
	}
	let r = Tt(n.balkanisation), i = Array.isArray(r?.factions) ? r.factions : [], a = [];
	for (let r of i) {
		let i = Tt(r), o = typeof i?.id == "string" ? i.id : null, s = typeof i?.governmentCode == "number" ? i.governmentCode : null, c = Et(i?.centralisation);
		!o || s === null || a.push({
			factionId: o,
			details: c ? Ct(new S(wt(`wbh-social-law-uniformity-v1|${e}|${t}|${n.uwp}|${o}`)), s, c) : null
		});
	}
	return {
		method: "WBH law uniformity audit",
		world: null,
		balkanisedFactions: a,
		generationNotes: ["Government 7 determines Law Uniformity separately for each represented sovereign faction."]
	};
}
function Ot(e, t) {
	t.social && (t.social.lawUniformityDetails = Dt(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		i.social && (i.social.lawUniformityDetails = Dt(e, i.sourceId ?? `${t.id}.moon-${r + 1}`, i.social));
	}
}
function kt(e) {
	for (let t of e.worlds) Ot(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhMilitaryTechnology.ts
function At(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function jt(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(e);
}
function Mt(e, t) {
	return new S(At(`${e}|${t}`));
}
function Nt(e, t, n) {
	let r = Math.max(0, Math.floor(t));
	return Math.max(r, Math.min(Math.max(r, Math.floor(n)), Math.trunc(e)));
}
function Pt(e, t, n, r, i, a, o, s) {
	let c = ne(Mt(e, t)), l = a.reduce((e, t) => e + t.dm, 0), u = Math.trunc(n) + c.modifier + l;
	return {
		category: t,
		status: o,
		baseTechLevel: Math.max(0, Math.trunc(n)),
		tlm: c,
		dmBreakdown: a,
		dmTotal: l,
		unboundedTechLevel: u,
		lowerBound: Math.max(0, Math.floor(r)),
		upperBound: Math.max(Math.max(0, Math.floor(r)), Math.floor(i)),
		techLevel: Nt(u, r, i),
		generationNotes: s
	};
}
function Ft(e) {
	return e === 0 || e >= 13 ? 2 : +(e >= 1 && e <= 4 || e >= 9 && e <= 12);
}
function It(e, t) {
	let n = Math.max(0, Math.trunc(t.manufacturingTechLevel)), r = Math.max(0, Math.trunc(t.electronicsTechLevel)), i = Math.max(0, Math.trunc(t.governmentCode)), a = t.worldGovernmentSeven === !0, o = [];
	(i === 0 || a || i === 7) && o.push({
		source: a && i !== 7 ? "Government 7 world" : `Government ${jt(i)}`,
		dm: 2
	});
	let s = "complete", c = 0, l = ["Personal Military TL = Manufacturing TL + TLM + DMs; upper bound is Electronics TL."];
	if (t.weaponsAndArmourLawLevel === null) s = "provisional", l.push("Weapons and Armour Law Level is unavailable, so its DM and the special Law 0 lower bound cannot be applied; this candidate is provisional.");
	else {
		let e = Math.max(0, Math.trunc(t.weaponsAndArmourLawLevel)), r = Ft(e);
		r !== 0 && o.push({
			source: `Weapons/Armour Law ${jt(e)}`,
			dm: r
		}), e === 0 && (c = n);
	}
	let u = Pt(e, "personal", n, c, r, o, s, l), d = [], f = "complete", p = ["Heavy Military TL = Manufacturing TL + TLM + DMs; upper bound is Manufacturing TL and lower bound is 0."];
	if (t.populationCode === null) f = "provisional", p.push("Nation-specific Population code is unavailable, so the Population DM is not applied.");
	else {
		let e = Math.max(0, Math.trunc(t.populationCode));
		e >= 1 && e <= 6 ? d.push({
			source: `Population ${jt(e)}`,
			dm: -1
		}) : e >= 8 && d.push({
			source: `Population ${jt(e)}`,
			dm: 1
		});
	}
	(a || i === 7) && d.push({
		source: "Government 7 world",
		dm: 2
	}), (i === 10 || i === 11 || i === 15) && d.push({
		source: `Government ${jt(i)}`,
		dm: 2
	}), t.overallLawLevel === null ? (f = "provisional", p.push("Nation-specific overall Law Level is unavailable, so the Law D+ DM is not applied.")) : t.overallLawLevel >= 13 && d.push({
		source: `Law ${jt(t.overallLawLevel)}`,
		dm: 2
	}), t.industrial === null ? (f = "provisional", p.push("Nation-specific Industrial status is unavailable, so the Industrial DM is not applied.")) : t.industrial && d.push({
		source: "Industrial",
		dm: 1
	});
	let m = Pt(e, "heavy", n, 0, n, d, f, p);
	return {
		method: "WBH military Tech Levels",
		manufacturingTechLevel: n,
		electronicsTechLevel: r,
		populationCode: t.populationCode === null ? null : Math.max(0, Math.trunc(t.populationCode)),
		governmentCode: i,
		overallLawLevel: t.overallLawLevel === null ? null : Math.max(0, Math.trunc(t.overallLawLevel)),
		weaponsAndArmourLawLevel: t.weaponsAndArmourLawLevel === null ? null : Math.max(0, Math.trunc(t.weaponsAndArmourLawLevel)),
		industrial: t.industrial,
		worldGovernmentSeven: a,
		personal: u,
		heavy: m,
		generationNotes: a ? ["Government-7 military technology is represented per sovereign faction/nation. World-level Population/PCR/trade-code assumptions are not silently substituted for missing nation-specific data."] : []
	};
}
function w(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Lt(e) {
	return e.tradeCodes.some((e) => e.trim().toUpperCase() === "IN" || e.trim().toUpperCase() === "INDUSTRIAL");
}
function Rt(e) {
	let t = w(e), n = w(t?.manufacturing)?.techLevel, r = w(t?.electronics)?.techLevel;
	return typeof n != "number" || typeof r != "number" ? null : {
		manufacturingTechLevel: n,
		electronicsTechLevel: r
	};
}
function zt(e) {
	let t = w(w(w(e.lawSubclassificationsDetails)?.world)?.weaponsAndArmour);
	return typeof t?.lawLevel == "number" ? t.lawLevel : null;
}
function Bt(e, t) {
	let n = w(e.lawLevelDetails), r = Array.isArray(n?.balkanisedFactionLawLevels) ? n.balkanisedFactionLawLevels : [];
	for (let e of r) {
		let n = w(e);
		if (n?.factionId === t) return typeof n.governmentCode != "number" || typeof n.lawLevelCode != "number" ? null : {
			governmentCode: n.governmentCode,
			lawLevelCode: n.lawLevelCode
		};
	}
	return null;
}
function Vt(e, t) {
	let n = w(e.lawSubclassificationsDetails), r = Array.isArray(n?.balkanisedFactions) ? n.balkanisedFactions : [];
	for (let e of r) {
		let n = w(e);
		if (n?.factionId !== t) continue;
		let r = w(w(n.details)?.weaponsAndArmour);
		return typeof r?.lawLevel == "number" ? r.lawLevel : null;
	}
	return null;
}
function Ht(e, t, n) {
	if (n.populationCode === 0) return {
		...n,
		militaryTechnologyDetails: null
	};
	let r = w(n.qualityOfLifeTechnologyDetails);
	if (!r) return {
		...n,
		militaryTechnologyDetails: null
	};
	let i = Rt(r.world);
	if (i) {
		let r = It(`wbh-social-military-technology-v1|${e}|${t.id}|world|${n.uwp}`, {
			...i,
			populationCode: n.populationCode,
			governmentCode: n.governmentCode,
			overallLawLevel: n.lawLevelCode,
			weaponsAndArmourLawLevel: zt(n),
			industrial: Lt(n)
		});
		return {
			...n,
			militaryTechnologyDetails: {
				method: "WBH military technology audit",
				world: r,
				factions: [],
				generationNotes: ["Non-balkanised world uses its world Population, Government, Law, trade codes, and Quality-of-Life Technology inputs."]
			}
		};
	}
	let a = (Array.isArray(r.factions) ? r.factions : []).flatMap((r) => {
		let i = w(r);
		if (!i) return [];
		let a = typeof i.factionId == "string" ? i.factionId : null;
		if (!a) return [];
		let o = Bt(n, a), s = Rt(i.hostOrAdjacent), c = Rt(i.nonHost);
		if (!o || !s || !c) return [];
		let l = {
			populationCode: null,
			governmentCode: o.governmentCode,
			overallLawLevel: o.lawLevelCode,
			weaponsAndArmourLawLevel: Vt(n, a),
			industrial: null,
			worldGovernmentSeven: !0
		};
		return [{
			factionId: a,
			hostOrAdjacent: It(`wbh-social-military-technology-v1|${e}|${t.id}|${a}|host|${n.uwp}`, {
				...s,
				...l
			}),
			nonHost: It(`wbh-social-military-technology-v1|${e}|${t.id}|${a}|non-host|${n.uwp}`, {
				...c,
				...l
			})
		}];
	});
	return {
		...n,
		militaryTechnologyDetails: {
			method: "WBH military technology audit",
			world: null,
			factions: a,
			generationNotes: ["Government 7 applies its military Government DM to every nation regardless of local government.", "Faction-specific Population, PCR-derived Weapons/Armour Law, and Industrial status are not yet available. Missing nation-specific DMs are not replaced with world values; affected results are explicitly provisional."]
		}
	};
}
function Ut(e, t, n, r) {
	if (!n.social) return n;
	let i = n.sourceId ?? `${t.id}.moon-${r + 1}`, a = {
		...t,
		id: i,
		worldKind: "Terrestrial Planet",
		physical: n.physical,
		social: n.social,
		isMainworld: !!n.isMainworld
	};
	return {
		...n,
		social: Ht(e, a, n.social)
	};
}
function Wt(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.social ? Ht(e.id, t, t.social) : t.social, r = t.physical?.details?.satellites;
			return r ? {
				...t,
				social: n,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...r,
							moons: r.moons.map((n, r) => Ut(e.id, t, n, r))
						}
					}
				}
			} : {
				...t,
				social: n
			};
		})
	};
}
//#endregion
//#region src/rules/worlds/wbhNoveltyTechnology.ts
function Gt(e) {
	return Math.max(0, Math.trunc(e));
}
function Kt(e) {
	let t = Gt(e.highCommonTechLevel), n = Gt(e.minimumSustainableTechLevel), r = Gt(e.environmentalTechLevel), i = e.subcategoryTechLevels.filter((e) => Number.isFinite(e)).map(Gt), a = i.length ? Math.max(...i) : 0, o = Math.max(t, r) < n ? Math.max(0, n - 2) : null, s = [{
		source: "highest-subcategory",
		status: "known",
		techLevel: a,
		note: "WBH local prototype factor: Novelty TL can equal the highest technology subcategory TL."
	}], c = e.starport.trim().toUpperCase(), l = e.nearbyRichIndustrialClassATechLevel;
	c === "X" ? s.push({
		source: "nearby-class-a",
		status: "not-applicable",
		techLevel: null,
		note: "WBH nearby rich/industrial Class A minimum does not apply to a Class X starport world."
	}) : l === void 0 ? s.push({
		source: "nearby-class-a",
		status: "unknown",
		techLevel: null,
		note: "The highest qualifying rich/industrial Class A world within the subsector or six parsecs has not been established."
	}) : l === null ? s.push({
		source: "nearby-class-a",
		status: "not-applicable",
		techLevel: null,
		note: "No qualifying nearby rich/industrial Class A source has been established."
	}) : s.push({
		source: "nearby-class-a",
		status: "known",
		techLevel: Gt(l),
		note: "WBH nearby rich/industrial Class A world factor."
	});
	let u = e.previousCultureTechLevel;
	u === void 0 ? s.push({
		source: "previous-culture",
		status: "unknown",
		techLevel: null,
		note: "Previous local higher-technology culture history has not been established."
	}) : u === null ? s.push({
		source: "previous-culture",
		status: "not-applicable",
		techLevel: null,
		note: "No qualifying previous higher-technology culture has been established."
	}) : s.push({
		source: "previous-culture",
		status: "known",
		techLevel: Gt(u),
		note: "WBH relic technology factor from a previous local culture."
	}), s.push(o === null ? {
		source: "survivable-prototype",
		status: "not-applicable",
		techLevel: null,
		note: "Existing High Common/Environmental technology already reaches the minimum sustainable TL."
	} : {
		source: "survivable-prototype",
		status: "known",
		techLevel: o,
		note: "WBH survival exception: early prototype/relic technology may exist two TL below the normal minimum sustainable requirement."
	});
	let d = s.flatMap((e) => e.status === "known" && e.techLevel !== null ? [e.techLevel] : []), f = d.length ? Math.max(...d) : a, p = s.filter((e) => e.status === "unknown").map((e) => e.source);
	return {
		method: "WBH Novelty Tech Level",
		status: p.length ? "provisional" : "complete",
		techLevel: f,
		highCommonTechLevel: t,
		minimumSustainableTechLevel: n,
		highestSubcategoryTechLevel: a,
		nearbyRichIndustrialClassATechLevel: l == null ? null : Gt(l),
		previousCultureTechLevel: u == null ? null : Gt(u),
		survivablePrototypeTechLevel: o,
		factors: s,
		unresolvedFactors: p,
		generationNotes: [
			"Novelty TL is the highest of the WBH nearby Class A, highest subcategory, previous-culture, and survivable-prototype factors.",
			"Novelty has no ordinary upper/lower bounds and no TLM roll.",
			...p.length ? ["The displayed TL is the highest currently-known factor, not a fabricated final value; unresolved Referee/regional inputs keep it provisional."] : []
		]
	};
}
function T(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function qt(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function Jt(e, t) {
	let n = T(e);
	if (!n) return null;
	let r = [];
	for (let e of t) {
		let t = qt(T(n[e])?.techLevel);
		if (t === null) return null;
		r.push(t);
	}
	return r;
}
function Yt(e, t) {
	let n = T(e), r = Array.isArray(n?.factions) ? n.factions : [];
	for (let e of r) {
		let n = T(e);
		if (n?.factionId === t) return n;
	}
	return null;
}
function Xt(e, t) {
	return Yt(e.balkanisedCommonTechnologyDetails, t);
}
function Zt(e) {
	return qt(T(T(e.commonTechnologyDetails)?.minimumSustainable)?.minimumTechLevel);
}
function Qt(e, t, n, r, i) {
	let a = Jt(t, [
		"energy",
		"electronics",
		"manufacturing",
		"medical",
		"environmental"
	]), o = Jt(n, [
		"land",
		"water",
		"air",
		"space"
	]), s = Jt(r, ["personal", "heavy"]), c = Zt(e), l = a?.[4] ?? null;
	return !a || !o || !s || c === null || l === null ? null : Kt({
		starport: e.starport,
		highCommonTechLevel: i,
		minimumSustainableTechLevel: c,
		environmentalTechLevel: l,
		subcategoryTechLevels: [
			...a,
			...o,
			...s
		]
	});
}
function $t(e) {
	if (e.populationCode === 0) return {
		...e,
		noveltyTechnologyDetails: null
	};
	let t = T(e.qualityOfLifeTechnologyDetails), n = T(e.transportationTechnologyDetails), r = T(e.militaryTechnologyDetails), i = T(e.commonTechnologyDetails);
	if (!t || !n || !r || !i) return {
		...e,
		noveltyTechnologyDetails: null
	};
	let a = T(t.world), o = T(n.world), s = T(r.world), c = qt(i.highCommonTechLevel);
	if (a && o && s && c !== null) return {
		...e,
		noveltyTechnologyDetails: {
			method: "WBH novelty technology audit",
			world: Qt(e, a, o, s, c),
			factions: [],
			generationNotes: ["World Novelty TL retains unresolved regional and previous-culture factors rather than inventing them."]
		}
	};
	let l = (Array.isArray(t.factions) ? t.factions : []).flatMap((e) => {
		let t = T(e);
		return typeof t?.factionId == "string" ? [t.factionId] : [];
	}).flatMap((i) => {
		let a = Yt(t, i), o = Yt(n, i), s = Yt(r, i), c = Xt(e, i);
		if (!a || !o || !s || !c) return [];
		let l = qt(T(c.hostOrAdjacentCandidate)?.highCommonTechLevel), u = qt(T(c.nonHostCandidate)?.highCommonTechLevel);
		if (l === null || u === null) return [];
		let d = Qt(e, a.hostOrAdjacent, o.hostOrAdjacent, s.hostOrAdjacent, l), f = Qt(e, a.nonHost, o.nonHost, s.nonHost, u);
		return !d || !f ? [] : [{
			factionId: i,
			hostOrAdjacent: d,
			nonHost: f
		}];
	});
	return {
		...e,
		noveltyTechnologyDetails: {
			method: "WBH novelty technology audit",
			world: null,
			factions: l,
			generationNotes: ["Government-7 worlds retain starport-host/adjacent and non-host nation candidates.", "Regional nearby-world and previous-culture factors remain explicit unresolved Referee/context inputs."]
		}
	};
}
function en(e, t, n) {
	return t.social ? (t.sourceId ?? `${e.id}${n + 1}`, {
		...t,
		social: $t(t.social)
	}) : t;
}
function tn(e) {
	return {
		...e,
		worlds: e.worlds.map((e) => {
			let t = e.social ? $t(e.social) : e.social, n = e.physical?.details?.satellites;
			return n ? {
				...e,
				social: t,
				physical: {
					...e.physical,
					details: {
						...e.physical.details,
						satellites: {
							...n,
							moons: n.moons.map((t, n) => en(e, t, n))
						}
					}
				}
			} : {
				...e,
				social: t
			};
		})
	};
}
//#endregion
//#region src/rules/worlds/wbhPresumptionOfInnocence.ts
function nn(e, t, n) {
	let r = Math.max(0, Math.trunc(t));
	if (n === null) return {
		method: "WBH presumption of innocence",
		status: "incomplete",
		lawLevelCode: r,
		primaryJudicialSystemCode: null,
		roll: null,
		lawLevelDm: -r,
		adversarialDm: 0,
		dmTotal: -r,
		total: null,
		presumedInnocent: null,
		code: null,
		generationNotes: ["The primary judicial system must be known before the Adversarial DM can be determined."]
	};
	let i = e.roll(2, 6).total, a = -r, o = n === "A" ? 2 : 0, s = a + o, c = i + s, l = c >= 0;
	return {
		method: "WBH presumption of innocence",
		status: "generated",
		lawLevelCode: r,
		primaryJudicialSystemCode: n,
		roll: i,
		lawLevelDm: a,
		adversarialDm: o,
		dmTotal: s,
		total: c,
		presumedInnocent: l,
		code: l ? "Y" : "N",
		generationNotes: ["Presumption of innocence exists on a final result of 0+ from 2D - Law Level, with DM+2 for an Adversarial primary judicial system."]
	};
}
function rn(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function an(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function on(e) {
	return e === "N" || e === "I" || e === "A" || e === "T" ? e : null;
}
function sn(e, t, n) {
	if (n.populationCode === 0) return {
		method: "WBH presumption of innocence audit",
		world: null,
		balkanisedFactions: [],
		generationNotes: ["Not applicable: Population 0 has no inhabited society or formal criminal judicial practice."]
	};
	let r = an(n.judicialSystemDetails);
	if (n.governmentCode !== 7) {
		let i = an(r?.world), a = on(i?.code), o = typeof i?.lawLevelCode == "number" ? i.lawLevelCode : n.lawLevelCode, s = nn(new S(rn(`wbh-social-presumption-innocence-v1|${e}|${t}|${n.uwp}`)), o, a);
		return {
			method: "WBH presumption of innocence audit",
			world: s,
			balkanisedFactions: [],
			generationNotes: s.status === "incomplete" ? ["Primary judicial-system details are incomplete, so no presumption result is fabricated."] : []
		};
	}
	let i = Array.isArray(r?.balkanisedFactions) ? r.balkanisedFactions : [], a = [];
	for (let r of i) {
		let i = an(r), o = typeof i?.factionId == "string" ? i.factionId : null, s = an(i?.details), c = typeof s?.lawLevelCode == "number" ? s.lawLevelCode : null;
		!o || c === null || a.push({
			factionId: o,
			details: nn(new S(rn(`wbh-social-presumption-innocence-v1|${e}|${t}|${n.uwp}|${o}`)), c, on(s?.code))
		});
	}
	return {
		method: "WBH presumption of innocence audit",
		world: null,
		balkanisedFactions: a,
		generationNotes: ["Government 7 determines presumption of innocence separately for each represented sovereign faction."]
	};
}
function cn(e, t) {
	t.social && (t.social.presumptionOfInnocenceDetails = sn(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		i.social && (i.social.presumptionOfInnocenceDetails = sn(e, i.sourceId ?? `${t.id}.moon-${r + 1}`, i.social));
	}
}
function ln(e) {
	for (let t of e.worlds) cn(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhQualityOfLifeTechnology.ts
function un(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function dn(e, ...t) {
	let n = new Set(e.map((e) => e.trim().toUpperCase()));
	return t.some((e) => n.has(e.toUpperCase()));
}
function fn(e, t, n) {
	let r = Math.max(0, Math.floor(t));
	return Math.max(r, Math.min(Math.max(r, Math.floor(n)), Math.trunc(e)));
}
function pn(e, t, n, r, i, a, o = []) {
	let s = ne(e), c = a.reduce((e, t) => e + t.dm, 0), l = Math.trunc(n) + s.modifier + c, u = Math.max(0, Math.floor(r)), d = Math.max(u, Math.floor(i));
	return {
		category: t,
		baseTechLevel: Math.trunc(n),
		tlm: s,
		dmBreakdown: a,
		dmTotal: c,
		unboundedTechLevel: l,
		lowerBound: u,
		upperBound: d,
		techLevel: fn(l, u, d),
		generationNotes: o
	};
}
function mn(e, t) {
	return new S(un(`${e}|${t}`));
}
function hn(e, t) {
	let n = Math.max(0, Math.trunc(t.highCommonTechLevel)), r = Math.max(0, Math.trunc(t.populationCode)), i = dn(t.tradeCodes, "In", "Industrial"), a = dn(t.tradeCodes, "Ri", "Rich"), o = dn(t.tradeCodes, "Po", "Poor"), s = [];
	r >= 9 && s.push({
		source: `Population ${r}`,
		dm: 1
	}), i && s.push({
		source: "Industrial",
		dm: 1
	});
	let c = pn(mn(e, "energy"), "energy", n, n / 2, n * 1.2, s, ["Energy TL = High Common TL + TLM + DMs. All WBH Tech Level bounds are rounded down."]), l = [];
	r >= 1 && r <= 5 ? l.push({
		source: `Population ${r}`,
		dm: 1
	}) : r >= 9 && l.push({
		source: `Population ${r}`,
		dm: -1
	}), i && l.push({
		source: "Industrial",
		dm: 1
	});
	let u = pn(mn(e, "electronics"), "electronics", n, c.techLevel - 3, c.techLevel + 1, l, ["Electronics TL = High Common TL + TLM + DMs."]), d = [];
	r >= 1 && r <= 6 ? d.push({
		source: `Population ${r}`,
		dm: -1
	}) : r >= 8 && d.push({
		source: `Population ${r}`,
		dm: 1
	}), i && d.push({
		source: "Industrial",
		dm: 1
	});
	let f = pn(mn(e, "manufacturing"), "manufacturing", n, u.techLevel - 2, Math.max(c.techLevel, u.techLevel), d, ["Manufacturing TL = High Common TL + TLM + DMs."]), p = [];
	a && p.push({
		source: "Rich",
		dm: 1
	}), o && p.push({
		source: "Poor",
		dm: -1
	});
	let m = t.starport.toUpperCase() === "A" ? 6 : t.starport.toUpperCase() === "B" ? 4 : t.starport.toUpperCase() === "C" ? 2 : 0, h = pn(mn(e, "medical"), "medical", u.techLevel, m, u.techLevel, p, ["Medical TL = Electronics TL + TLM + DMs; the lower bound is the starport-class Tech Level DM (A=6, B=4, C=2, otherwise 0)."]), g = [];
	t.habitabilityRating !== null && t.habitabilityRating < 8 && g.push({
		source: `Habitability ${t.habitabilityRating}`,
		dm: 8 - t.habitabilityRating
	});
	let _ = pn(mn(e, "environmental"), "environmental", f.techLevel, c.techLevel - 5, c.techLevel, g, ["Environmental TL = Manufacturing TL + TLM + DMs.", t.habitabilityRating === null ? "Habitability is unavailable; no Habitability DM was invented." : "Habitability below 8 contributes DM = 8 - Habitability Rating."]);
	return {
		method: "WBH quality of life Tech Levels",
		highCommonTechLevel: n,
		energy: c,
		electronics: u,
		manufacturing: f,
		medical: h,
		environmental: _,
		minimumSustainableTechLevel: Math.max(0, Math.trunc(t.minimumSustainableTechLevel)),
		environmentalMeetsSustainableMinimum: _.techLevel >= t.minimumSustainableTechLevel,
		generationNotes: [
			"Each quality-of-life subcategory has its own deterministic TLM stream so later rule changes in one category do not shift the others.",
			"This phase applies the published formula and explicit bounds; it records environmental sustainability separately rather than silently changing an established Tech Level.",
			"A configurable polity-wide maximum upper bound is not yet modeled; only the Handbook subcategory bounds are applied."
		]
	};
}
function gn(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function _n(e) {
	let t = e.physical?.details?.habitabilityRating?.rating;
	return typeof t == "number" ? t : null;
}
function vn(e, t, n) {
	let r = gn(gn(e.commonTechnologyDetails)?.minimumSustainable);
	return {
		highCommonTechLevel: n,
		populationCode: e.populationCode,
		starport: e.starport,
		tradeCodes: e.tradeCodes,
		habitabilityRating: _n(t),
		minimumSustainableTechLevel: typeof r?.minimumTechLevel == "number" ? r.minimumTechLevel : 0
	};
}
function yn(e, t, n) {
	if (n.populationCode === 0 || !n.commonTechnologyDetails) return {
		...n,
		qualityOfLifeTechnologyDetails: null
	};
	let r = n.commonTechnologyDetails;
	if (n.governmentCode !== 7) {
		let i = hn(`wbh-social-quality-of-life-technology-v1|${e}|${t.id}|world|${n.uwp}`, vn(n, t, r.highCommonTechLevel));
		return {
			...n,
			qualityOfLifeTechnologyDetails: {
				method: "WBH quality of life technology audit",
				world: i,
				factions: [],
				generationNotes: ["Non-balkanised world uses its High Common TL directly."]
			}
		};
	}
	let i = gn(n.balkanisedCommonTechnologyDetails), a = (Array.isArray(i?.factions) ? i.factions : []).flatMap((r) => {
		let i = gn(r), a = typeof i?.factionId == "string" ? i.factionId : null, o = gn(i?.hostOrAdjacentCandidate), s = gn(i?.nonHostCandidate), c = typeof o?.highCommonTechLevel == "number" ? o.highCommonTechLevel : null, l = typeof s?.highCommonTechLevel == "number" ? s.highCommonTechLevel : null;
		return !a || c === null || l === null ? [] : [{
			factionId: a,
			hostOrAdjacent: hn(`wbh-social-quality-of-life-technology-v1|${e}|${t.id}|${a}|host|${n.uwp}`, vn(n, t, c)),
			nonHost: hn(`wbh-social-quality-of-life-technology-v1|${e}|${t.id}|${a}|non-host|${n.uwp}`, vn(n, t, l))
		}];
	});
	return {
		...n,
		qualityOfLifeTechnologyDetails: {
			method: "WBH quality of life technology audit",
			world: null,
			factions: a,
			generationNotes: ["Government 7 has no single world-level technology profile. Each sovereign faction records both starport-host/adjacent and non-host quality-of-life candidates until the Referee establishes the host faction.", "The Handbook example applies world Population code to national Tech Level DMs; TSG follows that rule for these faction candidates."]
		}
	};
}
function bn(e, t, n, r) {
	if (!n.social) return n;
	let i = n.sourceId ?? `${t.id}.moon-${r + 1}`, a = {
		...t,
		id: i,
		worldKind: "Terrestrial Planet",
		physical: n.physical,
		social: n.social,
		isMainworld: !!n.isMainworld
	};
	return {
		...n,
		social: yn(e, a, n.social)
	};
}
function xn(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.social ? yn(e.id, t, t.social) : t.social, r = t.physical?.details?.satellites;
			return r ? {
				...t,
				social: n,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...r,
							moons: r.moons.map((n, r) => bn(e.id, t, n, r))
						}
					}
				}
			} : {
				...t,
				social: n
			};
		})
	};
}
//#endregion
//#region src/rules/worlds/wbhTechnologyProfile.ts
function E(e) {
	return e === null ? "?" : t(Math.max(0, Math.trunc(e)));
}
function Sn(e) {
	let t = {
		highCommon: e.highCommon,
		lowCommon: e.lowCommon,
		energy: e.energy,
		electronics: e.electronics,
		manufacturing: e.manufacturing,
		medical: e.medical,
		environmental: e.environmental,
		land: e.land,
		water: e.water,
		air: e.air,
		space: e.space,
		personalMilitary: e.personalMilitary,
		heavyMilitary: e.heavyMilitary,
		novelty: e.novelty
	}, n = Object.entries(t).filter(([, e]) => e === null).map(([e]) => `Missing ${e} Tech Level`), r = [.../* @__PURE__ */ new Set([...e.provisionalReasons ?? [], ...n])], i = [
		`${E(t.highCommon)}-${E(t.lowCommon)}`,
		`${E(t.energy)}${E(t.electronics)}${E(t.manufacturing)}${E(t.medical)}${E(t.environmental)}`,
		`${E(t.land)}${E(t.water)}${E(t.air)}${E(t.space)}`,
		`${E(t.personalMilitary)}${E(t.heavyMilitary)}`,
		E(t.novelty)
	].join("-");
	return {
		method: "WBH Technology Profile",
		status: r.length ? "provisional" : "complete",
		profile: i,
		components: t,
		provisionalReasons: r,
		generationNotes: [
			"WBH Technology Profile order is H-L-QQQQQ-TTTT-MM-N.",
			"Q = Energy, Electronics, Manufacturing, Medical, Environmental; T = Land, Water, Air, Space; M = Personal, Heavy.",
			...r.length ? ["Question marks identify component TLs that are not yet available; known provisional components retain their displayed eHex value."] : []
		]
	};
}
function D(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Cn(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function wn(e, t) {
	return D(t)?.status === "provisional" ? [`${e} is provisional`] : [];
}
function Tn(e, t) {
	let n = D(e), r = Array.isArray(n?.factions) ? n.factions : [];
	for (let e of r) {
		let n = D(e);
		if (n?.factionId === t) return n;
	}
	return null;
}
function En(e, t) {
	return Cn(D(D(e)?.[t])?.techLevel);
}
function Dn(e, t, n, r, i) {
	let a = D(e), o = D(i), s = [
		...wn("Novelty Technology", i),
		...[
			"energy",
			"electronics",
			"manufacturing",
			"medical",
			"environmental"
		].flatMap((e) => wn(`Quality of Life ${e}`, D(t)?.[e])),
		...[
			"land",
			"water",
			"air",
			"space"
		].flatMap((e) => wn(`Transportation ${e}`, D(n)?.[e])),
		...["personal", "heavy"].flatMap((e) => wn(`Military ${e}`, D(r)?.[e]))
	];
	return {
		highCommon: Cn(a?.highCommonTechLevel),
		lowCommon: Cn(a?.lowCommonTechLevel),
		energy: En(t, "energy"),
		electronics: En(t, "electronics"),
		manufacturing: En(t, "manufacturing"),
		medical: En(t, "medical"),
		environmental: En(t, "environmental"),
		land: En(n, "land"),
		water: En(n, "water"),
		air: En(n, "air"),
		space: En(n, "space"),
		personalMilitary: En(r, "personal"),
		heavyMilitary: En(r, "heavy"),
		novelty: Cn(o?.techLevel),
		provisionalReasons: s
	};
}
function On(e) {
	if (e.populationCode === 0) return {
		...e,
		technologyProfileDetails: null
	};
	let t = D(e.commonTechnologyDetails), n = D(e.qualityOfLifeTechnologyDetails), r = D(e.transportationTechnologyDetails), i = D(e.militaryTechnologyDetails), a = D(e.noveltyTechnologyDetails);
	if (!t || !n || !r || !i || !a) return {
		...e,
		technologyProfileDetails: null
	};
	let o = D(n.world), s = D(r.world), c = D(i.world), l = D(a.world);
	if (o && s && c && l) return {
		...e,
		technologyProfileDetails: {
			method: "WBH technology profile audit",
			world: Sn(Dn(t, o, s, c, l)),
			factions: [],
			generationNotes: ["Non-balkanised world profile assembled directly from its generated WBH technology components."]
		}
	};
	let u = D(e.balkanisedCommonTechnologyDetails), d = (Array.isArray(n.factions) ? n.factions : []).flatMap((e) => {
		let t = D(e);
		return typeof t?.factionId == "string" ? [t.factionId] : [];
	}).flatMap((e) => {
		let t = Tn(u, e), o = Tn(n, e), s = Tn(r, e), c = Tn(i, e), l = Tn(a, e);
		if (!t || !o || !s || !c || !l) return [];
		let d = D(t.hostOrAdjacentCandidate), f = D(t.nonHostCandidate);
		return !d || !f ? [] : [{
			factionId: e,
			hostOrAdjacent: Sn(Dn(d, o.hostOrAdjacent, s.hostOrAdjacent, c.hostOrAdjacent, l.hostOrAdjacent)),
			nonHost: Sn(Dn(f, o.nonHost, s.nonHost, c.nonHost, l.nonHost))
		}];
	});
	return {
		...e,
		technologyProfileDetails: {
			method: "WBH technology profile audit",
			world: null,
			factions: d,
			generationNotes: ["Government-7 worlds expose separate starport-host/adjacent and non-host Technology Profile candidates."]
		}
	};
}
function kn(e, t, n) {
	return t.social ? {
		...t,
		social: On(t.social)
	} : t;
}
function An(e) {
	return {
		...e,
		worlds: e.worlds.map((e) => {
			let t = e.social ? On(e.social) : e.social, n = e.physical?.details?.satellites;
			return n ? {
				...e,
				social: t,
				physical: {
					...e.physical,
					details: {
						...e.physical.details,
						satellites: {
							...n,
							moons: n.moons.map((t, n) => kn(e, t, n))
						}
					}
				}
			} : {
				...e,
				social: t
			};
		})
	};
}
//#endregion
//#region src/rules/worlds/wbhTransportationTechnology.ts
function jn(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Mn(e, t) {
	return new S(jn(`${e}|${t}`));
}
function Nn(e, t, n) {
	let r = Math.max(0, Math.floor(t));
	return Math.max(r, Math.min(Math.max(r, Math.floor(n)), Math.trunc(e)));
}
function Pn(e, t, n, r, i, a, o, s) {
	let c = ne(Mn(e, t)), l = a.reduce((e, t) => e + t.dm, 0), u = Math.trunc(n) + c.modifier + l;
	return {
		category: t,
		status: o,
		baseTechLevel: Math.trunc(n),
		tlm: c,
		dmBreakdown: a,
		dmTotal: l,
		unboundedTechLevel: u,
		lowerBound: Math.max(0, Math.floor(r)),
		upperBound: Math.max(Math.max(0, Math.floor(r)), Math.floor(i)),
		techLevel: Nn(u, r, i),
		generationNotes: s
	};
}
function Fn(e, t) {
	return {
		category: e,
		status: "complete",
		baseTechLevel: 0,
		tlm: null,
		dmBreakdown: [],
		dmTotal: 0,
		unboundedTechLevel: 0,
		lowerBound: 0,
		upperBound: 0,
		techLevel: 0,
		generationNotes: [t]
	};
}
function In(e, t) {
	let n = Math.max(0, Math.trunc(t.energyTechLevel)), r = Math.max(0, Math.trunc(t.electronicsTechLevel)), i = Math.max(0, Math.trunc(t.manufacturingTechLevel)), a = t.pcr !== null, o = a && t.pcr <= 2, s = a ? "complete" : "provisional", c = [];
	t.hydrographicsCode === 10 && c.push({
		source: "Hydrographics A",
		dm: -1
	}), o && c.push({
		source: `PCR ${t.pcr}`,
		dm: 1
	});
	let l = Pn(e, "land", n, r - 5, n, c, s, a ? ["Land Transport TL = Energy TL + TLM + DMs."] : ["Faction PCR is unavailable; PCR 0–2 DM+1 is not applied, so this candidate is provisional."]), u = [];
	t.hydrographicsCode === 0 ? u.push({
		source: "Hydrographics 0",
		dm: -2
	}) : t.hydrographicsCode === 8 ? u.push({
		source: "Hydrographics 8",
		dm: 1
	}) : t.hydrographicsCode >= 9 && u.push({
		source: `Hydrographics ${t.hydrographicsCode}`,
		dm: 2
	}), o && u.push({
		source: `PCR ${t.pcr}`,
		dm: 1
	});
	let d = Pn(e, "water", n, t.hydrographicsCode === 0 ? 0 : r - 5, n, u, s, a ? ["Water Transport TL = Energy TL + TLM + DMs."] : ["Faction PCR is unavailable; PCR 0–2 DM+1 is not applied, so this candidate is provisional."]), f;
	if (t.atmosphereCode === 0 && n <= 5) f = Fn("air", "WBH: Air Transport TL is automatically 0 for Atmosphere 0 at TL0–5.");
	else {
		let i = [];
		(t.atmosphereCode >= 0 && t.atmosphereCode <= 3 || t.atmosphereCode === 14) && n <= 7 ? i.push({
			source: `Atmosphere ${t.atmosphereCode}, TL0–7`,
			dm: -2
		}) : (t.atmosphereCode === 4 || t.atmosphereCode === 5) && n <= 7 && i.push({
			source: `Atmosphere ${t.atmosphereCode}, TL0–7`,
			dm: -1
		}), f = Pn(e, "air", n, r - 5, n, i, "complete", [
			"Air Transport TL = Energy TL + TLM + DMs.",
			"May24 prints a second Atmosphere 4 or 5, TL0–7 row with DM+1 immediately after the DM-1 row. TSG does not apply that contradictory duplicate condition automatically.",
			"The optional Referee allowance to raise the upper bound to Energy TL+1 for dense/very dense atmospheres is not applied automatically."
		]);
	}
	let p = [];
	(t.sizeCode === 0 || t.sizeCode === 1) && p.push({
		source: `Size ${t.sizeCode}`,
		dm: 2
	}), t.populationCode >= 1 && t.populationCode <= 5 ? p.push({
		source: `Population ${t.populationCode}`,
		dm: -1
	}) : t.populationCode >= 9 && p.push({
		source: `Population ${t.populationCode}`,
		dm: 1
	});
	let m = t.starport.toUpperCase();
	m === "A" ? p.push({
		source: "Starport A",
		dm: 2
	}) : m === "B" && p.push({
		source: "Starport B",
		dm: 1
	});
	let h = Pn(e, "space", i, Math.min(n - 3, i - 3), Math.min(n, i), p, "complete", ["Space Transport TL = Manufacturing TL + TLM + DMs.", "Referee options concerning jump-drive access and isolated-region minimums are recorded as policy choices and are not imposed automatically."]);
	return {
		method: "WBH transportation Tech Levels",
		energyTechLevel: n,
		electronicsTechLevel: r,
		manufacturingTechLevel: i,
		pcr: t.pcr,
		land: l,
		water: d,
		air: f,
		space: h,
		generationNotes: ["All explicit Transportation bounds are rounded down and clamped to non-negative TL values."]
	};
}
function Ln(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Rn(e) {
	let t = Ln(e), n = Ln(t?.energy)?.techLevel, r = Ln(t?.electronics)?.techLevel, i = Ln(t?.manufacturing)?.techLevel;
	return typeof n != "number" || typeof r != "number" || typeof i != "number" ? null : {
		energyTechLevel: n,
		electronicsTechLevel: r,
		manufacturingTechLevel: i
	};
}
function zn(e, t, n) {
	return {
		atmosphereCode: e.physical?.atmosphereCode ?? 0,
		hydrographicsCode: e.physical?.hydrographicsCode ?? 0,
		sizeCode: e.physical?.sizeCode ?? 0,
		populationCode: t.populationCode,
		pcr: n,
		starport: t.starport
	};
}
function Bn(e, t, n) {
	let r = Ln(n.qualityOfLifeTechnologyDetails);
	if (n.populationCode === 0 || !r) return {
		...n,
		transportationTechnologyDetails: null
	};
	let i = zn(t, n, typeof n.populationConcentration?.rating == "number" ? n.populationConcentration.rating : null), a = Rn(r.world);
	if (a) return {
		...n,
		transportationTechnologyDetails: {
			method: "WBH transportation technology audit",
			world: In(`wbh-social-transportation-technology-v1|${e}|${t.id}|world|${n.uwp}`, {
				...i,
				...a
			}),
			factions: [],
			generationNotes: ["Non-balkanised world uses its world PCR and Quality of Life Tech Levels."]
		}
	};
	let o = (Array.isArray(r.factions) ? r.factions : []).flatMap((r) => {
		let i = Ln(r), a = typeof i?.factionId == "string" ? i.factionId : null, o = Rn(i?.hostOrAdjacent), s = Rn(i?.nonHost);
		if (!a || !o || !s) return [];
		let c = zn(t, n, null);
		return [{
			factionId: a,
			hostOrAdjacent: In(`wbh-social-transportation-technology-v1|${e}|${t.id}|${a}|host|${n.uwp}`, {
				...c,
				...o
			}),
			nonHost: In(`wbh-social-transportation-technology-v1|${e}|${t.id}|${a}|non-host|${n.uwp}`, {
				...c,
				...s
			})
		}];
	});
	return {
		...n,
		transportationTechnologyDetails: {
			method: "WBH transportation technology audit",
			world: null,
			factions: o,
			generationNotes: ["Government 7 retains host/non-host faction candidates. Faction PCR is not yet generated, so Land and Water candidates omit the PCR 0–2 DM and are explicitly provisional."]
		}
	};
}
function Vn(e, t, n, r) {
	if (!n.social) return n;
	let i = n.sourceId ?? `${t.id}.moon-${r + 1}`, a = {
		...t,
		id: i,
		worldKind: "Terrestrial Planet",
		physical: n.physical,
		social: n.social,
		isMainworld: !!n.isMainworld
	};
	return {
		...n,
		social: Bn(e, a, n.social)
	};
}
function Hn(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.social ? Bn(e.id, t, t.social) : t.social, r = t.physical?.details?.satellites;
			return r ? {
				...t,
				social: n,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...r,
							moons: r.moons.map((n, r) => Vn(e.id, t, n, r))
						}
					}
				}
			} : {
				...t,
				social: n
			};
		})
	};
}
//#endregion
//#region src/rules/orbits/orbitNumbers.ts
var Un = /* @__PURE__ */ new Map([
	[0, 0],
	[1, .4],
	[2, .7],
	[3, 1],
	[4, 1.6],
	[5, 2.8],
	[6, 5.2],
	[7, 10],
	[8, 20],
	[9, 40],
	[10, 77],
	[11, 154],
	[12, 308],
	[13, 615],
	[14, 1230],
	[15, 2500],
	[16, 4900],
	[17, 9800],
	[18, 19500],
	[19, 39500],
	[20, 78700]
]), Wn = 0, Gn = 20;
function Kn(e) {
	if (!Number.isFinite(e)) throw Error(`Orbit# ${e} is not finite.`);
	if (e < Wn) throw Error(`Orbit# ${e} is below supported range.`);
	if (e > Gn) return Un.get(Gn) * 2 ** (e - Gn);
	let t = Math.floor(e), n = Math.ceil(e), r = Un.get(t), i = Un.get(n);
	if (r === void 0 || i === void 0) throw Error(`Orbit# ${e} is outside supported range.`);
	if (t === n) return r;
	let a = e - t;
	return r + (i - r) * a;
}
function qn(e) {
	if (!Number.isFinite(e)) throw Error(`AU ${e} is not finite.`);
	if (e < 0) throw Error(`AU ${e} is below supported range.`);
	let t = [...Un.entries()].sort((e, t) => e[0] - t[0]);
	if (e === 0) return Wn;
	for (let n = 0; n < t.length - 1; n += 1) {
		let [r, i] = t[n], [a, o] = t[n + 1];
		if (e >= i && e <= o) return r + (e - i) / (o - i);
	}
	let [n, r] = t.at(-1);
	return n + Math.log2(e / r);
}
function O(e, t = 3) {
	return Number(e.toFixed(t));
}
//#endregion
//#region src/rules/orbits/eccentricity.ts
function Jn(e, t = 0) {
	let n = e.roll(2, 6, t).total, r;
	return r = n <= 5 ? Math.max(0, -.001 + e.d6() / 1e3) : n <= 7 ? e.d6() / 200 : n <= 9 ? .03 + e.d6() / 100 : n === 10 ? .05 + e.d6() / 20 : n === 11 ? .05 + e.roll(2, 6).total / 20 : .3 + e.roll(2, 6).total / 20, O(Math.max(0, Math.min(.999, r)), 3);
}
//#endregion
//#region src/rules/stars/starTables.ts
function Yn(e, t = "classic") {
	return t === "realistic" ? e <= 2 ? "Special" : e <= 8 ? "M" : e === 9 ? "K" : e === 10 ? "G" : e === 11 ? "F" : "Hot" : e <= 2 ? "Special" : e <= 6 ? "M" : e <= 8 ? "K" : e <= 10 ? "G" : e === 11 ? "F" : "Hot";
}
function Xn(e, t) {
	return t ? e <= 3 ? "VI" : e <= 5 ? "BD" : e <= 8 ? "D" : e <= 10 ? "III" : e === 11 ? "II" : "Peculiar" : e <= 5 ? "VI" : e <= 8 ? "IV" : "III";
}
function Zn(e) {
	return e <= 8 ? "III" : e <= 10 ? "II" : e === 11 ? "Ib" : "Ia";
}
function Qn(e) {
	return e <= 9 ? "A" : e <= 11 ? "B" : "O";
}
function $n(e, t, n) {
	return t === "M" && n ? {
		2: 8,
		3: 6,
		4: 5,
		5: 4,
		6: 0,
		7: 2,
		8: 1,
		9: 3,
		10: 5,
		11: 7,
		12: 9
	}[e] : {
		2: 0,
		3: 1,
		4: 3,
		5: 5,
		6: 7,
		7: 9,
		8: 8,
		9: 6,
		10: 4,
		11: 2,
		12: 0
	}[e];
}
var er = [
	{
		key: "O0",
		spectralType: "O",
		subtype: 0,
		temperatureK: 5e4,
		mass: {
			Ia: 200,
			Ib: 150,
			II: 130,
			III: 110,
			V: 90,
			VI: 2
		},
		diameter: {
			Ia: 25,
			Ib: 24,
			II: 22,
			III: 21,
			V: 20,
			VI: .18
		}
	},
	{
		key: "O5",
		spectralType: "O",
		subtype: 5,
		temperatureK: 4e4,
		mass: {
			Ia: 80,
			Ib: 60,
			II: 40,
			III: 30,
			V: 60,
			VI: 1.5
		},
		diameter: {
			Ia: 22,
			Ib: 20,
			II: 18,
			III: 15,
			V: 12,
			VI: .18
		}
	},
	{
		key: "B0",
		spectralType: "B",
		subtype: 0,
		temperatureK: 3e4,
		mass: {
			Ia: 60,
			Ib: 40,
			II: 30,
			III: 20,
			IV: 20,
			V: 18,
			VI: .5
		},
		diameter: {
			Ia: 20,
			Ib: 14,
			II: 12,
			III: 10,
			IV: 8,
			V: 7,
			VI: .2
		}
	},
	{
		key: "B5",
		spectralType: "B",
		subtype: 5,
		temperatureK: 15e3,
		mass: {
			Ia: 30,
			Ib: 25,
			II: 20,
			III: 10,
			IV: 10,
			V: 5,
			VI: .4
		},
		diameter: {
			Ia: 60,
			Ib: 25,
			II: 14,
			III: 6,
			IV: 5,
			V: 3.5,
			VI: .5
		}
	},
	{
		key: "A0",
		spectralType: "A",
		subtype: 0,
		temperatureK: 1e4,
		mass: {
			Ia: 20,
			Ib: 15,
			II: 14,
			III: 8,
			IV: 4,
			V: 2.2
		},
		diameter: {
			Ia: 120,
			Ib: 50,
			II: 30,
			III: 5,
			IV: 4,
			V: 2.2
		}
	},
	{
		key: "A5",
		spectralType: "A",
		subtype: 5,
		temperatureK: 8e3,
		mass: {
			Ia: 15,
			Ib: 13,
			II: 11,
			III: 6,
			IV: 2.3,
			V: 1.8
		},
		diameter: {
			Ia: 180,
			Ib: 75,
			II: 45,
			III: 5,
			IV: 3,
			V: 2
		}
	},
	{
		key: "F0",
		spectralType: "F",
		subtype: 0,
		temperatureK: 7500,
		mass: {
			Ia: 13,
			Ib: 12,
			II: 10,
			III: 4,
			IV: 2,
			V: 1.5
		},
		diameter: {
			Ia: 210,
			Ib: 85,
			II: 50,
			III: 5,
			IV: 3,
			V: 1.7
		}
	},
	{
		key: "F5",
		spectralType: "F",
		subtype: 5,
		temperatureK: 6500,
		mass: {
			Ia: 12,
			Ib: 10,
			II: 8,
			III: 3,
			IV: 1.5,
			V: 1.3
		},
		diameter: {
			Ia: 280,
			Ib: 115,
			II: 66,
			III: 5,
			IV: 2,
			V: 1.5
		}
	},
	{
		key: "G0",
		spectralType: "G",
		subtype: 0,
		temperatureK: 6e3,
		mass: {
			Ia: 12,
			Ib: 10,
			II: 8,
			III: 2.5,
			IV: 1.7,
			V: 1.1,
			VI: .8
		},
		diameter: {
			Ia: 330,
			Ib: 135,
			II: 77,
			III: 10,
			IV: 3,
			V: 1.1,
			VI: .8
		}
	},
	{
		key: "G5",
		spectralType: "G",
		subtype: 5,
		temperatureK: 5600,
		mass: {
			Ia: 13,
			Ib: 11,
			II: 10,
			III: 2.4,
			IV: 1.2,
			V: .9,
			VI: .7
		},
		diameter: {
			Ia: 360,
			Ib: 150,
			II: 90,
			III: 15,
			IV: 4,
			V: .95,
			VI: .7
		}
	},
	{
		key: "K0",
		spectralType: "K",
		subtype: 0,
		temperatureK: 5200,
		mass: {
			Ia: 14,
			Ib: 12,
			II: 10,
			III: 1.1,
			IV: 1.5,
			V: .8,
			VI: .6
		},
		diameter: {
			Ia: 420,
			Ib: 180,
			II: 110,
			III: 20,
			IV: 6,
			V: .9,
			VI: .6
		}
	},
	{
		key: "K5",
		spectralType: "K",
		subtype: 5,
		temperatureK: 4400,
		mass: {
			Ia: 18,
			Ib: 13,
			II: 12,
			III: 1.5,
			V: .7,
			VI: .5
		},
		diameter: {
			Ia: 600,
			Ib: 260,
			II: 160,
			III: 40,
			V: .8,
			VI: .5
		}
	},
	{
		key: "M0",
		spectralType: "M",
		subtype: 0,
		temperatureK: 3700,
		mass: {
			Ia: 20,
			Ib: 15,
			II: 14,
			III: 1.8,
			V: .5,
			VI: .4
		},
		diameter: {
			Ia: 900,
			Ib: 380,
			II: 230,
			III: 60,
			V: .7,
			VI: .4
		}
	},
	{
		key: "M5",
		spectralType: "M",
		subtype: 5,
		temperatureK: 3e3,
		mass: {
			Ia: 25,
			Ib: 20,
			II: 16,
			III: 2.4,
			V: .16,
			VI: .12
		},
		diameter: {
			Ia: 1200,
			Ib: 600,
			II: 350,
			III: 100,
			V: .2,
			VI: .1
		}
	},
	{
		key: "M9",
		spectralType: "M",
		subtype: 9,
		temperatureK: 2400,
		mass: {
			Ia: 30,
			Ib: 25,
			II: 18,
			III: 8,
			V: .08,
			VI: .075
		},
		diameter: {
			Ia: 1800,
			Ib: 800,
			II: 500,
			III: 200,
			V: .1,
			VI: .08
		}
	}
], tr = {
	starDistribution: "classic",
	allowUnusualPrimaries: !0,
	detailLevel: "standard"
};
function nr(e) {
	return {
		...tr,
		...e
	};
}
function rr(e, t, n) {
	if (n === "IV") {
		if (e === "M") return {
			spectralType: "K",
			subtype: 4
		};
		if (e === "K") return {
			spectralType: "K",
			subtype: t > 4 ? t - 5 : t
		};
		if (e === "O") return {
			spectralType: "B",
			subtype: 0
		};
	}
	if (n === "VI") {
		if (e === "F") return {
			spectralType: "G",
			subtype: t
		};
		if (e === "A") return {
			spectralType: "B",
			subtype: t
		};
		if (e === "O") return {
			spectralType: "B",
			subtype: 0
		};
	}
	return {
		spectralType: e,
		subtype: t
	};
}
function ir(e, t, n, r) {
	let i = er.filter((t) => t.spectralType === e);
	if (i.length === 0) throw Error(`No rows for spectral type ${e}`);
	let a = i.filter((e) => e.subtype <= t).at(-1) ?? i[0], o = i.find((e) => e.subtype >= t) ?? i.at(-1), s = o.subtype - a.subtype || 1, c = (t - a.subtype) / s, l = (e) => {
		if (r === "temperatureK") return e.temperatureK;
		let t = e[r][n];
		return t === void 0 ? e[r].V ?? e[r].III ?? 1 : t;
	};
	return l(a) + (l(o) - l(a)) * c;
}
function ar(e, t) {
	return e ** 2 * (t / 5772) ** 4;
}
function or(e, t, n, r, i, a, o) {
	let s = rr(n, r, i), c = s.spectralType, l = s.subtype, u = ir(c, l, i, "mass"), d = ir(c, l, i, "diameter"), f = ir(c, l, i, "temperatureK"), p = ar(d, f);
	return {
		id: t,
		name: e,
		designation: t,
		orbitClass: "Far",
		spectralType: c,
		subtype: l,
		luminosityClass: i,
		massSolar: Number(u.toFixed(3)),
		diameterSolar: Number(d.toFixed(3)),
		temperatureK: Math.round(f),
		luminositySolar: Number(p.toFixed(4)),
		ageGyr: Number(a.toFixed(3)),
		stellarNature: i === "V" ? "Main sequence" : i === "IV" ? "Subgiant" : i === "VI" ? "Subdwarf" : "Giant or supergiant",
		generationNote: o
	};
}
function sr(e, t) {
	let n = 10 / Math.max(t, .08) ** 2.5;
	if (t < .9) return e.d6() * 2 + Math.ceil(e.d6() / 2) - 1;
	let r = Math.max(.01, e.d10ZeroToNine() / 10);
	return Math.max(.01, Math.min(n, n * r));
}
function cr(e, t, n, r, i) {
	if (r === "BD") {
		let r = e.d10ZeroToNine(), a = .015 + e.d10ZeroToNine() * .006, o = 500 + (9 - r) * 150, s = .1;
		return {
			id: n,
			name: t,
			designation: n,
			orbitClass: i ? "Primary" : "Far",
			spectralType: "BD",
			subtype: r,
			luminosityClass: "BD",
			massSolar: Number(a.toFixed(3)),
			diameterSolar: s,
			temperatureK: o,
			luminositySolar: Number(ar(s, o).toFixed(6)),
			ageGyr: Number((e.d6() * 2 + Math.ceil(e.d6() / 2) - 1).toFixed(3)),
			stellarNature: "Brown dwarf",
			generationNote: "Special-system result resolved as a brown dwarf primary/secondary."
		};
	}
	if (r === "D") {
		let r = 5e3 + e.d10ZeroToNine() * 2500, a = .45 + e.d10ZeroToNine() * .06, o = .01 + e.d10ZeroToNine() * .001;
		return {
			id: n,
			name: t,
			designation: n,
			orbitClass: i ? "Primary" : "Far",
			spectralType: "D",
			subtype: null,
			luminosityClass: "D",
			massSolar: Number(a.toFixed(3)),
			diameterSolar: Number(o.toFixed(3)),
			temperatureK: r,
			luminositySolar: Number(ar(o, r).toFixed(6)),
			ageGyr: Number((6 + e.d6() + e.d10ZeroToNine() / 10).toFixed(3)),
			stellarNature: "White dwarf",
			generationNote: "Special-system result resolved as a white dwarf."
		};
	}
	return {
		id: n,
		name: t,
		designation: n,
		orbitClass: i ? "Primary" : "Far",
		spectralType: "D",
		subtype: null,
		luminosityClass: "D",
		massSolar: Number((1.4 + e.d10ZeroToNine() * .2).toFixed(3)),
		diameterSolar: 1e-4,
		temperatureK: 1e5,
		luminositySolar: .001,
		ageGyr: Number((e.d6() + e.d10ZeroToNine() / 10).toFixed(3)),
		stellarNature: "Peculiar compact object",
		generationNote: "Unusual primary placeholder; referee should refine as neutron star, black hole, nebula, protostar, cluster, or anomaly."
	};
}
function lr(e, t, n) {
	let r = Yn(e.roll(2, 6, t ? 0 : -1).total, n);
	return r === "Hot" ? Qn(e.roll(2, 6).total) : r;
}
function ur(e, t, n, r, i) {
	let a = nr(i), o = lr(e, r, a.starDistribution), s = "V", c = "";
	if (o === "Special") {
		let i = Xn(e.roll(2, 6).total, a.allowUnusualPrimaries);
		if (i === "BD" || i === "D" || i === "Peculiar") return cr(e, t, n, i, r);
		s = i === "III" ? Zn(e.roll(2, 6).total) : i, c = `Special-system result resolved as luminosity class ${s}.`;
	}
	let l;
	if (o === "Special") {
		let t = Yn(e.roll(2, 6, 1).total, a.starDistribution);
		l = t === "Hot" ? Qn(e.roll(2, 6).total) : t === "Special" ? "M" : t;
	} else l = o;
	let u = $n(e.roll(2, 6).total, l, r), d = or(t, n, l, u, s, 0, c || void 0), f = s === "V" || s === "VI" ? sr(e, d.massSolar) : Math.max(sr(e, Math.max(.9, Math.min(d.massSolar, 3))), 1), p = or(t, n, l, u, s, f, c || void 0);
	return p.orbitClass = r ? "Primary" : "Far", p;
}
function dr(e, t, n, r, i) {
	return ur(e, t, n, r, i);
}
//#endregion
//#region src/rules/stars/wbhNonPrimaryStars.ts
var fr = [
	"O",
	"B",
	"A",
	"F",
	"G",
	"K",
	"M"
], pr = [
	{
		ageGyr: 0,
		temperatureK: 1e5
	},
	{
		ageGyr: .1,
		temperatureK: 25e3
	},
	{
		ageGyr: .5,
		temperatureK: 1e4
	},
	{
		ageGyr: 1,
		temperatureK: 8e3
	},
	{
		ageGyr: 1.5,
		temperatureK: 7e3
	},
	{
		ageGyr: 2.5,
		temperatureK: 5500
	},
	{
		ageGyr: 5,
		temperatureK: 5e3
	},
	{
		ageGyr: 10,
		temperatureK: 4e3
	},
	{
		ageGyr: 13,
		temperatureK: 3800
	}
];
function mr(e, t) {
	return t === "other" ? e <= 7 ? "D" : "BD" : t === "secondary" ? e <= 3 ? "Other" : e <= 6 ? "Random" : e <= 8 ? "Lesser" : e <= 10 ? "Sibling" : "Twin" : t === "companion" ? e <= 3 ? "Other" : e <= 5 ? "Random" : e <= 7 ? "Lesser" : e <= 9 ? "Sibling" : "Twin" : e <= 3 ? "Other" : e <= 8 ? "Random" : e <= 10 ? "Lesser" : "Twin";
}
function hr(e) {
	return e.luminosityClass === "III" || e.luminosityClass === "IV" ? -1 : 0;
}
function gr(e, t) {
	return e.spectralType === "D" ? "post-stellar" : t;
}
function _r(e) {
	let t = fr.indexOf(e);
	return t < 0 || t === fr.length - 1 ? "M" : fr[t + 1];
}
function vr(e, t, n) {
	let r = fr.indexOf(e), i = fr.indexOf(n.spectralType);
	return r < 0 || i < 0 ? !1 : r === i ? (t ?? 0) < (n.subtype ?? 0) : r < i;
}
function yr(e, t) {
	if (e.spectralType === "D" || e.spectralType === "BD") return {
		spectralType: "BD",
		subtype: t,
		luminosityClass: "BD"
	};
	if (e.spectralType === "M") return t > (e.subtype ?? 0) ? {
		spectralType: "BD",
		subtype: t,
		luminosityClass: "BD"
	} : {
		spectralType: "M",
		subtype: t,
		luminosityClass: e.luminosityClass
	};
	let n = _r(e.spectralType);
	return {
		spectralType: n,
		subtype: t,
		luminosityClass: e.luminosityClass === "IV" && n === "M" ? "V" : e.luminosityClass
	};
}
function br(e, t) {
	let n = t.spectralType === "D" || t.spectralType === "BD" ? t.spectralType : t.spectralType === "M" ? "M" : _r(t.spectralType);
	return yr(t, n === "D" ? 0 : $n(e.roll(2, 6).total, n, !1));
}
function xr(e, t) {
	if (!Number.isInteger(t) || t < 1 || t > 6) throw RangeError("Sibling roll must be 1-6.");
	if (e.spectralType === "D") return {
		spectralType: "D",
		subtype: null,
		luminosityClass: "D"
	};
	if (e.spectralType === "BD") return {
		spectralType: "BD",
		subtype: Math.min(9, (e.subtype ?? 0) + t),
		luminosityClass: "BD"
	};
	let n = e.spectralType, r = (e.subtype ?? 0) + t;
	if (r >= 10) {
		if (r -= 10, n === "M") return {
			spectralType: "BD",
			subtype: r,
			luminosityClass: "BD"
		};
		n = _r(n);
	}
	let i = e.luminosityClass === "IV" && n === "M" ? "V" : e.luminosityClass;
	return {
		spectralType: n,
		subtype: r,
		luminosityClass: i
	};
}
function Sr(e, t) {
	return xr(t, e.d6());
}
function Cr(e, t, n) {
	let r = Yn(e.roll(2, 6).total, n.starDistribution);
	r === "Hot" && (r = Qn(e.roll(2, 6).total));
	let i = "V";
	if (r === "Special") {
		let t = Xn(e.roll(2, 6).total, n.allowUnusualPrimaries);
		if (t === "BD") return {
			spectralType: "BD",
			subtype: e.d10ZeroToNine(),
			luminosityClass: "BD"
		};
		if (t === "D" || t === "Peculiar") return {
			spectralType: "D",
			subtype: null,
			luminosityClass: "D"
		};
		i = t;
		let a = Yn(e.roll(2, 6, 1).total, n.starDistribution);
		a === "Hot" && (a = Qn(e.roll(2, 6).total)), r = a === "Special" ? "M" : a;
	}
	let a = $n(e.roll(2, 6).total, r, !1);
	return vr(r, a, t) ? br(e, t) : {
		spectralType: r,
		subtype: a,
		luminosityClass: i
	};
}
function wr(e, t) {
	let n = Math.max(0, Math.min(13, e)), r = pr[0], i = pr.at(-1);
	for (let e = 1; e < pr.length; e += 1) if (n <= pr[e].ageGyr) {
		r = pr[e - 1], i = pr[e];
		break;
	}
	let a = i.ageGyr - r.ageGyr || 1, o = (n - r.ageGyr) / a, s = r.temperatureK + (i.temperatureK - r.temperatureK) * o;
	return Math.max(3e3, Math.round(s * t / .6));
}
function Tr(e, t) {
	let n = Math.max(.08, e * t);
	return 10 / n ** 2.5 * (1 + 1 / (4 + n) + 1 / (10 * n ** 3));
}
function Er(e, t, n, r) {
	let i = Number(((e.roll(2, 6).total - 1) / 10 + e.d10ZeroToNine() / 100).toFixed(3)), a = 2 + e.die(3), o = Tr(i, a);
	for (; o > 13.8 && a < 5;) a += 1, o = Tr(i, a);
	let s = o <= r ? r - o : e.d6() * 2 + e.die(3) - 1, c = Math.min(13.8, Math.max(r, o + s)), l = Math.max(0, c - o), u = Number((1 / Math.max(i, .01) * .01).toFixed(3)), d = wr(l, i), f = Number(ar(u, d).toFixed(6));
	return {
		requiredSystemAgeGyr: c,
		postStellarFinalAgeGyr: o,
		star: {
			id: n,
			name: t,
			designation: n,
			orbitClass: "Far",
			spectralType: "D",
			subtype: null,
			luminosityClass: "D",
			massSolar: i,
			diameterSolar: u,
			temperatureK: d,
			luminositySolar: f,
			ageGyr: Number(c.toFixed(3)),
			stellarNature: "White dwarf",
			generationNote: `WBH white dwarf; progenitor final age ${o.toFixed(3)} Gyr, cooling age ${l.toFixed(3)} Gyr.`
		}
	};
}
function Dr(e, t, n, r, i) {
	let a = r ?? e.d10ZeroToNine(), o = Number((.015 + e.d10ZeroToNine() * .006).toFixed(3)), s = 500 + (9 - a) * 150, c = .1;
	return {
		requiredSystemAgeGyr: i,
		star: {
			id: n,
			name: t,
			designation: n,
			orbitClass: "Far",
			spectralType: "BD",
			subtype: a,
			luminosityClass: "BD",
			massSolar: o,
			diameterSolar: c,
			temperatureK: s,
			luminositySolar: Number(ar(c, s).toFixed(6)),
			ageGyr: Number(i.toFixed(3)),
			stellarNature: "Brown dwarf",
			generationNote: "WBH non-primary brown dwarf; detailed brown-dwarf aging remains a later special-object refinement."
		}
	};
}
function Or(e, t, n, r, i) {
	let a = e.d6() / 10, o = Number(Math.max(.01, t.massSolar * (1 - a)).toFixed(3)), s = Math.min(9, (t.subtype ?? 0) + e.d6()), c = t.diameterSolar, l = 500 + (9 - s) * 150;
	return {
		requiredSystemAgeGyr: i,
		star: {
			id: r,
			name: n,
			designation: r,
			orbitClass: "Far",
			spectralType: "BD",
			subtype: s,
			luminosityClass: "BD",
			massSolar: o,
			diameterSolar: c,
			temperatureK: l,
			luminositySolar: Number(ar(c, l).toFixed(6)),
			ageGyr: Number(i.toFixed(3)),
			stellarNature: "Brown dwarf",
			generationNote: "WBH brown-dwarf sibling of its direct parent."
		}
	};
}
function kr(e, t, n, r) {
	return {
		requiredSystemAgeGyr: r,
		star: {
			...e,
			id: n,
			name: t,
			designation: n,
			orbitClass: "Far",
			parentId: void 0,
			orbitNumber: void 0,
			orbitAu: void 0,
			eccentricity: void 0,
			ageGyr: Number(r.toFixed(3)),
			generationNote: "WBH post-stellar Twin determination; physical stellar properties copied from direct parent."
		}
	};
}
function Ar(e, t, n, r, i, a, o) {
	if (t.spectralType === "BD") return Or(e, t, r, i, o);
	let s = gr(t, n), c = mr(e.roll(2, 6, hr(t)).total, s);
	if (c === "Other" && (c = mr(e.roll(2, 6).total, "other")), c === "D") return Er(e, r, i, o);
	if (c === "BD") return Dr(e, r, i, null, o);
	if (c === "Twin" && t.spectralType === "D") return kr(t, r, i, o);
	let l = c === "Lesser" ? br(e, t) : c === "Sibling" ? Sr(e, t) : c === "Twin" ? {
		spectralType: t.spectralType,
		subtype: t.subtype,
		luminosityClass: t.luminosityClass
	} : Cr(e, t, a);
	return l.spectralType === "D" ? Er(e, r, i, o) : l.spectralType === "BD" ? Dr(e, r, i, l.subtype, o) : {
		requiredSystemAgeGyr: o,
		star: or(r, i, l.spectralType, l.subtype ?? 0, l.luminosityClass, o, `WBH non-primary ${n} determination: ${c}.`)
	};
}
function jr(e, t, n = /* @__PURE__ */ new Map()) {
	let r = Number(Math.min(13.8, Math.max(.001, t)).toFixed(3));
	return e.map((e) => {
		let t = n.get(e.id);
		if (e.spectralType !== "D" || t === void 0) return {
			...e,
			ageGyr: r
		};
		let i = Math.max(0, r - t), a = wr(i, e.massSolar), o = Number(ar(e.diameterSolar, a).toFixed(6));
		return {
			...e,
			ageGyr: r,
			temperatureK: a,
			luminositySolar: o,
			generationNote: `WBH white dwarf; progenitor final age ${t.toFixed(3)} Gyr, cooling age ${i.toFixed(3)} Gyr after shared-system-age reconciliation.`
		};
	});
}
//#endregion
//#region src/rules/system/worldCounts.ts
function Mr(e) {
	return e.find((e) => e.orbitClass === "Primary") ?? e[0] ?? null;
}
function Nr(e) {
	return e.spectralType === "D" || e.luminosityClass === "D";
}
function Pr(e) {
	return e.spectralType === "BD" || e.luminosityClass === "BD";
}
function Fr(e) {
	return e <= 4 ? 1 : e <= 6 ? 2 : e <= 8 ? 3 : e <= 11 ? 4 : e === 12 ? 5 : 6;
}
function Ir(e) {
	return e <= 6 ? 1 : e <= 11 ? 2 : 3;
}
function Lr(e) {
	let t = Mr(e), n = e.filter(Nr).length;
	if (!t) return {
		postStellarObjects: 0,
		gasGiantQuantityDm: 0,
		planetoidBeltQuantityDmWithoutGasGiant: 0,
		terrestrialPlanetDm: 0
	};
	let r = 0;
	e.length === 1 && t.luminosityClass === "V" && (r += 1), Pr(t) && (r -= 2), Nr(t) && (r -= 2), r -= n, e.length >= 4 && --r;
	let i = 0;
	return Nr(t) && (i += 1), i += n, e.length >= 2 && (i += 1), {
		postStellarObjects: n,
		gasGiantQuantityDm: r,
		planetoidBeltQuantityDmWithoutGasGiant: i,
		terrestrialPlanetDm: n === 0 ? 0 : -n
	};
}
function Rr(e, t, n) {
	if (!Number.isInteger(e) || e < 2 || e > 12) throw RangeError("Terrestrial planet raw 2D total must be 2-12.");
	if (!Number.isInteger(t) || t < 0) throw RangeError("Post-stellar object count must be a non-negative integer.");
	if (!Number.isInteger(n) || n < 1 || n > 3) throw RangeError("Terrestrial planet adjustment D3 must be 1-3.");
	let r = e - 2 - t;
	return r < 3 ? n + 2 : r + n - 1;
}
function zr(e, t) {
	let n = e.roll(2, 6).total;
	return Br(t) ? n <= 7 : n <= 9;
}
function Br(e) {
	return e !== null && Pr(e);
}
function Vr(e, t) {
	let n = Mr(t), r = Lr(t), i = zr(e, n) ? Fr(e.roll(2, 6, r.gasGiantQuantityDm).total) : 0, a = r.planetoidBeltQuantityDmWithoutGasGiant + +(i > 0), o = e.roll(2, 6).total >= 8 ? Ir(e.roll(2, 6, a).total) : 0, s = Rr(e.roll(2, 6).total, r.postStellarObjects, e.die(3));
	return {
		gasGiants: i,
		planetoidBelts: o,
		terrestrialPlanets: s,
		totalWorlds: i + o + s
	};
}
//#endregion
//#region src/rules/worlds/wbhTidalLock.ts
var Hr = 8766;
function Ur(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Wr(e, t) {
	return new S(Ur([
		"wbh-tidal-lock-v1",
		e.id,
		t.case,
		t.targetId,
		t.dm,
		e.orbitNumber,
		e.au,
		e.eccentricity
	].join("|")));
}
function Gr(e, t) {
	let n = e.roll(2, 6, t).total, r;
	return r = n <= 5 ? -.001 + e.d6() / 1e3 : n <= 7 ? e.d6() / 200 : n <= 9 ? .03 + e.d6() / 100 : n === 10 ? .05 + e.d6() / 20 : n === 11 ? .05 + e.roll(2, 6).total / 20 : .3 + e.roll(2, 6).total / 20, O(Math.max(0, Math.min(.999, r)), 3);
}
function Kr(e, t, n, r, i) {
	let a = 0;
	return e !== null && e >= 1 && (a += Math.ceil(e / 3)), t > .1 && (a -= Math.floor(t * 10)), n > 30 && (a -= 2), n >= 60 && n <= 120 && (a -= 4), n >= 80 && n <= 100 && (a -= 4), r !== null && r > 2.5 && (a -= 2), i < 1 ? a -= 2 : i > 10 ? a += 4 : i >= 5 && (a += 2), a;
}
function qr(e) {
	return e < .5 ? -2 : e < 1 ? -1 : e <= 2 ? 0 : e <= 5 ? 1 : 2;
}
function Jr(e, t, n) {
	let r = -4;
	e.orbitNumber < 1 ? r += 4 + Math.floor(10 * (1 - e.orbitNumber)) : e.orbitNumber < 2 ? r += 4 : e.orbitNumber <= 3 ? r += 1 : r -= Math.floor(e.orbitNumber) * 2;
	let i = Math.max(1, t.starCount ?? 1), a = t.totalStarMassSolar ?? n.massSolar;
	r += qr(a), i > 1 && (r -= i);
	let o = (t.satellites ?? []).reduce((e, t) => e + (typeof t.sizeCode == "number" && t.sizeCode >= 1 ? t.sizeCode : 0), 0);
	return r -= o, r;
}
function Yr(e) {
	let t = 6;
	return e.orbitPd > 20 && (t -= Math.floor(e.orbitPd / 20)), e.direction === "Retrograde" && (t -= 2), e.parentMassTerra > 1e3 ? t += 8 : e.parentMassTerra > 100 ? t += 6 : e.parentMassTerra > 10 ? t += 4 : e.parentMassTerra >= 1 && (t += 2), t;
}
function Xr(e, t) {
	let n = -10;
	typeof e.sizeCode == "number" && e.sizeCode >= 1 && (n += e.sizeCode);
	let r = e.orbitPd;
	return r < 5 ? n += 5 + Math.ceil((5 - r) * 5) : r < 10 ? n += 4 : r < 20 ? n += 2 : r < 40 ? n += 1 : r > 60 && (n -= 6), n -= Math.max(0, t - 1) * 2, n;
}
function Zr(e, t, n) {
	let r = e / (n ? -t : t) - 1;
	return Math.abs(r) < 1e-9 ? {
		solarDaysPerYear: 0,
		solarDayHours: null,
		infinite: !0
	} : {
		solarDaysPerYear: O(r, 6),
		solarDayHours: O(Math.abs(e / r), 6),
		infinite: !1
	};
}
function Qr(e, t) {
	return t <= 3 ? t : O(e.roll(2, 6, -2).total / 10, 3);
}
function $r(e, t, n, r, i) {
	let a = t, o = [], s = n.siderealHours, c = n.direction, l = n.axialTiltDegrees, u = i, d = "none";
	if (a <= 2) return {
		status: d,
		siderealHours: s,
		direction: c,
		axialTiltDegrees: l,
		adjustedEccentricity: u,
		result: a,
		notes: o
	};
	if (a === 3) s *= 1.5, d = "modified";
	else if (a === 4) s *= 2, d = "modified";
	else if (a === 5) s *= 3, d = "modified";
	else if (a === 6) s *= 5, d = "modified";
	else if (a === 7) s = e.d6() * 5 * 24, c = "Prograde", d = "modified";
	else if (a === 8) s = e.d6() * 20 * 24, c = "Prograde", d = "modified";
	else if (a === 9) s = e.d6() * 10 * 24, c = "Retrograde", l < 90 && (l = 180 - l), d = "modified";
	else if (a === 10) s = e.d6() * 50 * 24, c = "Retrograde", l < 90 && (l = 180 - l), d = "modified";
	else if (a === 11) s = r.targetPeriodHours * 2 / 3, l = Qr(e, l), d = "3:2";
	else if (d = "1:1", s = r.targetPeriodHours, l = Qr(e, l), u > .1 && (u = Math.min(u, Gr(e, -2))), e.roll(2, 6).total === 12) {
		let t = e.roll(2, 6).total, a = $r(e, t, n, r, i);
		if (r.case === "moon-planet" && a.siderealHours > r.targetPeriodHours) o.push("WBH broken-lock reroll would exceed the moon orbital period; the moon remains in a 1:1 lock.");
		else return a.notes.push("WBH natural-12 broken-lock check replaced the initial 1:1 result with a no-DM Tidal Lock Status roll."), a;
	}
	return {
		status: d,
		siderealHours: O(s, 6),
		direction: c,
		axialTiltDegrees: O(l, 4),
		adjustedEccentricity: O(u, 3),
		result: a,
		notes: o
	};
}
function ei(e, t, n, r) {
	let i = Kr(r.sizeCode, r.moon?.eccentricity ?? e.eccentricity, n.axialTiltDegrees, r.atmospherePressureBar, t.ageGyr);
	if (r.moon) return [{
		case: "moon-planet",
		dm: i + Yr(r.moon),
		targetId: r.moon.parentId,
		targetPeriodHours: r.moon.orbitalPeriodHours
	}];
	let a = [{
		case: "planet-star",
		dm: i + Jr(e, r, t),
		targetId: t.id,
		targetPeriodHours: r.orbitalPeriodYears * Hr
	}];
	if (r.sizeCode !== null && r.sizeCode >= 1 && r.satellites?.length) {
		let e = r.satellites.filter((e) => e.physical?.details?.rotation?.tidalLockStatus === "1:1" && e.physical.details.rotation.tidalLockCase === "moon-planet");
		for (let t of e) a.push({
			case: "planet-moon",
			dm: i + Xr(t, r.satellites.length),
			targetId: t.sourceId ?? t.designation,
			targetPeriodHours: t.periodHours,
			moon: t
		});
	}
	return a;
}
function ti(e, t, n, r) {
	if (n.tidalLockStatus !== "unresolved") return n;
	let i = ei(e, t, n, r);
	if (!i.length) return n;
	let a = Math.max(...i.map((e) => e.dm)), o = i.filter((e) => e.dm === a).sort((e, t) => e.case === t.case && e.case === "planet-moon" ? (e.moon?.orbitPd ?? 0) - (t.moon?.orbitPd ?? 0) : e.case === "planet-moon" ? -1 : +(t.case === "planet-moon")), s = o[0], c = null, l = -Infinity;
	for (let t of o) {
		let i = Wr(e, t), a;
		a = t.dm <= -10 ? 2 : t.dm >= 10 ? 12 : i.roll(2, 6, t.dm).total;
		let o = $r(i, a, n, t, r.moon?.eccentricity ?? e.eccentricity);
		if (a > l && (c = o, l = a, s = t), o.status === "3:2" || o.status === "1:1") {
			c = o, s = t;
			break;
		}
	}
	if (!c) return n;
	let u = r.orbitalPeriodYears * Hr, d = s.case === "planet-star" && c.status === "1:1" ? {
		solarDaysPerYear: 0,
		solarDayHours: null,
		infinite: !0
	} : Zr(u, c.siderealHours, c.direction === "Retrograde");
	return {
		...n,
		siderealHours: c.siderealHours,
		solarDayHours: d.solarDayHours,
		solarDaysPerYear: d.solarDaysPerYear,
		solarDayInfinite: d.infinite,
		axialTiltDegrees: c.axialTiltDegrees,
		direction: c.direction,
		tidalLockStatus: c.status,
		tidalLockCase: s.case,
		tidalLockDm: s.dm,
		tidalLockRoll: c.result,
		tidalLockTargetId: s.targetId,
		adjustedEccentricity: c.adjustedEccentricity,
		generationNotes: [
			...n.generationNotes.filter((e) => !e.includes("tidal-lock effects are evaluated")),
			`WBH tidal-lock evaluation selected ${s.case} with DM${s.dm >= 0 ? "+" : ""}${s.dm}.`,
			...r.starCount === void 0 && s.case === "planet-star" ? ["Current physical-world context supplies one immediate stellar parent; multiple-star total-mass/count DMs remain a hierarchy-context refinement."] : [],
			...c.notes
		]
	};
}
//#endregion
//#region src/rules/system/wbhSystemMoonOrbitBoundaries.ts
var ni = 3, ri = 1e-9;
function ii(e, t) {
	let n = 10 ** t;
	return Math.floor((e + ri) * n) / n;
}
function ai(e, t, n) {
	if (e < t || e > n || e <= 0) return null;
	let r = 1 - t / e, i = n / e - 1, a = Math.min(.999, r, i);
	return a < 0 ? null : Math.max(0, ii(a, ni));
}
function oi(e) {
	let t = e.physical?.details?.gasGiant?.profile;
	return `${e.designation}:${t ?? e.sizeCode}@${e.orbitPd}PD`;
}
function si(e, t) {
	let n = e.rings.length ? `R${String(e.rings.length).padStart(2, "0")}:${e.rings.map((e) => `${e.centrePd}-${e.spanPd}`).join(",")}` : "R00", r = t.map(oi).join(",");
	return `${n}${r ? ` ${r}` : ""}`;
}
function ci(e, t) {
	let n = t.generationNotes.filter((e) => !e.startsWith("WBH moon-orbit boundary stabilization constrained ") && !e.startsWith("WBH moon-orbit boundary stabilization removed ")), r = [];
	for (let i of t.moons) {
		let a = i.sourceId ?? `${e}.${i.designation}`, o = ai(i.orbitPd, t.rocheLimitPd, t.hillSphereMoonLimitPd);
		if (o === null) {
			n.push(`WBH moon-orbit boundary stabilization removed ${a}: nominal orbit ${O(i.orbitPd, 3)} PD lies outside the persistent significant-moon interval bounded by Roche ${O(t.rocheLimitPd, 3)} PD and Hill Sphere Moon Limit ${O(t.hillSphereMoonLimitPd, 3)} PD.`);
			continue;
		}
		let s = Math.min(i.eccentricity, o);
		if (s < i.eccentricity) {
			let e = i.orbitPd * (1 - i.eccentricity), r = i.orbitPd * (1 + i.eccentricity), o = i.orbitPd * (1 - s), c = i.orbitPd * (1 + s);
			n.push(`WBH moon-orbit boundary stabilization constrained ${a} pre-tidal-lock eccentricity ${i.eccentricity} -> ${s}: periapsis/apoapsis ${O(e, 3)}/${O(r, 3)} PD -> ${O(o, 3)}/${O(c, 3)} PD, preserving the generated semi-major-axis location between Roche ${O(t.rocheLimitPd, 3)} PD and Hill Sphere Moon Limit ${O(t.hillSphereMoonLimitPd, 3)} PD. This boundary value precedes later WBH tidal-lock reconciliation.`);
		}
		r.push({
			...i,
			eccentricity: s,
			beyondHillMoonLimit: !1
		});
	}
	return {
		...t,
		moons: r,
		profile: si(t, r),
		generationNotes: n
	};
}
function li(e) {
	return e.map((e) => {
		let t = e.physical, n = t?.details, r = n?.satellites;
		return !t || !n || !r ? e : {
			...e,
			physical: {
				...t,
				details: {
					...n,
					satellites: ci(e.id, r)
				}
			}
		};
	});
}
//#endregion
//#region src/rules/worlds/wbhSurfaceTides.ts
var di = 1e6;
function fi(e, t, n) {
	return t <= 0 || n <= 0 ? 0 : e * t / (32 * n ** 3);
}
function pi(e, t, n) {
	if (e <= 0 || t <= 0 || n <= 0) return 0;
	let r = n / di;
	return e * t / (3.2 * r ** 3);
}
function k(e) {
	return O(e, 6);
}
function mi(e) {
	let t = [], n = e.rotationLockStatus === "1:1" && e.rotationLockCase === "planet-star", r = n ? 0 : fi(e.star.massSolar, e.sizeCode, e.distanceAu);
	t.push({
		sourceType: "star",
		sourceId: e.star.id,
		sourceDesignation: e.star.designation,
		amplitudeMetres: k(r),
		suppressedByOneToOneLock: n,
		distance: e.distanceAu,
		distanceUnit: "AU"
	});
	let i = 0, a = ["WBH surface tidal amplitudes are near-minimum open-ocean values; local coastal geometry can amplify actual tides substantially.", "Optional moon-to-moon tidal effects are not included automatically in Phase 1."];
	for (let n of e.moons) {
		let r = n.physical?.details?.size?.massTerra ?? n.physical?.details?.gasGiant?.massTerra ?? null;
		if (r === null) {
			a.push(`Moon ${n.designation} has no resolved mass, so its direct tidal amplitude on the parent is not calculated.`);
			continue;
		}
		let o = e.rotationLockStatus === "1:1" && e.rotationLockCase === "planet-moon" && e.rotationLockTargetId === (n.sourceId ?? n.designation), s = o ? 0 : pi(r, e.sizeCode, n.orbitKm);
		i += s, t.push({
			sourceType: "moon",
			sourceId: n.sourceId ?? n.designation,
			sourceDesignation: n.designation,
			amplitudeMetres: k(s),
			suppressedByOneToOneLock: o,
			distance: k(n.orbitKm / di),
			distanceUnit: "Mkm"
		});
	}
	return {
		method: "WBH surface tidal effects",
		totalAmplitudeMetres: k(r + i),
		stellarAmplitudeMetres: k(r),
		directSatelliteAmplitudeMetres: k(i),
		directParentAmplitudeMetres: 0,
		contributions: t,
		optionalMoonPairEffectsIncluded: !1,
		generationNotes: a
	};
}
function hi(e) {
	let t = [], n = fi(e.star.massSolar, e.sizeCode, e.stellarDistanceAu);
	t.push({
		sourceType: "star",
		sourceId: e.star.id,
		sourceDesignation: e.star.designation,
		amplitudeMetres: k(n),
		suppressedByOneToOneLock: !1,
		distance: e.stellarDistanceAu,
		distanceUnit: "AU"
	});
	let r = e.rotationLockStatus === "1:1" && e.rotationLockCase === "moon-planet", i = r ? 0 : pi(e.parentMassTerra, e.sizeCode, e.parentDistanceKm);
	return t.push({
		sourceType: "planet",
		sourceId: e.parentId,
		sourceDesignation: e.parentDesignation,
		amplitudeMetres: k(i),
		suppressedByOneToOneLock: r,
		distance: k(e.parentDistanceKm / di),
		distanceUnit: "Mkm"
	}), {
		method: "WBH surface tidal effects",
		totalAmplitudeMetres: k(n + i),
		stellarAmplitudeMetres: k(n),
		directSatelliteAmplitudeMetres: 0,
		directParentAmplitudeMetres: k(i),
		contributions: t,
		optionalMoonPairEffectsIncluded: !1,
		generationNotes: [
			"WBH star tides continue to act on moons even when the moon is in a 1:1 lock with its parent planet.",
			"WBH direct parent-planet daily tide is suppressed for a moon in a 1:1 moon-to-planet lock.",
			"Optional moon-to-moon tidal effects are not included automatically in Phase 1."
		]
	};
}
//#endregion
//#region src/rules/system/wbhStellarEnvironment.ts
function gi(e, t) {
	return e.filter((e) => e.orbitClass === "Companion" && e.parentId === t);
}
function _i(e, t, n) {
	e.some((e) => e.id === t.id) || e.push(t);
	for (let r of gi(n, t.id)) e.some((e) => e.id === r.id) || e.push(r);
}
function vi(e, t) {
	let n = t.find((t) => t.id === e.aroundStarId);
	if (!n) return [];
	let r = [];
	if (_i(r, n, t), n.orbitClass !== "Primary") return r;
	let i = t.filter((e) => e.orbitClass === "Close" || e.orbitClass === "Near" || e.orbitClass === "Far").filter((t) => typeof t.orbitNumber == "number" && t.orbitNumber <= e.orbitNumber).sort((e, t) => (e.orbitNumber ?? 0) - (t.orbitNumber ?? 0));
	for (let e of i) _i(r, e, t);
	return r;
}
function yi(e, t) {
	let n = t.find((t) => t.id === e.aroundStarId);
	if (!n) return null;
	let r = vi(e, t), i = r.length > 0 ? r : [n];
	return {
		anchorStar: n,
		interiorStars: i,
		interiorStarIds: i.map((e) => e.id),
		totalMassSolar: O(i.reduce((e, t) => e + Math.max(0, t.massSolar), 0), 6),
		totalLuminositySolar: O(i.reduce((e, t) => e + Math.max(0, t.luminositySolar), 0), 6)
	};
}
function bi(e, t) {
	let n = yi(e, t);
	return n ? {
		...n.anchorStar,
		massSolar: n.totalMassSolar,
		luminositySolar: n.totalLuminositySolar
	} : null;
}
//#endregion
//#region src/rules/system/wbhSystemSurfaceTides.ts
function xi(e) {
	return e.details?.size?.massTerra ?? e.details?.gasGiant?.massTerra ?? null;
}
function Si(e, t, n, r) {
	let i = r.physical, a = xi(t);
	if (!i?.details || a === null || typeof r.sizeCode != "number" || r.sizeCode <= 0 || i.details.gasGiant) return r;
	let o = i.details.rotation, s = hi({
		moonId: r.sourceId ?? `${e.id}.${r.designation}`,
		moonDesignation: r.designation,
		sizeCode: r.sizeCode,
		stellarDistanceAu: e.au,
		star: n,
		parentId: e.id,
		parentDesignation: e.id,
		parentMassTerra: a,
		parentDistanceKm: r.orbitKm,
		rotationLockCase: o?.tidalLockCase,
		rotationLockStatus: o?.tidalLockStatus
	});
	return {
		...r,
		physical: {
			...i,
			details: {
				...i.details,
				surfaceTides: s
			}
		}
	};
}
function Ci(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = bi(e, t);
	if (!r) return e;
	let i = n.details.satellites, a = i && {
		...i,
		moons: i.moons.map((t) => Si(e, n, r, t))
	};
	if (e.worldKind !== "Terrestrial Planet" || n.sizeCode === null) return {
		...e,
		physical: {
			...n,
			details: {
				...n.details,
				satellites: a
			}
		}
	};
	let o = n.details.rotation, s = mi({
		worldId: e.id,
		sizeCode: n.sizeCode,
		distanceAu: e.au,
		star: r,
		rotationLockCase: o?.tidalLockCase,
		rotationLockStatus: o?.tidalLockStatus,
		rotationLockTargetId: o?.tidalLockTargetId,
		moons: a?.moons ?? []
	});
	return {
		...e,
		physical: {
			...n,
			details: {
				...n.details,
				satellites: a,
				surfaceTides: s
			}
		}
	};
}
function wi(e, t) {
	return e.map((e) => Ci(e, t));
}
//#endregion
//#region src/rules/worlds/wbhTemperatureExtremes.ts
function Ti(e) {
	return Math.max(0, Math.min(1, e));
}
function Ei(e, t) {
	let n = Math.sin(Math.max(0, Math.min(180, e)) * Math.PI / 180);
	return t < .1 ? n /= 2 : t > 2 && (n += Math.min(.25, .01 * t)), Ti(n);
}
function Di(e) {
	if (e.tidalLockStatus === "1:1" && e.tidalLockCase === "planet-star" || e.solarDayInfinite) return 1;
	let t = Math.abs(e.solarDayHours ?? 0);
	return t >= 2500 ? 1 : Ti(Math.sqrt(t) / 50);
}
function Oi(e) {
	return e ? e.code >= 9 ? .1 : e.code <= 1 ? -.1 : 0 : 0;
}
function ki(e, t) {
	return (10 - e) / 20 + (e >= 2 && e <= 8 ? Oi(t?.distribution) : 0);
}
function Ai(e, t) {
	return t === null ? e.initialGreenhouseFactor === 0 ? 1 : null : Math.max(1, 1 + t);
}
function ji(e, t, n, r) {
	let i = e * (1 - t) * (1 + n) / Math.max(r, 1e-6) ** 2;
	return Math.max(3, Math.round(279 * Math.max(0, i) ** .25));
}
function Mi(e) {
	let t = Ei(e.rotation.axialTiltDegrees, e.seasonalPeriodYears), n = Di(e.rotation), r = ki(e.hydrographicsCode, e.hydrographics), i = Ti(t + n + r), a = Ai(e.climate, e.pressureBar), o = a === null ? null : Ti(i / a), s = Math.max(0, Math.min(.999999, e.eccentricity)), c = Math.max(1e-6, e.distanceAu * (1 - s)), l = Math.max(1e-6, e.distanceAu * (1 + s)), u = null, d = null, f = null, p = null;
	o !== null && e.climate.greenhouseFactor !== null && (u = e.luminositySolar * (1 + o), d = e.luminositySolar * (1 - o), f = ji(u, e.climate.albedo, e.climate.greenhouseFactor, c), p = ji(d, e.climate.albedo, e.climate.greenhouseFactor, l));
	let m = [
		"WBH high/low temperatures are baseline planetwide values at mean baseline altitude, not absolute local extremes.",
		"Variance combines axial tilt, rotation and hydrographic geography, then clamps the result to the WBH 0-1 range.",
		e.isMoon ? "For this significant moon, near/far stellar AU uses the parent planet orbital eccentricity; optional moon-orbit distance correction is not included." : "Near/far stellar AU uses the world's final post-lock orbital eccentricity."
	];
	return a === null && m.push("Temperature extremes remain unresolved because no mean atmospheric pressure is available for the WBH atmospheric factor."), e.rotation.tidalLockStatus === "1:1" && e.rotation.tidalLockCase === "planet-star" && m.push("WBH rotation factor is forced to 1.0 for a world in a 1:1 stellar tidal lock."), {
		method: "WBH high and low temperatures",
		axialTiltFactor: O(t, 6),
		rotationFactor: O(n, 6),
		geographicFactor: O(r, 6),
		varianceFactor: O(i, 6),
		atmosphericFactor: a === null ? null : O(a, 6),
		luminosityModifier: o === null ? null : O(o, 6),
		highLuminositySolar: u === null ? null : O(u, 6),
		lowLuminositySolar: d === null ? null : O(d, 6),
		nearAu: O(c, 6),
		farAu: O(l, 6),
		highTemperatureK: f,
		highTemperatureC: f === null ? null : f - 273,
		lowTemperatureK: p,
		lowTemperatureC: p === null ? null : p - 273,
		generationNotes: m
	};
}
//#endregion
//#region src/rules/system/wbhSystemTemperatureExtremes.ts
var Ni = 8766;
function Pi(e) {
	return e.details?.atmosphere?.meanBaselinePressureBar ?? null;
}
function Fi(e, t, n) {
	let r = n.physical, i = r?.details, a = i?.climate, o = i?.rotation;
	if (!r || !i || !a || !o || typeof n.sizeCode != "number" || n.sizeCode <= 0 || i.gasGiant || r.hydrographicsCode === null) return n;
	let s = Mi({
		climate: a,
		rotation: o,
		hydrographics: i.hydrographics,
		hydrographicsCode: r.hydrographicsCode,
		pressureBar: Pi(r),
		luminositySolar: t.luminositySolar,
		distanceAu: e.au,
		eccentricity: e.eccentricity,
		seasonalPeriodYears: n.periodHours / Ni,
		isMoon: !0
	});
	return {
		...n,
		physical: {
			...r,
			details: {
				...i,
				climate: {
					...a,
					temperatureExtremes: s
				}
			}
		}
	};
}
function Ii(e, t) {
	let n = e.physical, r = n?.details;
	if (!n || !r) return e;
	let i = bi(e, t);
	if (!i) return e;
	let a = r.satellites ? {
		...r.satellites,
		moons: r.satellites.moons.map((t) => Fi(e, i, t))
	} : r.satellites;
	if (e.worldKind !== "Terrestrial Planet" || !r.climate || !r.rotation || n.hydrographicsCode === null) return {
		...e,
		physical: {
			...n,
			details: {
				...r,
				satellites: a
			}
		}
	};
	let o = Mi({
		climate: r.climate,
		rotation: r.rotation,
		hydrographics: r.hydrographics,
		hydrographicsCode: n.hydrographicsCode,
		pressureBar: Pi(n),
		luminositySolar: i.luminositySolar,
		distanceAu: e.au,
		eccentricity: e.eccentricity,
		seasonalPeriodYears: n.orbitalPeriodYears
	});
	return {
		...e,
		physical: {
			...n,
			details: {
				...r,
				satellites: a,
				climate: {
					...r.climate,
					temperatureExtremes: o
				}
			}
		}
	};
}
function Li(e, t) {
	return e.map((e) => Ii(e, t));
}
//#endregion
//#region src/rules/worlds/wbhSeismology.ts
var Ri = 332971, zi = 1e6, Bi = 24, Vi = 365.25;
function Hi(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Ui(e) {
	return new S(Hi(`wbh-seismology-v1|${e}`));
}
function Wi(e, t, n, r, i = []) {
	let a = +!!r;
	if (n > 1 ? a += 2 : n < .5 && --a, !r) {
		let e = i.reduce((e, t) => typeof t.sizeCode != "number" || t.sizeCode < 1 ? e : e + t.sizeCode, 0);
		a += Math.min(12, e);
	}
	let o = Math.floor(e - Math.max(0, t) + a);
	return {
		stress: o < 1 ? 0 : o * o,
		dm: a
	};
}
function Gi(e) {
	return Math.max(0, Math.floor(e / 10));
}
function Ki(e, t, n, r, i, a) {
	if (e <= 0 || t <= 0 || n <= 0 || r <= 0 || i <= 0 || a <= 0) return 0;
	let o = e ** 2 * t ** 5 * n ** 2 / (3e3 * r ** 5 * i * a);
	return o < 1 ? 0 : Math.floor(o);
}
function qi(e, t) {
	return e === null ? null : O((e ** 4 + Math.max(0, t) ** 4) ** .25, 6);
}
function Ji(e, t, n, r, i) {
	if (!r || n < 1 || i <= 0) return {
		count: 0,
		roll: null,
		dm: 0
	};
	let a = i > 100 ? 2 : +(i >= 10), o = Ui(e).roll(2, 6).total, s = t + n - o + a;
	return {
		count: s <= 1 ? 0 : s,
		roll: o,
		dm: a
	};
}
function Yi(e) {
	let t = e.profile.details, n = t?.size, r = e.profile.sizeCode;
	if (!t || !n || r === null || r <= 0) return null;
	let i = t.satellites?.moons ?? [], a = Wi(r, e.star.ageGyr, n.densityTerra, !1, i), o = Gi(t.surfaceTides?.totalAmplitudeMetres ?? 0), s = Ki(e.star.massSolar * Ri, r, e.eccentricity, e.profile.details?.climate?.distanceAuUsed ? e.profile.details.climate.distanceAuUsed * 149.5978709 : 0, e.profile.orbitalPeriodYears * Vi, n.massTerra), c = a.stress + o + s, l = t.hydrographics?.composition === "H2O", u = Ji(e.id, r, e.profile.hydrographicsCode ?? 0, l, c);
	return {
		method: "WBH seismology",
		residualSeismicStress: a.stress,
		residualStressDm: a.dm,
		tidalStressFactor: o,
		tidalHeatingFactor: s,
		totalSeismicStress: c,
		seismicAdjustedMeanTemperatureK: qi(t.climate?.meanTemperatureK ?? null, c),
		majorTectonicPlates: u.count,
		tectonicPlateRoll: u.roll,
		tectonicPlateDm: u.dm,
		waterBasedTectonicsEligible: l && (e.profile.hydrographicsCode ?? 0) >= 1 && c > 0,
		generationNotes: [
			"Residual seismic stress follows WBH Size − age + DMs, rounded down before squaring.",
			"Tidal stress is the floor of total surface tidal amplitude divided by 10.",
			"Tidal heating uses the WBH primary-mass/Size/eccentricity/distance/period/world-mass relationship and ignores values below 1.",
			"Seismic-adjusted mean temperature is stored separately; the existing mean climate value is not overwritten in Phase 1."
		]
	};
}
function Xi(e) {
	let t = e.profile.details, n = t?.size;
	if (!t || !n || e.sizeCode <= 0) return null;
	let r = Wi(e.sizeCode, e.starAgeGyr, n.densityTerra, !0), i = Gi(t.surfaceTides?.totalAmplitudeMetres ?? 0), a = Ki(e.parentMassTerra, e.sizeCode, e.eccentricity, e.orbitKm / zi, e.periodHours / Bi, n.massTerra), o = r.stress + i + a, s = t.hydrographics?.composition === "H2O", c = Ji(e.id, e.sizeCode, e.profile.hydrographicsCode ?? 0, s, o);
	return {
		method: "WBH seismology",
		residualSeismicStress: r.stress,
		residualStressDm: r.dm,
		tidalStressFactor: i,
		tidalHeatingFactor: a,
		totalSeismicStress: o,
		seismicAdjustedMeanTemperatureK: qi(t.climate?.meanTemperatureK ?? null, o),
		majorTectonicPlates: c.count,
		tectonicPlateRoll: c.roll,
		tectonicPlateDm: c.dm,
		waterBasedTectonicsEligible: s && (e.profile.hydrographicsCode ?? 0) >= 1 && o > 0,
		generationNotes: [
			"Moon residual seismic stress includes the WBH DM+1 for being a moon.",
			"Moon tidal heating uses parent mass, planet-centric eccentricity, moon distance and moon orbital period.",
			"Optional moon-to-moon tidal effects remain excluded because the upstream surface-tide phase does not include them automatically.",
			"Seismic-adjusted mean temperature is stored separately; the existing mean climate value is not overwritten in Phase 1."
		]
	};
}
//#endregion
//#region src/rules/system/wbhSystemSeismology.ts
function Zi(e) {
	return e.details?.size?.massTerra ?? e.details?.gasGiant?.massTerra ?? null;
}
function Qi(e, t, n, r) {
	let i = r.physical, a = Zi(t);
	if (!i?.details || a === null || typeof r.sizeCode != "number" || r.sizeCode <= 0 || i.details.gasGiant) return r;
	let o = Xi({
		id: r.sourceId ?? `${e.id}.${r.designation}`,
		profile: i,
		sizeCode: r.sizeCode,
		starAgeGyr: n.ageGyr,
		eccentricity: r.eccentricity,
		parentMassTerra: a,
		orbitKm: r.orbitKm,
		periodHours: r.periodHours
	});
	return o ? {
		...r,
		physical: {
			...i,
			details: {
				...i.details,
				seismology: o
			}
		}
	} : r;
}
function $i(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = bi(e, t);
	if (!r) return e;
	let i = n.details.satellites, a = i && {
		...i,
		moons: i.moons.map((t) => Qi(e, n, r, t))
	};
	if (e.worldKind !== "Terrestrial Planet") return {
		...e,
		physical: {
			...n,
			details: {
				...n.details,
				satellites: a
			}
		}
	};
	let o = {
		...n,
		details: {
			...n.details,
			satellites: a
		}
	}, s = Yi({
		id: e.id,
		profile: o,
		star: r,
		eccentricity: e.eccentricity
	});
	return {
		...e,
		physical: {
			...o,
			details: {
				...o.details,
				seismology: s
			}
		}
	};
}
function ea(e, t) {
	return e.map((e) => $i(e, t));
}
//#endregion
//#region src/rules/worlds/wbhAtmosphereGasMix.ts
var ta = {
	H2: {
		name: "Hydrogen",
		code: "H2",
		escapeValue: 12,
		taint: !1
	},
	He: {
		name: "Helium",
		code: "He",
		escapeValue: 6,
		taint: !1
	},
	CH4: {
		name: "Methane",
		code: "CH4",
		escapeValue: 1.5,
		taint: !0
	},
	NH3: {
		name: "Ammonia",
		code: "NH3",
		escapeValue: 1.42,
		taint: !0
	},
	H2O: {
		name: "Water Vapour",
		code: "H2O",
		escapeValue: 1.33,
		taint: !1
	},
	HF: {
		name: "Hydrofluoric Acid",
		code: "HF",
		escapeValue: 1.2,
		taint: !0
	},
	Ne: {
		name: "Neon",
		code: "Ne",
		escapeValue: 1.2,
		taint: !1
	},
	Na: {
		name: "Sodium",
		code: "Na",
		escapeValue: 1.04,
		taint: !0
	},
	N2: {
		name: "Nitrogen",
		code: "N2",
		escapeValue: .86,
		taint: !1
	},
	CO: {
		name: "Carbon Monoxide",
		code: "CO",
		escapeValue: .86,
		taint: !0
	},
	HCN: {
		name: "Hydrogen Cyanide",
		code: "HCN",
		escapeValue: .86,
		taint: !0
	},
	C2H6: {
		name: "Ethane",
		code: "C2H6",
		escapeValue: .8,
		taint: !0
	},
	HCl: {
		name: "Hydrochloric Acid",
		code: "HCl",
		escapeValue: .67,
		taint: !0
	},
	F2: {
		name: "Fluorine",
		code: "F2",
		escapeValue: .63,
		taint: !0
	},
	Ar: {
		name: "Argon",
		code: "Ar",
		escapeValue: .6,
		taint: !1
	},
	CO2: {
		name: "Carbon Dioxide",
		code: "CO2",
		escapeValue: .55,
		taint: !0
	},
	CH3NO: {
		name: "Formamide",
		code: "CH3NO",
		escapeValue: .53,
		taint: !0
	},
	CH2O2: {
		name: "Formic Acid",
		code: "CH2O2",
		escapeValue: .52,
		taint: !0
	},
	SO2: {
		name: "Sulphur Dioxide",
		code: "SO2",
		escapeValue: .38,
		taint: !0
	},
	Cl2: {
		name: "Chlorine",
		code: "Cl2",
		escapeValue: .34,
		taint: !0
	},
	Kr: {
		name: "Krypton",
		code: "Kr",
		escapeValue: .29,
		taint: !1
	},
	H2SO4: {
		name: "Sulphuric Acid",
		code: "H2SO4",
		escapeValue: .24,
		taint: !0
	},
	Sil: {
		name: "Silicates",
		code: "Sil",
		escapeValue: null,
		taint: null
	},
	Metal: {
		name: "Metal Vapours",
		code: "Metal",
		escapeValue: null,
		taint: null
	}
}, na = {
	[-2]: {
		10: "Sil",
		11: "Sil",
		12: "Metal"
	},
	[-1]: {
		10: "Na",
		11: "Na",
		12: "Sil"
	},
	0: {
		10: "Kr",
		11: "Kr",
		12: "Na"
	},
	1: {
		10: "Ar",
		11: "Ar",
		12: "H2SO4"
	},
	2: {
		10: "SO2",
		11: "SO2",
		12: "HCl"
	},
	3: {
		10: "CO",
		11: "HCN",
		12: "Cl2"
	},
	4: {
		10: "CO2",
		11: "CH3NO",
		12: "F2"
	},
	5: {
		10: "N2",
		11: "CO2",
		12: "CH2O2"
	},
	6: {
		10: "CO2",
		11: "N2",
		12: "H2O"
	},
	7: {
		10: "N2",
		11: "CO2",
		12: "N2"
	},
	8: {
		10: "H2O",
		11: "SO2",
		12: "CO2"
	},
	9: {
		10: "SO2",
		11: "H2O",
		12: "SO2"
	},
	10: {
		10: "N2",
		11: "N2",
		12: "HCN"
	},
	11: {
		10: "CH4",
		11: "NH3",
		12: "NH3"
	},
	12: {
		10: "H2O",
		11: "NH3",
		12: "HF"
	},
	13: {
		10: "CH4",
		11: "CH4",
		12: "CH4"
	}
}, ra = {
	1: {
		10: "Kr",
		11: "Ar",
		12: "HCl"
	},
	2: {
		10: "Ar",
		11: "SO2",
		12: "Cl2"
	},
	3: {
		10: "SO2",
		11: "HCN",
		12: "F2"
	},
	4: {
		10: "C2H6",
		11: "C2H6",
		12: "CH2O2"
	},
	5: {
		10: "CO2",
		11: "CO2",
		12: "H2O"
	},
	6: {
		10: "N2",
		11: "N2",
		12: "N2"
	},
	7: {
		10: "CO2",
		11: "CO2",
		12: "CO2"
	},
	8: {
		10: "N2",
		11: "SO2",
		12: "SO2"
	},
	9: {
		10: "H2O",
		11: "H2O",
		12: "HCN"
	},
	10: {
		10: "SO2",
		11: "N2",
		12: "NH3"
	},
	11: {
		10: "CH4",
		11: "NH3",
		12: "CH4"
	},
	12: {
		10: "Ne",
		11: "NH3",
		12: "HF"
	},
	13: {
		10: "CH4",
		11: "CH4",
		12: "CH4"
	}
}, ia = {
	1: {
		10: "Kr",
		11: "Ar",
		12: "HCl"
	},
	2: {
		10: "Ar",
		11: "SO2",
		12: "Cl2"
	},
	3: {
		10: "SO2",
		11: "HCN",
		12: "F2"
	},
	4: {
		10: "C2H6",
		11: "C2H6",
		12: "SO2"
	},
	5: {
		10: "CO2",
		11: "CO2",
		12: "CO"
	},
	6: {
		10: "N2",
		11: "N2",
		12: "N2"
	},
	7: {
		10: "CO2",
		11: "CO2",
		12: "CO2"
	},
	8: {
		10: "N2",
		11: "SO2",
		12: "C2H6"
	},
	9: {
		10: "CO",
		11: "CO",
		12: "HCN"
	},
	10: {
		10: "SO2",
		11: "N2",
		12: "NH3"
	},
	11: {
		10: "CH4",
		11: "NH3",
		12: "CH4"
	},
	12: {
		10: "Ne",
		11: "NH3",
		12: "HF"
	},
	13: {
		10: "CH4",
		11: "CH4",
		12: "He"
	}
}, aa = {
	1: {
		10: "Kr",
		11: "Kr",
		12: "Ar"
	},
	2: {
		10: "Ar",
		11: "Cl2",
		12: "Cl2"
	},
	3: {
		10: "SO2",
		11: "Ar",
		12: "F2"
	},
	4: {
		10: "N2",
		11: "SO2",
		12: "SO2"
	},
	5: {
		10: "CO",
		11: "CO",
		12: "CO"
	},
	6: {
		10: "N2",
		11: "N2",
		12: "N2"
	},
	7: {
		10: "CO2",
		11: "CO2",
		12: "CO2"
	},
	8: {
		10: "C2H6",
		11: "C2H6",
		12: "C2H6"
	},
	9: {
		10: "N2",
		11: "NH3",
		12: "NH3"
	},
	10: {
		10: "Ne",
		11: "NH3",
		12: "NH3"
	},
	11: {
		10: "CH4",
		11: "CH4",
		12: "CH4"
	},
	12: {
		10: "CH4",
		11: "He",
		12: "He"
	},
	13: {
		10: "He",
		11: "H2",
		12: "H2"
	}
}, oa = {
	1: {
		10: "Kr",
		11: "Kr",
		12: "Ar"
	},
	2: {
		10: "Ar",
		11: "Cl2",
		12: "Cl2"
	},
	3: {
		10: "C2H6",
		11: "Ar",
		12: "F2"
	},
	4: {
		10: "N2",
		11: "N2",
		12: "C2H6"
	},
	5: {
		10: "CO",
		11: "CO",
		12: "CO"
	},
	6: {
		10: "N2",
		11: "N2",
		12: "N2"
	},
	7: {
		10: "CO2",
		11: "CO2",
		12: "CO2"
	},
	8: {
		10: "N2",
		11: "N2",
		12: "N2"
	},
	9: {
		10: "C2H6",
		11: "C2H6",
		12: "C2H6"
	},
	10: {
		10: "CH4",
		11: "NH3",
		12: "NH3"
	},
	11: {
		10: "Ne",
		11: "CH4",
		12: "CH4"
	},
	12: {
		10: "CH4",
		11: "He",
		12: "He"
	},
	13: {
		10: "He",
		11: "H2",
		12: "H2"
	}
}, sa = {
	1: {
		10: "Kr",
		11: "Kr",
		12: "Kr"
	},
	2: {
		10: "Ar",
		11: "Ar",
		12: "Ar"
	},
	3: {
		10: "Ar",
		11: "Ar",
		12: "F2"
	},
	4: {
		10: "N2",
		11: "N2",
		12: "N2"
	},
	5: {
		10: "N2",
		11: "N2",
		12: "N2"
	},
	6: {
		10: "CO",
		11: "CO",
		12: "CO"
	},
	7: {
		10: "N2",
		11: "N2",
		12: "N2"
	},
	8: {
		10: "CH4",
		11: "CH4",
		12: "CH4"
	},
	9: {
		10: "CH4",
		11: "CH4",
		12: "CH4"
	},
	10: {
		10: "CH4",
		11: "Ne",
		12: "Ne"
	},
	11: {
		10: "Ne",
		11: "CH4",
		12: "He"
	},
	12: {
		10: "CH4",
		11: "He",
		12: "H2"
	},
	13: {
		10: "He",
		11: "H2",
		12: "H2"
	}
}, ca = {
	1: {
		10: "Kr",
		11: "Kr",
		12: "Kr"
	},
	2: {
		10: "Ar",
		11: "Ar",
		12: "Ar"
	},
	3: {
		10: "Ar",
		11: "Ar",
		12: "F2"
	},
	4: {
		10: "CH4",
		11: "CH4",
		12: "CH4"
	},
	5: {
		10: "CO",
		11: "CO",
		12: "CO"
	},
	6: {
		10: "N2",
		11: "N2",
		12: "N2"
	},
	7: {
		10: "N2",
		11: "N2",
		12: "N2"
	},
	8: {
		10: "Ne",
		11: "Ne",
		12: "Ne"
	},
	9: {
		10: "He",
		11: "He",
		12: "He"
	},
	10: {
		10: "He",
		11: "He",
		12: "He"
	},
	11: {
		10: "H2",
		11: "H2",
		12: "H2"
	},
	12: {
		10: "H2",
		11: "H2",
		12: "H2"
	},
	13: {
		10: "H2",
		11: "H2",
		12: "H2"
	}
};
function la(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function ua(e, t, n, r) {
	return new S(la([
		"wbh-atmosphere-gas-mix-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		n,
		r
	].join("|")));
}
function da(e) {
	return e >= 453 ? {
		table: na,
		label: "Boiling 453K+",
		minimum: -2,
		maximum: 13
	} : e >= 353 ? {
		table: ra,
		label: "Boiling 353-453K",
		minimum: 1,
		maximum: 13
	} : e >= 303 ? {
		table: ia,
		label: "Hot 303-353K",
		minimum: 1,
		maximum: 13
	} : e >= 273 ? {
		table: aa,
		label: "Temperate 273-303K",
		minimum: 1,
		maximum: 13
	} : e >= 223 ? {
		table: oa,
		label: "Cold 223-273K",
		minimum: 1,
		maximum: 13
	} : e >= 123 ? {
		table: sa,
		label: "Frozen 123-223K",
		minimum: 1,
		maximum: 13
	} : {
		table: ca,
		label: "Frozen below 123K",
		minimum: 1,
		maximum: 13
	};
}
function fa(e, t) {
	let n = 0;
	return t >= 453 ? (t > 2e3 ? n -= 5 : t >= 700 && (n -= 2), e >= 1 && e <= 7 && --n) : t >= 223 ? e >= 1 && e <= 7 && --n : t >= 123 ? e >= 1 && e <= 7 && (n -= 2) : (t < 70 ? n += 5 : t <= 100 && (n += 3), e >= 1 && e <= 7 && (n -= 3)), e >= 10 && (n += 1), n;
}
function pa(e) {
	return e?.composition === "H2O";
}
function ma(e, t, n) {
	return e !== "CO" || n > 900 ? e : pa(t) ? "CO2" : e;
}
function ha(e, t) {
	if (!e || e.diameterKm <= 0 || e.massTerra <= 0 || t <= 0) return null;
	let n = e.diameterKm / 12742;
	return O(1e3 * e.massTerra / (n * t), 3);
}
function ga(e, t, n) {
	let r = ta[e] ?? {
		name: e,
		code: e,
		escapeValue: null,
		taint: null
	};
	return {
		name: r.name,
		code: r.code,
		percentage: t,
		escapeValue: r.escapeValue,
		retainedLongTerm: n === null || r.escapeValue === null ? null : r.escapeValue < n,
		taint: r.taint
	};
}
function _a(e, t) {
	let n = e.find((e) => e.code === t.code);
	n ? n.percentage = O(n.percentage + t.percentage, 1) : e.push(t);
}
function va(e) {
	let t = [...e].sort((e, t) => t.percentage - e.percentage).slice(0, 3);
	return t.length ? t.map((e) => `${e.code}-${Math.round(e.percentage).toString().padStart(2, "0")}`).join(":") : null;
}
function ya(e, t, n, r, i, a, o) {
	if (![
		10,
		11,
		12
	].includes(r) || o === null) return null;
	let s = ua(e, t, r, o), c = r, l = da(o), u = fa(n, o), d = ha(i, o), f = [], p = 0;
	for (let e = 0; e < 6 && p < 95; e += 1) {
		let e = s.roll(2, 6, u).total, t = Math.max(l.minimum, Math.min(l.maximum, e)), n = l.table[t][c], r = ma(n, a, o), i = 100 - p, m = (s.d6() + 3) / 10;
		_a(f, ga(r, O(Math.min(i, i * m), 1), d)), p = O(f.reduce((e, t) => e + t.percentage, 0), 1);
	}
	let m = O(Math.max(0, 100 - p), 1), h = ["Gas identities use the WBH temperature/type quick-reference tables; percentages use the Handbook (1D+3)×10% alternative applied successively to the remaining atmosphere.", "WBH quick gas tables are intentionally inspirational and do not guarantee chemically stable combinations; generated values remain Referee-editable source truth."];
	return d !== null && h.push(`Long-term gas-retention threshold is ${d}; a component passes when its WBH escape value is lower than this threshold.`), f.some((e) => e.retainedLongTerm === !1) && h.push("One or more generated gases fail the >1 Gyr WBH retention test and therefore imply replenishment, artificial support, unusual youth, or Referee revision. They are not silently rerolled."), m > 0 && h.push(`${m}% remains unallocated as trace/other gases.`), t.ageGyr < 1 && h.push("World or system is younger than 1 Gyr; WBH permits the Referee to reduce gas escape values for young worlds, but this optional adjustment is not applied automatically."), {
		method: "WBH temperature/type quick table",
		temperatureBand: l.label,
		retentionThreshold: d,
		components: f.sort((e, t) => t.percentage - e.percentage),
		unallocatedPercent: m,
		profile: va(f),
		generationNotes: h
	};
}
//#endregion
//#region src/rules/worlds/wbhHydrographicsDetails.ts
var ba = {
	0: {
		description: "Extremely Dispersed",
		effect: "Many minor and small bodies; no major bodies."
	},
	1: {
		description: "Very Dispersed",
		effect: "Mostly minor bodies; 5-10% of body coverage is in major bodies."
	},
	2: {
		description: "Dispersed",
		effect: "Mostly minor bodies; 10-20% of body coverage is in major bodies."
	},
	3: {
		description: "Scattered",
		effect: "Roughly 20-30% or less of body coverage is in major bodies."
	},
	4: {
		description: "Slightly Scattered",
		effect: "Roughly 30-40% or less of body coverage is in major bodies."
	},
	5: {
		description: "Mixed",
		effect: "Mix of major and minor bodies; roughly 40-60% of body coverage is major."
	},
	6: {
		description: "Slightly Skewed",
		effect: "Roughly 60-70% of body coverage is in major bodies."
	},
	7: {
		description: "Skewed",
		effect: "Roughly 70-80% or less of body coverage is in major bodies."
	},
	8: {
		description: "Concentrated",
		effect: "Mostly major bodies; 80-90% of body coverage is in major bodies."
	},
	9: {
		description: "Very Concentrated",
		effect: "Single very large major body; 90-95% of body coverage is in one body."
	},
	10: {
		description: "Extremely Concentrated",
		effect: "Single very large major body; 95% or more of body coverage is in one body."
	}
}, xa = {
	0: [0, 0],
	1: [.05, .1],
	2: [.1, .2],
	3: [.2, .3],
	4: [.3, .4],
	5: [.4, .6],
	6: [.6, .7],
	7: [.7, .8],
	8: [.8, .9],
	9: [.9, .95],
	10: [.95, 1]
}, Sa = [
	{
		molecule: "Fluorine",
		code: "F2",
		boilingPointK: 85,
		meltingPointK: 53,
		relativeAbundance: 2
	},
	{
		molecule: "Oxygen",
		code: "O2",
		boilingPointK: 90,
		meltingPointK: 54,
		relativeAbundance: 50
	},
	{
		molecule: "Methane",
		code: "CH4",
		boilingPointK: 113,
		meltingPointK: 91,
		relativeAbundance: 70
	},
	{
		molecule: "Ethane",
		code: "C2H6",
		boilingPointK: 184,
		meltingPointK: 90,
		relativeAbundance: 70
	},
	{
		molecule: "Chlorine",
		code: "Cl2",
		boilingPointK: 239,
		meltingPointK: 171,
		relativeAbundance: 1
	},
	{
		molecule: "Ammonia",
		code: "NH3",
		boilingPointK: 240,
		meltingPointK: 195,
		relativeAbundance: 30
	},
	{
		molecule: "Sulphur Dioxide",
		code: "SO2",
		boilingPointK: 263,
		meltingPointK: 201,
		relativeAbundance: 20
	},
	{
		molecule: "Hydrofluoric Acid",
		code: "HF",
		boilingPointK: 293,
		meltingPointK: 190,
		relativeAbundance: 2
	},
	{
		molecule: "Hydrogen Cyanide",
		code: "HCN",
		boilingPointK: 299,
		meltingPointK: 260,
		relativeAbundance: 30
	},
	{
		molecule: "Hydrochloric Acid",
		code: "HCl",
		boilingPointK: 321,
		meltingPointK: 247,
		relativeAbundance: 1
	},
	{
		molecule: "Water",
		code: "H2O",
		boilingPointK: 373,
		meltingPointK: 273,
		relativeAbundance: 100
	},
	{
		molecule: "Formic Acid",
		code: "CH2O2",
		boilingPointK: 374,
		meltingPointK: 281,
		relativeAbundance: 15
	},
	{
		molecule: "Formamide",
		code: "CH3NO",
		boilingPointK: 483,
		meltingPointK: 275,
		relativeAbundance: 15
	},
	{
		molecule: "Carbonic Acid",
		code: "H2CO3",
		boilingPointK: 607,
		meltingPointK: 193,
		relativeAbundance: 20
	},
	{
		molecule: "Sulphuric Acid",
		code: "H2SO4",
		boilingPointK: 718,
		meltingPointK: 388,
		relativeAbundance: 20
	}
];
function Ca(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function wa(e, t, n) {
	return new S(Ca([
		"wbh-hydrographics-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		n
	].join("|")));
}
function Ta(e, t, n) {
	return new S(Ca([
		"wbh-surface-features-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		n
	].join("|")));
}
function Ea(e, t, n, r) {
	return new S(Ca([
		"wbh-hydrographics-liquids-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		n,
		r
	].join("|")));
}
function Da(e, t, n) {
	return n <= 0 ? Math.max(0, -4 + e.d10ZeroToNine()) : n >= 10 ? t > 9 ? 100 : Math.min(100, 96 + e.d10ZeroToNine()) : n * 10 - 4 + e.d10ZeroToNine();
}
function Oa(e, t) {
	return t >= 6 ? "ocean" : t <= 4 ? "land" : e.d6() <= 3 ? "ocean" : "land";
}
function ka(e) {
	let t = Math.max(0, Math.min(10, e.roll(2, 6, -2).total)), n = ba[t];
	return {
		code: t,
		description: n.description,
		effect: n.effect
	};
}
function Aa(e, t) {
	return e === "ocean" ? {
		majorBodyKind: "continents",
		minorBodyKind: "continents",
		smallBodyKind: "islands"
	} : t === "H2O" ? {
		majorBodyKind: "oceans",
		minorBodyKind: "oceans",
		smallBodyKind: "seas"
	} : {
		majorBodyKind: "liquid bodies",
		minorBodyKind: "liquid bodies",
		smallBodyKind: "liquid bodies"
	};
}
function ja(e) {
	return Number(e.toFixed(2));
}
function Ma(e) {
	return (e.die(1e4) - 1) / 9999;
}
function Na(e, t, n, r, i) {
	if (t <= 0 || e <= 0) return [];
	let a = [], o = e;
	for (let e = 0; e < t; e += 1) {
		let s = t - e - 1;
		if (s === 0) {
			a.push(o);
			break;
		}
		let c = Math.max(n, r === null ? n : o - r * s), l = Math.min(r ?? o, o - n * s), u = l <= c ? c : c + (l - c) * Ma(i);
		a.push(u), o -= u;
	}
	let s = a.map(ja), c = ja(e - s.reduce((e, t) => e + t, 0));
	return s.length && c !== 0 && (s[s.length - 1] = ja(s[s.length - 1] + c)), s;
}
function Pa(e, t) {
	return e === "liquid-body" ? t === 1 ? "liquid body" : "liquid bodies" : t === 1 ? e : e === "sea" ? "seas" : `${e}s`;
}
function Fa(e, t, n, r, i, a) {
	let o = Ta(e, t, n), s = i === "ocean" ? Math.max(0, 100 - r) : Math.max(0, r), c = i === "ocean" ? "land" : "liquid", [l, u] = xa[a], d = s * (l === u ? l : l + (u - l) * Ma(o));
	d > 0 && d < 5 && (d = 0);
	let f = Math.max(0, s - d), p = f * (f === 0 ? 0 : .15 + .2 * Ma(o)), m = f - p;
	m > 0 && m < 1 && (p += m, m = 0);
	let h = Math.floor(d / 5), g = h <= 0 ? 0 : a >= 9 ? 1 : o.die(Math.min(h, 4) + 1) - 1 || 1, _ = Math.min(4.5, 1.5 + a * .25), v = m > 0 ? Math.ceil(m / 4.99) : 0, y = m > 0 ? Math.ceil(m / _) : 0, b = m >= 1 ? Math.max(1, v, y) : 0, x = p > 0 ? Math.max(1, Math.ceil(p / .8)) : 0, S = i === "ocean" ? "continent" : "liquid-body", ee = S, te = i === "ocean" ? "island" : "liquid-body", ne = Na(d, g, 5, null, o), re = Na(m, b, 1, 4.99, o), ie = Na(p, x, .01, .99, o), ae = [
		...ne.map((e, t) => ({
			id: `${S}-major-${t + 1}`,
			classification: "major",
			kind: S,
			surfacePercent: e
		})),
		...re.map((e, t) => ({
			id: `${ee}-minor-${t + 1}`,
			classification: "minor",
			kind: ee,
			surfacePercent: e
		})),
		...ie.map((e, t) => ({
			id: `${te}-small-${t + 1}`,
			classification: "small",
			kind: te,
			surfacePercent: e
		}))
	];
	return {
		method: "WBH surface feature distribution",
		discreteFeatureCoveragePercent: ja(s),
		discreteFeatureType: c,
		majorCoveragePercent: ja(ne.reduce((e, t) => e + t, 0)),
		minorCoveragePercent: ja(re.reduce((e, t) => e + t, 0)),
		smallCoveragePercent: ja(ie.reduce((e, t) => e + t, 0)),
		majorBodyCount: g,
		minorBodyCount: b,
		smallBodyCount: x,
		bodies: ae,
		generationPolicy: `WBH supplies the 2D-2 distribution class and map thresholds (major >=5%, minor >=1%, small <1%) but not an exact count formula. Traveller System Generator deterministically allocates the discrete ${c} coverage into ${g} major ${Pa(S, g)}, ${b} minor ${Pa(ee, b)}, and ${x} small ${Pa(te, x)} while preserving those thresholds and the table's major-body coverage band.`
	};
}
function Ia(e, t) {
	if (e.discreteFeatureType === "land") return e;
	if (t !== "H2O") return {
		...e,
		discreteFeatureType: "liquid"
	};
	let n = e.bodies.map((e) => e.kind === "liquid-body" ? {
		...e,
		kind: e.classification === "small" ? "sea" : "ocean",
		id: `${e.classification === "small" ? "sea" : "ocean"}-${e.classification}-${e.id.split("-").at(-1)}`
	} : e);
	return {
		...e,
		discreteFeatureType: "water",
		bodies: n
	};
}
function La(e, t) {
	if (t.length === 1) return t[0];
	let n = t.reduce((e, t) => e + t.relativeAbundance, 0), r = e.die(n);
	for (let e of t) if (r -= e.relativeAbundance, r <= 0) return e;
	return t[t.length - 1];
}
function Ra(e, t, n, r, i) {
	let a = wa(e, t, i), o = Da(a, n, i), s = Oa(a, i), c = ka(a), l = Fa(e, t, i, o, s, c.code), u = [l.generationPolicy], d = null;
	return o === 0 ? d = "None" : [
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		13,
		14
	].includes(r) ? d = "H2O" : u.push("Hydrographic liquid composition awaits the WBH mean-temperature result before selecting a viable exotic liquid."), l = Ia(l, d), {
		coveragePercent: o,
		foundation: s,
		...Aa(s, d),
		distribution: c,
		majorBodyMinimumSurfacePercent: 5,
		minorBodyMinimumSurfacePercent: 1,
		minorBodyMaximumSurfacePercent: 5,
		smallBodyMaximumSurfacePercent: 1,
		majorBodyCount: l.majorBodyCount,
		minorBodyCount: l.minorBodyCount,
		surfaceFeatures: l,
		composition: d,
		profile: `${i.toString(16).toUpperCase()}-D${c.code.toString(16).toUpperCase()}:${o}%:${l.majorBodyCount}M/${l.minorBodyCount}m/${l.smallBodyCount}s`,
		generationNotes: u
	};
}
function za(e, t, n, r, i) {
	if (e.composition === "None" || e.composition === "H2O" || i === null) return e;
	let a = e.generationNotes.filter((e) => !e.includes("awaits the WBH mean-temperature result")), o;
	if (i > 1e3) a.push("WBH notes that above 1000K the surface liquid may be magma (liquid rock)."), o = "Magma";
	else {
		let e = Sa.filter((e) => i >= e.meltingPointK && i <= e.boilingPointK);
		e.length === 0 ? (a.push(`No WBH Possible Exotic Liquid spans the generated mean surface temperature of ${i}K at standard-pressure reference points; Referee determination required.`), o = null) : (o = La(Ea(t, n, r, i), e).code, a.push(`WBH temperature-qualified liquid candidates at ${i}K: ${e.map((e) => e.code).join(", ")}. Selection is weighted by the Handbook relative-abundance values.`), a.push("Melting/boiling reference points assume approximately standard atmospheric pressure; pressure-dependent phase chemistry remains outside the Handbook procedure."));
	}
	let s = e.surfaceFeatures ? Ia(e.surfaceFeatures, o) : e.surfaceFeatures;
	return {
		...e,
		...Aa(e.foundation, o),
		composition: o,
		surfaceFeatures: s,
		generationNotes: a
	};
}
//#endregion
//#region src/rules/system/wbhSystemFinalTemperature.ts
var Ba = 8.5, Va = 288, Ha = /* @__PURE__ */ new Set([
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	13,
	14
]), Ua = /* @__PURE__ */ new Set([
	10,
	11,
	12,
	15
]);
function Wa(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Ga(e) {
	return e < 222 ? "Frozen" : e < 273 ? "Cold" : e <= 303 ? "Temperate" : e <= 353 ? "Hot" : "Boiling";
}
function Ka(e, t, n) {
	return !t || t.gravityG <= 0 || n === 0 ? null : O(Ba * e / (t.gravityG * Va), 3);
}
function qa(e, t, n, r) {
	if (e !== 13 || t === null || n === null || r === null) return null;
	let i = Math.max(n / 2, r / .5);
	return i <= 1 ? 0 : O(Math.log(i) * t, 3);
}
function Ja(e, t, n, r) {
	if (e !== 14 || t === null || n === null || r === null || r <= 0) return null;
	if (r >= .1) return 0;
	let i = .1 / r;
	return n * i > 2 ? null : O(Math.log(i) * t, 3);
}
function Ya(e, t, n, r) {
	if (!t || !Ha.has(e) || !n || n.gravityG <= 0) return t ?? null;
	let i = Ka(r, n, e), a = t.generationNotes.filter((e) => !e.startsWith("Scale height currently uses the WBH temperate baseline") && !e.startsWith("Scale height uses the WBH 288K Terra baseline corrected to the final reconciled mean temperature"));
	return a.push(`Scale height uses the WBH 288K Terra baseline corrected to the final reconciled mean temperature ${O(r, 6)}K.`), {
		...t,
		scaleHeightKm: i,
		minimumSafeAltitudeKm: qa(e, i, t.nitrogenPartialPressureBar, t.oxygenPartialPressureBar),
		safeAltitudeBelowMeanKm: Ja(e, i, t.nitrogenPartialPressureBar, t.oxygenPartialPressureBar),
		generationNotes: a
	};
}
function Xa(e) {
	let t = e.surfaceFeatures;
	return !t || t.discreteFeatureType !== "water" ? e : {
		...e,
		surfaceFeatures: {
			...t,
			discreteFeatureType: "liquid",
			bodies: t.bodies.map((e) => e.kind !== "ocean" && e.kind !== "sea" ? e : {
				...e,
				kind: "liquid-body",
				id: `liquid-body-${e.classification}-${e.id.split("-").at(-1)}`
			})
		}
	};
}
function Za(e) {
	return {
		...e,
		generationNotes: e.generationNotes.filter((e) => !e.includes("awaits the WBH mean-temperature result") && !e.startsWith("WBH temperature-qualified liquid candidates at ") && !e.startsWith("No WBH Possible Exotic Liquid spans the generated mean surface temperature") && !e.startsWith("WBH notes that above 1000K the surface liquid may be magma") && !e.startsWith("Melting/boiling reference points assume approximately standard atmospheric pressure"))
	};
}
function Qa(e, t, n, r) {
	let i = n.details?.hydrographics, a = n.atmosphereCode;
	return !i || a === null || i.coveragePercent <= 0 || !Ua.has(a) ? i : za(Xa(Za({
		...i,
		composition: null
	})), e, t, a, r);
}
function $a(e, t, n, r, i) {
	if (!(r && n >= 1 && i > 0)) return {
		count: 0,
		roll: null,
		dm: 0,
		eligible: !1
	};
	let a = i > 100 ? 2 : +(i >= 10), o = new S(Wa(`wbh-seismology-v1|${e}`)).roll(2, 6).total, s = t + n - o + a;
	return {
		count: s <= 1 ? 0 : s,
		roll: o,
		dm: a,
		eligible: !0
	};
}
function eo(e, t, n, r, i) {
	let a = e.meanTemperatureK, o = e.temperatureExtremes, s = o?.highTemperatureK ?? null, c = o?.lowTemperatureK ?? null, l = o ? qi(s, t) : null, u = o ? qi(c, t) : null, d = o && {
		...o,
		highTemperatureK: l,
		highTemperatureC: l === null ? null : O(l - 273, 6),
		lowTemperatureK: u,
		lowTemperatureC: u === null ? null : O(u - 273, 6),
		generationNotes: [...o.generationNotes.filter((e) => !e.startsWith("WBH seismic heating reconciled into high/low temperatures:")), `WBH seismic heating reconciled into high/low temperatures: ${s ?? "unresolved"}K/${c ?? "unresolved"}K -> ${l ?? "unresolved"}K/${u ?? "unresolved"}K.`]
	}, f = e.generationNotes.filter((e) => !e.startsWith("Final-temperature reconciliation applies WBH seismic heating:"));
	return f.push(`Final-temperature reconciliation applies WBH seismic heating: mean ${a ?? "unresolved"}K -> ${O(n, 6)}K. Reconciled mean and high/low temperatures are authoritative for downstream physical and biological consumers.`), {
		...e,
		meanTemperatureK: n,
		meanTemperatureC: O(n - 273, 6),
		temperatureClass: Ga(n),
		temperatureCorrectedScaleHeightKm: Ka(n, r, i),
		runawayGreenhouseEligible: n > 303 && i >= 2 && i <= 15,
		temperatureExtremes: d,
		generationNotes: f
	};
}
function to(e, t, n) {
	let r = n.details, i = r?.climate, a = r?.seismology, o = n.atmosphereCode, s = n.hydrographicsCode, c = n.sizeCode, l = a?.seismicAdjustedMeanTemperatureK;
	if (!r || !i || !a || o === null || typeof l != "number" || !Number.isFinite(l)) return n;
	let u = eo(i, a.totalSeismicStress, l, r.size, o), d = Qa(e, t, n, l), f = Ya(o, r.atmosphere, r.size, l), p = c === null ? null : ya(e, t, c, o, r.size, d ?? null, l);
	if (f && p) {
		let e = f.generationNotes.filter((e) => !e.includes("detailed gas composition is deferred") && !e.includes("detailed gas composition remains deferred") && !e.startsWith("Detailed A/B/C gas composition and retention use the final reconciled mean temperature"));
		e.push(`Detailed A/B/C gas composition and retention use the final reconciled mean temperature ${O(l, 6)}K.`), f = {
			...f,
			gasMix: p,
			generationNotes: e
		};
	}
	let m = a;
	if (c !== null && c > 0 && s !== null) {
		let t = d?.composition === "H2O", n = $a(e.id, c, s, t, a.totalSeismicStress);
		m = {
			...a,
			majorTectonicPlates: n.count,
			tectonicPlateRoll: n.roll,
			tectonicPlateDm: n.dm,
			waterBasedTectonicsEligible: n.eligible,
			generationNotes: [...a.generationNotes.filter((e) => !e.startsWith("Tectonic eligibility was reconciled after final-temperature hydrographic composition:")), `Tectonic eligibility was reconciled after final-temperature hydrographic composition: ${d?.composition ?? "unresolved"}.`]
		};
	}
	return {
		...n,
		details: {
			...r,
			atmosphere: f,
			hydrographics: d,
			climate: u,
			seismology: m
		}
	};
}
function no(e, t) {
	return {
		id: t.sourceId ?? `${e.id}.${t.designation}`,
		aroundStarId: e.aroundStarId,
		aroundDesignation: e.aroundDesignation,
		sequence: e.sequence,
		orbitNumber: e.orbitNumber,
		au: e.au,
		eccentricity: e.eccentricity,
		hzco: e.hzco,
		hzDeviation: e.hzDeviation,
		worldKind: "Terrestrial Planet",
		generationNotes: [`Significant moon ${t.designation} orbits parent world ${e.id}.`]
	};
}
function ro(e, t, n) {
	let r = n.physical;
	return !r?.details || r.details.gasGiant || typeof n.sizeCode != "number" || n.sizeCode <= 0 ? n : {
		...n,
		physical: to(no(e, n), t, r)
	};
}
function io(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = t.find((t) => t.id === e.aroundStarId);
	if (!r) return e;
	let i = n.details.satellites ? {
		...n.details.satellites,
		moons: n.details.satellites.moons.map((t) => ro(e, r, t))
	} : n.details.satellites, a = {
		...n,
		details: {
			...n.details,
			satellites: i
		}
	};
	return e.worldKind === "Terrestrial Planet" ? {
		...e,
		physical: to(e, r, a)
	} : {
		...e,
		physical: a
	};
}
function ao(e, t) {
	return e.map((e) => io(e, t));
}
//#endregion
//#region src/rules/worlds/wbhSurfaceGeology.ts
function oo(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function so(e, t) {
	return e <= 1 || t <= 1 ? e > 1 ? "limited" : "inactive" : e > 100 ? "extreme" : e >= 10 ? "active" : "limited";
}
function co(e) {
	let t = e.die(100);
	return t <= 35 ? "convergent" : t <= 60 ? "divergent" : t <= 85 ? "transform" : "stable";
}
function lo(e) {
	return (e?.surfaceFeatures?.bodies ?? []).map((e) => e.id);
}
function uo(e, t) {
	if (!t.length) return [];
	let n = t[e.die(t.length) - 1];
	if (t.length === 1 || e.d6() <= 3) return [n];
	let r = n;
	for (let i = 0; i < 4 && r === n; i += 1) r = t[e.die(t.length) - 1];
	return r === n ? [n] : [n, r];
}
function fo(e) {
	return e > 100 ? "severe" : e >= 10 ? "major" : "minor";
}
function po(e, t, n) {
	if (e === "convergent") {
		let e = ["mountain-chain"];
		return (t?.coveragePercent ?? 0) >= 40 && n % 2 == 0 && e.push("ocean-trench"), e;
	}
	return e === "divergent" ? n % 2 == 0 ? ["rift-system", "volcanic-belt"] : ["rift-system"] : e === "transform" ? ["fault-zone"] : [];
}
function mo(e, t, n) {
	if (!t) return null;
	let r = t.totalSeismicStress, i = t.majorTectonicPlates, a = so(r, i), o = lo(n), s = new S(oo(`wbh-surface-geology-v1|${e}|${r}|${i}|${o.join(",")}`)), c = i > 1 ? Math.max(3, Math.round(i * 1.5)) : 0, l = {
		convergent: 0,
		divergent: 0,
		transform: 0,
		stable: 0
	}, u = [], d = fo(r);
	for (let e = 0; e < c; e += 1) {
		let t = co(s);
		l[t] += 1;
		for (let r of po(t, n, e)) u.push({
			id: `geology-${u.length + 1}`,
			kind: r,
			intensity: d,
			relatedSurfaceBodyIds: uo(s, o),
			sourceBoundary: t
		});
	}
	return i <= 1 && r > 1 && u.push({
		id: "geology-1",
		kind: s.d6() <= 3 ? "isolated-volcanic-region" : "uplift-highland",
		intensity: d,
		relatedSurfaceBodyIds: uo(s, o),
		sourceBoundary: null
	}), {
		method: "WBH surface geology phase 1",
		regime: a,
		tectonicPlateCount: i,
		totalSeismicStress: r,
		plateBoundaries: l,
		features: u,
		generationPolicy: "WBH supplies the tectonic prerequisites and qualitative terrain effects; boundary-type weights, abstract boundary count, and feature allocation are Traveller System Generator policy.",
		generationNotes: [`Surface geology regime ${a} derived from total seismic stress ${r} and ${i} major tectonic plates.`, i > 1 ? `${c} abstract major plate-boundary segments generated for geographic planning.` : r > 1 ? "No moving-plate network; isolated volcanism or crustal uplift used as the WBH-supported fallback." : "No significant active surface geology generated from the current seismic state."]
	};
}
//#endregion
//#region src/rules/system/wbhSystemSurfaceGeology.ts
function ho(e, t) {
	let n = t.physical;
	if (!n?.details || n.details.gasGiant) return t;
	let r = mo(t.sourceId ?? `${e.id}.${t.designation}`, n.details.seismology, n.details.hydrographics);
	return r ? {
		...t,
		physical: {
			...n,
			details: {
				...n.details,
				surfaceGeology: r
			}
		}
	} : t;
}
function go(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites, r = n && {
		...n,
		moons: n.moons.map((t) => ho(e, t))
	};
	if (e.worldKind !== "Terrestrial Planet") return {
		...e,
		physical: {
			...t,
			details: {
				...t.details,
				satellites: r
			}
		}
	};
	let i = {
		...t,
		details: {
			...t.details,
			satellites: r
		}
	}, a = mo(e.id, i.details?.seismology, i.details?.hydrographics);
	return {
		...e,
		physical: {
			...i,
			details: i.details ? {
				...i.details,
				surfaceGeology: a
			} : i.details
		}
	};
}
function _o(e) {
	return e.map(go);
}
//#endregion
//#region src/rules/worlds/wbhSurfaceClimate.ts
function vo(e) {
	return e < 253 ? "frigid" : e < 273 ? "cold" : e < 303 ? "temperate" : e < 323 ? "warm" : "hot";
}
function yo(e, t, n) {
	return n <= 273 ? "pervasive" : t <= 273 ? "substantial" : e <= 273 ? "localized" : "none";
}
function bo(e) {
	let t = e.details?.climate, n = t?.temperatureExtremes;
	if (!t || !n || t.meanTemperatureK === null || n.highTemperatureK === null || n.lowTemperatureK === null) return null;
	let r = t.meanTemperatureK, i = n.highTemperatureK, a = n.lowTemperatureK, o = yo(a, r, i), s = i > 278 && r > 273, c = s && (i < 323 || r < 318), l = [];
	return o === "pervasive" ? l.push("Permanent ice or glaciation can dominate nearly all mapped latitude bands.") : o === "substantial" ? l.push("Large permanent polar or high-altitude ice regions are expected.") : o === "localized" ? l.push("Permanent ice is plausible in polar or high-altitude regions.") : l.push("The baseline temperature range does not imply permanent surface ice."), s ? l.push("At least some regions satisfy the WBH thermal threshold for agriculture.") : l.push("The global baseline temperatures do not satisfy the WBH thermal threshold for agriculture."), c ? l.push("At least some regions satisfy the WBH thermal threshold for unprotected human settlement.") : l.push("The global baseline temperatures do not satisfy the WBH thermal threshold for unprotected human settlement."), e.details?.rotation?.tidalLockStatus === "1:1" && e.details.rotation.tidalLockCase === "planet-star" && l.push("For mapping a stellar 1:1 tidal lock, treat the terminator/twilight zone as the principal surface-climate axis rather than ordinary latitude."), {
		method: "WBH surface climate phase 1",
		meanTemperatureK: r,
		highTemperatureK: i,
		lowTemperatureK: a,
		thermalRegime: vo(r),
		permanentIceExtent: o,
		agricultureThermallyEligible: s,
		unprotectedSettlementThermallyEligible: c,
		broadRegionGuidance: l,
		generationPolicy: "WBH supplies temperature thresholds but not a canonical global climate-zone or biome generator. Ice extent categories and thermal-regime labels are Traveller System Generator policy intended as map guidance, not exact mapped coverage.",
		generationNotes: [
			"WBH high/low temperatures are baseline planetwide values at mean baseline altitude, not absolute local extremes.",
			"Permanent ice is certain only when a region's high temperature never exceeds 273K; phase 1 uses global high/mean/low values to classify likely extent without inventing precise ice-cap percentages.",
			"Detailed climate classifications, precipitation patterns and named biomes remain deferred because the WBH explicitly leaves them beyond scope."
		]
	};
}
//#endregion
//#region src/rules/system/wbhSystemSurfaceClimate.ts
function xo(e) {
	let t = e.physical;
	if (!t?.details || t.details.gasGiant || typeof e.sizeCode != "number" || e.sizeCode <= 0) return e;
	let n = bo(t);
	return n ? {
		...e,
		physical: {
			...t,
			details: {
				...t.details,
				surfaceClimate: n
			}
		}
	} : e;
}
function So(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites ? {
		...t.details.satellites,
		moons: t.details.satellites.moons.map(xo)
	} : t.details.satellites;
	if (e.worldKind !== "Terrestrial Planet") return {
		...e,
		physical: {
			...t,
			details: {
				...t.details,
				satellites: n
			}
		}
	};
	let r = {
		...t,
		details: {
			...t.details,
			satellites: n
		}
	}, i = bo(r);
	return i ? {
		...e,
		physical: {
			...r,
			details: {
				...r.details,
				surfaceClimate: i
			}
		}
	} : {
		...e,
		physical: r
	};
}
function Co(e) {
	return e.map(So);
}
//#endregion
//#region src/rules/worlds/wbhNativeLife.ts
function wo(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function To(e, t, n, r) {
	return new S(wo([
		"wbh-native-life-v1",
		e,
		t,
		n.uwpPhysical,
		n.atmosphereCode ?? "none",
		n.hydrographicsCode ?? "none",
		n.details?.climate?.meanTemperatureK ?? "none",
		n.details?.climate?.temperatureExtremes?.highTemperatureK ?? "none",
		r
	].join("|"))).roll(2, 6).total;
}
function Eo(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(Math.max(0, Math.trunc(e)));
}
function Do(e) {
	return e === 0 ? -6 : e === 1 ? -4 : [
		2,
		3,
		14
	].includes(e) ? -3 : [4, 5].includes(e) ? -2 : [
		8,
		9,
		13
	].includes(e) ? 2 : e === 10 ? -3 : e === 11 ? -5 : e === 12 ? -7 : e >= 15 ? -5 : 0;
}
function Oo(e) {
	return e === 0 ? -4 : e >= 1 && e <= 3 ? -2 : e >= 6 && e <= 8 ? 1 : e >= 9 ? 2 : 0;
}
function ko(e) {
	return e < .2 ? -6 : e < 1 ? -2 : +(e > 4);
}
function Ao(e) {
	let t = e.details?.climate, n = t?.temperatureExtremes?.highTemperatureK ?? null, r = t?.meanTemperatureK ?? null, i = 0;
	return n !== null && (n > 353 ? i -= 2 : n < 273 && (i -= 4)), r === null ? e.temperatureBand === "Temperate" ? i + 2 : e.temperatureBand === "Cold" ? i - 2 : e.temperatureBand === "Frozen" || e.temperatureBand === "Boiling" ? i - 6 : i : (r > 353 ? i -= 4 : r < 273 ? i -= 2 : r >= 279 && r <= 303 && (i += 2), i);
}
function jo(e) {
	return e ? e.taints.some((e) => e.type.toLowerCase().includes("biologic")) || e.hazards.some((e) => e.type === "Biologic") : !1;
}
function Mo(e) {
	return e === 0 || e === 1 || e === 10 || e === 11 || e === 12 || e >= 15;
}
function No(e, t) {
	let n = 0, r = e.atmosphereCode ?? 0;
	return (r < 4 || r > 9) && (n -= 2), e.details?.atmosphere?.oxygenSafety === "low" && (n -= 2), t <= 1 ? n -= 10 : t <= 2 ? n -= 8 : t <= 3 ? n -= 4 : t <= 4 && (n -= 2), n;
}
function Po(e, t) {
	let n = e.atmosphereCode ?? 0, r = (e.details?.atmosphere?.taints.length ?? 0) > 0, i;
	return i = [
		0,
		1,
		11,
		16,
		17
	].includes(n) ? -8 : n === 12 ? -10 : [10, 15].includes(n) ? -6 : [13, 14].includes(n) ? -1 : [
		2,
		4,
		7,
		9
	].includes(n) || r ? -2 : [
		3,
		5,
		8
	].includes(n) ? 1 : n === 6 ? 2 : n >= 18 ? -8 : 0, t > 8 && (i -= 2), i;
}
function Fo(e, t, n) {
	return t <= 0 ? 0 : Math.max(1, Math.ceil(e - 7 + (t + n) / 2));
}
function Io(e, t, n) {
	return Math.max(0, Math.floor(e + 3 - t / 2 + n));
}
function Lo(e) {
	let { id: t, profile: n, ageGyr: r } = e, i = n.atmosphereCode, a = n.hydrographicsCode;
	if (i === null || a === null || !n.details) return null;
	let o = Do(i), s = Oo(a), c = ko(r), l = Ao(n), u = o + s + c + l, d = Math.max(-12, Math.min(4, u)), f = To(t, "biomass", n, r), p = Math.max(0, f + d), m = "none", h = [`WBH biomass DM ${u >= 0 ? "+" : ""}${u} is clamped to ${d >= 0 ? "+" : ""}${d} within the -12/+4 limits.`];
	if (p === 0 && jo(n.details.atmosphere)) p = 1, m = "biologic-taint-floor", h.push("Biologic atmospheric taint forces Biomass 1 and Biocomplexity 1 under the WBH special case.");
	else if (p >= 1 && Mo(i)) {
		let e = Math.max(0, Math.abs(o) - 1);
		p += e, m = "life-as-we-do-not-know-it", h.push(`Hostile-atmosphere life special case restores ${e} Biomass point(s), one less than the magnitude of the atmosphere DM.`);
	}
	if (p <= 0) return {
		method: "WBH native lifeforms",
		biomassRating: 0,
		biomassRoll: f,
		biomassDm: {
			atmosphere: o,
			hydrographics: s,
			age: c,
			temperature: l,
			totalBeforeClamp: u,
			totalApplied: d
		},
		biomassSpecialCase: m,
		biocomplexityRating: 0,
		biocomplexityRoll: null,
		biocomplexityDm: 0,
		biodiversityRating: 0,
		biodiversityRoll: null,
		compatibilityRating: 0,
		compatibilityRoll: null,
		compatibilityDm: 0,
		currentNativeSophont: null,
		currentNativeSophontRoll: null,
		extinctNativeSophontEvidence: null,
		extinctNativeSophontRoll: null,
		profile: "0000",
		generationNotes: [...h, "Biomass 0 means no native life; downstream native-life ratings are 0 and sophont checks are not made."]
	};
	let g, _, v = 0;
	m === "biologic-taint-floor" ? (g = 1, _ = null) : (v = No(n, r), _ = To(t, "biocomplexity", n, r), g = Math.max(1, _ - 7 + Math.min(9, p) + v));
	let y = null, b = null, x = null, S = null;
	if (g >= 8) {
		let e = Math.min(9, g);
		b = To(t, "current-sophont", n, r), y = b + e - 7 >= 13, S = To(t, "extinct-sophont", n, r), x = S + e - 7 + +(r > 5) >= 13;
	}
	let ee = To(t, "biodiversity", n, r), te = Fo(ee, p, g), ne = Po(n, r), re = To(t, "compatibility", n, r), ie = Io(re, g, ne), ae = `${Eo(p)}${Eo(g)}${Eo(te)}${Eo(ie)}`;
	return h.push("Biodiversity uses 2D-7 + (Biomass + Biocomplexity)/2, rounded up with minimum 1."), h.push("Compatibility uses 2D+3-Biocomplexity/2+DMs, rounded down with minimum 0."), h.push("The optional oxygen-floor and Rare Earth variants are not applied automatically."), {
		method: "WBH native lifeforms",
		biomassRating: p,
		biomassRoll: f,
		biomassDm: {
			atmosphere: o,
			hydrographics: s,
			age: c,
			temperature: l,
			totalBeforeClamp: u,
			totalApplied: d
		},
		biomassSpecialCase: m,
		biocomplexityRating: g,
		biocomplexityRoll: _,
		biocomplexityDm: v,
		biodiversityRating: te,
		biodiversityRoll: ee,
		compatibilityRating: ie,
		compatibilityRoll: re,
		compatibilityDm: ne,
		currentNativeSophont: y,
		currentNativeSophontRoll: b,
		extinctNativeSophontEvidence: x,
		extinctNativeSophontRoll: S,
		profile: ae,
		generationNotes: h
	};
}
//#endregion
//#region src/rules/system/wbhSystemNativeLife.ts
function Ro(e, t, n) {
	let r = n.physical;
	if (!r?.details || typeof n.sizeCode != "number" || r.details.gasGiant) return n;
	let i = Lo({
		id: n.sourceId ?? `${e.id}.${n.designation}`,
		profile: r,
		ageGyr: t.ageGyr
	});
	return i ? {
		...n,
		physical: {
			...r,
			details: {
				...r.details,
				nativeLife: i
			}
		}
	} : n;
}
function zo(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = t.find((t) => t.id === e.aroundStarId);
	if (!r) return e;
	let i = n.details.satellites, a = i && {
		...i,
		moons: i.moons.map((t) => Ro(e, r, t))
	}, o = {
		...n,
		details: {
			...n.details,
			satellites: a
		}
	};
	if (e.worldKind !== "Terrestrial Planet") return {
		...e,
		physical: o
	};
	let s = Lo({
		id: e.id,
		profile: o,
		ageGyr: r.ageGyr
	});
	return {
		...e,
		physical: {
			...o,
			details: {
				...o.details,
				nativeLife: s
			}
		}
	};
}
function Bo(e, t) {
	return e.map((e) => zo(e, t));
}
//#endregion
//#region src/rules/worlds/wbhResourceRating.ts
function Vo(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Ho(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(Math.max(0, Math.trunc(e)));
}
function Uo(e) {
	return e === null ? 0 : e > 1.12 ? 2 : e < .5 ? -2 : 0;
}
function Wo(e) {
	return e >= 11 ? 2 : +(e >= 8);
}
function Go(e, t) {
	return e < 1 ? 0 : t <= 3 ? -1 : t >= 8 ? 2 : 0;
}
function Ko(e) {
	let { id: t, profile: n } = e;
	if (typeof n.sizeCode != "number" || n.sizeCode <= 0 || n.details?.gasGiant) return null;
	let r = n.details?.nativeLife ?? null, i = n.details?.size?.densityTerra ?? null, a = r?.biomassRating ?? 0, o = r?.biodiversityRating ?? 0, s = r?.compatibilityRating ?? 0, c = Uo(i), l = a >= 3 ? 2 : 0, u = Wo(o), d = Go(a, s), f = c + l + u + d, p = new S(Vo([
		"wbh-resource-rating-v1",
		t,
		n.uwpPhysical,
		n.sizeCode,
		i ?? "none",
		a,
		o,
		s
	].join("|"))).roll(2, 6).total, m = p - 7 + n.sizeCode + f, h = Math.max(2, Math.min(12, m)), g = [];
	return i === null && g.push("No precise density was available; density DM treated as 0."), g.push("May 2024 Resource Rating table used: Biomass 3+ gives DM+2."), g.push("WBH Zed Prime prose conflicts with that table by describing Biomass A as DM+1."), {
		method: "WBH resource rating",
		rating: h,
		code: Ho(h),
		roll: p,
		sizeCode: n.sizeCode,
		dm: {
			density: c,
			biomass: l,
			biodiversity: u,
			compatibility: d,
			total: f
		},
		unclampedTotal: m,
		generationNotes: g
	};
}
//#endregion
//#region src/rules/system/wbhSystemResourceRating.ts
function qo(e, t) {
	let n = t.physical;
	if (!n?.details || typeof t.sizeCode != "number" || t.sizeCode <= 0 || n.details.gasGiant) return t;
	let r = Ko({
		id: t.sourceId ?? `${e.id}.${t.designation}`,
		profile: n
	});
	return r ? {
		...t,
		physical: {
			...n,
			details: {
				...n.details,
				resourceRating: r
			}
		}
	} : t;
}
function Jo(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites, r = n && {
		...n,
		moons: n.moons.map((t) => qo(e, t))
	}, i = {
		...t,
		details: {
			...t.details,
			satellites: r
		}
	};
	if (e.worldKind !== "Terrestrial Planet") return {
		...e,
		physical: i
	};
	let a = Ko({
		id: e.id,
		profile: i
	});
	return a ? {
		...e,
		physical: {
			...i,
			details: {
				...i.details,
				resourceRating: a
			}
		}
	} : {
		...e,
		physical: i
	};
}
function Yo(e, t) {
	return e.map(Jo);
}
//#endregion
//#region src/rules/worlds/wbhHabitabilityRating.ts
function Xo(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(Math.max(0, Math.trunc(e)));
}
function Zo(e) {
	return e <= 4 ? -1 : +(e >= 9);
}
function Qo(e) {
	return [
		0,
		1,
		10
	].includes(e) ? -8 : [2, 14].includes(e) ? -4 : [3, 13].includes(e) ? -3 : [4, 9].includes(e) ? -2 : [
		5,
		7,
		8
	].includes(e) ? -1 : e === 11 ? -10 : e === 12 || e >= 15 ? -12 : 0;
}
function $o(e) {
	return e === 0 ? -4 : e >= 1 && e <= 3 ? -2 : e === 9 ? -1 : e >= 10 ? -2 : 0;
}
function es(e) {
	return e < .2 ? -4 : e <= .4 ? -2 : e <= .7 ? -1 : e < .9 ? 1 : e < 1.1 ? 0 : e < 1.4 ? -1 : e < 2 ? -3 : -6;
}
function ts(e) {
	return 1 - Math.abs(6 - e);
}
function ns(e) {
	let t = e.details?.climate, n = t?.temperatureExtremes, r = n?.highTemperatureK ?? null, i = t?.meanTemperatureK ?? null, a = n?.lowTemperatureK ?? null;
	if (r !== null || i !== null || a !== null) return {
		high: r !== null && (r > 323 || r < 279) ? -2 : 0,
		mean: i === null ? 0 : i > 323 ? -4 : i >= 304 || i < 273 ? -2 : 0,
		low: a !== null && a < 200 ? -2 : 0,
		fallback: 0,
		detailed: !0
	};
	let o = e.temperatureBand.toLowerCase();
	return {
		high: 0,
		mean: 0,
		low: 0,
		fallback: o === "hot" || o === "cold" ? -2 : o === "boiling" || o === "frozen" ? -6 : 0,
		detailed: !1
	};
}
function rs(e) {
	return e <= 0 ? "Actively hostile world: not survivable without specialised equipment" : e <= 2 ? "Barely habitable world: full protective equipment often needed" : e <= 5 ? "Marginally survivable world with proper equipment" : e <= 7 ? "Regionally habitable world: may require acclimation" : e <= 9 ? "Suitable for human habitation with minimal equipment or acclimation" : "Terra-equivalent garden world";
}
function is(e) {
	let { profile: t } = e, n = t.sizeCode, r = t.atmosphereCode, i = t.hydrographicsCode;
	if (n === null || r === null || i === null) return null;
	let a = t.details?.atmosphere, o = t.details?.size?.gravityG ?? null, s = ns(t), c = Math.trunc(e.miscellaneousAdjustment ?? 0), l = a?.taints.some((e) => e.code === "L") ? -2 : 0, u = t.details?.rotation?.tidalLockStatus === "1:1" && t.details.rotation.tidalLockCase === "planet-star" ? -2 : 0, d = {
		size: Zo(n),
		atmosphere: Qo(r),
		lowOxygenTaint: l,
		hydrographics: $o(i),
		solarTidalLock: u,
		highTemperature: s.high,
		meanTemperature: s.mean,
		lowTemperature: s.low,
		temperatureFallback: s.fallback,
		gravity: o === null ? ts(n) : es(o),
		miscellaneous: c,
		total: 0
	};
	d.total = Object.entries(d).filter(([e]) => e !== "total").reduce((e, [, t]) => e + t, 0);
	let f = 10 + d.total, p = Math.max(0, Math.min(12, f)), m = [
		"WBH Terragen Habitability Rating = 10 + DMs; final rating is bounded to 0-C.",
		o === null ? "Detailed gravity unavailable; used the WBH Size-based undefined-gravity fallback." : "Used computed surface gravity.",
		s.detailed ? "Used detailed high, mean and low temperatures." : "Detailed temperatures unavailable; used the WBH temperature-band fallback.",
		c === 0 ? "No miscellaneous Referee adjustment was applied automatically." : `Applied miscellaneous Referee adjustment ${c >= 0 ? "+" : ""}${c}.`
	];
	return {
		method: "WBH Terragen habitability rating",
		rating: p,
		code: Xo(p),
		baseRating: 10,
		dm: d,
		unclampedTotal: f,
		remarks: rs(p),
		usedDetailedTemperature: s.detailed,
		usedComputedGravity: o !== null,
		generationNotes: m
	};
}
//#endregion
//#region src/rules/system/wbhSystemHabitabilityRating.ts
function as(e, t) {
	let n = t.physical;
	if (!n?.details || typeof t.sizeCode != "number" || t.sizeCode <= 0 || n.details.gasGiant) return t;
	let r = is({ profile: n });
	return r ? {
		...t,
		physical: {
			...n,
			details: {
				...n.details,
				habitabilityRating: r
			}
		}
	} : t;
}
function os(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites, r = n && {
		...n,
		moons: n.moons.map((t) => as(e, t))
	}, i = {
		...t,
		details: {
			...t.details,
			satellites: r
		}
	};
	if (e.worldKind !== "Terrestrial Planet") return {
		...e,
		physical: i
	};
	let a = is({ profile: i });
	return a ? {
		...e,
		physical: {
			...i,
			details: {
				...i.details,
				habitabilityRating: a
			}
		}
	} : {
		...e,
		physical: i
	};
}
function ss(e, t) {
	return e.map(os);
}
//#endregion
//#region src/rules/system/wbhSystemTidalLocks.ts
function cs(e) {
	return e ? e.meanBaselinePressureBar === null ? e.pressureRangeBar?.minimumBar !== void 0 && e.pressureRangeBar.minimumBar > 2.5 ? e.pressureRangeBar.minimumBar : e.specialSubtype?.minimumPressureBar !== null && e.specialSubtype?.minimumPressureBar !== void 0 && e.specialSubtype.minimumPressureBar > 2.5 ? e.specialSubtype.minimumPressureBar : null : e.meanBaselinePressureBar : null;
}
function ls(e) {
	return e.details?.size?.massTerra ?? e.details?.gasGiant?.massTerra ?? null;
}
function us(e, t) {
	return {
		...e,
		id: t.sourceId ?? `${e.id}.${t.designation}`,
		eccentricity: t.eccentricity,
		worldKind: t.physical?.details?.gasGiant ? "Gas Giant" : "Terrestrial Planet",
		physical: t.physical,
		social: void 0,
		isMainworld: !1
	};
}
function ds(e, t, n, r) {
	let i = r.physical, a = i?.details?.rotation, o = ls(t);
	if (!i || !a || o === null) return r;
	let s = i.details?.gasGiant ? null : typeof r.sizeCode == "number" ? r.sizeCode : 0, c = ti(us(e, r), n, a, {
		sizeCode: s,
		atmospherePressureBar: cs(i.details?.atmosphere),
		orbitalPeriodYears: i.orbitalPeriodYears,
		moon: {
			parentId: e.id,
			orbitPd: r.orbitPd,
			orbitalPeriodHours: r.periodHours,
			eccentricity: r.eccentricity,
			direction: r.direction,
			parentMassTerra: o
		}
	}), l = {
		...i,
		details: i.details ? {
			...i.details,
			rotation: c
		} : i.details
	};
	return {
		...r,
		eccentricity: c.adjustedEccentricity ?? r.eccentricity,
		physical: l
	};
}
function fs(e, t) {
	let n = e.physical, r = n?.details?.rotation;
	if (!n || !r) return e;
	let i = bi(e, t), a = yi(e, t);
	if (!i || !a) return e;
	let o = n.details?.satellites, s = o && {
		...o,
		moons: o.moons.map((t) => ds(e, n, i, t))
	}, c = ti(e, i, r, {
		sizeCode: n.sizeCode,
		atmospherePressureBar: cs(n.details?.atmosphere),
		orbitalPeriodYears: n.orbitalPeriodYears,
		satellites: s?.moons ?? null,
		starCount: a.interiorStars.length,
		totalStarMassSolar: a.totalMassSolar
	});
	return {
		...e,
		eccentricity: c.adjustedEccentricity ?? e.eccentricity,
		physical: {
			...n,
			details: n.details ? {
				...n.details,
				rotation: c,
				satellites: s
			} : n.details
		}
	};
}
function ps(e, t) {
	return ss(Yo(Bo(Co(_o(ao(ea(Li(wi(li(e).map((e) => fs(e, t)), t), t), t), t))), t), t), t);
}
//#endregion
//#region src/rules/worlds/wbhClimateDetails.ts
function ms(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function hs(e, t, n, r) {
	return new S(ms([
		"wbh-climate-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		t.luminositySolar,
		n,
		r
	].join("|")));
}
function gs(e) {
	return O(Math.max(.02, Math.min(.98, e)), 3);
}
function _s(e, t, n, r, i) {
	let a;
	return (n?.densityTerra ?? 0) > .4 ? a = .04 + (e.roll(2, 6).total - 2) * .02 : t.hzDeviation <= 2 ? a = .2 + (e.roll(2, 6).total - 3) * .05 : (a = .25 + (e.roll(2, 6).total - 2) * .07, a <= .4 && (a -= (e.d6() - 1) * .05)), [
		1,
		2,
		3,
		14
	].includes(r) ? a += (e.roll(2, 6).total - 3) * .01 : r >= 4 && r <= 9 ? a += e.roll(2, 6).total * .01 : [
		10,
		11,
		12,
		15
	].includes(r) || r >= 16 ? a += (e.roll(2, 6).total - 2) * .05 : r === 13 && (a += e.roll(2, 6).total * .03), i >= 2 && i <= 5 ? a += (e.roll(2, 6).total - 2) * .02 : i >= 6 && (a += (e.roll(2, 6).total - 4) * .03), gs(a);
}
function vs(e, t, n) {
	if (t === 0) return {
		initial: 0,
		effective: 0
	};
	let r = n?.meanBaselinePressureBar ?? null;
	if (r === null) return {
		initial: null,
		effective: null
	};
	let i = O(.5 * Math.sqrt(Math.max(0, r)), 3), a = i;
	if (t >= 1 && t <= 9 || t === 13 || t === 14) a += e.roll(3, 6).total * .01;
	else if (t === 10 || t === 15) a *= Math.max(.5, e.d6() - 1);
	else if ([11, 12].includes(t) || t >= 16) {
		let t = e.d6();
		a *= t <= 5 ? t : e.roll(3, 6).total;
	}
	return {
		initial: i,
		effective: O(a, 3)
	};
}
function ys(e) {
	return e < 222 ? "Frozen" : e < 273 ? "Cold" : e <= 303 ? "Temperate" : e <= 353 ? "Hot" : "Boiling";
}
function bs(e, t, n, r, i, a, o) {
	let s = hs(e, t, n, r), c = _s(s, e, i, n, r), l = vs(s, n, a), u = Math.max(e.au, 1e-6), d = Math.max(t.luminositySolar, 0), f = null, p = null, m = null;
	if (l.effective !== null) {
		let e = d * (1 - c) * (1 + l.effective) / u ** 2;
		f = Math.max(3, Math.round(279 * Math.max(0, e) ** .25)), p = f - 273, m = ys(f);
	}
	let h = i?.gravityG ?? 0, g = f !== null && h > 0 && n !== 0 ? O(8.5 * f / (h * 288), 3) : null, _ = f !== null && f > 303 && n >= 2 && n <= 15, v = [];
	return v.push("Mean temperature uses the WBH luminosity/albedo/greenhouse equation at mean baseline altitude."), v.push("The luminosity supplied by system generation is used; hierarchy-aware generation aggregates all stellar components interior to the world orbit when required by WBH."), l.effective === null && v.push("Mean temperature is unresolved because the atmosphere has no resolved mean pressure; no greenhouse factor is invented."), _ && v.push("WBH optional runaway-greenhouse check is eligible at mean temperature above 303K. It is not automatically applied because this optional rule can change the established Atmosphere and Hydrographics codes."), v.push("High/low temperature extremes are finalized later after rotation, axial tilt, tidal-lock state and post-lock eccentricity are known."), {
		albedo: c,
		initialGreenhouseFactor: l.initial,
		greenhouseFactor: l.effective,
		luminositySolarUsed: d,
		distanceAuUsed: e.au,
		meanTemperatureK: f,
		meanTemperatureC: p,
		temperatureClass: m,
		temperatureCorrectedScaleHeightKm: g,
		runawayGreenhouseEligible: _,
		runawayGreenhouseApplied: !1,
		generationNotes: v
	};
}
//#endregion
//#region src/rules/worlds/wbhGasGiantDetails.ts
var xs = 12742;
function Ss(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Cs(e, t) {
	return t.primaryStar ? t.primaryStar : e.orbitClass === "Primary" ? e : void 0;
}
function ws(e, t, n, r = "wbh-gas-giant-v1") {
	let i = Cs(t, n);
	return new S(Ss([
		r,
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		i?.designation ?? "primary-unknown",
		i?.spectralType ?? "unknown",
		i?.luminosityClass ?? "unknown",
		n.systemSpread ?? "unknown"
	].join("|")));
}
function Ts(e, t) {
	let n = 0, r = [];
	return e ? (e.spectralType === "BD" || e.spectralType === "M" && e.luminosityClass === "V" || e.luminosityClass === "VI") && (--n, r.push("WBH gas-giant category DM-1 applied for a brown dwarf, M-class V, or Class VI primary star.")) : r.push("System primary-star context was unavailable; the WBH primary-star gas-giant category DM was not inferred from the secondary star being orbited."), t !== void 0 && t < .1 ? (--n, r.push("WBH gas-giant category DM-1 applied because system spread is below 0.1.")) : t === void 0 && r.push("System spread was unavailable to the gas-giant sizing procedure; the WBH spread <0.1 DM could not be evaluated."), {
		dm: n,
		notes: r
	};
}
function Es(e, t) {
	let n = e.d6() + t;
	return n <= 2 ? {
		category: "Small",
		code: "S",
		roll: n
	} : n <= 4 ? {
		category: "Medium",
		code: "M",
		roll: n
	} : {
		category: "Large",
		code: "L",
		roll: n
	};
}
function Ds(e) {
	return e === "Small" ? "S" : e === "Medium" ? "M" : "L";
}
function Os(e) {
	return {
		diameterTerra: e.die(3) + e.die(3),
		massTerra: 5 * (e.d6() + 1),
		adjusted: !1,
		notes: []
	};
}
function ks(e) {
	return {
		diameterTerra: e.d6() + 6,
		massTerra: 20 * e.roll(3, 6, -1).total,
		adjusted: !1,
		notes: ["WBH Medium row prints a 6–12 Terra-diameter range but specifies 1D+6; TSG follows the explicit formula, producing 7–12."]
	};
}
function As(e) {
	let t = e.roll(2, 6, 6).total, n = e.die(3), r = e.roll(3, 6).total, i = n * 50 * (r + 4), a = i, o = !1, s = [];
	return i >= 3e3 && (a = 4e3 - e.roll(2, 6, -2).total * 200, o = !0, s.push(`WBH high-mass Large gas-giant rule replaced initial ${i} Terra masses with ${a}.`)), s.push("The WBH high-mass footnote is keyed to an initial mass of at least 3,000 Terra masses; TSG tests the computed initial mass rather than inferring the trigger only from the parenthetical 3D example."), {
		diameterTerra: t,
		massTerra: a,
		adjusted: o,
		notes: s
	};
}
function js(e, t) {
	return t === "Small" ? Os(e) : t === "Medium" ? ks(e) : As(e);
}
function Ms(e, n, r, i, a) {
	let o = Ds(e);
	return {
		method: "WBH Gas Giant Sizing",
		category: e,
		categoryCode: o,
		categoryRoll: n,
		categoryDm: r,
		diameterTerra: i.diameterTerra,
		diameterKm: i.diameterTerra * xs,
		massTerra: i.massTerra,
		massAdjustedByHighMassRule: i.adjusted,
		profile: `G${o}${t(i.diameterTerra)}`,
		generationNotes: a
	};
}
function Ns(e, t, n = {}) {
	let r = Cs(t, n), i = ws(e, t, n), a = Ts(r, n.systemSpread), o = Es(i, a.dm), s = js(i, o.category);
	return Ms(o.category, o.roll, a.dm, s, [
		...a.notes,
		...s.notes,
		"Gas-giant mass variance is optional in WBH and is not applied automatically."
	]);
}
function Ps(e, t, n, r, i = {}) {
	let a = ws(e, t, i, `wbh-gas-giant-moon-${n.toLowerCase()}-v1`), o = js(a, n), s = 1;
	for (; o.diameterTerra >= r && s < 64;) o = js(a, n), s += 1;
	if (o.diameterTerra >= r) throw Error(`Unable to generate a ${n} gas-giant moon smaller than parent diameter ${r} Terra.`);
	return Ms(n, 0, 0, o, [
		...o.notes,
		`Gas-giant moon category ${n} was fixed by the WBH Gas Giant Special Moon Sizing table rather than a gas-giant category roll.`,
		`Moon diameter was constrained to be smaller than its parent gas giant (${r} Terra diameters); resolved after ${s} sizing attempt${s === 1 ? "" : "s"}.`,
		"Gas-giant mass variance is optional in WBH and is not applied automatically."
	]);
}
//#endregion
//#region src/rules/worlds/wbhUnusualAtmosphereDetails.ts
var Fs = {
	1: {
		code: "1",
		subtype: "Dense, Extreme",
		atmosphericConditions: "Density between 10 and 100 bar, possibly with free oxygen.",
		minimumPressureBar: 10,
		maximumPressureBar: 100
	},
	2: {
		code: "2",
		subtype: "Dense, Very Extreme",
		atmosphericConditions: "Density between 100 and 1,000 bar, possibly with free oxygen.",
		minimumPressureBar: 100,
		maximumPressureBar: 1e3
	},
	3: {
		code: "3",
		subtype: "Dense, Crushing",
		atmosphericConditions: "Density above 1,000 bar; surface may be unreachable or indistinct.",
		minimumPressureBar: 1e3,
		pressureUnbounded: !0
	},
	4: {
		code: "4",
		subtype: "Ellipsoid",
		atmosphericConditions: "Tidal forces or very fast rotation elongate one axis; pressure may range from near vacuum to very dense and some atmospheric bands may be habitable."
	},
	5: {
		code: "5",
		subtype: "High Radiation",
		atmosphericConditions: "Internal or external factors produce constant high radiation and may cause unusual gases or lethal emanations."
	},
	6: {
		code: "6",
		subtype: "Layered",
		atmosphericConditions: "Different altitudes have different gas compositions; requires gravity above 1.2g."
	},
	7: {
		code: "7",
		subtype: "Panthalassic",
		atmosphericConditions: "A world ocean hundreds of kilometres deep covers the world; pressure is at least standard and often very or extremely dense.",
		minimumPressureBar: 1,
		pressureUnbounded: !0
	},
	8: {
		code: "8",
		subtype: "Steam",
		atmosphericConditions: "Water vapour merges with oceans at very dense or greater pressure.",
		minimumPressureBar: 2.5,
		pressureUnbounded: !0
	},
	9: {
		code: "9",
		subtype: "Variable Pressure",
		atmosphericConditions: "Tides or storms cause large variations in atmospheric pressure."
	},
	A: {
		code: "A",
		subtype: "Variable Composition",
		atmosphericConditions: "Composition varies with seasons, lifeform lifecycles or another factor."
	},
	F: {
		code: "F",
		subtype: "Other",
		atmosphericConditions: "Something else entirely; definition is left to the Referee."
	}
};
function Is(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Ls(e, t, n) {
	return new S(Is([
		"wbh-unusual-atmosphere-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		n
	].join("|")));
}
function Rs(e) {
	return e.die(2) * 10 + e.d6();
}
function zs(e) {
	switch (Rs(e)) {
		case 11: return "1";
		case 12: return "2";
		case 13: return "3";
		case 14: return "4";
		case 15: return "5";
		case 16: return "6";
		case 21: return "7";
		case 22: return "8";
		case 23: return "9";
		case 24: return "A";
		case 25: return "COMBINATION";
		default: return "F";
	}
}
function Bs(e, t, n) {
	return e === "6" ? (t?.gravityG ?? 0) > 1.2 : e === "7" ? n >= 10 : e !== "8" || n >= 5;
}
function Vs(e, t, n) {
	let r = Fs[e], i = [];
	return e === "6" && i.push(`WBH prerequisite satisfied: gravity ${(t?.gravityG ?? 0).toFixed(3)}g is above 1.2g.`), e === "7" && (i.push("WBH prerequisite satisfied: Hydrographics is A (10)."), i.push("Subtype establishes a minimum atmospheric pressure of 1.0 bar; WBH provides no canonical upper bound for this subtype.")), e === "8" && (i.push("WBH prerequisite satisfied: Hydrographics is 5 or greater."), i.push("Subtype establishes a minimum atmospheric pressure of 2.5 bar; WBH provides no canonical upper bound for this subtype.")), e === "F" && i.push("WBH leaves Other entirely to Referee definition; no additional condition is invented."), {
		code: e,
		subtype: r.subtype,
		atmosphericConditions: r.atmosphericConditions,
		minimumPressureBar: r.minimumPressureBar ?? null,
		maximumPressureBar: r.maximumPressureBar ?? null,
		pressureUnbounded: !!r.pressureUnbounded,
		prerequisiteNotes: i
	};
}
function Hs(e, t, n, r = /* @__PURE__ */ new Set()) {
	for (let i = 0; i < 64; i += 1) {
		let i = zs(e);
		if (i !== "COMBINATION" && !r.has(i) && Bs(i, t, n)) return i;
	}
	return "F";
}
function Us(e, t) {
	let n = /* @__PURE__ */ new Set([
		"1",
		"2",
		"3"
	]);
	return !!(n.has(e) && n.has(t) || e === "F" || t === "F");
}
function Ws(e, t, n) {
	let r = [];
	for (let i = 0; i < 64; i += 1) {
		let i = zs(e);
		if (i === "COMBINATION") {
			let i = Hs(e, t, n, /* @__PURE__ */ new Set(["F"])), a = Hs(e, t, n, /* @__PURE__ */ new Set([i, "F"]));
			for (let r = 0; r < 32 && Us(i, a); r += 1) a = Hs(e, t, n, /* @__PURE__ */ new Set([i, "F"]));
			return Us(i, a) ? (r.push("WBH Combination could not produce two compatible automated results; resolved as Other for Referee definition."), {
				codes: ["F"],
				combination: !1,
				notes: r
			}) : (r.push("WBH Combination result resolved as two independently rolled, prerequisite-valid, compatible subtypes."), {
				codes: [i, a],
				combination: !0,
				notes: r
			});
		}
		if (Bs(i, t, n)) return {
			codes: [i],
			combination: !1,
			notes: r
		};
		r.push(`WBH subtype ${i} was rerolled because its world prerequisite was not satisfied; established world values were preserved.`);
	}
	return r.push("Unusual subtype reroll limit reached; resolved as Other for Referee definition."), {
		codes: ["F"],
		combination: !1,
		notes: r
	};
}
function Gs(e, t) {
	let n = t.filter((e) => e.minimumPressureBar !== null && e.maximumPressureBar !== null);
	if (n.length === 1) {
		let t = n[0].minimumPressureBar, r = n[0].maximumPressureBar, i = r - t, a = ((e.d6() - 1) * 5 + (e.d6() - 1)) / 30;
		return {
			pressureRangeBar: {
				minimumBar: t,
				maximumBar: r
			},
			pressureSpanBar: i,
			meanBaselinePressureBar: O(t + i * a, 3)
		};
	}
	return {
		pressureRangeBar: null,
		pressureSpanBar: null,
		meanBaselinePressureBar: null
	};
}
function Ks(e, t, n, r) {
	let i = Ls(e, t, r), a = Ws(i, n, r), o = a.codes.map((e) => Vs(e, n, r)), s = Gs(i, o), c = [...a.notes];
	if (o.some((e) => e.pressureUnbounded)) {
		let e = Math.max(...o.map((e) => e.minimumPressureBar ?? 0));
		c.push(`WBH specifies an open-ended pressure condition with a minimum of ${e} bar; no mean or maximum pressure is invented.`);
	}
	return o.some((e) => e.code === "4") && c.push("Ellipsoid pressure distribution depends on tidal forces or rapid rotation; detailed latitude/band pressures await rotation/tidal prerequisites."), o.some((e) => e.code === "5") && c.push("High Radiation source/effect detail remains a later radiation-hazard integration."), o.some((e) => e.code === "6") && c.push("Layered gas composition by altitude is represented structurally; layer-by-layer chemistry is not invented by this phase."), o.some((e) => e.code === "9") && c.push("Variable Pressure amplitude/cycle depends on later tides, storms and rotation detail."), o.some((e) => e.code === "A") && c.push("Variable Composition timing/cause depends on later seasonal or native-life detail."), {
		detail: {
			method: "WBH D26 subtype table",
			subtypes: o,
			combination: a.combination,
			profile: o.map((e) => e.code).join("+"),
			generationNotes: c
		},
		...s
	};
}
//#endregion
//#region src/rules/worlds/wbhHydrographicsCode.ts
function qs(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Js(e) {
	return e >= 1.1 ? 2 : e >= 1 ? 3 : e >= .5 ? 4 : e >= .2 ? 5 : e >= .1 ? 6 : e >= 0 ? 7 : e >= -.1 ? 8 : e >= -.2 ? 9 : e >= -.5 ? 10 : e >= -1 ? 11 : 12;
}
function Ys(e) {
	return e <= 1 ? 0 : e <= 3 ? -2 : e === 4 || e === 5 || e === 14 ? -1 : e === 6 || e === 7 ? 0 : e === 8 || e === 9 ? 1 : e === 10 || e === 13 || e === 15 ? 2 : e === 11 || e === 12 ? 6 : 0;
}
function Xs(e) {
	return e <= 2 ? "Frozen" : e <= 4 ? "Cold" : e <= 9 ? "Temperate" : e <= 11 ? "Hot" : "Boiling";
}
function Zs(e) {
	return e <= 1 || e >= 10 ? -4 : 0;
}
function Qs(e) {
	return e === "Hot" ? -2 : e === "Boiling" ? -6 : 0;
}
function $s(e, t, n, r) {
	return r === 10 && Ks(e, t, n, r).detail.subtypes.some((e) => e.code === "7");
}
function ec(e, t) {
	let { world: n, star: r, sizeCode: i, atmosphereCode: a, sizeDetails: o = null } = t, s = Js(n.hzDeviation), c = Ys(a), l = s + c, u = Xs(l), d = Zs(a), f = Qs(u);
	if (i <= 1) return {
		method: "WBH hydrographics code",
		baseRoll: null,
		atmosphereCode: a,
		atmosphereDm: d,
		provisionalTemperatureSource: "HZCO deviation proxy",
		provisionalTemperatureHzcoDeviation: n.hzDeviation,
		provisionalTemperatureRawRoll: s,
		provisionalTemperatureAtmosphereDm: c,
		provisionalTemperatureModifiedRoll: l,
		provisionalTemperatureClass: u,
		temperatureDm: 0,
		temperatureDmSuppressed: f !== 0,
		temperatureDmSuppressionReason: "Size 0-1 worlds have Hydrographics 0 by WBH rule.",
		unclampedTotal: 0,
		hydrographicsCode: 0,
		generationNotes: ["WBH forces Hydrographics 0 for Size 0-1 worlds; no Hydrographics roll is made.", `HZCO deviation ${n.hzDeviation} maps to provisional raw temperature roll ${s}; Atmosphere DM ${c >= 0 ? "+" : ""}${c} gives ${l} (${u}).`]
	};
	let p = e.roll(2, 6).total, m = qs(p - 7 + a + d, 0, 10), h = f, g = null;
	a === 13 && h !== 0 ? (h = 0, g = "WBH ignores Hot/Boiling Hydrographics temperature DMs for very dense Atmosphere D.") : a === 15 && h !== 0 && $s(n, r, o, m) && (h = 0, g = "WBH ignores Hot/Boiling Hydrographics temperature DMs for panthalassic subtype 7 of Atmosphere F.");
	let _ = p - 7 + a + d + h, v = qs(_, 0, 10), y = [
		`WBH Hydrographics uses 2D (${p}) - 7 + Atmosphere ${a.toString(16).toUpperCase()}${d ? ` ${d >= 0 ? "+" : ""}${d}` : ""}${h ? ` ${h >= 0 ? "+" : ""}${h} temperature DM` : ""}, clamped to 0-A.`,
		`HZCO deviation ${n.hzDeviation} maps to provisional raw temperature roll ${s}; Atmosphere temperature DM ${c >= 0 ? "+" : ""}${c} gives modified roll ${l} (${u}).`,
		"The provisional temperature is the WBH Hydrographics input; later detailed climate does not reroll or retroactively alter Hydrographics."
	];
	return g && y.push(g), {
		method: "WBH hydrographics code",
		baseRoll: p,
		atmosphereCode: a,
		atmosphereDm: d,
		provisionalTemperatureSource: "HZCO deviation proxy",
		provisionalTemperatureHzcoDeviation: n.hzDeviation,
		provisionalTemperatureRawRoll: s,
		provisionalTemperatureAtmosphereDm: c,
		provisionalTemperatureModifiedRoll: l,
		provisionalTemperatureClass: u,
		temperatureDm: h,
		temperatureDmSuppressed: f !== h,
		temperatureDmSuppressionReason: g,
		unclampedTotal: _,
		hydrographicsCode: v,
		generationNotes: y
	};
}
//#endregion
//#region src/rules/worlds/wbhOrdinaryAtmosphereGasMix.ts
var tc = /* @__PURE__ */ new Set([
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	13,
	14
]);
function nc(e, t, n) {
	return {
		name: e,
		code: t,
		percentage: O(n, 1),
		escapeValue: null,
		retainedLongTerm: null,
		taint: !1
	};
}
function rc(e, t) {
	if (!t || !tc.has(e) || t.oxygenFraction === null) return null;
	let n = O(t.oxygenFraction * 100, 1), r = O(Math.max(0, 100 - n), 1), i = [];
	return r > 0 && i.push(nc("Nitrogen", "N2", r)), n > 0 && i.push(nc("Oxygen", "O2", n)), {
		method: "WBH temperature/type quick table",
		temperatureBand: "Ordinary N2/O2 atmosphere",
		retentionThreshold: null,
		components: i,
		unallocatedPercent: 0,
		profile: i.map((e) => `${e.code}-${Math.round(e.percentage).toString().padStart(2, "0")}`).join(":"),
		generationNotes: [
			"Source: WBH ordinary nitrogen/oxygen atmosphere model (wbh-generated).",
			"Composition reuses the WBH-generated oxygen fraction already present in the ordinary-atmosphere physical model; the remaining atmospheric fraction is nitrogen.",
			"Atmospheric taints remain separate structured hazards and are not converted into invented trace-gas percentages.",
			"No additional random rolls are consumed, so established deterministic world generation is unchanged."
		]
	};
}
//#endregion
//#region src/rules/worlds/wbhPhysicalDetails.ts
var ic = 12742, ac = 11186, oc = 8.5, sc = {
	0: {
		classification: "None",
		minimumBar: 0,
		maximumBar: 9e-4
	},
	1: {
		classification: "Trace",
		minimumBar: .001,
		maximumBar: .09,
		spanBar: .089
	},
	2: {
		classification: "Very Thin, Tainted",
		minimumBar: .1,
		maximumBar: .42,
		spanBar: .32
	},
	3: {
		classification: "Very Thin",
		minimumBar: .1,
		maximumBar: .42,
		spanBar: .32
	},
	4: {
		classification: "Thin, Tainted",
		minimumBar: .43,
		maximumBar: .7,
		spanBar: .27
	},
	5: {
		classification: "Thin",
		minimumBar: .43,
		maximumBar: .7,
		spanBar: .27
	},
	6: {
		classification: "Standard",
		minimumBar: .7,
		maximumBar: 1.49,
		spanBar: .79
	},
	7: {
		classification: "Standard, Tainted",
		minimumBar: .7,
		maximumBar: 1.49,
		spanBar: .79
	},
	8: {
		classification: "Dense",
		minimumBar: 1.5,
		maximumBar: 2.49,
		spanBar: .99
	},
	9: {
		classification: "Dense, Tainted",
		minimumBar: 1.5,
		maximumBar: 2.49,
		spanBar: .99
	},
	10: { classification: "Exotic" },
	11: { classification: "Corrosive" },
	12: { classification: "Insidious" },
	13: {
		classification: "Very Dense",
		minimumBar: 2.5,
		maximumBar: 10,
		spanBar: 7.5
	},
	14: {
		classification: "Low",
		minimumBar: .1,
		maximumBar: .42,
		spanBar: .32
	},
	15: { classification: "Unusual" }
}, cc = {
	"Exotic Ice": [
		.03,
		.06,
		.09,
		.12,
		.15,
		.18,
		.21,
		.24,
		.27,
		.3,
		.33
	],
	"Mostly Ice": [
		.18,
		.21,
		.24,
		.27,
		.3,
		.33,
		.36,
		.39,
		.41,
		.44,
		.47
	],
	"Mostly Rock": [
		.5,
		.53,
		.56,
		.59,
		.62,
		.65,
		.68,
		.71,
		.74,
		.77,
		.8
	],
	"Rock and Metal": [
		.82,
		.85,
		.88,
		.91,
		.94,
		.97,
		1,
		1.03,
		1.06,
		1.09,
		1.12
	],
	"Mostly Metal": [
		1.15,
		1.18,
		1.21,
		1.24,
		1.27,
		1.3,
		1.33,
		1.36,
		1.39,
		1.42,
		1.45
	],
	"Compressed Metal": [
		1.5,
		1.55,
		1.6,
		1.65,
		1.7,
		1.75,
		1.8,
		1.85,
		1.9,
		1.95,
		2
	]
}, lc = [
	{
		max: 2,
		type: "Low Oxygen",
		code: "L"
	},
	{
		max: 3,
		type: "Radioactivity",
		code: "R"
	},
	{
		max: 4,
		type: "Biologic",
		code: "B"
	},
	{
		max: 5,
		type: "Gas Mix",
		code: "G"
	},
	{
		max: 6,
		type: "Particulates",
		code: "P"
	},
	{
		max: 7,
		type: "Gas Mix",
		code: "G"
	},
	{
		max: 8,
		type: "Sulphur Compounds",
		code: "S"
	},
	{
		max: 9,
		type: "Biologic",
		code: "B"
	},
	{
		max: 10,
		type: "Particulates",
		code: "P",
		extra: !0
	},
	{
		max: 11,
		type: "Radioactivity",
		code: "R"
	},
	{
		max: Infinity,
		type: "High Oxygen",
		code: "H"
	}
];
function uc(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function dc(e, t, n, r, i) {
	return new S(uc([
		"wbh-physical-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		t.ageGyr,
		n,
		r,
		i
	].join("|")));
}
function fc(e, t) {
	if (t <= 0) return 0;
	let n = 800 + (t - 1) * 1600, r = 0;
	do
		r = [
			0,
			600,
			1200
		][e.die(3) - 1] + (e.d6() - 1) * 100;
	while (r >= 1600);
	return n + r + e.d10ZeroToNine() * 10 + e.d10ZeroToNine();
}
function pc(e, t, n) {
	let r = n <= 4 ? -1 : n >= 10 ? 3 : +(n >= 6);
	return e.hzDeviation <= 0 ? r += 1 : r -= 1 + Math.floor(e.hzDeviation), t.ageGyr > 10 && --r, r;
}
function mc(e, t, n, r) {
	let i = e.roll(2, 6, pc(t, n, r)).total;
	return i <= -4 ? "Exotic Ice" : i <= 2 ? "Mostly Ice" : i <= 6 ? "Mostly Rock" : i <= 11 ? "Rock and Metal" : i <= 14 ? "Mostly Metal" : "Compressed Metal";
}
function hc(e, t) {
	return cc[t][e.roll(2, 6).total - 2];
}
function gc(e, t, n, r) {
	if (r <= 0) return null;
	let i = fc(e, r), a = mc(e, t, n, r), o = hc(e, a), s = i / ic, c = o * s, l = o * s ** 3;
	return {
		diameterKm: i,
		composition: a,
		densityTerra: o,
		gravityG: O(c, 3),
		massTerra: O(l, 3),
		escapeVelocityKps: O(Math.sqrt(l / s) * ac / 1e3, 3)
	};
}
function _c(e) {
	return ((e.d6() - 1) * 5 + (e.d6() - 1)) / 30;
}
function vc(e) {
	return e >= 2 && e <= 9 || e === 13 || e === 14;
}
function yc(e, t) {
	let n = +(t.ageGyr > 4), r = (e.d6() + n) / 20 + e.roll(2, 6, -7).total / 100;
	return r <= 0 && (r = e.d6() * .01), O(Math.max(0, Math.min(.4, r)), 3);
}
function bc(e) {
	return e === null ? "not-applicable" : e < .1 ? "low" : e > .5 ? "high" : "within-human-range";
}
function xc(e, t) {
	let n = t === "L" || t === "H" ? 4 : 0, r = e.roll(2, 6, n).total, i = r <= 4 ? 1 : Math.min(9, r - 3);
	return {
		code: i,
		label: [
			"",
			"Trivial irritant",
			"Surmountable irritant",
			"Minor irritant",
			"Major irritant",
			"Serious irritant",
			"Hazardous irritant",
			"Long term lethal",
			"Inevitably lethal",
			"Rapidly lethal"
		][i]
	};
}
function Sc(e, t, n) {
	let r = 0;
	(t === "L" || t === "H") && (r = n >= 8 ? 6 : 4);
	let i = e.roll(2, 6, r).total, a = i <= 2 ? 2 : Math.min(9, i);
	return {
		code: a,
		label: {
			2: "Occasional and brief",
			3: "Occasional and lingering",
			4: "Irregular",
			5: "Fluctuating",
			6: "Varying",
			7: "Varying",
			8: "Varying",
			9: "Constant"
		}[a]
	};
}
function Cc(e, t) {
	let n = t === 4 ? -2 : t === 9 ? 2 : 0, r = e.roll(2, 6, n).total, i = lc.find((e) => r <= e.max);
	![
		4,
		5,
		6,
		7,
		8,
		9
	].includes(t) && (i.code === "L" || i.code === "H") && (i = {
		max: i.max,
		type: "Gas Mix",
		code: "G",
		extra: i.extra
	});
	let a = xc(e, i.code), o = Sc(e, i.code, a.code);
	return {
		detail: {
			type: i.type,
			code: i.code,
			severityCode: a.code,
			severity: a.label,
			persistenceCode: o.code,
			persistence: o.label,
			profile: `${i.code}.${a.code}.${o.code}`
		},
		extra: !!i.extra
	};
}
function wc(e, t) {
	let n = t === "low" ? "L" : "H", r = xc(e, n), i = Sc(e, n, r.code);
	return {
		type: t === "low" ? "Low Oxygen" : "High Oxygen",
		code: n,
		severityCode: r.code,
		severity: r.label,
		persistenceCode: i.code,
		persistence: i.label,
		profile: `${n}.${r.code}.${i.code}`
	};
}
function Tc(e, t, n) {
	if (![
		2,
		4,
		7,
		9
	].includes(t)) return [];
	let r = [];
	if ([
		4,
		7,
		9
	].includes(t) && (n === "low" || n === "high")) {
		r.push(wc(e, n));
		let i = Cc(e, t);
		return i.extra && (r.push(i.detail), Cc(e, t).extra && r.push(Cc(e, t).detail)), r.slice(0, 3);
	}
	let i = Cc(e, t);
	if (r.push(i.detail), i.extra && r.length < 3) {
		let n = Cc(e, t);
		r.push(n.detail), n.extra && r.length < 3 && r.push(Cc(e, t).detail);
	}
	return r.slice(0, 3);
}
function A(e, t, n, r, i, a) {
	return {
		subtypeCode: e,
		description: t,
		irritant: n,
		pressureRangeBar: {
			minimumBar: r,
			maximumBar: i
		},
		pressureSpanBar: a,
		minimumPressureBar: r,
		pressureUnbounded: !1
	};
}
function Ec(e, t, n = !1) {
	return {
		subtypeCode: e,
		description: t,
		irritant: n,
		pressureRangeBar: null,
		pressureSpanBar: null,
		minimumPressureBar: 10,
		pressureUnbounded: !0
	};
}
function Dc(e, t, n) {
	let r = n >= 2 && n <= 4 ? -2 : 0;
	t.hzDeviation < -1 && (r -= 2), t.hzDeviation > 2 && (r += 2);
	let i = e.roll(2, 6, r).total;
	return i <= 2 ? A("2", "Very Thin, Irritant", !0, .1, .42, .32) : i === 3 ? A("3", "Very Thin", !1, .1, .42, .32) : i === 4 ? A("4", "Thin, Irritant", !0, .43, .7, .27) : i === 5 ? A("5", "Thin", !1, .43, .7, .27) : i === 6 ? A("6", "Standard", !1, .7, 1.49, .79) : i === 7 ? A("7", "Standard, Irritant", !0, .7, 1.49, .79) : i === 8 ? A("8", "Dense", !1, 1.5, 2.49, .99) : i === 9 ? A("9", "Dense, Irritant", !0, 1.5, 2.49, .99) : i === 10 || i === 13 ? A("A", "Very Dense", !1, 2.5, 10, 7.5) : i === 11 || i >= 14 ? A("B", "Very Dense, Irritant", !0, 2.5, 10, 7.5) : A("C", "Very Dense, Occasionally Corrosive", !1, 2.5, 10, 7.5);
}
function Oc(e, t, n, r) {
	let i = 0;
	n >= 2 && n <= 4 && (i -= 3), n >= 8 && (i += 2), t.hzDeviation < -1 && (i += 4), t.hzDeviation > 2 && (i -= 2), r === 12 && (i += 2);
	let a = e.roll(2, 6, i).total;
	return a <= 1 ? A("1", "Very Thin, Temperature 50K or less", !1, .1, .42, .32) : a === 2 ? A("2", "Very Thin, Irritant", !0, .1, .42, .32) : a === 3 ? A("3", "Very Thin", !1, .1, .42, .32) : a === 4 ? A("4", "Thin, Irritant", !0, .43, .7, .27) : a === 5 ? A("5", "Thin", !1, .43, .7, .27) : a === 6 ? A("6", "Standard", !1, .7, 1.49, .79) : a === 7 ? A("7", "Standard, Irritant", !0, .7, 1.49, .79) : a === 8 ? A("8", "Dense", !1, 1.5, 2.49, .99) : a === 9 ? A("9", "Dense, Irritant", !0, 1.5, 2.49, .99) : a === 10 ? A("A", "Very Dense", !1, 2.5, 10, 7.5) : a === 11 ? A("B", "Very Dense, Irritant", !0, 2.5, 10, 7.5) : a === 12 ? Ec("C", "Extremely Dense") : a === 13 ? Ec("D", "Extremely Dense, Temperature 500K+") : Ec("E", "Extremely Dense, Temperature 500K+, Irritant", !0);
}
function kc(e, t) {
	let n = e.roll(2, 6, t ? 2 : 0).total;
	return n <= 4 ? {
		type: "Biologic",
		code: "B",
		inherent: !1
	} : n === 5 || n === 11 ? {
		type: "Radioactivity",
		code: "R",
		inherent: !1
	} : n === 6 || n === 7 || n === 9 ? {
		type: "Gas Mix",
		code: "G",
		inherent: !1
	} : {
		type: "Temperature",
		code: "T",
		inherent: !1
	};
}
function Ac(e, t, n) {
	if (t !== 12 || !n) return [];
	let r = [
		"C",
		"D",
		"E"
	].includes(n.subtypeCode);
	return n.subtypeCode === "D" || n.subtypeCode === "E" ? [{
		type: "Temperature",
		code: "T",
		inherent: !0
	}, kc(e, !0)] : [kc(e, r)];
}
function jc(e, t, n, r, i, a) {
	let o = e.toString(16).toUpperCase(), s = r.length ? ` ${r.map((e) => e.profile).join(",")}` : "";
	if (a && e === 10) return `A-St${a.subtypeCode}${t === null ? "" : `:${t.toFixed(3)}`}${s}`;
	if (a && e === 11) return `B-St${a.subtypeCode}${t === null ? "" : `:${t.toFixed(3)}`}${s}`;
	if (a && e === 12) {
		let e = i.find((e) => !e.inherent), n = e ? `.${e.code}` : "";
		return `C-St${a.subtypeCode}${n}${t === null ? "" : `:${t.toFixed(3)}`}${s}`;
	}
	if (t === null) return null;
	let c = n === null ? `${o}-${t.toFixed(3)}` : `${o}-${t.toFixed(3)}-${n.toFixed(3)}`;
	return r.length ? `${c}${s}` : c;
}
function Mc(e, t, n, r) {
	if (e !== 13 || t === null || n === null || r === null) return null;
	let i = Math.max(n / 2, r / .5);
	return i <= 1 ? 0 : O(Math.log(i) * t, 3);
}
function Nc(e, t, n, r) {
	if (e !== 14 || t === null || n === null || r === null || r <= 0) return null;
	if (r >= .1) return 0;
	let i = .1 / r;
	return n * i > 2 ? null : O(Math.log(i) * t, 3);
}
function Pc(e, t, n, r, i, a) {
	let o = sc[r] ?? { classification: `Atmosphere ${r}` }, s = null;
	r === 10 ? s = Dc(e, t, i) : (r === 11 || r === 12) && (s = Oc(e, t, i, r));
	let c = s ? {
		minimumBar: s.pressureRangeBar?.minimumBar,
		maximumBar: s.pressureRangeBar?.maximumBar,
		spanBar: s.pressureSpanBar
	} : o, l = c.minimumBar !== void 0 && c.maximumBar !== void 0 ? {
		minimumBar: c.minimumBar,
		maximumBar: c.maximumBar
	} : null, u = null;
	r === 0 ? u = 0 : c.minimumBar !== void 0 && c.spanBar !== void 0 && c.spanBar !== null && (u = O(c.minimumBar + c.spanBar * _c(e), 3));
	let d = null, f = null, p = null, m = null;
	vc(r) && u !== null && (d = yc(e, n), f = O(u * d, 3), p = O(u - f, 3), a && a.gravityG > 0 && (m = O(oc / a.gravityG, 3)));
	let h = bc(f), g = Tc(e, r, h);
	s?.irritant && g.push(Cc(e, r).detail);
	let _ = Ac(e, r, s), v = [];
	return [
		5,
		6,
		8
	].includes(r) && h !== "within-human-range" && v.push("WBH Referee choice required: nominally breathable atmosphere has oxygen partial pressure outside 0.1-0.5 bar; preserve established Atmosphere code until reviewed."), vc(r) && v.push("Scale height currently uses the WBH temperate baseline 8.5 km / gravity; apply Kelvin temperature refinement when detailed mean temperature is implemented."), r === 10 && v.push("Exotic subtype and pressure are generated; detailed gas composition is deferred until gas-retention/temperature-aware composition is implemented."), (r === 11 || r === 12) && (v.push("Corrosive/Insidious subtype and applicable hazard are generated; detailed gas composition remains deferred until WBH temperature-aware gas-mix procedures are implemented."), v.push("WBH runaway-greenhouse subtype DM is not applied until runaway-greenhouse status is represented as structured source data."), s?.pressureUnbounded && v.push("WBH defines this subtype as 10+ bar with no upper bound; no mean pressure is invented before a bounded pressure procedure is available."), _.some((e) => e.code === "B") && v.push("Insidious biologic hazard implies Biomass Rating at least 1; enforce that constraint when WBH native-life generation is implemented."), _.some((e) => e.code === "R") && v.push("Insidious radioactivity hazard source is recorded; detailed radiation exposure values remain a later hazard-effect integration.")), r === 15 && v.push("Unusual atmosphere subtype remains deferred: WBH outcomes depend on prerequisite-specific conditions such as Panthalassic hydrographics and other world state; no subtype is invented here."), {
		classification: o.classification,
		pressureRangeBar: l,
		pressureSpanBar: c.spanBar ?? null,
		meanBaselinePressureBar: u,
		oxygenFraction: d,
		oxygenPartialPressureBar: f,
		nitrogenPartialPressureBar: p,
		scaleHeightKm: m,
		oxygenSafety: h,
		minimumSafeAltitudeKm: Mc(r, m, p, f),
		safeAltitudeBelowMeanKm: Nc(r, m, p, f),
		taints: g,
		hazards: _,
		specialSubtype: s,
		profile: jc(r, u, f, g, _, s),
		generationNotes: v
	};
}
function Fc(e, t, n, r, i) {
	let a = dc(e, t, n, r, i), o = gc(a, e, t, n);
	return {
		size: o,
		atmosphere: Pc(a, e, t, r, n, o)
	};
}
//#endregion
//#region src/rules/worlds/wbhPlanetoidBeltDetails.ts
function Ic(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Lc(e, t) {
	return t <= 0 ? {
		m: 60 + e.d6() * 5,
		s: e.d6() * 5,
		c: 0
	} : t === 1 ? {
		m: 50 + e.d6() * 5,
		s: 5 + e.d6() * 5,
		c: e.die(3)
	} : t === 2 ? {
		m: 40 + e.d6() * 5,
		s: 15 + e.d6() * 5,
		c: e.d6()
	} : t === 3 ? {
		m: 25 + e.d6() * 5,
		s: 30 + e.d6() * 5,
		c: e.d6()
	} : t === 4 ? {
		m: 15 + e.d6() * 5,
		s: 35 + e.d6() * 5,
		c: 5 + e.d6()
	} : t === 5 ? {
		m: 5 + e.d6() * 5,
		s: 40 + e.d6() * 5,
		c: 5 + e.d6() * 2
	} : t === 6 ? {
		m: e.d6() * 5,
		s: 40 + e.d6() * 5,
		c: e.d6() * 5
	} : t === 7 ? {
		m: 5 + e.d6() * 2,
		s: 35 + e.d6() * 5,
		c: 10 + e.d6() * 5
	} : t === 8 ? {
		m: 5 + e.d6(),
		s: 30 + e.d6() * 5,
		c: 20 + e.d6() * 5
	} : t === 9 ? {
		m: e.d6(),
		s: 15 + e.d6() * 5,
		c: 40 + e.d6() * 5
	} : t === 10 ? {
		m: e.d6(),
		s: 5 + e.d6() * 5,
		c: 50 + e.d6() * 5
	} : t === 11 ? {
		m: e.die(3),
		s: 5 + e.d6() * 2,
		c: 60 + e.d6() * 5
	} : {
		m: 0,
		s: e.d6(),
		c: 70 + e.d6() * 5
	};
}
function Rc(e, t, n) {
	let r = e.m, i = e.s, a = e.c, o = r + i + a - 100;
	if (o > 0) {
		let e = Math.min(r, o);
		r -= e, o -= e, o > 0 && (i = Math.max(0, i - o));
	}
	let s = r + i + a;
	return {
		metallicPercent: r,
		stonyPercent: i,
		carbonaceousPercent: a,
		otherPercent: Math.max(0, 100 - s),
		roll: t,
		orbitDm: n
	};
}
function zc(e, n) {
	let r = new S(Ic(`wbh-planetoid-belt-prereq-v1|${e.id}|${e.orbitNumber}|${e.hzco}|${n.ageGyr}`)), i = e.orbitNumber < e.hzco ? -4 : e.orbitNumber > e.hzco + 2 ? 4 : 0, a = r.roll(2, 6).total + i, o = Rc(Lc(r, a), a, i), s = r.roll(2, 6).total + 2, c = -Math.floor(n.ageGyr / 2), l = Math.floor(o.carbonaceousPercent / 10), u = c + l, d = Math.max(1, s + u), f = r.roll(2, 6).total, p = Math.floor(o.metallicPercent / 10), m = -Math.ceil(o.carbonaceousPercent / 10), h = d + p + m, g = f - 7 + h, _ = Math.max(1, g);
	return {
		method: "WBH planetoid belt characteristics",
		spanOrbitNumber: null,
		spanRoll: null,
		spanDm: null,
		composition: o,
		bulk: d,
		bulkRoll: s,
		bulkDm: {
			systemAge: c,
			carbonaceousComposition: l,
			total: u
		},
		resourceRating: {
			method: "WBH planetoid belt resource rating",
			rating: _,
			code: t(_),
			roll: f,
			dm: {
				bulk: d,
				metallicComposition: p,
				carbonaceousComposition: m,
				total: h
			},
			unclampedTotal: g
		},
		generationNotes: [
			"Composition, bulk and natural Resource Rating generated from WBH asteroid-belt procedures so belts can participate fairly in Final Mainworld Determination.",
			"Belt span and significant Size 1/S bodies remain deferred because they do not affect the four mainworld criteria.",
			"Industrial exploitation is not applied here because Final Mainworld Determination occurs before social characteristics are generated."
		]
	};
}
//#endregion
//#region src/rules/worlds/wbhRotationDetails.ts
var Bc = 8766;
function Vc(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Hc(e, t, n, r) {
	return new S(Vc([
		"wbh-rotation-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		t.ageGyr,
		n ? "gas-giant" : "ordinary",
		r ?? "none"
	].join("|")));
}
function Uc(e) {
	return (e.d6() - 1) * 10 + e.d10ZeroToNine();
}
function Wc(e, t, n) {
	let r = Math.floor(Math.max(0, t) / 2), i = n ? 2 : 4, a = () => e.roll(2, 6, -2).total * i + 2 + e.d6() + r, o = a(), s = 0, c = 0;
	for (; o >= 40 && c < 16 && (c += 1, !(e.d6() < 5));) o += a(), s += 1;
	return {
		hours: o,
		additions: s
	};
}
function Gc(e) {
	let t = e.roll(2, 6).total, n, r = !1, i = [];
	if (t <= 4) n = (e.d6() - 1) / 50;
	else if (t === 5) n = e.d6() / 5;
	else if (t === 6) n = e.d6();
	else if (t === 7) n = 6 + e.d6();
	else if (t <= 9) n = 5 + e.d6() * 5;
	else {
		r = !0;
		let t = e.d6();
		n = t <= 2 ? 10 + e.d6() * 10 : t === 3 ? 30 + e.d6() * 10 : t === 4 ? 90 + e.d6() * e.d6() : t === 5 ? 180 - e.d6() * e.d6() : 120 + e.d6() * 10;
		let a = Uc(e), o = Uc(e);
		n += a / 60 + o / 3600, i.push("WBH linear minute/second variance applied to an Extreme Axial Tilt result.");
	}
	for (; n > 180;) n = 360 - n;
	return {
		degrees: O(Math.max(0, Math.min(180, n)), 4),
		extreme: r,
		notes: i
	};
}
function Kc(e, t, n) {
	let r = e / (n ? -t : t) - 1;
	return Math.abs(r) < 1e-9 ? {
		solarDaysPerYear: 0,
		solarDayHours: null,
		infinite: !0
	} : {
		solarDaysPerYear: O(r, 6),
		solarDayHours: O(Math.abs(e / r), 6),
		infinite: !1
	};
}
function qc(e, t, n) {
	let r = Hc(e, t, n.isGasGiant ?? !1, n.sizeCode ?? null), i = (n.isGasGiant ?? !1) || n.sizeCode === 0, a = Wc(r, t.ageGyr, i), o = Uc(r), s = Uc(r), c = O(a.hours + o / 60 + s / 3600, 6), l = Gc(r), u = l.degrees > 90 ? "Retrograde" : "Prograde", d = Kc(Math.max(0, n.orbitalPeriodYears) * Bc, c, u === "Retrograde"), f = [
		`WBH basic rotation uses ${i ? "×2" : "×4"} because this ${i ? "is a gas giant or Size 0/S body" : "is not a gas giant or Size 0/S body"}.`,
		`System age ${O(t.ageGyr, 3)} Gyr contributes DM+${Math.floor(Math.max(0, t.ageGyr) / 2)}.`,
		...a.additions > 0 ? [`WBH 40+ hour extension added ${a.additions} additional basic rotation determination(s).`] : [],
		...l.notes,
		"WBH solar-day convention: solarDaysPerYear stores the signed equation result; retrograde rotation uses a negative sidereal period. The sign describes the relative solar-cycle direction, not a negative physical day count, while solarDayHours is stored as a positive duration.",
		"Axial tilt is provisional until WBH tidal-lock effects are evaluated."
	];
	return e.id.includes(".") && f.push("For this subordinate moon, the solar-day calculation uses the inherited parent-planet stellar year, following the WBH approximation."), d.infinite && f.push("Sidereal period equals the local year closely enough that the solar day is undefined/infinite."), {
		method: "WBH basic rotation and axial tilt",
		baseSiderealHours: O(a.hours, 6),
		siderealHours: c,
		precisionMinutes: o,
		precisionSeconds: s,
		solarDayHours: d.solarDayHours,
		solarDaysPerYear: d.solarDaysPerYear,
		solarDayInfinite: d.infinite,
		axialTiltDegrees: l.degrees,
		axialTiltExtreme: l.extreme,
		direction: u,
		tidalLockStatus: "unresolved",
		generationNotes: f
	};
}
//#endregion
//#region src/rules/worlds/wbhSatelliteSystem.ts
var Jc = 149597870.9, Yc = 3e-6, Xc = 1.5;
function Zc(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Qc(e, t, n, r) {
	return r ? new S(Zc([
		"wbh-gas-giant-satellites-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		e.eccentricity,
		t.designation,
		t.massSolar,
		r.categoryCode,
		r.diameterTerra,
		r.massTerra
	].join("|"))) : new S(Zc([
		"wbh-satellites-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		e.eccentricity,
		t.designation,
		t.massSolar,
		n
	].join("|")));
}
function $c(e, t, n, r) {
	return new S(Zc([
		"wbh-moon-physical-v1",
		e.id,
		n,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		t.ageGyr,
		r
	].join("|")));
}
function el(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function tl(e, t, n, r) {
	let i, a;
	r ? r.category === "Small" ? (i = 3, a = -7) : (i = 4, a = -6) : t <= 2 ? (i = 1, a = -5) : t <= 9 ? (i = 2, a = -8) : (i = 2, a = -6);
	let o = n < 1 ? -i : 0;
	return e.roll(i, 6, a + o).total;
}
function nl(e, t) {
	let n = e.d6();
	if (n <= 3) return "S";
	if (n <= 5) {
		let t = e.die(3) - 1;
		return t === 0 ? "R" : t;
	}
	let r = t - 1 - e.d6();
	if (r < 0) return "S";
	if (r === 0) return "R";
	if (r === t - 2) {
		let n = e.roll(2, 6).total;
		if (n === 2) return t - 1;
		if (n === 12) return t;
	}
	return r;
}
function rl(e, t) {
	for (let n = 0; n < 64; n += 1) {
		let n = e.d6(), r;
		if (r = n <= 3 ? e.d6() : n <= 5 ? e.roll(2, 6, -2).total : e.roll(2, 6, 4).total, r === 0) return "R";
		if (r < 16) return { sizeCode: r };
		if (t.category === "Small") continue;
		let i = "Small";
		return t.category === "Large" && e.roll(2, 6).total === 12 && (i = "Medium"), {
			sizeCode: 16,
			gasGiantCategory: i
		};
	}
	return { sizeCode: 15 };
}
function il(e, t) {
	let n = e.d6();
	if (n <= 3) return { sizeCode: "S" };
	if (n <= 5) {
		let t = e.die(3) - 1;
		return t === 0 ? "R" : { sizeCode: t };
	}
	return rl(e, t);
}
function al(e, t) {
	if (t === "S") return {
		numericSizeCode: 0,
		atmosphereCode: 0,
		hydrographicsCode: 0
	};
	let n = t;
	if (n <= 1) return {
		numericSizeCode: n,
		atmosphereCode: 0,
		hydrographicsCode: 0
	};
	let r = el(e.roll(2, 6, -7 + n).total, 0, 15), i = 0;
	return (r <= 1 || r >= 10) && (i -= 4), {
		numericSizeCode: n,
		atmosphereCode: r,
		hydrographicsCode: el(e.roll(2, 6, -7 + r + i).total, 0, 10)
	};
}
function ol(e, t, n) {
	return {
		id: `${e.id}.${t}`,
		aroundStarId: e.aroundStarId,
		aroundDesignation: e.aroundDesignation,
		sequence: e.sequence,
		orbitNumber: e.orbitNumber,
		au: e.au,
		eccentricity: e.eccentricity,
		hzco: e.hzco,
		hzDeviation: e.hzDeviation,
		worldKind: "Terrestrial Planet",
		generationNotes: [`Significant moon ${t} orbits parent world ${e.id}; stellar-distance values inherit the parent planet orbit.`, `Moon planet-centric eccentricity ${n} is stored on the subordinate moon record.`]
	};
}
function sl(e, t, n) {
	let r = n.massTerra * Yc, i = Math.max(t.massSolar, 1e-6), a = e.au * (1 - e.eccentricity) * Math.cbrt(r / (3 * i)), o = a * Jc / n.diameterKm;
	return {
		au: O(a, 6),
		pd: O(o, 3),
		moonLimitPd: O(o / 2, 3)
	};
}
function cl(e, t) {
	let n = Math.max(0, Math.floor(e) - 2);
	return n <= 200 ? n : Math.min(n, 200 + t);
}
function ll(e, t) {
	return t ? 6 : e === "Inner" ? -1 : e === "Middle" ? 1 : 4;
}
function ul(e, t) {
	let n = e.d6() + +(t < 60), r, i;
	return n <= 3 ? (r = "Inner", i = e.roll(2, 6, -2).total * t / 60 + 2) : n <= 5 ? (r = "Middle", i = e.roll(2, 6, -2).total * t / 30 + t / 6 + 3) : (r = "Outer", i = e.roll(2, 6, -2).total * t / 20 + t / 2 + 4), {
		range: r,
		pd: O(Math.max(2, i), 2)
	};
}
function dl(e, t) {
	let n = e.roll(2, 6, t).total, r;
	return r = n <= 5 ? -.001 + e.d6() / 1e3 : n <= 7 ? e.d6() / 200 : n <= 9 ? .03 + e.d6() / 100 : n === 10 ? .05 + e.d6() / 20 : n === 11 ? .05 + e.roll(2, 6).total / 20 : .3 + e.roll(2, 6).total / 20, O(Math.max(0, Math.min(.999, r)), 3);
}
function fl(e, t) {
	let n = [];
	for (let r = 0; r < t; r += 1) {
		let t = O(.4 + e.roll(2, 6).total / 8, 3), i = O(e.roll(3, 6).total / 100 + .07, 3);
		t - i / 2 < .55 && (i = O(Math.max(0, 2 * (t - .55)), 3));
		let a = n[n.length - 1];
		if (a) {
			let e = a.centrePd + a.spanPd / 2;
			t - i / 2 < e && (t = O(e + i / 2, 3));
		}
		n.push({
			designation: `R${String(r + 1).padStart(2, "0")}`,
			centrePd: t,
			spanPd: i
		});
	}
	return n;
}
function pl(e, t) {
	return t <= 0 ? 0 : O(Math.sqrt(e ** 3 / t) / 361730, 3);
}
function ml(e, t) {
	return t ? {
		diameterKm: t.diameterKm,
		massTerra: t.massTerra
	} : e ? {
		diameterKm: e.diameterKm,
		massTerra: e.massTerra
	} : null;
}
function hl(e, t, n, r, i, a, o) {
	let s = ml(r, a);
	if (!s || !a && n <= 0) return null;
	let c = Qc(e, t, n, a), l = tl(c, n, e.orbitNumber, a), u = +(l === 0), d = Math.max(0, l), f = sl(e, t, s), p = ["WBH Hill sphere uses the stellar mass supplied by system generation; hierarchy-aware generation aggregates all stellar components interior to the world orbit when required by WBH.", "WBH companion/unavailability adjacency DMs for significant-moon quantity require broader system-slot context and are not yet applied in this per-world phase."];
	a && (p.push(`Gas-giant significant-moon quantity uses the WBH ${a.category === "Small" ? "3D-7" : "4D-6"} row for ${a.category} gas giants.`), p.push("Gas-giant moon sizing uses the WBH Gas Giant Special Moon Sizing table, including rare smaller gas-giant moons."));
	let m = d;
	f.moonLimitPd < Xc && (d > 0 && f.moonLimitPd >= .55 && (u += 1), m = 0, p.push("Hill Sphere Moon Limit is below the Roche limit; significant moons are removed per WBH.")), f.moonLimitPd < .55 && (u = 0, p.push("Hill Sphere Moon Limit is below 0.55 PD; significant rings are also precluded."));
	let h = [];
	for (let e = 0; e < m; e += 1) if (a) {
		let e = il(c, a);
		e === "R" ? u += 1 : h.push(e);
	} else {
		let e = nl(c, n);
		e === "R" ? u += 1 : h.push({ sizeCode: e });
	}
	let g = cl(f.moonLimitPd, h.length), _ = h.map(() => ul(c, g)).sort((e, t) => e.pd - t.pd);
	for (let e = 1; e < _.length; e += 1) _[e].pd <= _[e - 1].pd && (_[e].pd = O(_[e - 1].pd + 1, 2));
	let v = h.map((n, r) => {
		let l = String.fromCharCode(97 + r), u = _[r], d = u.pd > g, p = u.pd > f.moonLimitPd, m = ll(u.range, d), h = dl(c, m), v = m + (p ? 2 : 0), y = c.roll(2, 6, v).total >= 10, b = O(u.pd * s.diameterKm, 0), x = `${e.id}.${l}`, S, ee = ol(e, l, h);
		if (n.gasGiantCategory && o && a) S = o(ee, n.gasGiantCategory, a.diameterTerra);
		else if (i) {
			let r = al($c(e, t, l, n.sizeCode), n.sizeCode);
			S = i(ee, r.numericSizeCode, r.atmosphereCode, r.hydrographicsCode);
		}
		return {
			designation: l,
			sizeCode: n.sizeCode,
			orbitRange: u.range,
			orbitPd: u.pd,
			orbitKm: b,
			eccentricity: h,
			direction: y ? "Retrograde" : "Prograde",
			periodHours: pl(b, s.massTerra),
			beyondHillMoonLimit: p,
			sourceId: x,
			physical: S
		};
	}), y = fl(c, u);
	y.some((e) => e.centrePd + e.spanPd / 2 > Xc) && p.push("At least one significant ring extends beyond the nominal 1.5 PD Roche limit; WBH permits the span to remain and later moon-gap handling can refine overlaps."), (i || o) && v.length > 0 && p.push("Significant moons include additive WBH physical profiles generated from dedicated moon sub-seeds; adding moon detail does not perturb established satellite geometry.");
	let b = v.map((e) => {
		let t = e.physical?.details?.gasGiant?.profile;
		return `${e.designation}:${t ?? e.sizeCode}@${e.orbitPd}PD`;
	}).join(","), x = y.length ? `R${String(y.length).padStart(2, "0")}:${y.map((e) => `${e.centrePd}-${e.spanPd}`).join(",")}` : "R00";
	return {
		method: "WBH significant moons and rings",
		hillSphereAu: f.au,
		hillSpherePd: f.pd,
		hillSphereMoonLimitPd: f.moonLimitPd,
		rocheLimitPd: Xc,
		moonOrbitRangePd: g,
		moons: v,
		rings: y,
		profile: `${x}${b ? ` ${b}` : ""}`,
		generationNotes: p
	};
}
//#endregion
//#region src/rules/worlds/physicalWorld.ts
function gl(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function _l(e) {
	return e <= -3 ? "Inner" : e < -.75 ? "Inferno" : e <= .75 ? "Habitable Zone" : e <= 3 ? "Outer" : "Frozen";
}
function vl(e, t, n) {
	let r = t >= 10 ? 1 : t >= 4 ? 0 : -1, i = n >= 6 ? -1 : 0, a = {
		Inner: 4,
		Inferno: 3,
		"Habitable Zone": 1,
		Outer: -1,
		Frozen: -3
	}[e] + r + i;
	return a >= 4 ? "Inferno" : a >= 2 ? "Hot" : a >= 0 ? "Temperate" : a >= -2 ? "Cold" : "Frozen";
}
function yl(e) {
	return e === "Inner" || e === "Inferno" ? "Hot" : e === "Frozen" ? "Frozen" : "Cold";
}
function bl(e, t) {
	return O(Math.sqrt(e ** 3 / Math.max(t, .01)), 3);
}
function xl(e, t) {
	let n = e.roll(2, 6, -2).total;
	return (t === "Inner" || t === "Frozen") && --n, t === "Habitable Zone" && (n += 1), gl(n, 0, 15);
}
function Sl(e, t, n) {
	if (t === 0) return 0;
	let r = e.roll(2, 6, -7 + t).total;
	return (n === "Inner" || n === "Inferno") && (r += 1), n === "Frozen" && (r -= 2), gl(r, 0, 15);
}
function Cl(e, t, n, r, i, a = !0, o) {
	let s = Fc(e, t, n, r, i), c = Ra(e, t, n, r, i), l = o ? {
		...c,
		generationNotes: [...o.generationNotes, ...c.generationNotes]
	} : c, u = s.atmosphere;
	if (r === 15 && s.atmosphere) {
		let n = Ks(e, t, s.size, i);
		u = {
			...s.atmosphere,
			pressureRangeBar: n.pressureRangeBar,
			pressureSpanBar: n.pressureSpanBar,
			meanBaselinePressureBar: n.meanBaselinePressureBar,
			unusual: n.detail,
			generationNotes: [...s.atmosphere.generationNotes.filter((e) => !e.startsWith("Unusual atmosphere subtype remains deferred")), ...n.detail.generationNotes]
		};
	}
	let d = bs(e, t, r, i, s.size, u, l), f = za(l, e, t, r, d.meanTemperatureK), p = ya(e, t, n, r, s.size, f, d.meanTemperatureK) ?? rc(r, u), m = u && {
		...u,
		gasMix: p
	}, h = qc(e, t, {
		sizeCode: n,
		orbitalPeriodYears: bl(e.au, t.massSolar)
	}), g = a ? hl(e, t, n, s.size, (e, n, r, i) => kl(e, t, n, r, i, !1, "Physical profile generated for a WBH significant moon.")) : null;
	return {
		...s,
		atmosphere: m,
		hydrographics: f,
		climate: d,
		rotation: h,
		satellites: g
	};
}
function wl(e, t, n, r, i) {
	let a = _l(e.hzDeviation), o = bl(e.au, t.massSolar), s = Ps(e, t, n, r, i), c = qc(e, t, {
		isGasGiant: !0,
		sizeCode: null,
		orbitalPeriodYears: o
	});
	return {
		zone: a,
		sizeCode: null,
		atmosphereCode: null,
		hydrographicsCode: null,
		uwpPhysical: s.profile,
		temperatureBand: yl(a),
		notes: `${n} gas-giant-sized moon; diameter ${s.diameterTerra} Terra, mass ${s.massTerra} Terra.`,
		orbitalPeriodYears: o,
		details: {
			size: null,
			atmosphere: null,
			gasGiant: s,
			rotation: c,
			satellites: null
		}
	};
}
function Tl(e, t, n, r, i) {
	e.roll(2, 6), e.roll(2, 6);
	let a = bl(t.au, n.massSolar), o = Ns(t, n, i), s = qc(t, n, {
		isGasGiant: !0,
		sizeCode: null,
		orbitalPeriodYears: a
	}), c = hl(t, n, 0, null, (e, t, r, i) => kl(e, n, t, r, i, !1, "Physical profile generated for a WBH significant gas-giant moon."), o, (e, t, r) => wl(e, n, t, r, i));
	return {
		zone: r,
		sizeCode: null,
		atmosphereCode: null,
		hydrographicsCode: null,
		uwpPhysical: o.profile,
		temperatureBand: yl(r),
		notes: `${o.category} gas giant; diameter ${o.diameterTerra} Terra, mass ${o.massTerra} Terra.`,
		orbitalPeriodYears: a,
		details: {
			size: null,
			atmosphere: null,
			gasGiant: o,
			rotation: s,
			satellites: c
		}
	};
}
function El(e, t, n) {
	return {
		zone: n,
		sizeCode: 0,
		atmosphereCode: 0,
		hydrographicsCode: 0,
		uwpPhysical: "000",
		temperatureBand: n === "Habitable Zone" ? "Temperate" : n,
		notes: "Planetoid belt; WBH composition, bulk and natural Resource Rating generated for system comparison.",
		orbitalPeriodYears: bl(e.au, t.massSolar),
		details: {
			size: null,
			atmosphere: null,
			planetoidBelt: zc(e, t)
		}
	};
}
function Dl(e) {
	return {
		zone: e,
		sizeCode: null,
		atmosphereCode: null,
		hydrographicsCode: null,
		uwpPhysical: "---",
		temperatureBand: e,
		notes: "Empty orbit slot.",
		orbitalPeriodYears: 0
	};
}
function Ol(e, n, r, i) {
	let a = xl(e, i), o = Sl(e, a, i), s = ec(a > 1 && o <= 1 ? e.fork(`wbh-hydrographics-code-v2|${n.id}`) : e, {
		world: n,
		star: r,
		sizeCode: a,
		atmosphereCode: o
	}), c = s.hydrographicsCode;
	return {
		zone: i,
		sizeCode: a,
		atmosphereCode: o,
		hydrographicsCode: c,
		uwpPhysical: `${t(a)}${t(o)}${t(c)}`,
		temperatureBand: vl(i, o, c),
		notes: n.hzDeviation > 3 ? "Distant ice/rock world." : n.hzDeviation < -2 ? "Inner rocky world." : "Terrestrial world candidate.",
		orbitalPeriodYears: bl(n.au, r.massSolar),
		details: Cl(n, r, a, o, c, !0, s)
	};
}
function kl(e, n, r, i, a, o, s) {
	let c = _l(e.hzDeviation);
	return {
		zone: c,
		sizeCode: r,
		atmosphereCode: i,
		hydrographicsCode: a,
		uwpPhysical: `${t(r)}${t(i)}${t(a)}`,
		temperatureBand: vl(c, i, a),
		notes: s,
		orbitalPeriodYears: bl(e.au, n.massSolar),
		details: Cl(e, n, r, i, a, o)
	};
}
function Al(e, t, n, r = {}) {
	let i = _l(t.hzDeviation), a, o = t.worldKind;
	return a = o === "Gas Giant" ? Tl(e, t, n, i, r) : o === "Planetoid Belt" ? El(t, n, i) : o === "Empty Orbit" ? Dl(i) : Ol(e, t, n, i), {
		...a,
		orbitalPeriodYears: bl(t.au, n.massSolar)
	};
}
function jl(e, t, n, r, i) {
	return kl(e, t, n, r, i, !0, "Physical profile imported from source UWP.");
}
//#endregion
//#region src/rules/worlds/wbhGovernmentType.ts
var Ml = [
	"None",
	"Company/Corporation",
	"Participating Democracy",
	"Self-Perpetuating Oligarchy",
	"Representative Democracy",
	"Feudal Technocracy",
	"Captive Government",
	"Balkanisation",
	"Civil Service Bureaucracy",
	"Impersonal Bureaucracy",
	"Charismatic Dictatorship",
	"Non-Charismatic Dictatorship",
	"Charismatic Oligarchy",
	"Religious Dictatorship",
	"Religious Autocracy",
	"Totalitarian Oligarchy"
];
function Nl(e) {
	return Math.max(0, Math.min(15, Math.trunc(e)));
}
function Pl(e) {
	return Ml[Nl(e)] ?? "Unknown";
}
function Fl(e, t) {
	if (t <= 0) return {
		method: "WBH government type",
		source: "generated",
		populationCode: 0,
		roll: null,
		modifier: null,
		unclampedTotal: 0,
		governmentCode: 0,
		governmentType: Pl(0),
		generationNotes: ["Population 0 has Government 0."]
	};
	let n = t - 7, r = e.roll(2, 6).total, i = r + n, a = Nl(i);
	return {
		method: "WBH government type",
		source: "generated",
		populationCode: t,
		roll: r,
		modifier: n,
		unclampedTotal: i,
		governmentCode: a,
		governmentType: Pl(a),
		generationNotes: ["Government code = 2D - 7 + Population code, bounded to 0-F."]
	};
}
function Il(e, t) {
	let n = e <= 0 ? 0 : Nl(t);
	return {
		method: "WBH government type",
		source: "imported",
		populationCode: e,
		roll: null,
		modifier: null,
		unclampedTotal: n,
		governmentCode: n,
		governmentType: Pl(n),
		generationNotes: [e <= 0 ? "Population 0 forces Government 0." : "Government code preserved from the source UWP."]
	};
}
//#endregion
//#region src/rules/worlds/wbhBalkanisation.ts
function Ll(e, t, n) {
	if (t <= 0 || n !== 7) return null;
	let r = e.die(3), i = r + 1, a = [];
	for (let n = 0; n < i; n += 1) {
		let r = Fl(e, t);
		if (r.roll === null || r.modifier === null) throw Error("Balkanised inhabited factions require a Government roll.");
		a.push({
			id: `F${n + 1}`,
			governmentCode: r.governmentCode,
			governmentType: Pl(r.governmentCode),
			governmentRoll: r.roll,
			governmentModifier: r.modifier,
			governmentUnclampedTotal: r.unclampedTotal,
			centralisation: null,
			internalFactions: null
		});
	}
	return {
		method: "WBH balkanisation",
		representation: "factions",
		worldGovernmentCode: n,
		populationCode: t,
		factionCountRoll: r,
		factionCount: i,
		factions: a,
		generationNotes: [
			"Government 7 is represented by D3+1 sovereign factions, per the WBH balkanisation procedure.",
			"Each faction rolls its own Government code using the world Population code.",
			"Individual nations and nation population allocation are deferred because the Handbook treats them as optional Referee detail."
		]
	};
}
//#endregion
//#region src/rules/worlds/wbhGovernmentFunctionalStructure.ts
var Rl = [
	{
		code: "L",
		name: "Legislative"
	},
	{
		code: "E",
		name: "Executive"
	},
	{
		code: "J",
		name: "Judicial"
	}
];
function zl(e) {
	return e === "D" ? "Demos" : e === "S" ? "Single Council" : e === "R" ? "Ruler" : "Multiple Councils";
}
function Bl(e, t, n, r, i, a = 0, o = i, s = null) {
	return {
		functionCode: e,
		functionName: t,
		code: n,
		structure: zl(n),
		method: r,
		roll: i,
		dm: a,
		total: o,
		sharedFromFunction: s
	};
}
function Vl(e) {
	return e <= 3 ? "D" : e === 4 ? "S" : e === 5 || e === 6 ? "M" : e === 7 || e === 8 ? "R" : e === 9 ? "M" : e === 10 ? "S" : e === 11 ? "M" : "S";
}
function Hl(e, t, n, r = 0) {
	let i = e.roll(2, 6).total, a = i + r;
	return Bl(t, n, Vl(a), "2D functional structure table", i, r, a);
}
function Ul(e, t, n, r, i) {
	let a = n !== "B" && n === r;
	if (t === 2 && (a || n === "B" && r === "L")) return Bl(r, i, "D", "fixed", null, 0, null);
	if (t === 8 || t === 9) return Bl(r, i, "M", "fixed", null, 0, null);
	if ([
		3,
		12,
		15
	].includes(t)) {
		let t = e.die(6);
		return Bl(r, i, t <= 4 ? "S" : "M", "1D council split", t);
	}
	if ([
		10,
		11,
		13,
		14
	].includes(t) && a) {
		let t = e.die(6);
		return Bl(r, i, t <= 5 ? "R" : "S", "1D authoritative ruler split", t);
	}
	if (n === "L" && r === "L") {
		let t = e.roll(2, 6).total;
		return Bl(r, i, t <= 3 ? "D" : t <= 8 ? "M" : "S", "2D legislative-authority table", t);
	}
	return Hl(e, r, i, [
		10,
		11,
		13,
		14
	].includes(t) ? 2 : 0);
}
function Wl(e, t, n, r) {
	let i = /* @__PURE__ */ new Map();
	if (r !== "B") {
		let a = Rl.find((e) => e.code === r);
		if (a) {
			let o = Ul(e, t, r, a.code, a.name);
			if (i.set(o.functionCode, o), n === "U" && (o.code === "R" || o.code === "S")) {
				for (let e of Rl) e.code !== o.functionCode && i.set(e.code, Bl(e.code, e.name, o.code, "unitary shared leadership", null, 0, null, o.functionCode));
				return {
					method: "WBH government functional structure",
					governmentCode: t,
					centralisationCode: n,
					authorityCode: r,
					functions: Rl.map((e) => i.get(e.code))
				};
			}
		}
	}
	for (let n of Rl) i.has(n.code) || i.set(n.code, Ul(e, t, r, n.code, n.name));
	return {
		method: "WBH government functional structure",
		governmentCode: t,
		centralisationCode: n,
		authorityCode: r,
		functions: Rl.map((e) => i.get(e.code))
	};
}
//#endregion
//#region src/rules/worlds/wbhGovernmentProfile.ts
var Gl = [
	"L",
	"E",
	"J"
];
function Kl(e, t) {
	let n = e.functions.find((e) => e.functionCode === t);
	if (!n) throw Error(`WBH government profile requires a ${t} functional structure.`);
	return n.code;
}
function ql(e, n, r, i) {
	let a = t(e);
	if (r === "B") {
		let t = `${a}-${n}BB-${Gl.map((e) => `${e}${Kl(i, e)}`).join("-")}`;
		return {
			method: "WBH government profile",
			governmentCode: e,
			centralisationCode: n,
			authorityCode: r,
			primaryStructureCode: null,
			profile: t,
			basicProfile: t,
			fullProfile: t
		};
	}
	let o = r, s = Kl(i, o), c = `${a}-${n}${r}${s}`;
	return {
		method: "WBH government profile",
		governmentCode: e,
		centralisationCode: n,
		authorityCode: r,
		primaryStructureCode: s,
		profile: c,
		basicProfile: c,
		fullProfile: [c, ...Gl.filter((e) => e !== o).map((e) => `${e}${Kl(i, e)}`)].join("-")
	};
}
//#endregion
//#region src/rules/worlds/wbhGovernmentAuthority.ts
function Jl(e) {
	return [
		1,
		6,
		10,
		13,
		14
	].includes(e) ? 6 : e === 2 ? -4 : [
		3,
		5,
		12
	].includes(e) ? -2 : [11, 15].includes(e) ? 4 : 0;
}
function Yl(e) {
	return e === "C" ? -2 : e === "U" ? 2 : 0;
}
function Xl(e) {
	return e <= 4 ? {
		code: "L",
		authoritativeFunction: "Legislative"
	} : e === 5 ? {
		code: "E",
		authoritativeFunction: "Executive"
	} : e === 6 ? {
		code: "J",
		authoritativeFunction: "Judicial"
	} : e === 7 ? {
		code: "B",
		authoritativeFunction: "Balance"
	} : e === 8 ? {
		code: "L",
		authoritativeFunction: "Legislative"
	} : e === 9 ? {
		code: "B",
		authoritativeFunction: "Balance"
	} : e === 10 ? {
		code: "E",
		authoritativeFunction: "Executive"
	} : e === 11 ? {
		code: "J",
		authoritativeFunction: "Judicial"
	} : {
		code: "E",
		authoritativeFunction: "Executive"
	};
}
function Zl(e, t, n) {
	let r = [], i = Jl(t);
	i !== 0 && r.push({
		source: `Government ${t}`,
		dm: i
	});
	let a = Yl(n);
	a !== 0 && r.push({
		source: `${n} centralisation`,
		dm: a
	});
	let o = e.roll(2, 6).total, s = r.reduce((e, t) => e + t.dm, 0), c = o + s, l = Xl(c), u = Wl(e, t, n, l.code), d = ql(t, n, l.code, u);
	return {
		method: "WBH government authority",
		governmentCode: t,
		centralisationCode: n,
		roll: o,
		dmTotal: s,
		dmBreakdown: r,
		total: c,
		code: l.code,
		authoritativeFunction: l.authoritativeFunction,
		functionalStructure: u,
		governmentProfile: d
	};
}
//#endregion
//#region src/rules/worlds/wbhGovernmentCentralisation.ts
function Ql(e) {
	return e >= 2 && e <= 5 ? -1 : e === 6 || e >= 8 && e <= 11 ? 1 : e >= 12 ? 2 : 0;
}
function $l(e) {
	return e >= 0 && e <= 3 ? -1 : e >= 7 && e <= 8 ? 1 : e === 9 ? 3 : 0;
}
function eu(e) {
	return e <= 5 ? {
		code: "C",
		description: "Confederal — sub-states are considered sovereign and more powerful than the central government."
	} : e <= 8 ? {
		code: "F",
		description: "Federal — powers are shared between sub-states and the central government."
	} : {
		code: "U",
		description: "Unitary — the central government is dominant."
	};
}
function tu(e, t, n, r = !1) {
	let i = [], a = Ql(t);
	a !== 0 && i.push({
		source: `Government ${t}`,
		dm: a
	}), r && i.push({
		source: "Government 7 balkanised faction",
		dm: 1
	});
	let o = $l(n);
	o !== 0 && i.push({
		source: `PCR ${n}`,
		dm: o
	});
	let s = e.roll(2, 6).total, c = i.reduce((e, t) => e + t.dm, 0), l = s + c, u = eu(l), d = Zl(e, t, u.code);
	return {
		method: "WBH government centralisation",
		governmentCode: t,
		pcr: n,
		balkanisedFaction: r,
		roll: s,
		dmTotal: c,
		dmBreakdown: i,
		total: l,
		code: u.code,
		description: u.description,
		authority: d
	};
}
//#endregion
//#region src/rules/worlds/wbhGovernmentFactions.ts
var nu = 4, ru = 64;
function iu(e) {
	return e === 0 || e === 7 ? 1 : e >= 10 ? -1 : 0;
}
function au(e) {
	return e <= 3 ? {
		code: "O",
		description: "Obscure group — few have heard of them"
	} : e <= 5 ? {
		code: "F",
		description: "Fringe group"
	} : e <= 7 ? {
		code: "M",
		description: "Minor group"
	} : e <= 9 ? {
		code: "N",
		description: "Notable group"
	} : e <= 11 ? {
		code: "S",
		description: "Significant — nearly as powerful as government"
	} : {
		code: "P",
		description: "Overwhelming popular support — more powerful than government"
	};
}
function ou(e) {
	return e <= 0 ? {
		code: 0,
		relationship: "Alliance",
		description: "Factions present a united front against any opposition"
	} : e === 1 ? {
		code: 1,
		relationship: "Cooperation",
		description: "Factions support actions of one another"
	} : e === 2 ? {
		code: 2,
		relationship: "Truce",
		description: "Factions do not oppose each other’s actions"
	} : e === 3 ? {
		code: 3,
		relationship: "Competition",
		description: "Factions compete within bounds of the legal system"
	} : e === 4 ? {
		code: 4,
		relationship: "Resistance",
		description: "Factions engage in disobedience and peaceful protests"
	} : e === 5 ? {
		code: 5,
		relationship: "Riots",
		description: "Factions engage in violent protest or riot actions"
	} : e === 6 ? {
		code: 6,
		relationship: "Uprising",
		description: "Factions engage in periodic murder, sabotage, bombings and raids"
	} : e === 7 ? {
		code: 7,
		relationship: "Insurgency",
		description: "Regions under factional control; widespread guerrilla warfare"
	} : e === 8 ? {
		code: 8,
		relationship: "War",
		description: "Ongoing conventional warfare between factions"
	} : {
		code: 9,
		relationship: "Total War",
		description: "Warfare with the aim of conquest or annihilation"
	};
}
function su(e) {
	let t = [
		[1e3, "M"],
		[900, "CM"],
		[500, "D"],
		[400, "CD"],
		[100, "C"],
		[90, "XC"],
		[50, "L"],
		[40, "XL"],
		[10, "X"],
		[9, "IX"],
		[5, "V"],
		[4, "IV"],
		[1, "I"]
	], n = e, r = "";
	for (let [e, i] of t) for (; n >= e;) r += i, n -= e;
	return r || "I";
}
function cu(e, n, r) {
	return `${e}-${t(n)}-${r}`;
}
function lu(e, t, n) {
	return `${e}+${t}=${n}`;
}
function uu(e, t, n) {
	if (t <= 0) return null;
	let r = e.die(3), i = iu(n), a = r + i, o = Math.max(1, a);
	Math.max(0, o - 1);
	let s = [], c = !1, l = (e, t, n, r, i, a, o, l, u, d, f, p) => {
		if (s.length >= ru) {
			c = !0;
			return;
		}
		s.push({
			id: e,
			parentId: t,
			depth: n,
			ruling: r,
			governmentCode: i,
			governmentType: Pl(i),
			governmentRoll: a,
			governmentModifier: o,
			governmentUnclampedTotal: l,
			strengthRoll: u,
			strengthCode: d,
			strengthDescription: f,
			profile: cu(e, i, d),
			spawnedByBalkanisation: p
		});
	};
	l("I", null, 0, !0, n, null, null, n, null, "G", "Official government", !1);
	let u = (n, r, i, a) => {
		if (s.length >= ru) {
			c = !0;
			return;
		}
		let o = Fl(e, t);
		if (o.roll === null || o.modifier === null) throw Error("WBH outside faction on an inhabited world requires a Government roll.");
		let d = e.roll(2, 6).total, f = au(d);
		if (l(n, r, i, !1, o.governmentCode, o.roll, o.modifier, o.unclampedTotal, d, f.code, f.description, a), o.governmentCode !== 7) return;
		if (i >= nu) {
			c = !0;
			return;
		}
		let p = e.die(3) + 1;
		for (let e = 1; e <= p; e += 1) u(`${n}.${su(e)}`, n, i + 1, !0);
	};
	for (let e = 2; e <= o; e += 1) u(su(e), null, 0, !1);
	let d = [];
	for (let t = 0; t < s.length; t += 1) for (let n = t + 1; n < s.length; n += 1) {
		let r = s[t], i = s[n], a = [];
		(r.ruling || i.ruling) && a.push({
			source: "Between ruling faction and external faction",
			dm: 1
		}), r.governmentCode === i.governmentCode && a.push({
			source: "Factions have the same Government code",
			dm: -1
		});
		let o = a.reduce((e, t) => e + t.dm, 0), c = e.die(6), l = c + o, u = ou(l);
		d.push({
			leftFactionId: r.id,
			rightFactionId: i.id,
			roll: c,
			dmTotal: o,
			dmBreakdown: a,
			total: l,
			code: u.code,
			relationship: u.relationship,
			description: u.description,
			profile: lu(r.id, i.id, u.code)
		});
	}
	return {
		method: "WBH government factions",
		populationCode: t,
		governmentCode: n,
		factionCountRoll: r,
		factionCountDm: i,
		factionCountRaw: a,
		factionCount: s.length,
		outsideFactionCount: Math.max(0, s.length - 1),
		factions: s,
		relationships: d,
		recursionLimitReached: c,
		generationNotes: [
			"Faction count = D3 + Government DMs; results 0–1 mean no significant faction outside the official power structure.",
			"Each outside faction rolls Government using the same world Population code and rolls 2D for relative strength.",
			"Generated Government-7 factions recursively spawn D3+1 subordinate factions.",
			`Recursion is capped at depth ${nu} and ${ru} total factions to prevent pathological infinite Government-7 chains.`,
			"Faction relationships roll 1D for every pair, with DM+1 for the ruling faction and DM-1 for matching Government codes."
		]
	};
}
//#endregion
//#region src/rules/worlds/wbhMajorCities.ts
function du(e) {
	return Math.max(0, Math.ceil(e));
}
function fu(e, t, n, r) {
	if (t.length === 0) return [];
	let i = t.map((t) => Math.floor(e * t / 100)), a = i.reduce((e, t) => e + t, 0);
	return i[0] += Math.max(0, e - a), t.map((e, t) => ({
		rank: 0,
		sharePercent: e,
		population: i[t],
		allocationRolls: n[t] ?? [],
		chunkCount: r[t] ?? null,
		originalIndex: t
	})).sort((e, t) => t.population - e.population || e.originalIndex - t.originalIndex).map(({ originalIndex: e, ...t }, n) => ({
		...t,
		rank: n + 1
	}));
}
function pu(e, t, n, r, i) {
	if (n === 0) {
		let t = e.d6(), n = Math.min(i / 100, (t + 2) * 1e4);
		return n < 100 && (n = Math.max(i / 10, t + 1)), {
			populationAllocationCase: 1,
			largestNonMajorCityPopulation: du(n),
			largestNonMajorCityRoll: t,
			allocationChunkPercent: null,
			allocationRemainderPercent: null,
			cities: []
		};
	}
	if (n === 1) return {
		populationAllocationCase: 2,
		largestNonMajorCityPopulation: null,
		largestNonMajorCityRoll: null,
		allocationChunkPercent: null,
		allocationRemainderPercent: null,
		cities: fu(r, [100], [[]], [null])
	};
	if (n <= 3) {
		let t = [], i = [], a = 100;
		for (let r = 0; r < n; r += 1) {
			let o = e.d6(), s = n - r - 1, c = a - s, l = a * ((o + 3) / 10), u = Math.min(c, Math.max(1, l));
			t.push(u), i.push([o]), a -= u;
		}
		return t[0] += a, {
			populationAllocationCase: 3,
			largestNonMajorCityPopulation: null,
			largestNonMajorCityRoll: null,
			allocationChunkPercent: null,
			allocationRemainderPercent: null,
			cities: fu(r, t, i, Array(n).fill(null))
		};
	}
	let a = 100 - n, o = Math.max(1, Math.floor(a / (n * 2))), s = Math.max(1, Math.min(t, o)), c = Math.floor(a / s), l = a - c * s, u = Array(n).fill(0), d = Array.from({ length: n }, () => []), f = c, p = 0;
	for (; f > 0;) {
		let t = e.d6(), r = Math.min(t, f);
		if (u[p] += r, d[p].push(t), f -= r, f === 0) break;
		p = (p + 1) % n;
	}
	let m = (p + 1) % n, h = u.map((e) => 1 + e * s);
	return h[m] += l, {
		populationAllocationCase: 4,
		largestNonMajorCityPopulation: null,
		largestNonMajorCityRoll: null,
		allocationChunkPercent: s,
		allocationRemainderPercent: l,
		cities: fu(r, h, d, u)
	};
}
function mu(e, t) {
	let n = t.populationConcentration, r = t.urbanisation;
	if (t.populationCode <= 0 || !n || !r) return null;
	let i = t.populationCode, a = n.rating, o = r.totalUrbanPopulation, s = r.urbanisationPercent, c = [];
	if (a === 0) {
		c.push("WBH Major Cities Case 1: PCR 0 has no major cities.");
		let t = pu(e, a, 0, 0, o);
		return c.push("WBH Major City Population Case 1: largest non-major city uses the lesser of 1% of urban population or (1D+2)×10,000, with the under-100 fallback."), {
			method: "WBH major cities phase 1",
			case: 1,
			populationCode: i,
			pcr: a,
			urbanisationPercent: s,
			totalUrbanPopulation: o,
			countRoll: null,
			countUnrounded: 0,
			numberMajorCities: 0,
			majorCityPopulationRoll: null,
			totalMajorCityPopulation: 0,
			totalMajorCitySharePercent: 0,
			...t,
			generationNotes: c
		};
	}
	if (i <= 5 && a === 9) {
		c.push("WBH Major Cities Case 2: Population 5 or less with PCR 9 has one major city containing the entire urban population.");
		let t = pu(e, a, 1, o, o);
		return {
			method: "WBH major cities phase 1",
			case: 2,
			populationCode: i,
			pcr: a,
			urbanisationPercent: s,
			totalUrbanPopulation: o,
			countRoll: null,
			countUnrounded: 1,
			numberMajorCities: 1,
			majorCityPopulationRoll: null,
			totalMajorCityPopulation: o,
			totalMajorCitySharePercent: o > 0 ? 100 : 0,
			...t,
			generationNotes: c
		};
	}
	if (i <= 5 && a >= 1 && a <= 8) {
		let t = Math.max(1, Math.min(9 - a, i));
		c.push("WBH Major Cities Case 3: Population 5 or less with PCR 1–8 uses the lesser of 9-PCR or Population code; all urban population is in major cities.");
		let n = pu(e, a, t, o, o);
		return {
			method: "WBH major cities phase 1",
			case: 3,
			populationCode: i,
			pcr: a,
			urbanisationPercent: s,
			totalUrbanPopulation: o,
			countRoll: null,
			countUnrounded: t,
			numberMajorCities: t,
			majorCityPopulationRoll: null,
			totalMajorCityPopulation: o,
			totalMajorCitySharePercent: o > 0 ? 100 : 0,
			...n,
			generationNotes: c
		};
	}
	if (i >= 6 && a === 9) {
		let t = e.roll(2, 6).total, n = Math.max(i - t, 1);
		c.push("WBH Major Cities Case 4: Population 6+ with PCR 9 uses the greater of Population code - 2D or 1; all urban population is in major cities.");
		let r = pu(e, a, n, o, o);
		return n > 1 && c.push("WBH directs multiple PCR 9 cities to the following population-allocation procedure; allocation is selected by city count."), {
			method: "WBH major cities phase 1",
			case: 4,
			populationCode: i,
			pcr: a,
			urbanisationPercent: s,
			totalUrbanPopulation: o,
			countRoll: t,
			countUnrounded: i - t,
			numberMajorCities: n,
			majorCityPopulationRoll: null,
			totalMajorCityPopulation: o,
			totalMajorCitySharePercent: o > 0 ? 100 : 0,
			...r,
			generationNotes: c
		};
	}
	let l = e.roll(2, 6).total, u = l - a + s / 100 * 20 / a, d = Math.max(1, Math.ceil(u));
	i < 6 && (d = Math.min(d, i));
	let f = e.d6(), p = du(a / (f + 7) * o), m = o > 0 ? p / o * 100 : 0, h = pu(e, a, d, p, o);
	return c.push("WBH Major Cities Case 5: Major Cities = 2D - PCR + (Urbanisation fraction × 20 ÷ PCR), rounded up with a minimum of 1."), c.push("WBH Major Cities Case 5: Total Major City Population = PCR ÷ (1D+7) × Total Urban Population."), c.push(`WBH Major City Population Case ${h.populationAllocationCase}: individual populations allocated without optional variance.`), {
		method: "WBH major cities phase 1",
		case: 5,
		populationCode: i,
		pcr: a,
		urbanisationPercent: s,
		totalUrbanPopulation: o,
		countRoll: l,
		countUnrounded: u,
		numberMajorCities: d,
		majorCityPopulationRoll: f,
		totalMajorCityPopulation: p,
		totalMajorCitySharePercent: m,
		...h,
		generationNotes: c
	};
}
//#endregion
//#region src/rules/worlds/wbhPopulationConcentration.ts
var hu = [
	"Extremely Dispersed",
	"Highly Dispersed",
	"Moderately Dispersed",
	"Partially Dispersed",
	"Slightly Dispersed",
	"Slightly Concentrated",
	"Partially Concentrated",
	"Moderately Concentrated",
	"Highly Concentrated",
	"Extremely Concentrated"
];
function gu(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function _u(e) {
	let t = e.physical?.details?.rotation;
	return t?.tidalLockStatus === "1:1" && t.tidalLockCase === "planet-star";
}
function vu(e) {
	let t = e.physical?.atmosphereCode ?? 0, n = e.physical?.details?.habitabilityRating?.rating, r = 0;
	return [
		0,
		1,
		10
	].includes(t) ? r = Math.max(r, 8) : [
		2,
		3,
		13,
		14
	].includes(t) ? r = Math.max(r, 5) : [
		4,
		7,
		9
	].includes(t) ? r = Math.max(r, 3) : t === 11 ? r = Math.max(r, 9) : t === 12 ? r = Math.max(r, 10) : t === 15 ? r = Math.max(r, 8) : (t === 16 || t === 17) && (r = Math.max(r, 14)), typeof n == "number" && (n === 0 ? r = Math.max(r, 8) : n <= 2 ? r = Math.max(r, 5) : n <= 7 && (r = Math.max(r, 3))), r;
}
function yu(e, t) {
	let n = [], r = e.physical?.sizeCode ?? 0, i = t.populationCode, a = t.governmentCode, o = t.techLevel, s = vu(e), c = new Set(t.tradeCodes), l = (e, t) => {
		n.push({
			source: e,
			dm: t
		});
	};
	return r === 1 ? l("Size 1", 2) : (r === 2 || r === 3) && l(`Size ${r}`, 1), _u(e) && l("Twilight zone world", 2), s >= 8 ? l(`Minimum sustainable TL ${s}`, 3) : s >= 3 && l(`Minimum sustainable TL ${s}`, 1), i === 8 ? l("Population 8", -1) : i >= 9 && l(`Population ${i}`, -2), a === 7 && l("Government 7", -2), o <= 1 ? l(`Tech Level ${o}`, -2) : o <= 3 ? l(`Tech Level ${o}`, -1) : o <= 9 && l(`Tech Level ${o}`, 1), c.has("Ag") && l("Agricultural", -2), c.has("In") && l("Industrial", 1), c.has("Na") && l("Non-Agricultural", -1), c.has("Ri") && l("Rich", 1), n;
}
function bu(e, t, n) {
	if (n.populationCode <= 0) return null;
	let r = n.populationCode, i = +(r >= 9), a = [], o = null;
	if (r < 6) {
		if (o = e.d6(), o > r) return a.push("Population below 6 and the preliminary 1D roll exceeded the Population code: the entire population occupies one settlement area, so PCR is 9."), {
			method: "WBH population concentration rating",
			rating: 9,
			description: hu[9],
			settlementAreaRoll: o,
			singleSettlementArea: !0,
			pcrRoll: null,
			dmTotal: 0,
			dmBreakdown: [],
			unclampedTotal: null,
			minimumRating: i,
			maximumRating: 9,
			generationNotes: a
		};
		a.push("Population below 6, but the preliminary 1D roll did not exceed the Population code; use the normal PCR table.");
	}
	let s = e.d6(), c = yu(t, n), l = c.reduce((e, t) => e + t.dm, 0), u = s + l, d = gu(u, i, 9);
	return a.push(r >= 9 ? "Population 9+ sets the WBH minimum PCR to 1." : "WBH minimum PCR is 0 for Population below 9."), a.push("PCR is bounded to a maximum of 9."), {
		method: "WBH population concentration rating",
		rating: d,
		description: hu[d],
		settlementAreaRoll: o,
		singleSettlementArea: !1,
		pcrRoll: s,
		dmTotal: l,
		dmBreakdown: c,
		unclampedTotal: u,
		minimumRating: i,
		maximumRating: 9,
		generationNotes: a
	};
}
//#endregion
//#region src/rules/worlds/wbhUrbanisation.ts
function xu(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Su(e) {
	return e.die(2);
}
function Cu(e, t) {
	return t <= 0 ? {
		percentage: .5,
		range: "Less than 1%",
		note: "The WBH table specifies only “Less than 1%”. TSG stores 0.5% as a deterministic representative value for population arithmetic."
	} : t === 1 ? {
		percentage: e.d6(),
		range: "1–6%"
	} : t === 2 ? {
		percentage: 6 + e.d6(),
		range: "7–12%"
	} : t === 3 ? {
		percentage: 12 + e.d6(),
		range: "13–18%"
	} : t === 4 ? {
		percentage: 18 + e.d6(),
		range: "19–24%"
	} : t === 5 ? {
		percentage: 22 + e.d6() * 2 + Su(e),
		range: "25–36%"
	} : t === 6 ? {
		percentage: 34 + e.d6() * 2 + Su(e),
		range: "37–48%"
	} : t === 7 ? {
		percentage: 46 + e.d6() * 2 + Su(e),
		range: "49–60%"
	} : t === 8 ? {
		percentage: 58 + e.d6() * 2 + Su(e),
		range: "61–72%"
	} : t === 9 ? {
		percentage: 70 + e.d6() * 2 + Su(e),
		range: "73–84%"
	} : t === 10 ? {
		percentage: 84 + e.d6(),
		range: "85–90%"
	} : t === 11 ? {
		percentage: 90 + e.d6(),
		range: "91–96%"
	} : t === 12 ? {
		percentage: 96 + e.die(3),
		range: "97–99%"
	} : {
		percentage: 100,
		range: "Greater than 99%"
	};
}
function wu(e, t, n) {
	let r = [], i = (e, t) => {
		r.push({
			source: e,
			dm: t
		});
	}, a = vu(e), o = e.physical?.sizeCode ?? 0, s = t.populationCode, c = t.governmentCode, l = t.lawLevelCode, u = t.techLevel, d = new Set(t.tradeCodes);
	return n <= 2 ? i(`PCR ${n}`, -3 + n) : n >= 7 && i(`PCR ${n}`, -6 + n), a <= 3 && i(`Minimum sustainable TL ${a}`, -1), o === 0 && i("Size 0", 2), s === 8 ? i("Population 8", 1) : s === 9 ? i("Population 9", 2) : s >= 10 && i(`Population ${s}`, 4), c === 0 && i("Government 0", -2), l >= 9 && i(`Law Level ${l}`, 1), u <= 2 ? i(`Tech Level ${u}`, -2) : u === 3 ? i("Tech Level 3", -1) : u === 4 ? i("Tech Level 4", 1) : u <= 9 ? i(`Tech Level ${u}`, 2) : i(`Tech Level ${u}`, 1), d.has("Ag") && i("Agricultural", -2), d.has("Na") && i("Non-Agricultural", 2), r;
}
function Tu(e, t) {
	let n = [], r = [], i = t.populationCode, a = t.techLevel, o = new Set(t.tradeCodes);
	return i === 9 ? n.push({
		source: "Population 9",
		kind: "minimum",
		percentage: 18 + e.d6()
	}) : i >= 10 && n.push({
		source: `Population ${i}`,
		kind: "minimum",
		percentage: 50 + e.d6()
	}), a <= 2 ? r.push({
		source: `Tech Level ${a}`,
		kind: "maximum",
		percentage: 20 + e.d6()
	}) : a === 3 ? r.push({
		source: "Tech Level 3",
		kind: "maximum",
		percentage: 30 + e.d6()
	}) : a === 4 ? r.push({
		source: "Tech Level 4",
		kind: "maximum",
		percentage: 60 + e.d6()
	}) : a <= 9 && r.push({
		source: `Tech Level ${a}`,
		kind: "maximum",
		percentage: 90 + e.d6()
	}), o.has("Ag") && r.push({
		source: "Agricultural",
		kind: "maximum",
		percentage: 90 + e.d6()
	}), {
		minimums: n,
		maximums: r
	};
}
function Eu(e, t, n) {
	if (n.populationCode <= 0 || !n.populationConcentration) return null;
	let r = n.populationConcentration.rating, i = wu(t, n, r), a = i.reduce((e, t) => e + t.dm, 0), o = e.roll(2, 6).total, s = o + a, c = Cu(e, s), l = Tu(e, n), u = l.minimums.length ? l.minimums.reduce((e, t) => t.percentage > e.percentage ? t : e) : null, d = l.maximums.length ? l.maximums.reduce((e, t) => t.percentage < e.percentage ? t : e) : null, f = c.percentage, p = null, m = null;
	u && f < u.percentage && (f = u.percentage, p = u), d && f > d.percentage && (!u || u.percentage <= d.percentage) && (f = d.percentage, m = d), f = xu(f, 0, 100);
	let h = Math.round(n.populationTotal * f / 100), g = ["Urbanisation uses the WBH 2D+DM percentage table and applies listed minimum/maximum restrictions.", "A minimum restriction supersedes a conflicting maximum restriction, per the Handbook."];
	return c.note && g.push(c.note), {
		method: "WBH urbanisation percentage",
		pcr: r,
		baseRoll: o,
		dmTotal: a,
		dmBreakdown: i,
		tableResult: s,
		tableRange: c.range,
		rolledPercentage: c.percentage,
		minimumLimits: l.minimums,
		maximumLimits: l.maximums,
		appliedMinimum: p,
		appliedMaximum: m,
		urbanisationPercent: f,
		totalUrbanPopulation: h,
		generationNotes: g
	};
}
//#endregion
//#region src/rules/worlds/socialWorld.ts
function Du(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Ou(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function j(e) {
	return t(Du(e, 0, 33));
}
function ku(e) {
	return e >= 11 ? "A" : e >= 9 ? "B" : e >= 7 ? "C" : e >= 5 ? "D" : e >= 3 ? "E" : "X";
}
function Au(e) {
	let t = e.physical, n = 0;
	return t?.zone === "Habitable Zone" && (n += 1), t?.temperatureBand === "Temperate" && (n += 1), e.worldKind === "Planetoid Belt" && --n, e.worldKind === "Gas Giant" && (n -= 3), n;
}
function ju(e) {
	return e.physical?.details?.nativeLife?.currentNativeSophont === !0;
}
function Mu(e, t) {
	return ju(e) ? {
		status: "native-sophont",
		basis: "Current native Sophonts establish an inhabited world."
	} : t?.origin === "transplanted" ? {
		status: "transplanted",
		basis: t.populationCode === null ? "Referee established a transplanted population; Population is generated with the ordinary WBH procedure." : `Referee established a transplanted population with Population code ${j(t.populationCode)}.`
	} : {
		status: "uninhabited",
		basis: e.isMainworld ? "Mainworld designation identifies the system reference world; it does not itself establish inhabitants." : "No native Sophonts or explicit transplanted population has been established for this body."
	};
}
function Nu(e, t) {
	return e.isMainworld === !0 || ju(e) || t?.origin === "transplanted";
}
function Pu(e) {
	for (let t = 0; t < 32; t += 1) {
		let t = Du(e.roll(2, 6, -2).total, 0, 10);
		if (t > 0) return t;
	}
	return 1;
}
function Fu(e, t, n) {
	return t === "native-sophont" ? e.die(3) + e.die(3) + 4 : t === "transplanted" ? typeof n?.populationCode == "number" ? Du(Math.trunc(n.populationCode), 1, 10) : Pu(e) : 0;
}
function Iu(e, t) {
	if (t === 0) return 0;
	let n = e.die(3), r = e.die(3);
	return (n - 1) * 3 + r;
}
function Lu(e, t, n = null) {
	if (e === 0 || t === 0) return 0;
	let r = t + (n === null ? 0 : n / 10);
	return Math.round(r * 10 ** e);
}
function Ru(e, t, n, r, i) {
	if (t === 0) return {
		method: "WBH population phase 1",
		populationCode: 0,
		pValue: 0,
		additionalSignificantDigit: null,
		estimatedPopulation: 0,
		profilePrefix: "0-0",
		nativeSophontPopulationProcedure: "none",
		generationNotes: ["Population 0: no permanent inhabitants have been established for this body."]
	};
	let a = e.d10ZeroToNine(), o = Lu(t, n, a), s = `${n}.${a}`, c = ["P value uses the WBH two-D3 procedure; one d10 supplies an additional significant digit."];
	return r === "native-sophont" && c.push("Population code uses the WBH native-sophont 2D3+4 option."), r === "transplanted" && c.push(typeof i?.populationCode == "number" ? "Population code was set explicitly by the Referee for this transplanted population." : "Population code uses ordinary WBH 2D-2 conditioned on an established non-zero transplanted population."), {
		method: "WBH population phase 1",
		populationCode: t,
		pValue: n,
		additionalSignificantDigit: a,
		estimatedPopulation: o,
		profilePrefix: `${j(t)}-${s}`,
		nativeSophontPopulationProcedure: r === "native-sophont" ? "2D3+4" : "none",
		generationNotes: c
	};
}
function zu(e, t, n) {
	return n === 0 ? 0 : Du(e.roll(2, 6, -7 + t).total, 0, 18);
}
function Bu(e, t, n, r, i, a) {
	let o = 0;
	return o += {
		A: 6,
		B: 4,
		C: 2,
		D: 0,
		E: -1,
		X: -4
	}[e], t <= 1 ? o += 2 : t <= 4 && (o += 1), (n <= 3 || n >= 10) && (o += 1), (r === 0 || r === 9) && (o += 1), r === 10 && (o += 2), i >= 1 && i <= 5 && (o += 1), i === 9 && (o += 2), i >= 10 && (o += 4), (a === 0 || a === 5) && (o += 1), (a === 13 || a === 14) && (o -= 2), o;
}
function Vu(e) {
	let t = e.physical?.sizeCode ?? 0, n = e.physical?.atmosphereCode ?? 0, r = e.physical?.hydrographicsCode ?? 0, i = e.physical?.details?.habitabilityRating?.rating, a = 0, o = [], s = (e, t) => {
		e > a && (a = e), o.push(`${t}: TL${e}`);
	};
	return [
		0,
		1,
		10
	].includes(n) ? s(8, `WBH Atmosphere ${j(n)}`) : [
		2,
		3,
		13,
		14
	].includes(n) ? s(5, `WBH Atmosphere ${j(n)}`) : [
		4,
		7,
		9
	].includes(n) ? s(3, `WBH Atmosphere ${j(n)}`) : n === 11 ? s(9, "WBH Atmosphere B") : n === 12 ? s(10, "WBH Atmosphere C") : n === 15 ? s(8, "WBH Atmosphere F conservative floor") : (n === 16 || n === 17) && s(14, `WBH Atmosphere ${j(n)}`), typeof i == "number" && (i === 0 ? s(8, "WBH Habitability 0") : i <= 2 ? s(5, `WBH Habitability ${i}`) : i <= 7 && s(3, `WBH Habitability ${i}`)), r === 0 && n >= 4 && s(4, "Existing dry-world survival floor"), t === 0 && s(8, "Existing Size 0 survival floor"), {
		minimum: a,
		basis: o
	};
}
function Hu(e, t, n, r, i, a) {
	if (r === 0) return 0;
	let o = n.physical, s = o?.sizeCode ?? 0, c = o?.atmosphereCode ?? 0, l = o?.hydrographicsCode ?? 0, u = e.die(6) + Bu(t, s, c, l, r, i);
	return Du(Math.max(u, a), 0, 15);
}
function M(e, t, n) {
	return e >= t && e <= n;
}
function Uu(e, t, n, r) {
	let i = e.populationCode, a = e.governmentCode, o = e.lawLevelCode, s = e.techLevel, c = [];
	return M(t, 4, 9) && M(n, 4, 8) && M(r, 5, 7) && c.push("Ag"), t === 0 && n === 0 && r === 0 && c.push("As"), i === 0 && a === 0 && o === 0 && c.push("Ba"), M(t, 2, 9) && r === 0 && c.push("De"), (M(n, 10, 12) || n >= 15) && r >= 1 && c.push("Fl"), M(t, 6, 8) && [
		5,
		6,
		8
	].includes(n) && M(r, 5, 7) && c.push("Ga"), i >= 9 && c.push("Hi"), s >= 12 && c.push("Ht"), (n === 0 || n === 1) && r >= 1 && c.push("Ic"), [
		0,
		1,
		2,
		4,
		7,
		9,
		10,
		11,
		12
	].includes(n) && i >= 9 && c.push("In"), i >= 1 && i <= 3 && c.push("Lo"), i >= 1 && s <= 5 && c.push("Lt"), M(n, 0, 3) && M(r, 0, 3) && i >= 6 && c.push("Na"), M(i, 4, 6) && c.push("Ni"), M(n, 2, 5) && M(r, 0, 3) && c.push("Po"), (n === 6 || n === 8) && M(i, 6, 8) && M(a, 4, 9) && c.push("Ri"), n === 0 && c.push("Va"), M(t, 2, 9) && r === 10 && c.push("Wa"), c;
}
function Wu(e) {
	let t = 0;
	return (e.starport === "A" || e.starport === "B") && (t += 1), (e.starport === "D" || e.starport === "E" || e.starport === "X") && --t, e.populationCode <= 6 && --t, e.populationCode >= 9 && (t += 1), e.techLevel <= 8 && --t, e.techLevel >= 10 && e.techLevel <= 15 && (t += 1), e.techLevel >= 16 && (t += 2), e.tradeCodes.includes("Ag") && (t += 1), e.tradeCodes.includes("In") && (t += 1), e.tradeCodes.includes("Ri") && (t += 1), t;
}
function Gu(e, t, n) {
	if (!t.physical || t.worldKind === "Empty Orbit" || t.worldKind === "Gas Giant" || !Nu(t, n)) return;
	let r = Mu(t, n), i = Fu(e, r.status, n), a = Iu(e, i), o = Ru(e, i, a, r.status, n), s = o.estimatedPopulation, c = Fl(e, i), l = c.governmentCode, u = zu(e, l, i), d = i === 0 ? "X" : ku(e.roll(2, 6, Au(t)).total), f = i === 0 ? {
		minimum: 0,
		basis: []
	} : Vu(t), p = Hu(e, d, t, i, l, f.minimum), m = t.physical.sizeCode ?? 0, h = t.physical.atmosphereCode ?? 0, g = t.physical.hydrographicsCode ?? 0, _ = {
		starport: d,
		populationCode: i,
		populationMultiplier: a,
		populationTotal: s,
		populationDetails: o,
		populationConcentration: null,
		urbanisation: null,
		majorCities: null,
		governmentDetails: c,
		balkanisation: null,
		governmentCentralisation: null,
		governmentFactions: null,
		habitationStatus: r.status,
		habitationBasis: r.basis,
		minimumSustainableTechLevel: i === 0 ? null : f.minimum,
		minimumSustainableTechLevelBasis: f.basis,
		governmentCode: l,
		lawLevelCode: u,
		techLevel: p,
		uwp: "",
		tradeCodes: [],
		importance: 0,
		notes: i === 0 ? "Uninhabited. Mainworld status, if present, is a system-designation choice rather than evidence of settlement." : r.status === "transplanted" ? "Referee-established transplanted population with WBH social generation." : "Initial UWP social profile with WBH population expansion."
	};
	if (_.tradeCodes = Uu(_, m, h, g), _.importance = Wu(_), _.uwp = `${d}${t.physical.uwpPhysical}${j(i)}${j(l)}${j(u)}-${j(p)}`, _.populationConcentration = bu(new S(Ou(`wbh-social-pcr-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), t, _), _.urbanisation = Eu(new S(Ou(`wbh-social-urbanisation-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), t, _), _.majorCities = mu(new S(Ou(`wbh-social-major-cities-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), _), _.balkanisation = Ll(new S(Ou(`wbh-social-balkanisation-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), i, l), i > 0) if (l === 7 && _.balkanisation) for (let e of _.balkanisation.factions) e.internalFactions = uu(new S(Ou(`wbh-social-government-factions-v1|${t.id}|${_.uwp}|${e.id}`)), i, e.governmentCode);
	else _.governmentFactions = uu(new S(Ou(`wbh-social-government-factions-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), i, l);
	let v = _.populationConcentration?.rating;
	if (i > 0 && typeof v == "number") if (l === 7 && _.balkanisation) for (let e of _.balkanisation.factions) e.centralisation = tu(new S(Ou(`wbh-social-centralisation-v1|${t.id}|${_.uwp}|${e.id}`)), e.governmentCode, v, !0);
	else l !== 0 && (_.governmentCentralisation = tu(new S(Ou(`wbh-social-centralisation-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), l, v, !1));
	return _;
}
function Ku(e, t, n, r, i, a, o, s, c) {
	let l = Il(t, r), u = {
		starport: e,
		populationCode: t,
		populationMultiplier: n,
		populationTotal: Lu(t, n),
		populationDetails: null,
		populationConcentration: null,
		urbanisation: null,
		majorCities: null,
		governmentDetails: l,
		balkanisation: null,
		governmentCentralisation: null,
		governmentFactions: null,
		habitationStatus: t === 0 ? "uninhabited" : void 0,
		habitationBasis: t === 0 ? "Imported UWP has Population 0." : "Imported source UWP establishes an inhabited population.",
		minimumSustainableTechLevel: null,
		minimumSustainableTechLevelBasis: [],
		governmentCode: l.governmentCode,
		lawLevelCode: i,
		techLevel: a,
		uwp: "",
		tradeCodes: [],
		importance: 0,
		notes: "Social profile imported from source UWP."
	};
	if (u.tradeCodes = Uu(u, o, s, c), u.importance = Wu(u), u.uwp = `${e}${j(o)}${j(s)}${j(c)}${j(t)}${j(u.governmentCode)}${j(i)}-${j(a)}`, u.balkanisation = Ll(new S(Ou(`wbh-social-balkanisation-v1|imported|${u.uwp}`)), t, u.governmentCode), t > 0) if (u.governmentCode === 7 && u.balkanisation) for (let e of u.balkanisation.factions) e.internalFactions = uu(new S(Ou(`wbh-social-government-factions-v1|imported|${u.uwp}|${e.id}`)), t, e.governmentCode);
	else u.governmentFactions = uu(new S(Ou(`wbh-social-government-factions-v1|imported|${u.uwp}`)), t, u.governmentCode);
	return u;
}
//#endregion
//#region src/rules/validation/systemValidation.ts
var qu = /* @__PURE__ */ new Set([
	"Frozen",
	"Cold",
	"Temperate",
	"Hot",
	"Boiling"
]), Ju = /* @__PURE__ */ new Set([
	5,
	6,
	8
]);
function N(e, t, n, r, i) {
	e.push({
		severity: t,
		scope: n,
		message: r,
		recommendation: i
	});
}
function Yu(e, t = 2) {
	let n = 10 ** t;
	return Math.round(e * n) / n;
}
function Xu(e, t) {
	return Math.abs(t - e) >= Math.max(5, Math.abs(e) * .01);
}
function Zu(e, t, n) {
	let r = n.details?.atmosphere, i = n.atmosphereCode;
	if (!(!r || i === null) && Ju.has(i) && (r.oxygenSafety === "low" || r.oxygenSafety === "high")) {
		let n = r.oxygenPartialPressureBar, a = r.oxygenSafety === "low" ? "low" : "high";
		N(e, "warning", t, `Nominally breathable Atmosphere ${i.toString(16).toUpperCase()} has ${a} oxygen${typeof n == "number" ? ` (ppo ${n} bar)` : ""} outside the WBH 0.1-0.5 bar safer range.`, "Referee review required: preserve the established Atmosphere code unless choosing to adjust pressure/oxygen values or convert it to the corresponding tainted atmosphere.");
	}
}
function Qu(e, t, n) {
	let r = n.details?.hydrographics;
	r && (r.coveragePercent > 0 && r.composition === "None" && N(e, "error", t, `Hydrographics records ${r.coveragePercent}% surface coverage but composition is None.`, "Resolve the hydrographic liquid composition or set precise coverage to 0."), r.surfaceFeatures?.discreteFeatureType === "water" && r.composition !== "H2O" && N(e, "warning", t, `Surface features are labelled as water but hydrographic composition is ${r.composition ?? "unresolved"}.`, "Keep unresolved or exotic fluids labelled as generic liquid until H2O composition is confirmed."));
}
function $u(e, t, n) {
	let r = n.details?.climate, i = r?.temperatureClass;
	i && qu.has(n.temperatureBand) && n.temperatureBand !== i && N(e, "info", t, `Provisional temperature band ${n.temperatureBand} differs from detailed WBH climate class ${i}.`, "Use the detailed climate class for presentation and retain the provisional band only as generation provenance.");
	let a = r?.meanTemperatureK, o = n.details?.seismology?.seismicAdjustedMeanTemperatureK;
	typeof a == "number" && Number.isFinite(a) && typeof o == "number" && Number.isFinite(o) && Xu(a, o) && N(e, "warning", t, `Seismic-adjusted mean temperature ${Yu(o)}K materially differs from detailed climate mean ${Yu(a)}K but has not been reconciled downstream.`, "Reconcile the final mean temperature before treating climate, native life, habitability, or other temperature consumers as final.");
}
function ed(e, t, n, r, i) {
	let a = n.sourceId ?? `${t}.${n.designation}`, o = n.orbitPd * (1 - n.eccentricity), s = n.orbitPd * (1 + n.eccentricity);
	(n.orbitPd > r || n.beyondHillMoonLimit) && N(e, "warning", a, `Persistent significant moon orbit ${Yu(n.orbitPd)} PD lies beyond the WBH Hill Sphere Moon Limit ${Yu(r)} PD.`, "Remove or relocate the significant moon; WBH system generation uses the Hill Sphere Moon Limit as the practical outer persistence boundary."), o < i && N(e, "warning", a, `Eccentric moon periapsis ${Yu(o)} PD crosses inside the nominal Roche limit ${Yu(i)} PD.`, "Review the orbit for disruption/ring formation or apply a referee-approved orbital correction."), s > r && N(e, "warning", a, `Eccentric moon apoapsis ${Yu(s)} PD crosses beyond the WBH Hill Sphere Moon Limit ${Yu(r)} PD.`, "Reduce eccentricity, relocate, or remove the significant moon so its complete persistent orbit remains inside the WBH Moon Limit."), n.physical && nd(e, a, n.physical);
}
function td(e, t, n) {
	let r = n.details?.satellites;
	if (r) for (let n of r.moons) ed(e, t, n, r.hillSphereMoonLimitPd, r.rocheLimitPd);
}
function nd(e, t, n) {
	Zu(e, t, n), Qu(e, t, n), $u(e, t, n), td(e, t, n);
}
function rd(e, t) {
	if (t.worldKind === "Empty Orbit") return;
	let n = t.physical;
	if (!n) {
		N(e, "warning", t.id, "World has no physical profile.", "Regenerate the system or check the physical world generation step.");
		return;
	}
	let r = n.sizeCode ?? 0, i = n.atmosphereCode ?? 0, a = n.hydrographicsCode ?? 0, o = t.social;
	nd(e, t.id, n), r === 0 && (i !== 0 || a !== 0) && N(e, "error", t.id, "Size 0 world has non-zero atmosphere or hydrographics.", "Set atmosphere and hydrographics to 0 for asteroid-size bodies."), i === 0 && a > 0 && n.temperatureBand !== "Frozen" && N(e, "warning", t.id, "Vacuum world has surface hydrographics outside a frozen environment.", "Treat water as ice, subsurface reservoirs, or reroll hydrographics."), a === 10 && ["Inferno", "Inner"].includes(n.zone) && N(e, "warning", t.id, "Very high hydrographics on a hot inner-zone world.", "Consider revising temperature, hydrographics, or atmosphere."), t.worldKind === "Gas Giant" && n.uwpPhysical !== "---" && N(e, "info", t.id, "Gas giant is excluded from UWP-style physical coding.", "This is expected for the current generator."), o && (o.populationCode === 0 && (o.governmentCode !== 0 || o.lawLevelCode !== 0 || o.starport !== "X") && N(e, "error", t.id, "Uninhabited world has government, law, or starport values that imply habitation.", "Set starport X and social codes 000."), o.populationCode > 0 && o.techLevel === 0 && N(e, "warning", t.id, "Inhabited world has TL 0.", "Confirm this is intentional for a primitive or collapsed society."), o.techLevel < 5 && (i <= 3 || i >= 10) && o.populationCode >= 6 && N(e, "warning", t.id, "Large population on a hostile-atmosphere world with low TL.", "Raise TL, reduce population, or explain outside support."), o.starport === "A" && o.populationCode <= 3 && N(e, "info", t.id, "Excellent starport with very low population.", "This may indicate a depot, research station, or external installation."), o.tradeCodes.includes("Ba") && o.populationCode !== 0 && N(e, "error", t.id, "Barren trade code conflicts with non-zero population.", "Recalculate trade codes."));
}
function id(e) {
	let t = [];
	for (let n of e.worlds) {
		n.isMainworld && t.push({
			id: n.id,
			topLevelWorld: n
		});
		for (let e of n.physical?.details?.satellites?.moons ?? []) e.isMainworld && t.push({ id: e.sourceId ?? `${n.id}.${e.designation}` });
	}
	return t;
}
function ad(e) {
	let t = [], n = id(e), r = n[0];
	r ? r.topLevelWorld && !r.topLevelWorld.social?.uwp && N(t, "warning", "system", "Selected mainworld does not have a complete UWP.", "Generate or manually assign social characteristics.") : N(t, "error", "system", "No mainworld was selected.", "Choose the most habitable terrestrial world, significant moon, or belt as the mainworld."), n.length > 1 && N(t, "error", "system", "More than one body is marked as the mainworld.", "Keep exactly one mainworld flag across worlds and significant moons."), r && e.summary.mainworldId && e.summary.mainworldId !== r.id && N(t, "error", "system", `Summary mainworld ${e.summary.mainworldId} does not match the body marked as mainworld ${r.id}.`, "Reconcile mainworld selection metadata before export."), e.stars.length === 0 && N(t, "error", "system", "System has no stars.", "Regenerate primary star data."), e.summary.totalWorlds !== e.worlds.filter((e) => e.worldKind !== "Empty Orbit").length && N(t, "warning", "system", "Summary world count does not match generated non-empty world rows.", "Check world placement and empty-orbit accounting.");
	for (let n of e.worlds) rd(t, n);
	return t.length === 0 && N(t, "info", "system", "No validation issues found."), t;
}
//#endregion
//#region src/rules/system/wbhMainworldDetermination.ts
function od(e) {
	return (e.physical?.details?.satellites?.moons ?? []).flatMap((t, n) => !t.physical || t.physical.details?.gasGiant ? [] : [{
		id: t.sourceId ?? `${e.id}.moon-${n + 1}`,
		parentId: e.id,
		kind: "Significant Moon",
		physical: t.physical,
		parentWorldKind: e.worldKind
	}]);
}
function sd(e) {
	return e.flatMap((e) => {
		let t = od(e);
		return e.worldKind === "Empty Orbit" || e.worldKind === "Gas Giant" ? t : [{
			id: e.id,
			parentId: null,
			kind: e.worldKind,
			physical: e.physical,
			parentWorldKind: null
		}, ...t];
	});
}
function cd(e) {
	if (e.parentWorldKind === "Gas Giant") return {
		rank: 100,
		classification: "parent-gas-giant",
		description: "Significant moon of a gas giant; immediate wilderness refuelling is available from the parent gas giant."
	};
	let t = (e.physical?.details?.planetoidBelt)?.composition.carbonaceousPercent ?? 0;
	if (t > 0) return {
		rank: Math.max(1, Math.min(98, Math.round(t))),
		classification: "belt-volatiles",
		description: `${Number(t.toFixed(1))}% icy/carbonaceous belt bodies provide wilderness fuel volatiles; exact local accessibility remains survey-dependent.`
	};
	let n = e.physical?.details?.hydrographics, r = n?.coveragePercent ?? 0;
	return n?.composition === "H2O" && r > 0 ? {
		rank: Math.max(1, Math.min(99, Math.round(r))),
		classification: r >= 10 ? "surface-h2o" : "limited-surface-h2o",
		description: `${Number(r.toFixed(1))}% H2O surface coverage provides wilderness refuelling potential.`
	} : {
		rank: 0,
		classification: "none-or-unknown",
		description: "No confirmed H2O surface source, belt volatiles, or immediately available parent gas giant is recorded."
	};
}
function ld(e) {
	let t = e.physical?.details;
	return {
		id: e.id,
		parentId: e.parentId,
		kind: e.kind,
		habitabilityRating: t?.habitabilityRating?.rating ?? null,
		nativeSophontsPresent: t?.nativeLife?.currentNativeSophont === !0,
		resourceRating: t?.resourceRating?.rating ?? t?.planetoidBelt?.resourceRating.rating ?? null,
		refuelling: cd(e)
	};
}
function ud(e) {
	let t = e.filter((e) => e !== null && Number.isFinite(e));
	return t.length ? Math.max(...t) : null;
}
function dd(e, t) {
	return e.totalCriterionWins === t.totalCriterionWins ? (e.habitabilityRating ?? -1) === (t.habitabilityRating ?? -1) ? e.nativeSophontsPresent === t.nativeSophontsPresent ? (e.resourceRating ?? -1) === (t.resourceRating ?? -1) ? e.refuelling.rank === t.refuelling.rank ? e.id.localeCompare(t.id) : t.refuelling.rank - e.refuelling.rank : (t.resourceRating ?? -1) - (e.resourceRating ?? -1) : Number(t.nativeSophontsPresent) - Number(e.nativeSophontsPresent) : (t.habitabilityRating ?? -1) - (e.habitabilityRating ?? -1) : t.totalCriterionWins - e.totalCriterionWins;
}
function fd(e) {
	let t = sd(e).map(ld), n = ud(t.map((e) => e.habitabilityRating)), r = ud(t.map((e) => e.resourceRating)), i = Math.max(0, ...t.map((e) => e.refuelling.rank)), a = t.map((e) => {
		let t = {
			highestHabitability: n !== null && e.habitabilityRating === n,
			nativeSophontsPresent: e.nativeSophontsPresent,
			highestResources: r !== null && e.resourceRating === r,
			bestRefuelling: i > 0 && e.refuelling.rank === i
		}, a = Object.values(t).filter(Boolean).length;
		return {
			...e,
			criterionWins: t,
			totalCriterionWins: a
		};
	}).sort(dd), o = a[0]?.id ?? null;
	return {
		method: "WBH final mainworld determination",
		recommendedMainworldId: o,
		selectedMainworldId: o,
		selectionSource: "generated-recommendation",
		candidates: a,
		explanation: [
			"WBH lists four mainworld criteria but supplies no numeric weighting formula.",
			"The generator therefore awards one visible criterion win for each system-best criterion: Habitability, native sophonts, Resources, and refuelling.",
			"Candidates tied on total criterion wins are ordered deterministically by the same four criteria in Handbook order, then stable body ID.",
			"Refuelling compares confirmed H2O surface coverage, icy/carbonaceous belt availability, and immediate access to a parent gas giant. This comparison is an explicit generator interpretation because WBH supplies no numeric refuelling scale.",
			"Planetoid belts use the separate WBH belt Resource Rating procedure; belt Habitability remains not applicable on the physical belt survey form.",
			"The Referee may override the generated recommendation, as explicitly permitted by WBH."
		]
	};
}
function pd(e, t) {
	return e.map((e) => {
		let n = e.physical?.details?.satellites, r = n && {
			...n,
			moons: n.moons.map((n, r) => ({
				...n,
				isMainworld: (n.sourceId ?? `${e.id}.moon-${r + 1}`) === t
			}))
		};
		return {
			...e,
			isMainworld: e.id === t,
			physical: e.physical?.details ? {
				...e.physical,
				details: {
					...e.physical.details,
					satellites: r
				}
			} : e.physical
		};
	});
}
function md(e, t) {
	if (!t) return null;
	for (let n of e) {
		if (n.id === t) return { world: n };
		for (let e = 0; e < (n.physical?.details?.satellites?.moons.length ?? 0); e += 1) {
			let r = n.physical.details.satellites.moons[e];
			if ((r.sourceId ?? `${n.id}.moon-${e + 1}`) === t) return {
				world: n,
				moon: r
			};
		}
	}
	return null;
}
//#endregion
//#region src/rules/system/wbhMultipleStarStructure.ts
var hd = /* @__PURE__ */ new Set([
	"Ia",
	"Ib",
	"II",
	"III"
]), gd = /* @__PURE__ */ new Set([
	"Ia",
	"Ib",
	"II",
	"III",
	"IV"
]), _d = /* @__PURE__ */ new Set([
	"O",
	"B",
	"A",
	"F"
]);
function vd(e) {
	if (gd.has(e.luminosityClass)) return 1;
	if (e.luminosityClass === "V" || e.luminosityClass === "VI") {
		if (_d.has(e.spectralType)) return 1;
		if (e.spectralType === "M") return -1;
	}
	return e.spectralType === "BD" || e.spectralType === "D" ? -1 : 0;
}
function yd(e) {
	return !hd.has(e.luminosityClass);
}
function bd(e) {
	return hd.has(e.luminosityClass);
}
function xd(e, t) {
	if (!Number.isInteger(e) || e < 1 || e > 6) throw RangeError(`${t} must be an integer from 1 to 6.`);
}
function Sd(e) {
	if (!Number.isInteger(e) || e < 2 || e > 12) throw RangeError("2D total must be an integer from 2 to 12.");
}
function Cd(e, t, n) {
	xd(t, "Orbit roll"), xd(n, "Fractional-variance roll");
	let r = (n - 1) / 10;
	if (e === "Close") {
		let e = t - 1;
		return (e === 0 ? .5 : e) + r;
	}
	return e === "Near" ? t + 5 + r : t + 11 + r;
}
function wd(e, t) {
	return xd(e, "Companion orbit roll"), Sd(t), e / 10 + (t - 7) / 100;
}
function Td(e, t) {
	if (xd(e, "Giant companion orbit roll"), !Number.isFinite(t) || t < 0) throw RangeError("Parent minimum allowable orbit must be a finite non-negative Orbit#.");
	return e * t;
}
//#endregion
//#region src/rules/system/wbhAllowableOrbits.ts
function Ed(e) {
	return e.filter((e) => e.orbitClass !== "Primary" && e.orbitClass !== "Companion" && Number.isFinite(e.orbitNumber)).sort((e, t) => Number(e.orbitNumber) - Number(t.orbitNumber));
}
function Dd(e, t) {
	return e.find((e) => e.orbitClass === "Companion" && e.parentId === t.id) ?? null;
}
function Od(e) {
	if (e.spectralType === "BD" || e.luminosityClass === "BD") return .005;
	if (e.spectralType === "D" || e.luminosityClass === "D") return .001;
	let t = Math.max(0, .01 * Number(e.diameterSolar || 0));
	return O(Math.max(.01, qn(t)), 2);
}
function kd(e, t) {
	let n = Od(e);
	if (!t) return n;
	let r = Math.max(0, Number(t.eccentricity || 0)), i = Math.max(n, Od(t)), a = i > .2 ? i : 0;
	return O(Math.max(n, .5 + r + a), 2);
}
function Ad(e) {
	if (e.orbitClass === "Primary" || e.orbitClass === "Companion" || !Number.isFinite(e.orbitNumber)) throw Error("Primary exclusion requires a Close, Near, or Far secondary with an Orbit#.");
	let t = 1, n = Od(e);
	n > .2 && (t += n);
	let r = Math.max(0, Number(e.eccentricity || 0));
	r > .2 && (t += 1), (e.orbitClass === "Close" || e.orbitClass === "Near") && r > .5 && (t += 1);
	let i = Number(e.orbitNumber);
	return {
		sourceStarId: e.id,
		sourceDesignation: e.designation,
		inner: O(Math.max(0, i - t), 2),
		outer: O(i + t, 2),
		reason: `WBH exclusion around ${e.orbitClass} secondary ${e.designation}.`
	};
}
function jd(e, t) {
	let n = [];
	for (let r of e) {
		if (t.outer <= r.inner || t.inner >= r.outer) {
			n.push(r);
			continue;
		}
		t.inner > r.inner && n.push({
			inner: r.inner,
			outer: O(t.inner, 2)
		}), t.outer < r.outer && n.push({
			inner: O(t.outer, 2),
			outer: r.outer
		});
	}
	return n.filter((e) => e.outer - e.inner >= .01);
}
function Md(e) {
	return O(e.reduce((e, t) => e + Math.max(0, t.outer - t.inner), 0), 2);
}
function Nd(e, t) {
	let n = /* @__PURE__ */ new Map([
		["Close", 0],
		["Near", 1],
		["Far", 2]
	]), r = n.get(e.orbitClass), i = n.get(t.orbitClass);
	return r !== void 0 && i !== void 0 && Math.abs(r - i) === 1;
}
function Pd(e, t) {
	let n = Number(e.orbitNumber);
	if (!Number.isFinite(n)) return null;
	let r = n - 3, i = t.filter((t) => t.id !== e.id && Nd(e, t));
	return i.length > 0 && --r, [e, ...i].some((e) => Number(e.eccentricity || 0) > .2) && --r, O(r, 2);
}
function Fd(e) {
	let t = e.find((e) => e.orbitClass === "Primary") ?? e[0];
	if (!t) return {
		zones: [],
		primaryExclusions: []
	};
	let n = Ed(e), r = n.map(Ad), i = [], a = Dd(e, t), o = kd(t, a), s = o < 20 ? [{
		inner: o,
		outer: 20
	}] : [];
	for (let e of r) s = jd(s, e);
	i.push({
		starId: t.id,
		starDesignation: t.designation,
		parentStarIds: a ? [t.id, a.id] : [t.id],
		parentDesignations: a ? [t.designation, a.designation] : [t.designation],
		minimumAllowableOrbit: o,
		ranges: s,
		availableOrbitSpan: Md(s),
		outerLimit: s.length ? s.at(-1).outer : null
	});
	for (let t of n) {
		let r = Dd(e, t), a = kd(t, r), o = Pd(t, n), s = o !== null && o - a >= .01 ? [{
			inner: a,
			outer: o
		}] : [];
		i.push({
			starId: t.id,
			starDesignation: t.designation,
			parentStarIds: r ? [t.id, r.id] : [t.id],
			parentDesignations: r ? [t.designation, r.designation] : [t.designation],
			minimumAllowableOrbit: a,
			ranges: s,
			availableOrbitSpan: Md(s),
			outerLimit: s.length ? s.at(-1).outer : null
		});
	}
	return {
		zones: i,
		primaryExclusions: r
	};
}
//#endregion
//#region src/rules/system/wbhHillStability.ts
function Id(e) {
	return e.orbitAu === void 0 ? e.orbitNumber === void 0 ? 0 : Kn(e.orbitNumber) : e.orbitAu;
}
function Ld(e, t) {
	let n = t.filter((t) => t.orbitClass === "Companion" && t.parentId === e.id), r = n.reduce((e, t) => {
		let n = Id(t);
		return Math.max(e, n * (1 + (t.eccentricity ?? 0)));
	}, 0);
	return {
		anchor: e,
		companions: n,
		starIds: [e.id, ...n.map((e) => e.id)],
		massSolar: e.massSolar + n.reduce((e, t) => e + t.massSolar, 0),
		companionApoapsisAu: r
	};
}
function Rd(e) {
	if (e.anchor.orbitAu !== void 0) return e.anchor.orbitAu;
	if (e.anchor.orbitNumber !== void 0) return Kn(e.anchor.orbitNumber);
	throw Error(`Secondary star ${e.anchor.id} has no stellar orbit.`);
}
function zd(e, t, n) {
	return e <= 0 || t <= 0 || n <= 0 ? 0 : e * Math.cbrt(t / (3 * n));
}
function Bd(e, t) {
	let n = Rd(t), r = t.anchor.eccentricity ?? 0;
	return Math.max(0, n * (1 - r) - e.companionApoapsisAu - t.companionApoapsisAu);
}
function Vd(e, t) {
	let n = Rd(e), r = Rd(t), i = e.anchor.eccentricity ?? 0, a = t.anchor.eccentricity ?? 0;
	return Math.max(0, r * (1 - a) - n * (1 + i) - e.companionApoapsisAu - t.companionApoapsisAu);
}
function Hd(e, t, n, r) {
	return {
		otherStarId: t.anchor.id,
		separationAu: O(n, 6),
		hillSphereAu: O(zd(n, e.massSolar, t.massSolar), 6),
		basis: r
	};
}
function Ud(e) {
	let t = e.find((e) => e.orbitClass === "Primary");
	if (!t) throw Error("WBH Hill/stability calculation requires one primary star.");
	let n = Ld(t, e), r = e.filter((e) => e.orbitClass === "Close" || e.orbitClass === "Near" || e.orbitClass === "Far").map((t) => Ld(t, e)).sort((e, t) => Rd(e) - Rd(t)), i = [n, ...r], a = new Map(i.map((e) => [e.anchor.id, []])), o = r[0];
	if (o) {
		let e = Bd(n, o);
		a.get(n.anchor.id).push(Hd(n, o, e, "primary-secondary"));
	}
	for (let e of r) {
		let t = Bd(n, e);
		a.get(e.anchor.id).push(Hd(e, n, t, "secondary-primary"));
	}
	for (let e = 0; e < r.length; e += 1) for (let t = e + 1; t < r.length; t += 1) {
		let n = r[e], i = r[t], o = Vd(n, i);
		a.get(n.anchor.id).push(Hd(n, i, o, "secondary-secondary")), a.get(i.anchor.id).push(Hd(i, n, o, "secondary-secondary"));
	}
	return {
		method: "WBH alternate multi-star Hill/stability spheres",
		zones: i.map((e) => {
			let t = a.get(e.anchor.id) ?? [], n = t.length > 0 ? Math.min(...t.map((e) => e.hillSphereAu)) : null, r = n === null ? null : n / 3, i = n === null ? null : n / 2;
			return {
				starId: e.anchor.id,
				designation: e.anchor.designation,
				groupedStarIds: e.starIds,
				groupedMassSolar: O(e.massSolar, 6),
				hillSphereAu: n === null ? null : O(n, 6),
				stabilitySphereAu: r === null ? null : O(r, 6),
				stabilitySphereOrbitNumber: r === null ? null : O(qn(r), 6),
				absoluteMaximumAu: i === null ? null : O(i, 6),
				absoluteMaximumOrbitNumber: i === null ? null : O(qn(i), 6),
				constraints: t
			};
		}),
		generationNotes: r.length === 0 ? ["Single-star system: no inter-star Hill constraint applies."] : [
			"WBH alternate steps 1-4: stellar Orbit# values are evaluated in AU and pairwise Hill spheres are calculated.",
			"Companions are grouped with their direct parent for mass and their apoapsis shrinks the pair separation.",
			"The primary uses the closest-secondary constraint; secondary groups use their smallest primary/pairwise Hill result.",
			"The stability radius is one-third of the effective Hill sphere and the variance ceiling is one-half."
		]
	};
}
//#endregion
//#region src/rules/system/wbhHillStableOrbitZones.ts
var Wd = 20;
function Gd(e, t) {
	return e.find((e) => e.orbitClass === "Companion" && e.parentId === t.id) ?? null;
}
function Kd(e) {
	if (e.orbitAu !== void 0) return e.orbitAu;
	if (e.orbitNumber !== void 0) return Kn(e.orbitNumber);
	throw Error(`Secondary star ${e.id} has no stellar orbit.`);
}
function qd(e) {
	return O(e.reduce((e, t) => e + Math.max(0, t.outer - t.inner), 0), 2);
}
function Jd(e, t) {
	let n = O(Math.max(0, e), 2), r = O(Math.min(Wd, t), 2);
	return r - n >= .01 ? {
		inner: n,
		outer: r
	} : null;
}
function Yd(e, t, n, r) {
	let i = [...r].sort((e, t) => e.inner - t.inner);
	return {
		starId: e.id,
		starDesignation: e.designation,
		parentStarIds: t ? [e.id, t.id] : [e.id],
		parentDesignations: t ? [e.designation, t.designation] : [e.designation],
		minimumAllowableOrbit: n,
		ranges: i,
		availableOrbitSpan: qd(i),
		outerLimit: i.length ? i.at(-1).outer : null
	};
}
function Xd(e) {
	let t = e.find((e) => e.orbitClass === "Primary") ?? e[0];
	if (!t) return {
		zones: [],
		primaryExclusions: [],
		method: "WBH alternate Hill/stability orbit zones",
		generationNotes: []
	};
	let n = e.filter((e) => e.orbitClass === "Close" || e.orbitClass === "Near" || e.orbitClass === "Far").sort((e, t) => Kd(e) - Kd(t)), r = Ud(e), i = new Map(r.zones.map((e) => [e.starId, e])), a = Gd(e, t), o = kd(t, a), s = [], c = i.get(t.id);
	if (n.length === 0 || c?.stabilitySphereOrbitNumber === null) {
		let e = Jd(o, Wd);
		e && s.push(e);
	} else if (c?.stabilitySphereOrbitNumber !== void 0) {
		let e = Jd(o, c.stabilitySphereOrbitNumber);
		e && s.push(e);
	}
	for (let e = 0; e < n.length; e += 1) {
		let t = n[e], r = i.get(t.id);
		if (r?.hillSphereAu === null || r?.hillSphereAu === void 0) continue;
		let a = Kd(t) * (1 + Math.max(0, t.eccentricity ?? 0)), o = qn(a + 2 * r.hillSphereAu), c = n[e + 1], l = Wd;
		if (c) {
			let e = i.get(c.id);
			if (e?.hillSphereAu === null || e?.hillSphereAu === void 0) continue;
			let t = Kd(c) * (1 - Math.max(0, c.eccentricity ?? 0));
			l = qn(Math.max(0, t - a - e.hillSphereAu));
		}
		let u = Jd(o, l);
		u && s.push(u);
	}
	let l = [Yd(t, a, o, s)];
	for (let t of n) {
		let n = Gd(e, t), r = kd(t, n), a = i.get(t.id)?.stabilitySphereOrbitNumber ?? null, o = a === null ? null : Jd(r, a);
		l.push(Yd(t, n, r, o ? [o] : []));
	}
	return {
		zones: l,
		primaryExclusions: [],
		method: "WBH alternate Hill/stability orbit zones",
		generationNotes: [
			...r.generationNotes,
			"WBH alternate steps 4-7 convert one-third Hill stability limits to individual Orbit# ranges.",
			"Circummultiple stable ranges are attached to the primary anchor while effective interior-star physics remains hierarchy-aware."
		]
	};
}
//#endregion
//#region src/rules/system/wbhOrbitMethod.ts
function Zd(e) {
	return e.multiStarOrbitMethod === "hill-stability" ? "hill-stability" : "simplified";
}
//#endregion
//#region src/rules/system/wbhWorldPlacement.ts
var P = .01, Qd = 20, $d = 13, ef = /* @__PURE__ */ new Map([
	["Primary", 0],
	["Close", 1],
	["Near", 2],
	["Far", 3],
	["Companion", 4]
]);
function tf(e, t) {
	return t <= 1 ? 0 : e.die(t) - 1;
}
function nf(e) {
	return e.find((e) => e.orbitClass === "Primary") ?? e[0] ?? null;
}
function rf(e, t) {
	return e.find((e) => e.orbitClass === "Companion" && e.parentId === t.id) ?? null;
}
function af(e) {
	return e.spectralType === "D" || e.luminosityClass === "D";
}
function of(e) {
	return [...e].sort((e, t) => {
		let n = (ef.get(e.star.orbitClass) ?? 99) - (ef.get(t.star.orbitClass) ?? 99);
		return n === 0 ? Number(e.star.orbitNumber ?? 0) - Number(t.star.orbitNumber ?? 0) : n;
	});
}
function sf(e, t) {
	return t >= e.inner && t <= e.outer;
}
function cf(e, t) {
	return e.ranges.some((e) => sf(e, t));
}
function lf(e, t, n) {
	return n <= t ? 0 : e.ranges.reduce((e, r) => {
		let i = Math.max(t, r.inner), a = Math.min(n, r.outer);
		return e + Math.max(0, a - i);
	}, 0);
}
function uf(e, t) {
	return !Number.isFinite(e) || e <= 0 ? 0 : Math.max(0, Math.floor(e + +!t));
}
function df(e, t) {
	let n = (e.allowable.parentStarIds.length > 0 ? e.allowable.parentStarIds : [e.star.id]).reduce((e, n) => e + Math.max(0, t.find((e) => e.id === n)?.luminositySolar ?? 0), 0);
	return O(qn(Math.sqrt(Math.max(n, 1e-6))), 2);
}
function ff(e, t, n) {
	let r = of(e).map((e) => ({
		...e,
		hzco: df(e, t),
		totalStarOrbits: uf(e.allowable.availableOrbitSpan, e.allowable.parentStarIds.length > 1),
		allocatedWorlds: 0,
		emptySlots: 0,
		spread: 0
	})), i = r.reduce((e, t) => e + t.totalStarOrbits, 0), a = r.filter((e) => e.totalStarOrbits > 0);
	if (n <= 0 || i <= 0 || a.length === 0) return r;
	let o = n, s = a.at(-1);
	for (let e of r) {
		if (e.totalStarOrbits <= 0) continue;
		if (e === s) {
			e.allocatedWorlds = o;
			break;
		}
		let t = n * e.totalStarOrbits / i, r = e.star.orbitClass === "Primary" ? Math.ceil(t) : Math.floor(t);
		e.allocatedWorlds = Math.min(o, Math.max(0, r)), o -= e.allocatedWorlds;
	}
	return r;
}
function pf(e, t) {
	let n = nf(e);
	if (!n) return 0;
	let r = 0;
	return rf(e, n) && (r -= 2), [
		"Ia",
		"Ib",
		"II"
	].includes(n.luminosityClass) ? r += 3 : n.luminosityClass === "III" ? r += 2 : n.luminosityClass === "IV" ? r += 1 : n.luminosityClass === "VI" && --r, af(n) && (r -= 2), t < 6 ? r -= 4 : t <= 9 ? r -= 3 : t <= 12 ? r -= 2 : t <= 15 ? --r : t <= 17 ? r += 0 : t <= 20 ? r += 1 : r += 2, r -= e.filter((e) => [
		"Close",
		"Near",
		"Far"
	].includes(e.orbitClass)).length, r;
}
function mf(e, t, n, r) {
	let i = t.find((e) => e.star.orbitClass === "Primary") ?? t[0];
	if (!i) return {
		number: 0,
		mode: "cold",
		innerSplitCount: 0
	};
	if (n.some((e) => e.orbitClass === "Close") && !cf(i.allowable, i.hzco)) {
		let t = lf(i.allowable, i.allowable.minimumAllowableOrbit, i.hzco), n = Math.floor(t / P), r = Math.min(i.allocatedWorlds, n);
		if (r <= 0) return {
			number: 0,
			mode: "cold",
			innerSplitCount: 0
		};
		let a = tf(e, r + 1);
		return {
			number: a + 1,
			mode: "split",
			innerSplitCount: a
		};
	}
	let a = e.roll(2, 6, pf(n, r)).total;
	return a < 1 ? {
		number: a,
		mode: "cold",
		innerSplitCount: 0
	} : a > r ? {
		number: a,
		mode: "hot",
		innerSplitCount: 0
	} : {
		number: a,
		mode: "habitable",
		innerSplitCount: 0
	};
}
function hf(e, t, n) {
	if (cf(e, t)) return O(t, 2);
	let r = null;
	for (let i of e.ranges) {
		let e = Math.min(i.outer, i.inner + Math.abs(n)), a = Math.max(i.inner, i.outer - Math.abs(n));
		for (let n of [{
			distance: Math.abs(t - i.inner),
			value: e
		}, {
			distance: Math.abs(t - i.outer),
			value: a
		}]) (!r || n.distance < r.distance) && (r = n);
	}
	return r ? O(r.value, 2) : null;
}
function gf(e, t, n, r) {
	let i = t.hzco, a = t.allowable.minimumAllowableOrbit, o = i >= 1 ? 10 : 100, s = e.roll(2, 6, -7).total / o;
	if (r.mode === "split") {
		let e = t.allowable.ranges.find((e) => e.inner > i);
		return e ? O(Math.min(e.outer, e.inner + Math.abs(s)), 2) : hf(t.allowable, i, s) ?? a;
	}
	if (r.mode === "cold") {
		let e = i >= 1 ? Math.abs(r.number) : Math.abs(r.number) / 10, n = Math.max(i, a) + e + s, o = t.allowable.ranges.find((e) => e.outer >= Math.max(i, n));
		return o ? O(Math.max(o.inner, Math.min(o.outer, Math.max(i, n))), 2) : t.allowable.ranges.at(-1)?.outer ?? a;
	}
	if (r.mode === "hot") {
		let o = i - r.number + n, c = i >= 1 && o >= 1 ? o + s : i - r.number / 10 + n / 10 + e.roll(2, 6, -7).total / 100;
		return c < 0 && (c = Math.max(i - .1, a + t.allocatedWorlds * .01)), hf(t.allowable, Math.min(i, c), s) ?? a;
	}
	return hf(t.allowable, i + s, s) ?? a;
}
function _f(e) {
	return e <= 9 ? 0 : e === 10 ? 1 : e === 11 ? 2 : 3;
}
function vf(e, t) {
	let n = t;
	for (let t of [
		"Close",
		"Near",
		"Far"
	]) {
		if (n <= 0) break;
		let r = e.find((e) => e.star.orbitClass === t && e.allocatedWorlds > 0 && e.totalStarOrbits > 0);
		r && (r.emptySlots += 1, --n);
	}
	let r = e.find((e) => e.star.orbitClass === "Primary" && e.allocatedWorlds > 0 && e.totalStarOrbits > 0);
	return r && n > 0 && (r.emptySlots += n, n = 0), n;
}
function yf(e, t, n) {
	return n < 0 || t <= e ? 0 : (t - e) / (n + 1);
}
function bf(e, t, n, r) {
	let i = e.find((e) => e.star.orbitClass === "Primary") ?? e[0];
	if (!i) return P;
	let a = Math.max(P, (r - i.allowable.minimumAllowableOrbit) / Math.max(1, n)), o = i.allocatedWorlds + i.emptySlots, s = o > 0 ? i.allowable.availableOrbitSpan / Math.max(1, o + t.length) : a, c = O(Math.max(P, Math.min(a, s > 0 ? s : a)), 2);
	for (let t of e) {
		if (t.star.orbitClass === "Primary") {
			t.spread = c;
			continue;
		}
		let e = t.allocatedWorlds + t.emptySlots, n = yf(t.allowable.minimumAllowableOrbit, t.allowable.outerLimit ?? t.allowable.minimumAllowableOrbit, e);
		t.spread = O(Math.max(P, n > 0 ? Math.min(c, n) : c), 2);
	}
	return c;
}
function xf(e, t, n) {
	if (n < 0 || e.ranges.length === 0) return null;
	let r = e.ranges.findIndex((e) => sf(e, t)), i = t;
	if (r < 0) {
		if (r = e.ranges.findIndex((e) => e.inner >= t), r < 0) return null;
		i = e.ranges[r].inner;
	}
	let a = n;
	for (; r < e.ranges.length;) {
		let t = e.ranges[r], n = Math.max(0, t.outer - i);
		if (a <= n) return O(i + a, 2);
		if (a -= n, r += 1, r >= e.ranges.length) return null;
		i = e.ranges[r].inner;
	}
	return null;
}
function Sf(e, t, n, r, i) {
	let a = [], o = r;
	for (let r = 0; r < n; r += 1) {
		let n = e.roll(2, 6, -7).total * t.spread / 10, s = Math.max(P, t.spread + n), c = xf(t.allowable, o, s);
		if (c === null) break;
		a.push({
			key: `regular-${i + r}`,
			zone: t,
			orbitNumber: c,
			insertionOrder: i + r,
			orbitalDirection: "Prograde",
			eccentricity: 0,
			generationNotes: c - (o + s) >= P ? ["WBH placement translated this slot across an unavailable stellar exclusion range."] : []
		}), o = c;
	}
	return a;
}
function Cf(e, t, n, r, i) {
	let a = [], o = r;
	for (let r = 0; r < n; r += 1) {
		let n = e.roll(2, 6, -7).total * t.spread / 10, s = Math.max(P, t.spread + n), c = null;
		for (let e of [...t.allowable.ranges].reverse()) {
			if (o < e.inner) continue;
			let n = Math.min(o, e.outer);
			if (n - s >= e.inner) {
				c = O(n - s, 2);
				break;
			}
			let r = s - Math.max(0, n - e.inner), i = t.allowable.ranges.indexOf(e) - 1;
			if (i >= 0) {
				let e = t.allowable.ranges[i];
				e.outer - r >= e.inner && (c = O(e.outer - r, 2));
			}
			break;
		}
		if (c === null) break;
		a.push({
			key: `regular-${i + r}`,
			zone: t,
			orbitNumber: c,
			insertionOrder: i + r,
			orbitalDirection: "Prograde",
			eccentricity: 0,
			generationNotes: []
		}), o = c;
	}
	return a.reverse();
}
function wf(e, t, n, r) {
	let i = [], a = 0, o = 0;
	for (let s of t) {
		let t = s.allocatedWorlds + s.emptySlots;
		if (t <= 0) continue;
		if (s.allowable.ranges.length === 0) {
			o += t;
			continue;
		}
		let c;
		if (s.star.orbitClass !== "Primary") c = Sf(e, s, t, s.allowable.minimumAllowableOrbit, a);
		else if (n.mode === "cold") c = Sf(e, s, t, Math.max(r - s.spread, s.allowable.minimumAllowableOrbit), a);
		else if (n.mode === "hot") c = Cf(e, s, t, r + s.spread, a);
		else if (n.mode === "split") {
			let i = Sf(e, s, Math.min(t, n.innerSplitCount), s.allowable.minimumAllowableOrbit, a), o = t - i.length, l = o > 0 ? Sf(e, s, o, Math.max(r - s.spread, s.allowable.minimumAllowableOrbit), a + i.length) : [];
			c = [...i, ...l];
		} else c = Sf(e, s, t, s.allowable.minimumAllowableOrbit, a);
		i.push(...c), a += c.length, o += t - c.length;
	}
	return {
		slots: i,
		unplaced: o
	};
}
function Tf(e) {
	return e <= 9 ? 0 : e === 10 ? 1 : e === 11 ? 2 : 3;
}
function Ef(e) {
	return e <= 7 ? "Random" : e === 8 ? "Eccentric" : e === 9 ? "Inclined" : e <= 11 ? "Retrograde" : "Trojan";
}
function Df(e, t) {
	let n = Math.min(t, Math.max(0, $d - e.terrestrialPlanets));
	return {
		gasGiants: e.gasGiants,
		planetoidBelts: e.planetoidBelts + t - n,
		terrestrialPlanets: e.terrestrialPlanets + n,
		totalWorlds: e.totalWorlds + t
	};
}
function Of(e, t, n) {
	let r = Math.max(e.allowable.minimumAllowableOrbit, Math.min(Qd, t)), i = (t) => n.some((n) => n.zone.star.id === e.star.id && Math.abs(n.orbitNumber - t) < P / 2), a = hf(e.allowable, r, P);
	if (a !== null && !i(a)) return a;
	for (let t = 1; t <= 600; t += 1) for (let n of [O(r + t * P, 2), O(r - t * P, 2)]) if (n >= e.allowable.minimumAllowableOrbit && n <= Qd && cf(e.allowable, n) && !i(n)) return n;
	return null;
}
function kf(e, t, n, r, i) {
	let a = n.filter((e) => e.allowable.availableOrbitSpan > 0 && e.allowable.ranges.length > 0), o = 0, s = 0, c = t.reduce((e, t) => Math.max(e, t.insertionOrder + 1), 0);
	for (let n = 0; n < i; n += 1) {
		if (a.length === 0) return o + i - n;
		let l = Ef(e.roll(2, 6).total), u = r.terrestrialPlanets + s < $d ? "Terrestrial Planet" : "Planetoid Belt";
		if (u === "Terrestrial Planet" && (s += 1), l === "Trojan") {
			let n = t.filter((e) => !e.anomaly && e.worldKind === void 0);
			if (n.length > 0) {
				let r = n[tf(e, n.length)];
				r.protectedFromEmpty = !0;
				let i = e.d6() <= 3;
				t.push({
					key: `anomaly-${c}`,
					zone: r.zone,
					orbitNumber: r.orbitNumber,
					insertionOrder: c++,
					worldKind: u,
					anomaly: l,
					orbitalDirection: "Prograde",
					trojanHostKey: r.key,
					trojanOffsetDegrees: i ? 60 : -60,
					eccentricity: 0,
					generationNotes: [`WBH anomalous planet: Trojan ${i ? "leading" : "trailing"} its host by 60 degrees.`]
				});
				continue;
			}
		}
		let d = a[tf(e, a.length)], f = Of(d, e.roll(2, 6, -2).total + e.d10ZeroToNine() / 10, t);
		if (f === null) {
			o += 1;
			continue;
		}
		let p = l === "Inclined" ? (e.d6() + 2) * 10 + e.d10ZeroToNine() : void 0;
		t.push({
			key: `anomaly-${c}`,
			zone: d,
			orbitNumber: f,
			insertionOrder: c++,
			worldKind: u,
			anomaly: l,
			inclinationDegrees: p,
			orbitalDirection: l === "Retrograde" ? "Retrograde" : "Prograde",
			eccentricity: 0,
			generationNotes: [`WBH anomalous planet: ${l.toLowerCase()} orbit.`]
		});
	}
	return o;
}
function Af(e) {
	return [...e].sort((e, t) => {
		let n = (ef.get(e.zone.star.orbitClass) ?? 99) - (ef.get(t.zone.star.orbitClass) ?? 99);
		if (n !== 0) return n;
		let r = Number(e.zone.star.orbitNumber ?? 0) - Number(t.zone.star.orbitNumber ?? 0);
		return r === 0 ? e.orbitNumber - t.orbitNumber || e.insertionOrder - t.insertionOrder : r;
	});
}
function jf(e, t, n, r, i = () => !0) {
	let a = 0;
	for (let o = 0; o < r && t.length !== 0; o += 1) {
		let r = tf(e, t.length), o;
		for (let e = 0; e < t.length; e += 1) {
			let n = t[(r + e) % t.length];
			if (n.worldKind === void 0 && i(n)) {
				o = n;
				break;
			}
		}
		if (!o) break;
		o.worldKind = n, a += 1;
	}
	return a;
}
function Mf(e, t, n, r) {
	let i = Af(t), a = 0, o = jf(e, i, "Empty Orbit", r, (e) => !e.anomaly && !e.protectedFromEmpty);
	a += r - o;
	let s = jf(e, i, "Gas Giant", n.gasGiants);
	a += n.gasGiants - s;
	let c = jf(e, i, "Planetoid Belt", n.planetoidBelts);
	a += n.planetoidBelts - c;
	for (let e of i) e.worldKind === void 0 && (e.worldKind = "Terrestrial Planet");
	return a;
}
function Nf(e) {
	return e === "Eccentric" ? 5 : e === "Random" || e === "Inclined" || e === "Retrograde" ? 2 : 0;
}
function Pf(e, t, n) {
	for (let r of t) {
		if (r.worldKind === "Empty Orbit" || r.worldKind === void 0) continue;
		let t = Nf(r.anomaly);
		r.orbitNumber < 1 && n > 1 && --t, r.worldKind === "Planetoid Belt" && (t += 1);
		assign: r.eccentricity = Jn(e, t);
	}
}
function Ff(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.filter((e) => e.worldKind !== void 0)) {
		let e = t.get(n.zone.star.id) ?? [];
		e.push(n), t.set(n.zone.star.id, e);
	}
	let n = /* @__PURE__ */ new Map();
	for (let e of t.values()) e.sort((e, t) => e.orbitNumber - t.orbitNumber || e.insertionOrder - t.insertionOrder), e.forEach((e, t) => n.set(e.key, `${e.zone.star.designation}-${t + 1}`));
	return [...t.values()].flatMap((e) => e.map((e, t) => {
		let r = O(e.orbitNumber - e.zone.hzco, 2), i = [...e.generationNotes];
		return e.inclinationDegrees !== void 0 && i.push(`Inclined ${e.inclinationDegrees} degrees.`), e.orbitalDirection === "Retrograde" && i.push("Retrograde orbital direction."), {
			id: n.get(e.key),
			aroundStarId: e.zone.star.id,
			aroundDesignation: e.zone.star.designation,
			sequence: t + 1,
			orbitNumber: e.orbitNumber,
			au: O(Kn(e.orbitNumber), 6),
			eccentricity: e.eccentricity,
			hzco: e.zone.hzco,
			hzDeviation: r,
			worldKind: e.worldKind,
			orbitAnomaly: e.anomaly,
			inclinationDegrees: e.inclinationDegrees,
			orbitalDirection: e.orbitalDirection,
			trojanReferenceId: e.trojanHostKey ? n.get(e.trojanHostKey) : void 0,
			trojanOffsetDegrees: e.trojanOffsetDegrees,
			generationNotes: i.length > 0 ? i : void 0
		};
	})).sort((e, t) => e.au - t.au || e.aroundDesignation.localeCompare(t.aroundDesignation) || e.sequence - t.sequence);
}
function If(e, t, n, r, i) {
	let a = ff(t, n, r.totalWorlds), o = mf(e, a, n, r.totalWorlds), s = a.find((e) => e.star.orbitClass === "Primary") ?? a[0], c = s ? gf(e, s, r.totalWorlds, o) : 0, l = _f(e.roll(2, 6).total), u = vf(a, l), d = bf(a, n, o.number, c), f = wf(e, a, o, c), p = Tf(e.roll(2, 6).total), m = Df(r, p), h = kf(e, f.slots, a, r, p), g = Mf(e, f.slots, r, l - u);
	return Pf(e, f.slots, i), {
		worlds: Ff(f.slots),
		counts: m,
		emptyOrbits: l - u,
		anomalousOrbits: p,
		baselineNumber: o.number,
		baselineOrbitNumber: c,
		spread: d,
		unplacedSlots: f.unplaced + u + h + g
	};
}
//#endregion
//#region src/rules/system/generateExpandedSystem.ts
function Lf(e) {
	return {
		...tr,
		...e,
		populationMode: e?.populationMode ?? "established"
	};
}
function Rf(e, t, n, r) {
	let i = vd(n), a = [
		{
			orbitClass: "Close",
			designation: "B"
		},
		{
			orbitClass: "Near",
			designation: "C"
		},
		{
			orbitClass: "Far",
			designation: "D"
		}
	].filter((t) => t.orbitClass === "Close" && !yd(n) ? !1 : e.roll(2, 6, i).total >= 10), o = /* @__PURE__ */ new Set(), s = [n.id, ...a.map((e) => e.designation)];
	for (let t of s) e.roll(2, 6, i).total >= 10 && o.add(t);
	let c = n.ageGyr, l = /* @__PURE__ */ new Map(), u = [n];
	for (let i of a) {
		let a = Ar(e, n, "secondary", `${t} ${i.designation}`, i.designation, r, c);
		c = Math.max(c, a.requiredSystemAgeGyr), a.postStellarFinalAgeGyr !== void 0 && l.set(i.designation, a.postStellarFinalAgeGyr);
		let o = a.star;
		o.orbitClass = i.orbitClass, o.orbitNumber = O(Cd(i.orbitClass, e.d6(), e.d6()), 2), o.orbitAu = O(Kn(o.orbitNumber), 3), o.eccentricity = Jn(e, 2), u.push(o);
	}
	let d = [...u];
	for (let n of d) {
		if (!o.has(n.id)) continue;
		let i = `${n.designation}b`, a = Ar(e, n, "companion", `${t} ${i}`, i, r, c);
		c = Math.max(c, a.requiredSystemAgeGyr), a.postStellarFinalAgeGyr === void 0 ? a.star.spectralType === "D" && l.has(n.id) && l.set(i, l.get(n.id)) : l.set(i, a.postStellarFinalAgeGyr);
		let s = a.star;
		s.orbitClass = "Companion", s.parentId = n.id, s.orbitNumber = O(bd(n) ? Td(e.d6(), Od(n)) : wd(e.d6(), e.roll(2, 6).total), 2), s.orbitAu = O(Kn(s.orbitNumber), 3), s.eccentricity = Jn(e, 2), u.push(s);
	}
	return c = Math.min(13.8, c), {
		stars: jr(u, c, l),
		systemAgeGyr: Number(c.toFixed(3))
	};
}
function zf(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Bf(e, t, n) {
	return {
		...e,
		id: t.sourceId ?? `${e.id}.moon-${n + 1}`,
		worldKind: "Terrestrial Planet",
		physical: t.physical,
		social: t.social,
		isMainworld: !!t.isMainworld,
		eccentricity: t.eccentricity,
		generationNotes: [`Significant moon of ${e.id}.`]
	};
}
function Vf(e, t, n = {}) {
	return t.map((t) => {
		let r = Gu(e, t, n[t.id]), i = t.physical?.details?.satellites, a = i && {
			...i,
			moons: i.moons.map((e, r) => {
				if (!e.physical || e.physical.details?.gasGiant) return e;
				let i = e.sourceId ?? `${t.id}.moon-${r + 1}`, a = new S(zf(`wbh-moon-social-v1|${t.id}|${e.sourceId ?? r}`));
				return {
					...e,
					social: Gu(a, Bf(t, e, r), n[i])
				};
			})
		};
		return {
			...t,
			social: r,
			physical: t.physical?.details ? {
				...t.physical,
				details: {
					...t.physical.details,
					satellites: a
				}
			} : t.physical
		};
	});
}
function Hf(e, t) {
	return e + Math.imul(t, 2654435761) >>> 0;
}
function Uf(e, t, n, r) {
	let i = { ...r ?? {} };
	if (n.populationMode === "survey" || r !== void 0 || !t) return i;
	let a = md(e, t);
	return (a?.moon?.physical ?? a?.world?.physical)?.details?.nativeLife?.currentNativeSophont === !0 || (i[t] = {
		origin: "transplanted",
		populationCode: null
	}), i;
}
function Wf(e) {
	return `${e.sourceDesignation}: orbit ${e.inner}-${e.outer}`;
}
function Gf(e = {}) {
	let t = Lf(e.settings), n = e.seed ?? Date.now(), r = new S(Hf(n, e.rerollIndex ?? 0)), i = e.name ?? "Uncharted System", a = dr(r, `${i} A`, "A", !0, t), o = Rf(r, i, a, t), s = o.stars.sort((e, t) => (e.orbitAu ?? 0) - (t.orbitAu ?? 0)), c = s.find((e) => e.id === a.id) ?? a, l = Vr(r, s), u = Zd(t) === "hill-stability" ? Xd(s) : Fd(s), d = If(r, s.filter((e) => e.orbitClass !== "Companion").map((e) => ({
		star: e,
		allowable: u.zones.find((t) => t.starId === e.id) ?? {
			starId: e.id,
			starDesignation: e.designation,
			parentStarIds: [e.id],
			parentDesignations: [e.designation],
			minimumAllowableOrbit: Od(e),
			ranges: [],
			availableOrbitSpan: 0,
			outerLimit: null
		}
	})), s, l, o.systemAgeGyr), f = ps(d.worlds.map((e) => {
		let t = bi(e, s) ?? s.find((t) => t.id === e.aroundStarId) ?? c;
		return {
			...e,
			physical: Al(r, e, t)
		};
	}), s), p = fd(f), m = e.mainworldOverrideId, h = m && p.candidates.some((e) => e.id === m) ? {
		...p,
		selectedMainworldId: m,
		selectionSource: "referee-override",
		explanation: [...p.explanation, `Referee override selected ${m}.`]
	} : p, g = h.selectedMainworldId ?? void 0, _ = pd(f, h.selectedMainworldId), v = Uf(_, g, t, e.habitationOverrides), y = Vf(r, _, v), b = md(y, h.selectedMainworldId), x = b?.moon ? Bf(b.world, b.moon, b.world.physical?.details?.satellites?.moons.indexOf(b.moon) ?? 0) : b?.world, ee = x?.social?.uwp ?? (x?.physical?.uwpPhysical ? `X${x.physical.uwpPhysical}000-0` : void 0), te = {
		schemaVersion: "traveller-system-generator/v9",
		id: `system-${n}-${e.rerollIndex ?? 0}-${i.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
		name: i,
		generationMethod: "expanded",
		generationSettings: t,
		habitationOverrides: v,
		primary: c,
		stars: s,
		worlds: y,
		summary: {
			...d.counts,
			emptyOrbits: d.emptyOrbits,
			anomalousOrbits: d.anomalousOrbits,
			baselineNumber: d.baselineNumber,
			baselineOrbitNumber: d.baselineOrbitNumber,
			spread: d.spread,
			mainworldId: g,
			mainworldDetermination: h,
			preliminaryUwp: ee,
			tradeCodes: x?.social?.tradeCodes,
			importance: x?.social?.importance,
			forbiddenZones: u.primaryExclusions.map(Wf),
			generationNotes: d.unplacedSlots > 0 ? [`${d.unplacedSlots} generated orbital slot(s) could not be placed without violating WBH allowable-orbit constraints.`] : void 0
		},
		refereeNotes: "",
		imageUrl: "",
		mapUrl: ""
	};
	return {
		...te,
		validation: ad(te)
	};
}
//#endregion
//#region src/rules/system/continuationUwp.ts
var Kf = /^([ABCDEX])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])-([0-9A-HJ-NP-Z])$/i;
function qf(e) {
	let t = e.trim().toUpperCase().replace(/\s+/g, "").match(Kf);
	if (!t) throw Error("Enter a UWP like A867A74-C.");
	let [, r, i, a, o, s, c, l, u] = t;
	return {
		normalized: `${r}${i}${a}${o}${s}${c}${l}-${u}`,
		starport: r,
		size: n(i),
		atmosphere: n(a),
		hydrographics: n(o),
		population: n(s),
		government: n(c),
		law: n(l),
		techLevel: n(u)
	};
}
//#endregion
//#region src/rules/worlds/wbhImportedPopulationExpansion.ts
function Jf(e, t, n) {
	if (e <= 0 || t <= 0) return 0;
	let r = t + (n === null ? 0 : n / 10);
	return Math.round(r * 10 ** e);
}
function Yf(e, t) {
	if (t <= 0) return 0;
	let n = e.die(3), r = e.die(3);
	return (n - 1) * 3 + r;
}
function Xf(e, t) {
	if (t <= 0) return {
		method: "WBH population phase 1",
		populationCode: 0,
		pValue: 0,
		additionalSignificantDigit: null,
		estimatedPopulation: 0,
		profilePrefix: "0-0",
		nativeSophontPopulationProcedure: "none",
		generationNotes: ["Population code is preserved from the imported UWP.", "Population 0 has no P value or additional significant digit."]
	};
	let n = Yf(e, t), r = e.d10ZeroToNine();
	return {
		method: "WBH population phase 1",
		populationCode: t,
		pValue: n,
		additionalSignificantDigit: r,
		estimatedPopulation: Jf(t, n, r),
		profilePrefix: `${t.toString(16).toUpperCase()}-${n}.${r}`,
		nativeSophontPopulationProcedure: "none",
		generationNotes: [
			"Population code is preserved exactly from the imported UWP.",
			"P value uses the normal WBH two-D3 procedure.",
			"One d10 supplies an additional significant digit for the expanded population total."
		]
	};
}
//#endregion
//#region src/rules/system/generateContinuationSystem.ts
function Zf(e, t) {
	return e + Math.imul(t, 2246822507) >>> 0;
}
function Qf(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function $f(e, t) {
	let n = e.primary, r = Math.round((e.worlds.find((e) => e.aroundStarId === n.id)?.hzco ?? 4) * 100) / 100, i = O(r + t.roll(2, 6, -7).total * .04, 2), a = O(Kn(i), 3);
	return {
		id: "A-MW",
		aroundStarId: n.id,
		aroundDesignation: n.designation,
		sequence: 0,
		orbitNumber: i,
		au: a,
		eccentricity: Jn(t, 0),
		hzco: r,
		hzDeviation: O(i - r, 2),
		worldKind: "Terrestrial Planet",
		isMainworld: !0
	};
}
function ep(e, t) {
	return e.isMainworld ? e : {
		...e,
		id: `${e.aroundDesignation}-${t + 1}`,
		sequence: t + 1
	};
}
function tp(e) {
	let t = qf(e.sourceUwp), n = Gf(e), r = e.seed ?? Date.now(), i = $f(n, new S(Zf(r, (e.rerollIndex ?? 0) + 101))), a = jl(i, n.primary, t.size, t.atmosphere, t.hydrographics), o = Xf(new S(Qf(`wbh-continuation-population-v1|${r}|${e.rerollIndex ?? 0}|${t.normalized}`)), t.population), s = {
		...Ku(t.starport, t.population, o.pValue, t.government, t.law, t.techLevel, t.size, t.atmosphere, t.hydrographics),
		populationMultiplier: o.pValue,
		populationTotal: o.estimatedPopulation,
		populationDetails: o
	}, c = n.worlds.filter((e) => !e.isMainworld).map((e) => ({
		...e,
		isMainworld: !1
	})).sort((e, t) => e.au - t.au).map(ep), l = ps([{
		...i,
		physical: a,
		social: s
	}, ...c].sort((e, t) => e.au - t.au || (e.isMainworld ? -1 : 1)), n.stars).map((t) => {
		if (!t.isMainworld || !t.social) return t;
		let n = bu(new S(Qf(`wbh-social-pcr-v1|${r}|${e.rerollIndex ?? 0}|${t.id}|${t.social.uwp}`)), t, t.social), i = {
			...t.social,
			populationConcentration: n
		}, a = Eu(new S(Qf(`wbh-social-urbanisation-v1|${r}|${e.rerollIndex ?? 0}|${t.id}|${t.social.uwp}`)), t, i), o = {
			...i,
			urbanisation: a
		}, s = new S(Qf(`wbh-social-major-cities-v1|${r}|${e.rerollIndex ?? 0}|${t.id}|${t.social.uwp}`));
		return {
			...t,
			social: {
				...o,
				majorCities: mu(s, o)
			}
		};
	}), u = (l.find((e) => e.isMainworld) ?? l[0])?.social ?? s, d = fd(l), f = {
		...d,
		selectedMainworldId: i.id,
		selectionSource: "source-uwp",
		explanation: [...d.explanation, `Continuation generation preserves the imported source UWP as mainworld ${i.id}; the WBH recommendation remains visible for audit only.`]
	}, p = {
		...n,
		schemaVersion: "traveller-system-generator/v9",
		generationMethod: "continuation",
		sourceUwp: t.normalized,
		worlds: l,
		summary: {
			...n.summary,
			totalWorlds: l.filter((e) => e.worldKind !== "Empty Orbit").length,
			mainworldId: i.id,
			mainworldDetermination: f,
			preliminaryUwp: u.uwp,
			tradeCodes: u.tradeCodes,
			importance: u.importance
		}
	};
	return {
		...p,
		id: `system-${e.seed ?? "date"}-${e.rerollIndex ?? 0}-${t.normalized.toLowerCase()}`,
		validation: ad(p)
	};
}
//#endregion
//#region src/rules/system/generateContinuationSystemWithLawLevels.ts
function np(e) {
	return An(tn(Wt(Hn(xn(xe(pe(bt(Le(De(ln(kt(qe(nt(tp(e)))))))))))))));
}
//#endregion
//#region src/rules/worlds/wbhSecondaryWorldPopulations.ts
function rp(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.min(33, Math.trunc(e)))] ?? String(e);
}
function ip(e) {
	let t = e.physical?.sizeCode ?? 0, n = e.physical?.atmosphereCode ?? 0, r = e.physical?.hydrographicsCode ?? 0, i = e.physical?.details?.habitabilityRating?.rating, a = 0, o = [], s = (e, t) => {
		e > a && (a = e), o.push(`${t}: TL${e}`);
	};
	return [
		0,
		1,
		10
	].includes(n) ? s(8, `WBH Atmosphere ${rp(n)}`) : [
		2,
		3,
		13,
		14
	].includes(n) ? s(5, `WBH Atmosphere ${rp(n)}`) : [
		4,
		7,
		9
	].includes(n) ? s(3, `WBH Atmosphere ${rp(n)}`) : n === 11 ? s(9, "WBH Atmosphere B") : n === 12 ? s(10, "WBH Atmosphere C") : n === 15 ? s(8, "WBH Atmosphere F conservative floor") : (n === 16 || n === 17) && s(14, `WBH Atmosphere ${rp(n)}`), typeof i == "number" && (i === 0 ? s(8, "WBH Habitability 0") : i <= 2 ? s(5, `WBH Habitability ${i}`) : i <= 7 && s(3, `WBH Habitability ${i}`)), r === 0 && n >= 4 && s(4, "Existing dry-world survival floor"), t === 0 && s(8, "Existing Size 0 survival floor"), {
		minimum: a,
		basis: o
	};
}
function ap(e, t, n) {
	return {
		...e,
		id: t.sourceId ?? `${e.id}.moon-${n + 1}`,
		worldKind: "Terrestrial Planet",
		physical: t.physical,
		social: t.social,
		isMainworld: !!t.isMainworld,
		eccentricity: t.eccentricity
	};
}
function op(e, t, n) {
	return e !== null && e > 0 ? "existing-inhabited" : n <= 0 ? "population-ceiling-zero" : t ? "eligible" : "tech-infeasible";
}
function sp(e, t, n, r, i, a, o) {
	if (!e.physical || e.worldKind === "Empty Orbit" || e.worldKind === "Gas Giant" || e.isMainworld) return null;
	let s = ip(e), c = typeof e.social?.populationCode == "number" ? e.social.populationCode : null, l = e.physical.details?.nativeLife?.currentNativeSophont === !0, u = r >= s.minimum;
	return {
		id: e.id,
		parentId: t,
		kind: n ? "Significant Moon" : e.worldKind,
		isMoon: n,
		existingPopulationCode: c,
		currentNativeSophonts: l,
		minimumSustainableTechLevel: s.minimum,
		minimumSustainableTechLevelBasis: s.basis,
		sustainableAtMainworldTechLevel: u,
		normalMaximumPopulationCode: i,
		systemMaximumPopulationCode: a,
		effectiveMaximumPopulationCode: o,
		status: op(c, u, o)
	};
}
function cp(e, t, n) {
	let r = n?.social?.populationCode ?? 0;
	if (!n || r <= 0) return null;
	let i = n.social?.techLevel ?? 0, a = Math.max(0, r - 1), o = e.d6(), s = Math.max(0, r - o), c = Math.min(a, s), l = [];
	for (let e of t) {
		let t = sp(e, null, !1, i, a, s, c);
		t && l.push(t), (e.physical?.details?.satellites?.moons ?? []).forEach((t, n) => {
			if (!t.physical || t.physical.details?.gasGiant) return;
			let r = sp(ap(e, t, n), e.id, !0, i, a, s, c);
			r && l.push(r);
		});
	}
	let u = c > 0 && l.some((e) => e.status === "eligible" || e.status === "existing-inhabited"), d = [
		"WBH normal individual secondary-world maximum is mainworld Population - 1 except in rare Referee-established circumstances.",
		"WBH optional system shortcut uses mainworld Population - 1D; this plan uses that optional ceiling.",
		"Actual secondary-world placement and affiliation remain Referee choices; this planning phase does not create inhabitants.",
		"The secondary-world P value remains random when a population is later established."
	];
	return s <= 0 && d.push("The optional Population - 1D ceiling is zero or less, so no new secondary populations need be checked."), {
		method: "WBH secondary world populations",
		mainworldId: n.id,
		mainworldPopulationCode: r,
		mainworldTechLevel: i,
		normalMaximumPopulationCode: a,
		offworldMaximumRoll: o,
		systemMaximumPopulationCode: s,
		effectiveMaximumPopulationCode: c,
		secondaryPopulationsPossible: u,
		candidates: l,
		generationNotes: d
	};
}
//#endregion
//#region src/rules/system/generateExpandedSystemWithSecondaryPopulations.ts
function lp(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function up(e, t, n) {
	return {
		...e,
		id: t.sourceId ?? `${e.id}.moon-${n + 1}`,
		worldKind: "Terrestrial Planet",
		physical: t.physical,
		social: t.social,
		isMainworld: !!t.isMainworld,
		eccentricity: t.eccentricity,
		generationNotes: [`Significant moon of ${e.id}.`]
	};
}
function dp(e) {
	let t = e.summary.mainworldId;
	if (t) for (let n of e.worlds) {
		if (n.id === t) return n;
		let e = n.physical?.details?.satellites?.moons ?? [], r = e.findIndex((e, r) => (e.sourceId ?? `${n.id}.moon-${r + 1}`) === t);
		if (r >= 0) return up(n, e[r], r);
	}
}
function fp(e = {}) {
	let t = An(tn(Wt(Hn(xn(xe(pe(bt(Le(De(ln(kt(qe(nt(Gf(e))))))))))))))), n = dp(t), r = t.summary.mainworldId ?? "none", i = n?.social?.uwp ?? "none", a = cp(new S(lp(`wbh-secondary-populations-v1|${t.id}|${r}|${i}`)), t.worlds, n);
	return {
		...t,
		secondaryPopulationPlan: a
	};
}
//#endregion
//#region src/rules/orbits/orbitalState.ts
var pp = "traveller-system-generator/orbital-state-v1", mp = "tsg-system-epoch-v1", hp = 149597870.7, gp = 365.25 * 86400;
function _p(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function vp(e, t) {
	return _p(`tsg-orbital-state-v1|${e}|${t}`) / 4294967296 * 360;
}
function yp(e) {
	return (e % 360 + 360) % 360;
}
function bp(e) {
	let t = e.worlds.filter((e) => e.worldKind !== "Empty Orbit" && e.physical), n = new Map(t.map((e) => [e.id, e])), r = /* @__PURE__ */ new Map(), i = (t, a = /* @__PURE__ */ new Set()) => {
		let o = r.get(t);
		if (o !== void 0) return o;
		let s = n.get(t);
		if (!s || a.has(t)) return vp(e.id, t);
		a.add(t);
		let c = s.trojanReferenceId && n.has(s.trojanReferenceId) ? i(s.trojanReferenceId, a) + (s.trojanOffsetDegrees ?? 0) : vp(e.id, s.id);
		a.delete(t);
		let l = yp(c);
		return r.set(t, l), l;
	};
	return t.map((e) => ({
		sourceId: e.id,
		objectKind: "world",
		parentSourceId: e.aroundStarId,
		parentKind: "star",
		semiMajorAxisAu: e.au,
		semiMajorAxisKm: e.au * hp,
		eccentricity: e.eccentricity,
		periodSeconds: e.physical.orbitalPeriodYears * gp,
		meanAnomalyAtEpochDegrees: i(e.id),
		direction: e.orbitalDirection ?? "Prograde"
	}));
}
function xp(e, t, n) {
	return t.sourceId ?? `${e}.moon-${n + 1}`;
}
function Sp(e) {
	let t = [];
	for (let n of e.worlds) (n.physical?.details?.satellites?.moons ?? []).forEach((r, i) => {
		let a = xp(n.id, r, i);
		t.push({
			sourceId: a,
			objectKind: "significant-moon",
			parentSourceId: n.id,
			parentKind: "world",
			semiMajorAxisAu: null,
			semiMajorAxisKm: r.orbitKm,
			eccentricity: r.eccentricity,
			periodSeconds: r.periodHours * 3600,
			meanAnomalyAtEpochDegrees: vp(e.id, a),
			direction: r.direction
		});
	});
	return t;
}
function Cp(e) {
	return {
		schemaVersion: pp,
		sourceSystemId: e.id,
		epoch: {
			convention: mp,
			epochSeconds: 0
		},
		objects: [...bp(e), ...Sp(e)]
	};
}
//#endregion
//#region src/integrations/foundry/sensorSystemPayload.ts
function wp(e) {
	let t = new Map(e.stars.map((e) => [e.id, e.designation]));
	return {
		schemaVersion: "traveller-system-generator/sensors-v2",
		sourceSystemId: e.id,
		mainworldDetermination: e.summary.mainworldDetermination,
		secondaryPopulationPlan: e.secondaryPopulationPlan ?? null,
		orbitalState: Cp(e),
		stars: e.stars.map((e) => ({
			sourceId: e.id,
			designation: e.designation,
			parentDesignation: e.parentId ? t.get(e.parentId) ?? null : null,
			spectralType: `${e.spectralType}${e.subtype ?? ""}`,
			luminosityClass: e.luminosityClass,
			massSolar: e.massSolar,
			diameterSolar: e.diameterSolar,
			temperatureK: e.temperatureK,
			luminositySolar: e.luminositySolar,
			ageGyr: e.ageGyr,
			stellarNature: e.stellarNature ?? null,
			orbitAu: e.orbitAu ?? null
		})),
		bodies: e.worlds.filter((e) => e.worldKind !== "Empty Orbit").map((e) => ({
			sourceId: e.id,
			aroundStarId: e.aroundStarId,
			aroundDesignation: e.aroundDesignation,
			orbitNumber: e.sequence,
			physicalOrbitNumber: e.orbitNumber,
			au: e.au,
			eccentricity: e.eccentricity,
			orbitalPeriodYears: e.physical?.orbitalPeriodYears ?? null,
			worldKind: e.worldKind,
			isMainworld: !!e.isMainworld,
			physical: e.physical ?? null,
			social: e.social ?? null,
			generationNotes: [...e.generationNotes ?? []]
		})),
		artificialSources: [],
		anomalies: []
	};
}
//#endregion
//#region src/integrations/foundry/api.ts
var Tp = "traveller-system-generator";
function Ep() {
	return {
		moduleId: Tp,
		generateSystem(e = {}) {
			return e.method === "continuation" ? np(e) : fp(e);
		},
		createTwodsixWorldActor(e) {
			let t = x(e), n = t.flags[Tp];
			return t.flags[Tp] = {
				...n && typeof n == "object" ? n : {},
				habitationOverrides: e.habitationOverrides ?? {},
				sensorSystem: wp(e)
			}, t;
		}
	};
}
function Dp(e, t = Ep()) {
	let n = e.get(Tp);
	if (!n) throw Error(`Foundry module ${Tp} is not registered.`);
	return n.api = t, t;
}
//#endregion
//#region src/integrations/foundry/lawInspectorRows.ts
function Op(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function F(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function kp(e) {
	return Array.isArray(e) ? e : [];
}
function I(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${Op(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${Op(t ?? "—")}</span></div>`;
}
function Ap(e, t) {
	return `<details style="margin-top:0.55rem;padding:0.45rem;border:1px dashed var(--color-border-light-primary);border-radius:4px;"><summary style="cursor:pointer;font-weight:600;">${Op(e)}</summary><div style="margin-top:0.4rem;">${t}</div></details>`;
}
function jp(e) {
	return typeof e == "number" && Number.isFinite(e) ? `${e >= 0 ? "+" : ""}${e}` : "—";
}
function Mp(e) {
	let t = kp(e).map((e) => String(e));
	return t.length ? `<div style="padding:0.35rem 0;"><strong>Notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${t.map((e) => `<li>${Op(e)}</li>`).join("")}</ul></div>` : "";
}
function Np(e, t) {
	if (!t) return I(e, "Unavailable");
	if (t.status !== "generated" || typeof t.lawLevel != "number") return [I(e, "Incomplete"), Ap(`${e} Calculation`, [
		I("Status", t.status ?? "incomplete"),
		I("Overall Law Level", t.overallLawLevel ?? "—"),
		Mp(t.generationNotes)
	].join(""))].join("");
	let n = kp(t.dmBreakdown).map(F).filter((e) => !!e).map((e) => `${String(e.source ?? "Modifier")}: DM${jp(e.dm)}`).join("; ");
	return [I(e, t.lawLevel), Ap(`${e} Calculation`, [
		I("Overall Law Level", t.overallLawLevel ?? "—"),
		I("2D3 roll", t.roll ?? "—"),
		I("2D3 - 4 variance", jp(t.variance)),
		I("DM total", jp(t.dmTotal)),
		n ? I("Modifiers", n) : "",
		I("Unclamped total", t.unclampedTotal ?? "—"),
		I("Final Law Level", t.lawLevel ?? "—"),
		Mp(t.generationNotes)
	].join(""))].join("");
}
function Pp(e) {
	return e ? [
		I("Law Level Profile (O-WECPR)", e.profile ?? "Incomplete"),
		I("Profile status", e.status ?? "—"),
		I("Overall Law Level", e.overallLawLevel ?? "—"),
		I("Weapons & Armour", F(e.weaponsAndArmour)?.lawLevel ?? "Incomplete"),
		I("Economic", F(e.economic)?.lawLevel ?? "Incomplete"),
		I("Criminal", F(e.criminal)?.lawLevel ?? "Incomplete"),
		I("Private", F(e.privateLaw)?.lawLevel ?? "Incomplete"),
		I("Personal Rights", F(e.personalRights)?.lawLevel ?? "Incomplete"),
		Ap("Subclassifications", [
			Np("Weapons & Armour", F(e.weaponsAndArmour)),
			Np("Economic", F(e.economic)),
			Np("Criminal", F(e.criminal)),
			Np("Private", F(e.privateLaw)),
			Np("Personal Rights", F(e.personalRights)),
			Mp(e.generationNotes)
		].join(""))
	].join("") : "<p class=\"hint\">No WBH Law Level subclassification result is stored.</p>";
}
function Fp(e) {
	return F(F(e)?.world);
}
function Ip(e, t) {
	for (let n of kp(F(e)?.balkanisedFactions)) {
		let e = F(n);
		if (e?.factionId === t) return F(e.details);
	}
	return null;
}
function Lp(e) {
	if (!e) return "<p class=\"hint\">No WBH Law Level subclassification detail is stored for this body.</p>";
	let t = F(e.lawSubclassificationsDetails);
	if (!t) return "<p class=\"hint\">No WBH Law Level subclassification detail is stored for this body.</p>";
	if (e.governmentCode !== 7) return Pp(Fp(t));
	let n = kp(t.balkanisedFactions).flatMap((e) => {
		let t = F(e);
		return typeof t?.factionId == "string" ? [t.factionId] : [];
	});
	return n.length ? ["<p class=\"hint\">Government 7 has no single world-level Law Level Profile. Each represented sovereign faction is shown separately. Weapons & Armour may remain incomplete until faction-specific PCR is available.</p>", ...n.map((e) => `<div style="margin-top:0.65rem;padding:0.55rem;border:1px solid var(--color-border-light-primary);border-radius:5px;"><h4 style="margin:0 0 0.35rem;">${Op(e)}</h4>${Pp(Ip(t, e))}</div>`)].join("") : "<p class=\"hint\">Government 7 uses faction-specific Law Level subclassifications, but no represented sovereign-faction results are stored.</p>";
}
//#endregion
//#region src/integrations/foundry/justiceInspectorRows.ts
function Rp(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function L(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function zp(e) {
	return Array.isArray(e) ? e : [];
}
function R(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${Rp(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${Rp(t ?? "—")}</span></div>`;
}
function Bp(e, t) {
	return `<details style="margin-top:0.55rem;padding:0.45rem;border:1px dashed var(--color-border-light-primary);border-radius:4px;"><summary style="cursor:pointer;font-weight:600;">${Rp(e)}</summary><div style="margin-top:0.4rem;">${t}</div></details>`;
}
function Vp(e) {
	let t = zp(e).map((e) => String(e));
	return t.length ? `<div style="padding:0.35rem 0;"><strong>Notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${t.map((e) => `<li>${Rp(e)}</li>`).join("")}</ul></div>` : "";
}
function Hp(e) {
	return typeof e == "number" && Number.isFinite(e) ? `${e >= 0 ? "+" : ""}${e}` : "—";
}
function Up(e) {
	if (!e) return "—";
	let t = e.code ?? "—", n = e.judicialSystem ?? "—";
	return `${String(t)} — ${String(n)}`;
}
function Wp(e) {
	if (!e) return "<p class=\"hint\">No primary judicial-system result is stored.</p>";
	let t = L(e.secondarySystem), n = zp(e.dmBreakdown).map(L).filter((e) => !!e).map((e) => `${String(e.source ?? "Modifier")}: DM${Hp(e.dm)}`).join("; "), r = [
		R("Status", e.status ?? "—"),
		R("2D roll", e.roll ?? "—"),
		R("DM total", Hp(e.dmTotal)),
		n ? R("Modifiers", n) : "",
		R("Final total", e.total ?? "—"),
		R("Government code", e.governmentCode ?? "—"),
		R("Law Level", e.lawLevelCode ?? "—"),
		R("Tech Level", e.techLevel ?? "—"),
		R("Judicial function authoritative", e.judicialAuthoritative === !0 ? "Yes" : e.judicialAuthoritative === !1 ? "No" : "Unknown"),
		Vp(e.generationNotes)
	].join(""), i = t ? [
		R("Scope", t.scope ?? "economic and regulatory"),
		R("2D roll", t.roll ?? "Not required"),
		R("Law Level DM", Hp(t.lawLevelDm)),
		R("Final total", t.total ?? "—"),
		R("Changed from primary", t.changedFromPrimary === !0 ? "Yes" : "No"),
		Vp(t.generationNotes)
	].join("") : "";
	return [
		R("Primary Judicial System", Up(e)),
		t ? R("Secondary Judicial System", Up(t)) : R("Secondary Judicial System", "—"),
		Bp("Judicial System Calculation", r),
		t ? Bp("Secondary System Calculation", i) : ""
	].join("");
}
function Gp(e) {
	return e ? [R("Law Uniformity", `${String(e.code ?? "—")} — ${String(e.uniformity ?? "—")}`), Bp("Law Uniformity Calculation", [
		R("Centralisation", e.centralisationCode ?? "—"),
		R("Roll", e.roll ?? "Not required"),
		R("DM", Hp(e.dm)),
		R("Final total", e.total ?? "—"),
		Vp(e.generationNotes)
	].join(""))].join("") : R("Law Uniformity", "Unavailable");
}
function Kp(e) {
	return e ? [R("Presumption of Innocence", e.code === "Y" ? "Y — Yes" : e.code === "N" ? "N — No" : "Unavailable"), Bp("Presumption Calculation", [
		R("Status", e.status ?? "—"),
		R("2D roll", e.roll ?? "—"),
		R("Law Level DM", Hp(e.lawLevelDm)),
		R("Adversarial DM", Hp(e.adversarialDm)),
		R("DM total", Hp(e.dmTotal)),
		R("Final total", e.total ?? "—"),
		Vp(e.generationNotes)
	].join(""))].join("") : R("Presumption of Innocence", "Unavailable");
}
function qp(e) {
	return e ? [R("Death Penalty", e.code === "Y" ? "Y — Yes" : e.code === "N" ? "N — No" : "Unavailable"), Bp("Death Penalty Calculation", [
		R("2D roll", e.roll ?? "—"),
		R("Government DM", Hp(e.governmentDm)),
		R("Law Level DM", Hp(e.lawLevelDm)),
		R("DM total", Hp(e.dmTotal)),
		R("Final total", e.total ?? "—"),
		Vp(e.generationNotes)
	].join(""))].join("") : R("Death Penalty", "Unavailable");
}
function Jp(e) {
	if (!e) return R("Justice Profile (PSU-I-D)", "Unavailable");
	let t = [
		`P=${String(e.primaryJudicialSystemCode ?? "—")}`,
		`S=${String(e.secondaryJudicialSystemCode ?? "—")}`,
		`U=${String(e.lawUniformityCode ?? "—")}`,
		`I=${String(e.presumptionOfInnocenceCode ?? "—")}`,
		`D=${String(e.deathPenaltyCode ?? "—")}`
	].join(", ");
	return [
		R("Justice Profile (PSU-I-D)", e.profile ?? `Incomplete (${t})`),
		R("Profile status", e.status ?? "—"),
		Vp(e.generationNotes)
	].join("");
}
function Yp(e) {
	return L(L(e)?.world);
}
function Xp(e, t) {
	for (let n of zp(L(e)?.balkanisedFactions)) {
		let e = L(n);
		if (e?.factionId === t) return L(e.details);
	}
	return null;
}
function Zp(e, t, n, r, i) {
	return [
		Jp(e),
		Wp(t),
		Gp(n),
		Kp(r),
		qp(i)
	].join("");
}
function Qp(e) {
	if (!e) return "<p class=\"hint\">No WBH Law or Justice detail is stored for this body.</p>";
	let t = Bp("Law Level Profile & Subclassifications", Lp(e)), n = L(e.justiceProfileDetails), r = L(e.judicialSystemDetails), i = L(e.lawUniformityDetails), a = L(e.presumptionOfInnocenceDetails), o = L(e.deathPenaltyDetails);
	if (!(n || r || i || a || o)) return t;
	if (e.governmentCode !== 7) return [t, Bp("Justice Profile & Systems", Zp(Yp(n), Yp(r), Yp(i), Yp(a), Yp(o)))].join("");
	let s = /* @__PURE__ */ new Set();
	for (let e of [
		n,
		r,
		i,
		a,
		o
	]) for (let t of zp(e?.balkanisedFactions)) {
		let e = L(t);
		typeof e?.factionId == "string" && s.add(e.factionId);
	}
	return s.size ? [t, Bp("Justice Profile & Systems", ["<p class=\"hint\">Government 7 has no single world-level Justice Profile. Each represented sovereign faction is shown separately.</p>", ...Array.from(s).map((e) => `<div style="margin-top:0.65rem;padding:0.55rem;border:1px solid var(--color-border-light-primary);border-radius:5px;"><h4 style="margin:0 0 0.35rem;">${Rp(e)}</h4>${Zp(Xp(n, e), Xp(r, e), Xp(i, e), Xp(a, e), Xp(o, e))}</div>`)].join(""))].join("") : [t, "<p class=\"hint\">Government 7 uses faction-specific Justice results, but no represented sovereign-faction results are stored.</p>"].join("");
}
//#endregion
//#region src/integrations/foundry/localization.ts
var $p = {
	"TSG.Control.Generate": "Generate Traveller System",
	"TSG.Control.Regenerate": "Update Traveller System Actor",
	"TSG.Control.Manager": "Traveller System Generator",
	"TSG.Manager.Title": "Traveller System Generator",
	"TSG.Manager.Action": "Action",
	"TSG.Manager.Generate": "Generate New System",
	"TSG.Manager.GenerateHeading": "Generate New System",
	"TSG.Manager.GenerateHint": "Create a new Traveller system and world Actor in the Actors directory.",
	"TSG.Manager.GenerateDescription": "Choose generation options, destination folder, and whether to open the new Actor sheet.",
	"TSG.Manager.ManageHeading": "Manage Existing Systems",
	"TSG.Manager.Update": "Update System",
	"TSG.Manager.UpdateDescription": "Regenerate module-owned data while preserving campaign-authored Actor content.",
	"TSG.Manager.Adopt": "Adopt System",
	"TSG.Manager.AdoptDescription": "Bring an unmanaged World Actor under Traveller System Generator management using explicit generation settings.",
	"TSG.Manager.AdoptHint": "This World Actor is not generator-managed. Use Adopt System to establish generation settings and provenance while preserving campaign-authored content.",
	"TSG.Manager.Open": "Open Actor",
	"TSG.Manager.OpenDescription": "Open the selected system Actor sheet without changing its generated data.",
	"TSG.Manager.Actor": "System Actor",
	"TSG.Manager.ActorHint": "Generated systems are listed from the Actors directory using their folder paths.",
	"TSG.Manager.NoActors": "No generated system Actors found",
	"TSG.Manager.Continue": "Continue",
	"TSG.Manager.ContextManage": "Traveller System Generator: Manage System",
	"TSG.Manager.Folder": "Folder",
	"TSG.Manager.Uwp": "UWP",
	"TSG.Manager.Method": "Generation method",
	"TSG.Manager.Seed": "Seed",
	"TSG.Manager.Distribution": "Star distribution",
	"TSG.Manager.DetailLevel": "Detail level",
	"TSG.Settings.UseDefaultFolder.Name": "Use Default System Actor Folder",
	"TSG.Settings.UseDefaultFolder.Hint": "When enabled, newly generated Traveller system Actors initially use the configured default folder. You can still choose a different folder in the Generate New System form.",
	"TSG.Settings.DefaultFolder.Name": "Default System Actor Folder",
	"TSG.Settings.DefaultFolder.Hint": "The Actor folder preselected for new Traveller system Actors when the default-folder option is enabled.",
	"TSG.Dialog.Title": "Traveller System Generator",
	"TSG.Dialog.Generate": "Generate World Actor",
	"TSG.Dialog.RegenerateTitle": "Update Traveller System Actor",
	"TSG.Dialog.Regenerate": "Update Actor",
	"TSG.Dialog.RegenerateHint": "Generated system fields will be refreshed while existing campaign-authored fields remain unchanged.",
	"TSG.Dialog.AdoptTitle": "Adopt Traveller System Actor",
	"TSG.Dialog.Adopt": "Adopt Actor",
	"TSG.Dialog.AdoptHint": "This operation regenerates Traveller System Generator-owned system data using the settings below and records generator provenance. Existing campaign-authored notes, hooks, relationships, image, folder, ownership, and Actor identity are preserved.",
	"TSG.Dialog.SystemName": "System Name",
	"TSG.Dialog.DefaultSystemName": "Uncharted System",
	"TSG.Dialog.Seed": "Seed",
	"TSG.Dialog.Method": "Generation Method",
	"TSG.Dialog.MethodExpanded": "Expanded",
	"TSG.Dialog.MethodContinuation": "Continuation from UWP",
	"TSG.Dialog.SourceUwp": "Source UWP",
	"TSG.Dialog.SourceUwpHint": "Used only for continuation generation.",
	"TSG.Dialog.StarDistribution": "Star Distribution",
	"TSG.Dialog.DistributionClassic": "Classic",
	"TSG.Dialog.DistributionRealistic": "Realistic",
	"TSG.Dialog.DetailLevel": "Detail Level",
	"TSG.Dialog.DetailBasic": "Basic",
	"TSG.Dialog.DetailStandard": "Standard",
	"TSG.Dialog.DetailDeep": "Deep",
	"TSG.Dialog.AllowUnusualPrimaries": "Allow unusual primary stars",
	"TSG.Dialog.ActorFolder": "Actor Folder",
	"TSG.Dialog.ActorFolderRoot": "Actors directory root",
	"TSG.Dialog.OpenSheet": "Open the created Actor sheet",
	"TSG.Notification.PermissionDenied": "You do not have permission to create Traveller world actors.",
	"TSG.Notification.SelectGeneratedActor": "Select a world Actor created by Traveller System Generator.",
	"TSG.Notification.SelectUnmanagedActor": "Select an unmanaged World Actor to adopt.",
	"TSG.Notification.Created": "Created {name} in the Actors directory.",
	"TSG.Notification.Regenerated": "Updated generated system data for {name}.",
	"TSG.Notification.Adopted": "Adopted {name} as a Traveller System Generator-managed system.",
	"TSG.Notification.DefaultFolderMissing": "The configured default system Actor folder no longer exists. Traveller System Generator will use the Actors directory root until another default folder is selected.",
	"TSG.Notification.Failed": "Traveller system generation failed: {message}"
}, em = {
	localize(e) {
		return $p[e];
	},
	format(e, t) {
		return Object.entries(t).reduce((e, [t, n]) => e.replaceAll(`{${t}}`, String(n)), $p[e]);
	}
};
//#endregion
//#region src/integrations/foundry/seedProvenance.ts
function tm(e, t = 0) {
	let n = Number.isFinite(e) ? Math.trunc(e) : 0, r = Number.isFinite(t) ? Math.trunc(t) : 0;
	return {
		inputSeed: n,
		normalizedSeed: n >>> 0,
		rerollIndex: r,
		normalizationConvention: "uint32-v1"
	};
}
//#endregion
//#region src/integrations/foundry/generatorControl.ts
function nm(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function rm(e, t) {
	return e.name.localeCompare(t.name, void 0, { sensitivity: "base" }) || e.id.localeCompare(t.id);
}
function im(e) {
	e.style.width = "720px", e.style.maxWidth = "calc(100vw - 2rem)", e.style.boxSizing = "border-box";
	for (let t of e.querySelectorAll("select, input[type=\"text\"], input[type=\"number\"]")) t.style.maxWidth = "100%", t.style.minWidth = "0", t.style.boxSizing = "border-box";
}
function am(e = Math.random) {
	return Math.floor(e() * 4294967296) >>> 0;
}
function om(e) {
	let t = new Map(e.map((e) => [e.id, e])), n = /* @__PURE__ */ new Map();
	for (let r of e) {
		let e = r.parentId && r.parentId !== r.id && t.has(r.parentId) ? r.parentId : null, i = n.get(e) ?? [];
		i.push(r), n.set(e, i);
	}
	for (let e of n.values()) e.sort(rm);
	let r = [], i = /* @__PURE__ */ new Set(), a = (e, t, o) => {
		if (i.has(e.id)) return;
		i.add(e.id);
		let s = [...o, e.name];
		r.push({
			...e,
			depth: t,
			path: s.join(" / ")
		});
		for (let r of n.get(e.id) ?? []) a(r, t + 1, s);
	};
	for (let e of n.get(null) ?? []) a(e, 0, []);
	for (let t of [...e].sort(rm)) i.has(t.id) || a(t, 0, []);
	return r;
}
function sm(e, t, n = "") {
	let r = om(e).map((e) => {
		let t = e.depth > 0 ? `${"\xA0\xA0".repeat(e.depth)}└─ ` : "", r = e.id === n ? " selected" : "";
		return `<option value="${nm(e.id)}"${r}>${nm(`${t}${e.path}`)}</option>`;
	});
	return [`<option value=""${n ? "" : " selected"}>${nm(t.localize("TSG.Dialog.ActorFolderRoot"))}</option>`, ...r].join("");
}
function cm(e = 1105, t = [], n = em, r = "") {
	let i = n.localize;
	return `
    <div class="form-group"><label>${i("TSG.Dialog.SystemName")}</label><input name="name" type="text" value="${nm(i("TSG.Dialog.DefaultSystemName"))}" autofocus></div>
    <div class="form-group"><label>${i("TSG.Dialog.Seed")}</label><input name="seed" type="number" value="${nm(String(e))}" step="1"></div>
    <div class="form-group"><label>${i("TSG.Dialog.Method")}</label><select name="method"><option value="expanded" selected>${i("TSG.Dialog.MethodExpanded")}</option><option value="continuation">${i("TSG.Dialog.MethodContinuation")}</option></select></div>
    <div class="form-group"><label>Expanded System Population</label><select name="populationMode"><option value="established" selected>Established / Settled</option><option value="survey">Survey / Unexplored</option></select><p class="hint">Established generates an ordinary WBH population for the selected mainworld. Survey leaves worlds uninhabited unless native Sophonts or Referee habitation are present.</p></div>
    <div class="form-group"><label>${i("TSG.Dialog.SourceUwp")}</label><input name="sourceUwp" type="text" value="A867A74-C" maxlength="9"><p class="hint">${i("TSG.Dialog.SourceUwpHint")}</p></div>
    <div class="form-group"><label>${i("TSG.Dialog.StarDistribution")}</label><select name="starDistribution"><option value="classic" selected>${i("TSG.Dialog.DistributionClassic")}</option><option value="realistic">${i("TSG.Dialog.DistributionRealistic")}</option></select></div>
    <div class="form-group"><label>${i("TSG.Dialog.DetailLevel")}</label><select name="detailLevel"><option value="basic">${i("TSG.Dialog.DetailBasic")}</option><option value="standard" selected>${i("TSG.Dialog.DetailStandard")}</option><option value="deep">${i("TSG.Dialog.DetailDeep")}</option></select></div>
    <div class="form-group"><label>Multi-Star Orbit Method</label><select name="multiStarOrbitMethod"><option value="simplified" selected>WBH Simplified</option><option value="hill-stability">WBH Hill / Stability Spheres</option></select><p class="hint">Simplified preserves the standard WBH generation path. Hill / Stability Spheres uses the optional physics-based alternate method for multi-star allowable orbits.</p></div>
    <div class="form-group"><label class="checkbox"><input name="allowUnusualPrimaries" type="checkbox" checked> ${i("TSG.Dialog.AllowUnusualPrimaries")}</label></div>
    <div class="form-group"><label>${i("TSG.Dialog.ActorFolder")}</label><select name="folder">${sm(t, n, r)}</select></div>
    <div class="form-group"><label class="checkbox"><input name="openSheet" type="checkbox" checked> ${i("TSG.Dialog.OpenSheet")}</label></div>`;
}
function lm(e, t = "") {
	return typeof e == "string" ? e : t;
}
function um(e, t) {
	let n = typeof e == "number" ? e : Number(e);
	return Number.isFinite(n) ? Math.trunc(n) : t;
}
function dm(e, t = !1) {
	return typeof e == "boolean" ? e : typeof e == "string" ? e === "true" || e === "on" : t;
}
function fm(e) {
	let t = lm(e.name, "Uncharted System").trim() || "Uncharted System", n = um(e.seed, 1105), r = lm(e.method, "expanded"), i = {
		name: t,
		seed: n,
		settings: {
			starDistribution: lm(e.starDistribution, "classic") === "realistic" ? "realistic" : "classic",
			detailLevel: ["basic", "deep"].includes(lm(e.detailLevel)) ? lm(e.detailLevel) : "standard",
			allowUnusualPrimaries: dm(e.allowUnusualPrimaries, !0),
			populationMode: lm(e.populationMode, "established") === "survey" ? "survey" : "established",
			multiStarOrbitMethod: lm(e.multiStarOrbitMethod, "simplified") === "hill-stability" ? "hill-stability" : "simplified"
		}
	};
	return {
		request: r === "continuation" ? {
			...i,
			method: "continuation",
			sourceUwp: lm(e.sourceUwp, "A867A74-C").trim().toUpperCase()
		} : {
			...i,
			method: "expanded"
		},
		folder: lm(e.folder).trim() || null,
		openSheet: dm(e.openSheet, !0)
	};
}
function pm(e) {
	return fm(e).request;
}
async function mm(e, t) {
	let { localizer: n } = e;
	if (!e.isGameMaster() || !e.canCreateActor()) {
		e.notifyWarning(n.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	let r = e.listActorFolders(), i = e.defaultSystemFolderId?.() ?? "", a = await e.prompt({
		window: { title: n.localize("TSG.Dialog.Title") },
		content: cm(am(), r, n, i),
		ok: { label: n.localize("TSG.Dialog.Generate") },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => im(t.element)
	});
	if (a) try {
		let r = fm(a), i = t.generateSystem(r.request), o = t.createTwodsixWorldActor(i), s = o.flags && typeof o.flags == "object" ? o.flags : {}, c = s["traveller-system-generator"] && typeof s["traveller-system-generator"] == "object" ? s["traveller-system-generator"] : {}, l = Number(r.request.seed ?? 1105);
		s["traveller-system-generator"] = {
			...c,
			generationSeed: l,
			generationSeedProvenance: tm(l, 0)
		}, o.flags = s, r.folder && (o.folder = r.folder);
		let u = await e.createActor(o);
		r.openSheet && u.sheet?.render(!0), e.notifyInfo(n.format("TSG.Notification.Created", { name: String(u.name ?? o.name ?? i.name) }));
	} catch (t) {
		let r = t instanceof Error ? t.message : String(t);
		e.notifyError(n.format("TSG.Notification.Failed", { message: r }));
	}
}
//#endregion
//#region src/integrations/foundry/regenerateControl.ts
var hm = "traveller-system-generator", gm = [
	"notes",
	"adventureHooks",
	"relatedActors",
	"worldImage"
];
function _m(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function vm(e) {
	let t = e.flags?.[hm];
	return t && typeof t == "object" ? t : null;
}
function ym(e) {
	return !!(e && e.type === "world" && vm(e));
}
function bm(e) {
	return !!(e && e.type === "world" && !vm(e));
}
function xm(e, t, { adopting: n = !1 } = {}) {
	let r = vm(e) ?? {}, i = r.generationSettings ?? {}, a = String(e.system.name ?? e.name.replace(/ System$/, "")), o = r.generationMethod ?? "expanded", s = r.sourceUwp ?? String(e.system.uwp ?? "A867A74-C"), c = r.generationSeedProvenance?.inputSeed ?? r.generationSeed ?? (n ? am() : 1105), l = i.starDistribution ?? "classic", u = i.detailLevel ?? "standard", d = i.allowUnusualPrimaries ?? !0, f = i.populationMode ?? "established", p = i.multiStarOrbitMethod ?? "simplified", m = t.localize, h = m(n ? "TSG.Dialog.AdoptHint" : "TSG.Dialog.RegenerateHint"), g = n ? `<select name="method"><option value="expanded"${o === "expanded" ? " selected" : ""}>${m("TSG.Dialog.MethodExpanded")}</option><option value="continuation"${o === "continuation" ? " selected" : ""}>${m("TSG.Dialog.MethodContinuation")}</option></select>` : `<input name="method" type="hidden" value="${o}"><span>${m(o === "expanded" ? "TSG.Dialog.MethodExpanded" : "TSG.Dialog.MethodContinuation")}</span>`, _ = o === "continuation" || n ? `<div class="form-group"><label>${m("TSG.Dialog.SourceUwp")}</label><input name="sourceUwp" type="text" value="${_m(s)}" maxlength="9"><p class="hint">${m("TSG.Dialog.SourceUwpHint")}</p></div>` : `<input name="sourceUwp" type="hidden" value="${_m(s)}">`, v = o === "expanded" ? `<div class="form-group"><label>Expanded System Population</label><select name="populationMode"><option value="established"${f === "established" ? " selected" : ""}>Established / Settled</option><option value="survey"${f === "survey" ? " selected" : ""}>Survey / Unexplored</option></select></div>` : `<input name="populationMode" type="hidden" value="${f}">`, y = o === "expanded" || n ? `<div class="form-group"><label>Multi-Star Orbit Method</label><select name="multiStarOrbitMethod"><option value="simplified"${p === "simplified" ? " selected" : ""}>WBH Simplified</option><option value="hill-stability"${p === "hill-stability" ? " selected" : ""}>WBH Hill / Stability Spheres</option></select><p class="hint">Simplified preserves the standard WBH generation path. Hill / Stability Spheres uses the optional physics-based alternate method for multi-star allowable orbits.</p></div>` : `<input name="multiStarOrbitMethod" type="hidden" value="${p}">`;
	return `
    <p class="hint">${_m(h)}</p>
    <div class="form-group"><label>${m("TSG.Dialog.SystemName")}</label><input name="name" type="text" value="${_m(a)}" autofocus></div>
    <div class="form-group"><label>${m("TSG.Dialog.Seed")}</label><input name="seed" type="number" value="${c}" step="1"></div>
    <div class="form-group"><label>${m("TSG.Dialog.Method")}</label>${g}</div>
    ${v}
    ${_}
    <div class="form-group"><label>${m("TSG.Dialog.StarDistribution")}</label><select name="starDistribution"><option value="classic"${l === "classic" ? " selected" : ""}>${m("TSG.Dialog.DistributionClassic")}</option><option value="realistic"${l === "realistic" ? " selected" : ""}>${m("TSG.Dialog.DistributionRealistic")}</option></select></div>
    <div class="form-group"><label>${m("TSG.Dialog.DetailLevel")}</label><select name="detailLevel"><option value="basic"${u === "basic" ? " selected" : ""}>${m("TSG.Dialog.DetailBasic")}</option><option value="standard"${u === "standard" ? " selected" : ""}>${m("TSG.Dialog.DetailStandard")}</option><option value="deep"${u === "deep" ? " selected" : ""}>${m("TSG.Dialog.DetailDeep")}</option></select></div>
    ${y}
    <div class="form-group"><label class="checkbox"><input name="allowUnusualPrimaries" type="checkbox"${d ? " checked" : ""}> ${m("TSG.Dialog.AllowUnusualPrimaries")}</label></div>
    <div class="form-group"><label class="checkbox"><input name="openSheet" type="checkbox" checked> ${m("TSG.Dialog.OpenSheet")}</label></div>`;
}
function Sm(e, t) {
	return xm(e, t);
}
function Cm(e, t) {
	return xm(e, t, { adopting: !0 });
}
function wm(e, t, n) {
	let r = { ...t.system };
	for (let t of gm) e.system[t] !== void 0 && (r[t] = e.system[t]);
	let i = { ...t.flags }, a = vm(e);
	return i[hm] = {
		...i[hm] ?? {},
		...a?.habitationOverrides === void 0 ? {} : { habitationOverrides: a.habitationOverrides },
		...a?.cityOverrides === void 0 ? {} : { cityOverrides: a.cityOverrides },
		...a?.secondaryGovernmentOverrides === void 0 ? {} : { secondaryGovernmentOverrides: a.secondaryGovernmentOverrides },
		generationSeed: n,
		generationSeedProvenance: tm(n, 0)
	}, {
		name: e.name,
		img: e.img,
		folder: e.folder,
		ownership: e.ownership,
		prototypeToken: e.prototypeToken,
		system: r,
		flags: {
			...e.flags ?? {},
			...i
		}
	};
}
async function Tm(e, t, n, r) {
	let i = vm(e), a = pm(i ? {
		...t,
		method: i.generationMethod ?? t.method,
		sourceUwp: i.sourceUwp ?? t.sourceUwp,
		populationMode: i.generationSettings?.populationMode ?? t.populationMode,
		multiStarOrbitMethod: i.generationSettings?.multiStarOrbitMethod ?? t.multiStarOrbitMethod
	} : t), o = r.generateSystem(a), s = r.createTwodsixWorldActor(o);
	await e.update(wm(e, s, Number(a.seed ?? 1105))), t.openSheet !== !1 && e.sheet?.render(!0);
}
async function Em(e, t) {
	let n = e.getSelectedActor();
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	if (!ym(n)) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.SelectGeneratedActor"));
		return;
	}
	let r = await e.prompt({
		window: { title: e.localizer.localize("TSG.Dialog.RegenerateTitle") },
		content: Sm(n, e.localizer),
		ok: { label: e.localizer.localize("TSG.Dialog.Regenerate") },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => im(t.element)
	});
	if (r) try {
		await Tm(n, r, e, t), e.notifyInfo(e.localizer.format("TSG.Notification.Regenerated", { name: n.name }));
	} catch (t) {
		let n = t instanceof Error ? t.message : String(t);
		e.notifyError(e.localizer.format("TSG.Notification.Failed", { message: n }));
	}
}
async function Dm(e, t) {
	let n = e.getSelectedActor();
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	if (!bm(n)) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.SelectUnmanagedActor"));
		return;
	}
	let r = await e.prompt({
		window: { title: e.localizer.localize("TSG.Dialog.AdoptTitle") },
		content: Cm(n, e.localizer),
		ok: { label: e.localizer.localize("TSG.Dialog.Adopt") },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => im(t.element)
	});
	if (r) try {
		await Tm(n, r, e, t), e.notifyInfo(e.localizer.format("TSG.Notification.Adopted", { name: n.name }));
	} catch (t) {
		let n = t instanceof Error ? t.message : String(t);
		e.notifyError(e.localizer.format("TSG.Notification.Failed", { message: n }));
	}
}
//#endregion
//#region src/integrations/foundry/mainworldOverride.ts
var Om = "traveller-system-generator";
function km(e) {
	let t = e.flags?.[Om];
	return t && typeof t == "object" ? t : null;
}
function Am(e, t) {
	let n = km(e);
	if (!n || n.generationMethod === "continuation" || !Number.isFinite(n.generationSeed)) return null;
	let r = n.generationSettings ?? {};
	return {
		method: "expanded",
		name: String(e.system.name ?? e.name.replace(/ System$/, "")),
		seed: n.generationSeed,
		settings: {
			starDistribution: r.starDistribution ?? "classic",
			detailLevel: r.detailLevel ?? "standard",
			allowUnusualPrimaries: r.allowUnusualPrimaries ?? !0
		},
		habitationOverrides: n.habitationOverrides ?? {},
		...t ? { mainworldOverrideId: t } : {}
	};
}
async function jm(e, t, n) {
	let r = Am(e, t);
	if (!r) return !1;
	let i = n.generateSystem(r), a = n.createTwodsixWorldActor(i);
	return await e.update(wm(e, a, Number(r.seed))), e.sheet?.render(!0), !0;
}
//#endregion
//#region src/rules/worlds/wbhPopulationProfile.ts
function Mm(e, n, r, i) {
	if (!e || e.populationCode <= 0 || !n || !r || !i) return null;
	let a = e.additionalSignificantDigit === null ? String(e.pValue) : `${e.pValue}.${e.additionalSignificantDigit}`, o = [
		t(e.populationCode),
		a,
		String(n.rating),
		String(r.urbanisationPercent),
		String(i.numberMajorCities)
	].join("-");
	return {
		method: "WBH population profile",
		populationCode: e.populationCode,
		pValue: e.pValue,
		additionalSignificantDigit: e.additionalSignificantDigit,
		pValueText: a,
		pcr: n.rating,
		urbanisationPercent: r.urbanisationPercent,
		numberMajorCities: i.numberMajorCities,
		profile: o
	};
}
//#endregion
//#region src/integrations/foundry/socialInspectorRows.ts
function z(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function B(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Nm(e) {
	return Array.isArray(e) ? e : [];
}
function Pm(e) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.trunc(e)] ?? String(e);
}
function V(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${z(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${z(t ?? "—")}</span></div>`;
}
function Fm(e, t) {
	return `<div style="margin-top:0.55rem;padding-top:0.35rem;"><h4 style="margin:0 0 0.25rem;">${z(e)}</h4>${t}</div>`;
}
function Im(e) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : Math.trunc(e).toLocaleString("en-US");
}
function Lm(e) {
	return e === "native-sophont" ? "Inhabited — Native Sophonts" : e === "transplanted" ? "Inhabited — Transplanted / Colonial Population" : e === "uninhabited" ? "Uninhabited" : "—";
}
function Rm(e) {
	let t = B(e);
	if (!t) return String(e ?? "—");
	let n = String(t.source ?? "Unknown"), r = typeof t.dm == "number" ? t.dm : 0;
	return `${n}: DM${r >= 0 ? "+" : ""}${r}`;
}
function zm(e) {
	let t = B(e);
	return t ? `${String(t.source ?? "Unknown")}: ${t.kind === "minimum" ? "minimum" : "maximum"} ${typeof t.percentage == "number" ? t.percentage : "—"}%` : String(e ?? "—");
}
function Bm(e, t = 1) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : `${e.toFixed(t).replace(/\.0$/, "")}%`;
}
function Vm(e) {
	if (!e) return "<p class=\"hint\">No WBH functional-structure detail is stored.</p>";
	let t = Nm(e.functions).map((e) => B(e)).filter((e) => !!e);
	return t.length ? `<div style="padding:0.35rem 0;"><strong>Functional Structure</strong>${t.map((e) => {
		let t = e.roll === null || e.roll === void 0 ? "—" : String(e.roll), n = typeof e.dm == "number" && e.dm !== 0 ? ` DM${e.dm >= 0 ? "+" : ""}${e.dm}` : "", r = e.total === null || e.total === void 0 ? "" : ` = ${String(e.total)}`, i = e.sharedFromFunction ? ` — shared from ${String(e.sharedFromFunction)}` : "";
		return V(`${String(e.functionCode ?? "—")} — ${String(e.functionName ?? "Function")}`, `${String(e.code ?? "—")} — ${String(e.structure ?? "—")} — ${String(e.method ?? "—")} — roll ${t}${n}${r}${i}`);
	}).join("")}</div>` : "<p class=\"hint\">No WBH functional-structure branch records are stored.</p>";
}
function Hm(e) {
	if (!e) return "<p class=\"hint\">No WBH authority detail is stored.</p>";
	let t = B(e.governmentProfile);
	return [
		V("Authority", `${String(e.code ?? "—")} — ${String(e.authoritativeFunction ?? "—")}`),
		V("Authority 2D roll", e.roll ?? "—"),
		V("Authority DM total", typeof e.dmTotal == "number" ? `${e.dmTotal >= 0 ? "+" : ""}${e.dmTotal}` : "—"),
		V("Authority final total", e.total ?? "—"),
		Array.isArray(e.dmBreakdown) && e.dmBreakdown.length ? `<div style="padding:0.35rem 0;"><strong>Authority modifiers</strong><ul style="margin:0.3rem 0 0 1.25rem;">${e.dmBreakdown.map((e) => `<li>${z(Rm(e))}</li>`).join("")}</ul></div>` : "",
		Vm(B(e.functionalStructure)),
		t ? V("Government Profile", t.profile ?? "—") : "",
		t && t.fullProfile !== t.profile ? V("Expanded Government Profile", t.fullProfile ?? "—") : ""
	].join("");
}
function Um(e) {
	if (!e) return "<p class=\"hint\">No WBH internal-faction detail is stored for this effective government.</p>";
	let t = Nm(e.factions).map((e) => B(e)).filter((e) => !!e), n = Nm(e.relationships).map((e) => B(e)).filter((e) => !!e);
	return [
		V("D3 faction-count roll", e.factionCountRoll ?? "—"),
		V("Faction-count DM", typeof e.factionCountDm == "number" ? `${e.factionCountDm >= 0 ? "+" : ""}${e.factionCountDm}` : "—"),
		V("Raw faction-count result", e.factionCountRaw ?? "—"),
		V("Stored factions", e.factionCount ?? "—"),
		V("Outside factions", e.outsideFactionCount ?? "—"),
		e.recursionLimitReached === !0 ? V("Recursion safety ceiling", "Reached — further Government-7 expansion stopped") : "",
		t.length ? `<div style="padding:0.35rem 0;"><strong>Faction profiles</strong>${t.map((e) => {
			let t = e.governmentRoll === null || e.governmentRoll === void 0 ? "official government" : `Government 2D ${String(e.governmentRoll)} ${typeof e.governmentModifier == "number" ? `${e.governmentModifier >= 0 ? "+" : ""}${e.governmentModifier}` : ""} = ${String(e.governmentUnclampedTotal ?? "—")}`, n = e.strengthRoll === null || e.strengthRoll === void 0 ? String(e.strengthDescription ?? "Official government") : `Strength 2D ${String(e.strengthRoll)} → ${String(e.strengthCode ?? "—")} — ${String(e.strengthDescription ?? "—")}`, r = e.parentId ? ` — spawned under ${String(e.parentId)}` : "";
			return V(String(e.profile ?? e.id ?? "Faction"), `${String(e.governmentType ?? "—")} — ${t} — ${n}${r}`);
		}).join("")}</div>` : "",
		n.length ? `<div style="padding:0.35rem 0;"><strong>Faction relationships</strong>${n.map((e) => {
			let t = Nm(e.dmBreakdown).map(Rm).join("; ");
			return V(String(e.profile ?? `${String(e.leftFactionId ?? "?")}+${String(e.rightFactionId ?? "?")}`), `${String(e.relationship ?? "—")} — 1D ${String(e.roll ?? "—")} ${typeof e.dmTotal == "number" ? `${e.dmTotal >= 0 ? "+" : ""}${e.dmTotal}` : ""} = ${String(e.total ?? "—")}${t ? ` — ${t}` : ""}`);
		}).join("")}</div>` : "<p class=\"hint\">No pairwise faction relationships apply because there is only one stored faction.</p>",
		Array.isArray(e.generationNotes) && e.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>Faction notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${e.generationNotes.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : ""
	].join("");
}
function Wm(e) {
	let t = Nm(e.cities).map((e) => B(e)).filter((e) => !!e), n = [
		V("Population allocation case", e.populationAllocationCase ?? "—"),
		e.largestNonMajorCityPopulation !== null && e.largestNonMajorCityPopulation !== void 0 ? V("Largest non-major city", Im(e.largestNonMajorCityPopulation)) : "",
		e.largestNonMajorCityRoll !== null && e.largestNonMajorCityRoll !== void 0 ? V("Largest non-major city 1D roll", e.largestNonMajorCityRoll) : "",
		e.allocationChunkPercent !== null && e.allocationChunkPercent !== void 0 ? V("Allocation chunk size", Bm(e.allocationChunkPercent, 2)) : "",
		e.allocationRemainderPercent !== null && e.allocationRemainderPercent !== void 0 ? V("Allocation remainder", Bm(e.allocationRemainderPercent, 2)) : ""
	].join("");
	return t.length ? `${n}<div style="padding:0.45rem 0 0.15rem;"><strong>Individual city allocations</strong></div>${t.map((e, t) => {
		let n = Nm(e.allocationRolls).map((e) => String(e)).join(", "), r = e.chunkCount === null || e.chunkCount === void 0 ? "—" : String(e.chunkCount);
		return V(`City ${e.rank ?? t + 1}`, `${Im(e.population)} — ${Bm(e.sharePercent, 2)} share — chunks ${r} — rolls ${n || "—"}`);
	}).join("")}` : n;
}
function Gm(e) {
	return e ? [
		V("Centralisation", `${String(e.code ?? "—")} — ${String(e.description ?? "—")}`),
		V("2D roll", e.roll ?? "—"),
		V("DM total", typeof e.dmTotal == "number" ? `${e.dmTotal >= 0 ? "+" : ""}${e.dmTotal}` : "—"),
		V("Final total", e.total ?? "—"),
		Array.isArray(e.dmBreakdown) && e.dmBreakdown.length ? `<div style="padding:0.35rem 0;"><strong>Centralisation modifiers</strong><ul style="margin:0.3rem 0 0 1.25rem;">${e.dmBreakdown.map((e) => `<li>${z(Rm(e))}</li>`).join("")}</ul></div>` : "",
		Hm(B(e.authority))
	].join("") : "<p class=\"hint\">No world-level WBH centralisation applies or has been generated.</p>";
}
function Km(e) {
	if (!e) return "<p class=\"hint\">This world is not represented as a WBH balkanised Government-7 world.</p>";
	let t = Nm(e.factions).map((e) => B(e)).filter((e) => !!e);
	return [
		V("Representation", e.representation ?? "—"),
		V("D3 faction-count roll", e.factionCountRoll ?? "—"),
		V("Sovereign factions", e.factionCount ?? "—"),
		t.length ? `<div style="padding:0.35rem 0;"><strong>Faction governments</strong>${t.map((e) => {
			let t = B(e.centralisation), n = B(t?.authority), r = B(n?.functionalStructure), i = B(n?.governmentProfile), a = Nm(r?.functions).map((e) => B(e)).filter((e) => !!e).map((e) => `${String(e.functionCode ?? "—")}${String(e.code ?? "—")}`).join("/"), o = t ? ` — centralisation ${String(t.code ?? "—")} (${String(t.roll ?? "—")} ${typeof t.dmTotal == "number" ? `${t.dmTotal >= 0 ? "+" : ""}${t.dmTotal}` : ""} = ${String(t.total ?? "—")})` : "", s = n ? ` — authority ${String(n.code ?? "—")} ${String(n.authoritativeFunction ?? "—")} (${String(n.roll ?? "—")} ${typeof n.dmTotal == "number" ? `${n.dmTotal >= 0 ? "+" : ""}${n.dmTotal}` : ""} = ${String(n.total ?? "—")})` : "", c = a ? ` — structure ${a}` : "", l = i ? ` — profile ${String(i.profile ?? "—")}` : "";
			return [V(String(e.id ?? "Faction"), `${Pm(e.governmentCode)} — ${String(e.governmentType ?? "—")} — 2D ${String(e.governmentRoll ?? "—")} ${typeof e.governmentModifier == "number" ? `${e.governmentModifier >= 0 ? "+" : ""}${e.governmentModifier}` : ""} = ${String(e.governmentUnclampedTotal ?? "—")}${o}${s}${c}${l}`), `<div style="margin-left:0.8rem;padding:0.25rem 0 0.45rem;"><strong>${z(String(e.id ?? "Faction"))} internal factions</strong>${Um(B(e.internalFactions))}</div>`].join("");
		}).join("")}</div>` : "",
		Array.isArray(e.generationNotes) && e.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>Balkanisation notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${e.generationNotes.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : ""
	].join("");
}
function qm(e) {
	if (!e) return "<p class=\"hint\">No generated social profile is available for this body.</p>";
	let t = B(e.populationDetails), n = B(e.populationConcentration), r = B(e.urbanisation), i = B(e.majorCities), a = B(e.governmentDetails), o = B(e.governmentCentralisation), s = B(e.governmentFactions), c = B(e.balkanisation), l = Nm(e.tradeCodes).map((e) => String(e)).join(" "), u = Nm(e.minimumSustainableTechLevelBasis).map((e) => String(e)), d = typeof e.notes == "string" ? e.notes : null, f = Mm(t, n, r, i), p = [V("Habitation", Lm(e.habitationStatus)), V("Basis", e.habitationBasis ?? "—")].join(""), m = t ? [
		V("WBH method", t.method ?? "—"),
		V("Population phase-1 prefix", t.profilePrefix ?? "—"),
		V("Population code", Pm(t.populationCode)),
		V("P value", t.pValue ?? "—"),
		V("Additional significant digit", t.additionalSignificantDigit ?? "—"),
		V("Estimated population", Im(t.estimatedPopulation)),
		V("Native Sophont population procedure", t.nativeSophontPopulationProcedure ?? "—"),
		Array.isArray(t.generationNotes) && t.generationNotes.length ? `<div style="margin-top:0.45rem;"><strong>Population notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${t.generationNotes.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : "<p class=\"hint\">No WBH Population phase-1 detail is stored for this body.</p>", h = n ? [
		V("PCR", n.rating ?? "—"),
		V("Concentration", n.description ?? "—"),
		V("Single settlement area", n.singleSettlementArea === !0 ? "Yes" : "No"),
		V("Low-population settlement roll", n.settlementAreaRoll ?? "—"),
		V("PCR roll", n.pcrRoll ?? "—"),
		V("DM total", typeof n.dmTotal == "number" ? `${n.dmTotal >= 0 ? "+" : ""}${n.dmTotal}` : "—"),
		V("Unclamped total", n.unclampedTotal ?? "—"),
		V("Allowed range", `${n.minimumRating ?? 0}–${n.maximumRating ?? 9}`),
		Array.isArray(n.dmBreakdown) && n.dmBreakdown.length ? `<div style="padding:0.35rem 0;"><strong>PCR modifiers</strong><ul style="margin:0.3rem 0 0 1.25rem;">${n.dmBreakdown.map((e) => `<li>${z(Rm(e))}</li>`).join("")}</ul></div>` : "",
		Array.isArray(n.generationNotes) && n.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>PCR notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${n.generationNotes.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : e.populationCode === 0 ? "<p class=\"hint\">Population 0: no Population Concentration Rating applies.</p>" : "<p class=\"hint\">No WBH Population Concentration Rating detail is stored for this body.</p>", g = r ? [
		V("Urbanisation", `${r.urbanisationPercent ?? "—"}%`),
		V("Total urban population", Im(r.totalUrbanPopulation)),
		V("PCR used", r.pcr ?? "—"),
		V("2D roll", r.baseRoll ?? "—"),
		V("DM total", typeof r.dmTotal == "number" ? `${r.dmTotal >= 0 ? "+" : ""}${r.dmTotal}` : "—"),
		V("Table result", r.tableResult ?? "—"),
		V("Table range", r.tableRange ?? "—"),
		V("Rolled percentage", `${r.rolledPercentage ?? "—"}%`),
		B(r.appliedMinimum) ? V("Applied minimum", zm(r.appliedMinimum)) : "",
		B(r.appliedMaximum) ? V("Applied maximum", zm(r.appliedMaximum)) : "",
		Array.isArray(r.dmBreakdown) && r.dmBreakdown.length ? `<div style="padding:0.35rem 0;"><strong>Urbanisation modifiers</strong><ul style="margin:0.3rem 0 0 1.25rem;">${r.dmBreakdown.map((e) => `<li>${z(Rm(e))}</li>`).join("")}</ul></div>` : "",
		Array.isArray(r.minimumLimits) && r.minimumLimits.length ? `<div style="padding:0.35rem 0;"><strong>Minimum restrictions</strong><ul style="margin:0.3rem 0 0 1.25rem;">${r.minimumLimits.map((e) => `<li>${z(zm(e))}</li>`).join("")}</ul></div>` : "",
		Array.isArray(r.maximumLimits) && r.maximumLimits.length ? `<div style="padding:0.35rem 0;"><strong>Maximum restrictions</strong><ul style="margin:0.3rem 0 0 1.25rem;">${r.maximumLimits.map((e) => `<li>${z(zm(e))}</li>`).join("")}</ul></div>` : "",
		Array.isArray(r.generationNotes) && r.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>Urbanisation notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${r.generationNotes.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : e.populationCode === 0 ? "<p class=\"hint\">Population 0: no urbanisation percentage applies.</p>" : "<p class=\"hint\">No WBH urbanisation detail is stored for this body.</p>", _ = i ? [
		V("WBH case", i.case ?? "—"),
		V("Major cities", i.numberMajorCities ?? "—"),
		V("Combined major-city population", Im(i.totalMajorCityPopulation)),
		V("Share of urban population", Bm(i.totalMajorCitySharePercent)),
		V("2D count roll", i.countRoll ?? "—"),
		V("Unrounded city-count result", typeof i.countUnrounded == "number" ? i.countUnrounded.toFixed(2).replace(/\.00$/, "") : "—"),
		V("Major-city population 1D roll", i.majorCityPopulationRoll ?? "—"),
		Wm(i),
		Array.isArray(i.generationNotes) && i.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>Major-city notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${i.generationNotes.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : e.populationCode === 0 ? "<p class=\"hint\">Population 0: no major-city procedure applies.</p>" : "<p class=\"hint\">No WBH major-city summary is stored for this body.</p>", v = f ? [
		V("Profile", f.profile),
		V("Format", "P-p.pp-C-%%-M"),
		V("Population", Pm(f.populationCode)),
		V("P value", f.pValueText),
		V("PCR", f.pcr),
		V("Urbanisation", `${f.urbanisationPercent}%`),
		V("Major cities", f.numberMajorCities)
	].join("") : e.populationCode === 0 ? "<p class=\"hint\">Population 0: no WBH Population Profile applies.</p>" : "<p class=\"hint\">A complete WBH Population Profile requires Population/P value, PCR, Urbanisation and Major Cities detail.</p>", y = a ? [
		V("Government code", Pm(a.governmentCode)),
		V("Government type", a.governmentType ?? "—"),
		V("Source", a.source ?? "—"),
		V("2D roll", a.roll ?? "—"),
		V("Population modifier", typeof a.modifier == "number" ? `${a.modifier >= 0 ? "+" : ""}${a.modifier}` : "—"),
		V("Unclamped result", a.unclampedTotal ?? "—"),
		Array.isArray(a.generationNotes) && a.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>Government notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${a.generationNotes.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : "<p class=\"hint\">No WBH government-type detail is stored for this body.</p>", b = [
		V("UWP", e.uwp ?? "—"),
		V("Starport", e.starport ?? "—"),
		V("Government code", Pm(e.governmentCode)),
		V("Law Level", Pm(e.lawLevelCode)),
		V("Tech Level", Pm(e.techLevel)),
		V("Minimum sustainable TL", e.minimumSustainableTechLevel ?? "—"),
		u.length ? `<div style="padding:0.35rem 0;"><strong>Minimum TL basis</strong><ul style="margin:0.3rem 0 0 1.25rem;">${u.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : "",
		V("Trade codes", l || "—"),
		V("Importance", e.importance ?? "—"),
		d ? V("Notes", d) : "",
		"<p class=\"hint\" style=\"margin:0.45rem 0 0;\">Mainworld designation and habitation are independent. Uninhabited mainworlds retain a Population-0 UWP. Referee-established transplanted populations generate their own social values without changing the physical world.</p>"
	].join("");
	return [
		Fm("Habitation", p),
		Fm("Population", m),
		Fm("Population Concentration", h),
		Fm("Urbanisation", g),
		Fm("Major Cities", _),
		Fm("Population Profile", v),
		Fm("Government", y),
		Fm("Centralisation, Authority, Structure & Profile", Gm(o)),
		Fm("Government Factions", e.governmentCode === 7 ? "<p class=\"hint\">Government 7 uses the sovereign Balkanisation layer below; internal factions are shown inside each sovereign government.</p>" : Um(s)),
		Fm("Balkanisation", Km(c)),
		Fm("Current UWP Social Values", b)
	].join("");
}
//#endregion
//#region src/integrations/foundry/managerControl.ts
var Jm = "traveller-system-generator", Ym = "__all__", Xm = "__root__";
function H(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Zm(e) {
	return e.dataset.documentId ?? e.dataset.entryId ?? e.dataset.actorId ?? "";
}
function Qm(e) {
	return e.filter((e) => e.type === "world").sort((e, t) => (e.folderPath ?? "").localeCompare(t.folderPath ?? "") || e.name.localeCompare(t.name));
}
function $m(e, t = "", n = Ym) {
	return Qm(e).filter((e) => n === Ym || (n === Xm ? !e.folderId : e.folderId === n)).map((e) => {
		let n = ym(e), r = `${e.name}${n ? "" : " — not generator-managed"}`;
		return `<option value="${H(e.id)}" data-folder-id="${H(e.folderId ?? "")}" data-generator-managed="${n ? "true" : "false"}"${e.id === t ? " selected" : ""}>${H(r)}</option>`;
	}).join("");
}
function eh(e, t = Ym) {
	let n = e.localizer.localize("TSG.Dialog.ActorFolderRoot"), r = om(e.listActorFolders());
	return [
		`<option value="${Ym}"${t === Ym ? " selected" : ""}>All Actor folders</option>`,
		`<option value="${Xm}"${t === Xm ? " selected" : ""}>${H(n)}</option>`,
		...r.map((e) => `<option value="${H(e.id)}"${e.id === t ? " selected" : ""}>${H(e.path)}</option>`)
	].join("");
}
function th(e) {
	if (!e) return null;
	let t = e.flags?.[Jm], n = t && typeof t == "object" ? t : {}, r = n.generationSettings, i = r && typeof r == "object" ? r : {}, a = ym(e);
	return {
		folderPath: e.folderPath || "Actors directory root",
		managed: a,
		uwp: String(e.system.uwp ?? n.sourceUwp ?? "—"),
		method: a ? String(n.generationMethod ?? "expanded") : "—",
		seed: a ? n.generationSeed === void 0 ? "Legacy default (1105)" : String(n.generationSeed) : "—",
		distribution: a ? String(i.starDistribution ?? "classic") : "—",
		detailLevel: a ? String(i.detailLevel ?? "standard") : "—"
	};
}
function nh(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(8rem,0.8fr) minmax(0,1.2fr);gap:0.75rem;padding:0.3rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${H(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${H(t)}</span></div>`;
}
function rh(e, t) {
	let n = t.localizer.localize, r = th(e);
	return !e || !r ? "<p class=\"hint\">No World Actors found in the selected folder.</p>" : `
    <div style="padding:0.75rem;border:1px solid var(--color-border-light-primary);border-radius:6px;background:var(--color-bg-option);min-width:0;">
      <h3 style="margin:0 0 0.5rem;">${H(e.name)}</h3>
      ${nh("Generator status", r.managed ? "Generator-managed" : "Not generator-managed")}
      ${nh(n("TSG.Manager.Folder"), r.folderPath)}
      ${nh(n("TSG.Manager.Uwp"), r.uwp)}
      ${nh(n("TSG.Manager.Method"), r.method)}
      ${nh(n("TSG.Manager.Seed"), r.seed)}
      ${nh(n("TSG.Manager.Distribution"), r.distribution)}
      ${nh(n("TSG.Manager.DetailLevel"), r.detailLevel)}
      ${r.managed ? "" : `<p class="hint" style="margin:0.6rem 0 0;">${H(n("TSG.Manager.AdoptHint"))}</p>`}
    </div>`;
}
function ih(e, t, n, r, i = !1) {
	return `
    <label style="display:block;padding:0.75rem;border:1px solid var(--color-border-light-primary);border-radius:6px;cursor:${i ? "not-allowed" : "pointer"};opacity:${i ? "0.55" : "1"};" data-manager-action-card="${e}">
      <span style="display:flex;align-items:flex-start;gap:0.6rem;">
        <input type="radio" name="action" value="${e}"${r ? " checked" : ""}${i ? " disabled" : ""}>
        <span><strong>${H(t)}</strong><br><span class="hint">${H(n)}</span></span>
      </span>
    </label>`;
}
function ah(e) {
	return e?.folderId || (e ? Xm : Ym);
}
function oh(e, t, n = {}) {
	let r = t.localizer.localize, i = Qm(e), a = i.find((e) => e.id === n.initialActorId) ?? i[0], o = n.initialActorId ? ah(a) : Ym, s = o === Ym ? i : i.filter((e) => o === Xm ? !e.folderId : e.folderId === o), c = s.find((e) => e.id === a?.id) ?? s[0], l = $m(i, c?.id, o), u = n.initialAction ?? "generate", d = i.length > 0, f = !!(c && ym(c)), p = !!(c && bm(c));
	return `
    <section style="display:grid;gap:0.8rem;min-width:0;">
      <header>
        <h2 style="margin:0;">${r("TSG.Manager.GenerateHeading")}</h2>
        <p class="hint">${r("TSG.Manager.GenerateHint")}</p>
      </header>
      ${ih("generate", r("TSG.Manager.Generate"), r("TSG.Manager.GenerateDescription"), u === "generate")}
    </section>
    <hr style="margin:1rem 0;">
    <section style="display:grid;gap:0.8rem;min-width:0;">
      <header>
        <h2 style="margin:0;">${r("TSG.Manager.ManageHeading")}</h2>
        <p class="hint">Choose an Actor folder, then select any World Actor. Generator-managed Actors can be updated; unmanaged World Actors can be explicitly adopted.</p>
      </header>
      <div class="form-group" style="min-width:0;"><label>Actor Folder</label><select name="managerFolderId" aria-label="Actor Folder" style="width:100%;min-width:0;max-width:100%;">${eh(t, o)}</select></div>
      <div class="form-group" style="min-width:0;"><label>${r("TSG.Manager.Actor")}</label><select name="actorId" aria-label="${r("TSG.Manager.Actor")}" style="width:100%;min-width:0;max-width:100%;"${d ? "" : " disabled"}>
        ${l || "<option value=\"\">No World Actors found in this folder</option>"}
      </select></div>
      <div data-manager-actor-details style="min-width:0;">${rh(c, t)}</div>
      <div style="display:grid;grid-template-columns:1fr;gap:0.75rem;">
        ${ih("open", r("TSG.Manager.Open"), r("TSG.Manager.OpenDescription"), u === "open", !d)}
        ${ih("update", r("TSG.Manager.Update"), r("TSG.Manager.UpdateDescription"), u === "update" && f, !f)}
        ${ih("adopt", r("TSG.Manager.Adopt"), r("TSG.Manager.AdoptDescription"), u === "adopt" && p, !p)}
      </div>
    </section>`;
}
function sh(e) {
	return typeof e == "string" ? e : "";
}
function ch(e, t, n) {
	let r = Qm(t);
	e.style.width = "720px", e.style.maxWidth = "calc(100vw - 2rem)", e.style.boxSizing = "border-box";
	for (let t of e.querySelectorAll("select, input[type=\"text\"], input[type=\"number\"]")) t.style.maxWidth = "100%", t.style.minWidth = "0", t.style.boxSizing = "border-box";
	let i = e.querySelector("select[name=\"managerFolderId\"]"), a = e.querySelector("select[name=\"actorId\"]"), o = e.querySelector("[data-manager-actor-details]"), s = e.querySelector("input[name=\"action\"][value=\"update\"]"), c = e.querySelector("[data-manager-action-card=\"update\"]"), l = e.querySelector("input[name=\"action\"][value=\"adopt\"]"), u = e.querySelector("[data-manager-action-card=\"adopt\"]");
	if (!i || !a || !o) return;
	let d = (e, t, n) => {
		e && (e.disabled = !n), t && (t.style.opacity = n ? "1" : "0.55", t.style.cursor = n ? "pointer" : "not-allowed");
	}, f = () => {
		let t = r.find((e) => e.id === a.value);
		o.innerHTML = rh(t, n);
		let i = !!(t && ym(t)), f = !!(t && bm(t));
		if (d(s, c, i), d(l, u, f), e.querySelector("input[name=\"action\"]:checked")?.disabled) {
			let t = f ? l : i ? s : e.querySelector("input[name=\"action\"][value=\"open\"]");
			t && (t.checked = !0);
		}
	};
	i.addEventListener("change", () => {
		let e = i.value || Ym, t = a.value, n = $m(r, t, e);
		a.innerHTML = n || "<option value=\"\">No World Actors found in this folder</option>", a.disabled = !n, n && !a.value && (a.selectedIndex = 0), f();
	}), a.addEventListener("change", f), f();
}
function lh(e, t) {
	return {
		isGameMaster: t.isGameMaster,
		getSelectedActor: () => e,
		localizer: t.localizer,
		prompt: t.prompt,
		notifyInfo: t.notifyInfo,
		notifyWarning: t.notifyWarning,
		notifyError: t.notifyError
	};
}
async function uh(e, t, n = {}) {
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	let r = e.listGeneratedActors(), i = await e.prompt({
		window: { title: e.localizer.localize("TSG.Manager.Title") },
		content: oh(r, e, n),
		ok: { label: e.localizer.localize("TSG.Manager.Continue") },
		rejectClose: !1,
		modal: !1,
		render: (t, n) => ch(n.element, r, e)
	});
	if (!i) return;
	let a = sh(i.action) || n.initialAction || "generate";
	if (a === "generate") {
		await mm(e, t);
		return;
	}
	let o = Qm(r).find((e) => e.id === sh(i.actorId));
	if (!o) {
		e.notifyWarning("Select a World Actor.");
		return;
	}
	if (a === "open") {
		o.sheet?.render(!0);
		return;
	}
	if (a === "adopt") {
		await Dm(lh(o, e), t);
		return;
	}
	await Em(lh(o, e), t);
}
function dh(e, t, n) {
	let r = e.tokens;
	r && (r.tools ??= {}, r.tools.travellerSystemGenerator = {
		name: "travellerSystemGenerator",
		title: t.localizer.localize("TSG.Control.Manager"),
		icon: "fa-solid fa-solar-system",
		order: Object.keys(r.tools).length,
		button: !0,
		visible: t.isGameMaster(),
		onChange: () => {
			uh(t, n);
		}
	});
}
//#endregion
//#region src/integrations/foundry/wbhInspector.ts
var fh = "traveller-system-generator";
function U(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function W(e) {
	return Array.isArray(e) ? e : [];
}
function ph(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function G(e) {
	return typeof e == "string" && e.length ? e : null;
}
function K(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function mh(e) {
	return U(U(e.flags?.[fh])?.sensorSystem);
}
function hh(e) {
	let t = mh(e);
	return e.type === "world" && !!(t && Array.isArray(t.bodies));
}
function gh(e) {
	return W(U(U(e.physical?.details)?.satellites)?.moons).flatMap((t, n) => {
		let r = U(t);
		if (!r) return [];
		let i = U(r.physical), a = G(r.sourceId) ?? `${e.id}.moon-${n + 1}`, o = r.sizeCode ?? i?.sizeCode ?? "?", s = r.isMainworld === !0;
		return [{
			id: a,
			label: `↳ ${a}${s ? " ★" : ""} — Moon (Size ${String(o)})`,
			parentId: e.id,
			kind: i && U(U(i.details)?.gasGiant) ? "Gas Giant Moon" : "Moon",
			isMainworld: s,
			physical: i,
			social: U(r.social),
			source: r
		}];
	});
}
function _h(e) {
	return (mh(e)?.bodies ?? []).flatMap((e, t) => {
		let n = U(e);
		if (!n) return [];
		let r = G(n.sourceId) ?? `body-${t + 1}`, i = U(n.physical), a = U(n.social), o = G(a?.uwp) ?? G(i?.uwpPhysical) ?? "—", s = G(n.worldKind) ?? "Body", c = n.isMainworld === !0;
		return [{
			id: r,
			label: `${r}${c ? " ★" : ""} — ${s} — ${o}`,
			parentId: null,
			kind: s,
			isMainworld: c,
			physical: i,
			social: a,
			source: n
		}];
	}).flatMap((e) => [e, ...gh(e)]);
}
function vh(e) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.trunc(e)] ?? String(e);
}
function q(e, t = 3, n = "") {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : `${Number(e.toFixed(t))}${n}`;
}
function yh(e) {
	return e === !0 ? "Yes" : e === !1 ? "No" : "—";
}
function J(e, t, n = "") {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${K(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${n ? `${K(n)} ` : ""}${K(t ?? "—")}</span></div>`;
}
function Y(e, t, n = !0) {
	return `<details${n ? " open" : ""} style="border:1px solid var(--color-border-light-primary);border-radius:6px;padding:0.65rem;"><summary style="cursor:pointer;font-weight:700;">${K(e)}</summary><div style="margin-top:0.5rem;">${t}</div></details>`;
}
function bh(e) {
	return `<details style="margin-top:0.55rem;padding:0.45rem;border:1px dashed var(--color-border-light-primary);border-radius:4px;"><summary style="cursor:pointer;font-weight:600;">Calculation Details</summary><div style="margin-top:0.4rem;">${e}</div></details>`;
}
function xh(e) {
	let t = W(e).map((e) => String(e));
	return t.length ? `<div style="margin-top:0.45rem;"><strong>Generation notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${t.map((e) => `<li>${K(e)}</li>`).join("")}</ul></div>` : "";
}
function Sh(e, t, n, r) {
	let i = U(r?.details), a = U(i?.size), o = U(i?.atmosphere), s = U(i?.hydrographics), c = [];
	if (e !== null) {
		let t = ph(a?.diameterKm);
		c.push(`Size ${vh(e)} → ${t === null ? "no precise diameter" : `${q(t, 0, " km")} precise diameter`} ${t === null ? "⚠" : "✓"}`);
	}
	if (t !== null) {
		let e = G(o?.classification), n = ph(o?.meanBaselinePressureBar);
		c.push(`Atmosphere ${vh(t)} → ${e ?? "no detailed classification"}${n === null ? "" : `, ${q(n, 3, " bar")}`} ${e ? "✓" : "⚠"}`);
	}
	if (n !== null) {
		let e = ph(s?.coveragePercent), t = n === 0 ? 0 : Math.max(0, n * 10 - 5), r = n === 10 ? 100 : Math.min(100, n * 10 + 5), i = e !== null && e >= t && e <= r;
		c.push(`Hydrographics ${vh(n)} → ${e === null ? "no precise coverage" : `${q(e, 1, "%")} coverage`} ${e === null ? "⚠" : i ? "✓" : "⚠ review"}`);
	}
	return c.map((e) => `<div style="padding:0.2rem 0;">${K(e)}</div>`).join("") || "<p class=\"hint\">No SAH consistency data available for this body.</p>";
}
function Ch(e) {
	let t = U(e?.details), n = U(t?.size), r = U(t?.gasGiant);
	return [
		J("Physical profile", e?.uwpPhysical ?? "—"),
		J("Size code", vh(e?.sizeCode)),
		J("Diameter", q(n?.diameterKm ?? r?.diameterKm, 0, " km")),
		J("Composition", n?.composition ?? r?.category ?? "—"),
		J("Density", q(n?.densityTerra, 3, " Terra")),
		J("Mass", q(n?.massTerra ?? r?.massTerra, 6, " Terra")),
		J("Surface gravity", q(n?.gravityG, 3, " g")),
		J("Escape velocity", q(n?.escapeVelocityKps, 3, " km/s")),
		J("Zone", e?.zone ?? "—"),
		J("Orbital period", q(e?.orbitalPeriodYears, 6, " yr"))
	].join("");
}
function wh(e) {
	let t = e?.atmosphereCode, n = U(U(e?.details)?.atmosphere), r = W(n?.taints).map((e) => U(e)?.profile ?? U(e)?.type ?? e).join(", "), i = W(n?.hazards).map((e) => U(e)?.type ?? e).join(", "), a = W(U(n?.gasMix)?.components).map((e) => {
		let t = U(e);
		return t ? `${t.name ?? "?"} ${t.percentage ?? "?"}%${t.retainedLongTerm === !1 ? " (not retained)" : ""}` : String(e);
	}).join(", ");
	return [
		J("Atmosphere code", vh(t)),
		J("Classification", n?.classification ?? "—"),
		J("Mean pressure", q(n?.meanBaselinePressureBar, 4, " bar")),
		J("O₂ fraction", q(n?.oxygenFraction, 4)),
		J("O₂ partial pressure", q(n?.oxygenPartialPressureBar, 4, " bar")),
		J("N₂ partial pressure", q(n?.nitrogenPartialPressureBar, 4, " bar")),
		J("Oxygen safety", n?.oxygenSafety ?? "—"),
		J("Scale height", q(n?.scaleHeightKm, 3, " km")),
		J("Safe altitude", q(n?.minimumSafeAltitudeKm, 3, " km")),
		J("Safe depth below mean", q(n?.safeAltitudeBelowMeanKm, 3, " km")),
		J("Taints", r || "—"),
		J("Hazards", i || "—"),
		J("Gas mix", a || "—"),
		J("Atmosphere profile", n?.profile ?? "—")
	].join("");
}
function Th(e) {
	let t = U(e?.surfaceFeatures);
	if (!t) return "";
	let n = W(t.bodies).map((e) => U(e)).filter((e) => !!e).map((e) => `${e.id ?? "?"}: ${e.kind ?? "feature"} ${q(e.surfacePercent, 2, "%")}`).join("; ");
	return [
		J("Discrete feature coverage", q(t.discreteFeatureCoveragePercent, 2, "%")),
		J("Major feature coverage", q(t.majorCoveragePercent, 2, "%")),
		J("Minor feature coverage", q(t.minorCoveragePercent, 2, "%")),
		J("Small feature coverage", q(t.smallCoveragePercent, 2, "%")),
		J("Major bodies", t.majorBodyCount ?? "—"),
		J("Minor bodies", t.minorBodyCount ?? "—"),
		J("Small bodies", t.smallBodyCount ?? "—"),
		J("Generated surface bodies", n || "None")
	].join("");
}
function Eh(e) {
	let t = U(e?.details), n = U(t?.hydrographics), r = U(t?.climate);
	return [
		J("Hydrographics code", vh(e?.hydrographicsCode)),
		J("Precise coverage", q(n?.coveragePercent, 2, "%")),
		J("Foundation", n?.foundation ?? "—"),
		J("Liquid composition", n?.composition ?? "—"),
		J("Distribution", U(n?.distribution)?.description ?? "—"),
		J("Hydrographics profile", n?.profile ?? "—"),
		Th(n),
		J("Mean temperature", `${q(r?.meanTemperatureK, 2, " K")} / ${q(r?.meanTemperatureC, 2, " °C")}`),
		J("Temperature class", r?.temperatureClass ?? "—"),
		J("Albedo", q(r?.albedo, 4)),
		J("Greenhouse factor", q(r?.greenhouseFactor, 4)),
		J("Runaway greenhouse eligible", yh(r?.runawayGreenhouseEligible))
	].join("");
}
function Dh(e) {
	let t = U(U(U(e?.details)?.climate)?.temperatureExtremes);
	if (!t) return "<p class=\"hint\">No WBH high/low temperature record is available for this body.</p>";
	let n = [
		J("Axial tilt factor", q(t.axialTiltFactor, 6)),
		J("Rotation factor", q(t.rotationFactor, 6)),
		J("Geographic factor", q(t.geographicFactor, 6)),
		J("Variance factor", q(t.varianceFactor, 6)),
		J("Atmospheric factor", q(t.atmosphericFactor, 6)),
		J("Luminosity modifier", q(t.luminosityModifier, 6)),
		J("High luminosity", q(t.highLuminositySolar, 6, " Sol")),
		J("Low luminosity", q(t.lowLuminositySolar, 6, " Sol")),
		xh(t.generationNotes)
	].join("");
	return [
		J("High temperature", `${q(t.highTemperatureK, 2, " K")} / ${q(t.highTemperatureC, 2, " °C")}`),
		J("Low temperature", `${q(t.lowTemperatureK, 2, " K")} / ${q(t.lowTemperatureC, 2, " °C")}`),
		J("Near stellar distance", q(t.nearAu, 6, " AU")),
		J("Far stellar distance", q(t.farAu, 6, " AU")),
		bh(n)
	].join("");
}
function Oh(e) {
	let t = U(e?.details), n = U(t?.rotation), r = U(t?.surfaceTides);
	return [
		J("Sidereal day", q(n?.siderealHours, 6, " h")),
		J("Solar day", n?.solarDayInfinite ? "Infinite / undefined" : q(n?.solarDayHours, 6, " h")),
		J("Solar days/year", q(n?.solarDaysPerYear, 6)),
		J("Axial tilt", q(n?.axialTiltDegrees, 4, "°")),
		J("Direction", n?.direction ?? "—"),
		J("Tidal-lock status", n?.tidalLockStatus ?? "—"),
		J("Tidal-lock case", n?.tidalLockCase ?? "—"),
		J("Tidal-lock DM", n?.tidalLockDm ?? "—"),
		J("Tidal-lock target", n?.tidalLockTargetId ?? "—"),
		J("Adjusted eccentricity", n?.adjustedEccentricity ?? "—"),
		J("Surface tide total", q(r?.totalAmplitudeMetres, 6, " m")),
		J("Stellar tide", q(r?.stellarAmplitudeMetres, 6, " m")),
		J("Satellite tide subtotal", q(r?.directSatelliteAmplitudeMetres, 6, " m")),
		J("Parent tide", q(r?.directParentAmplitudeMetres, 6, " m"))
	].join("");
}
function kh(e) {
	let t = U(U(e?.details)?.seismology);
	if (!t) return "<p class=\"hint\">No WBH terrestrial seismology record is available for this body.</p>";
	let n = [
		J("Residual stress DM", t.residualStressDm ?? "—"),
		J("Tectonic plate roll", t.tectonicPlateRoll ?? "—"),
		J("Tectonic plate DM", t.tectonicPlateDm ?? "—"),
		xh(t.generationNotes)
	].join("");
	return [
		J("Residual seismic stress", t.residualSeismicStress ?? "—"),
		J("Tidal stress factor", t.tidalStressFactor ?? "—"),
		J("Tidal heating factor", t.tidalHeatingFactor ?? "—"),
		J("Total seismic stress", t.totalSeismicStress ?? "—"),
		J("Seismic-adjusted mean temperature", q(t.seismicAdjustedMeanTemperatureK, 3, " K")),
		J("Major tectonic plates", t.majorTectonicPlates ?? "—"),
		J("Water-based tectonics eligible", yh(t.waterBasedTectonicsEligible)),
		bh(n)
	].join("");
}
function Ah(e) {
	let t = U(U(e?.details)?.surfaceGeology);
	if (!t) return "<p class=\"hint\">No WBH-derived surface geology record is available for this body.</p>";
	let n = U(t.plateBoundaries), r = W(t.features).map((e) => U(e)).filter((e) => !!e).map((e) => {
		let t = W(e.relatedSurfaceBodyIds).map((e) => String(e)), n = e.sourceBoundary ? `; ${String(e.sourceBoundary)} boundary` : "";
		return `<li><strong>${K(e.id ?? "feature")}</strong> — ${K(e.kind ?? "terrain")} (${K(e.intensity ?? "—")})${K(n)}${t.length ? ` — ${K(t.join(", "))}` : ""}</li>`;
	}).join("");
	return [
		J("Geologic regime", t.regime ?? "—"),
		J("Tectonic plates used", t.tectonicPlateCount ?? "—"),
		J("Total seismic stress used", t.totalSeismicStress ?? "—"),
		J("Convergent boundaries", n?.convergent ?? "—"),
		J("Divergent boundaries", n?.divergent ?? "—"),
		J("Transform boundaries", n?.transform ?? "—"),
		J("Stable boundaries", n?.stable ?? "—"),
		`<div style="padding:0.4rem 0;"><strong>Generated major features</strong>${r ? `<ul style="margin:0.3rem 0 0 1.25rem;">${r}</ul>` : "<div class=\"hint\" style=\"margin-top:0.25rem;\">None</div>"}</div>`,
		bh([J("Generation policy", t.generationPolicy ?? "—"), xh(t.generationNotes)].join(""))
	].join("");
}
function jh(e) {
	let t = U(U(e?.details)?.surfaceClimate);
	if (!t) return "<p class=\"hint\">No WBH-derived surface climate guidance is available for this body.</p>";
	let n = W(t.broadRegionGuidance).map((e) => String(e));
	return [
		J("Thermal regime", t.thermalRegime ?? "—"),
		J("Mean temperature used", q(t.meanTemperatureK, 2, " K")),
		J("High temperature used", q(t.highTemperatureK, 2, " K")),
		J("Low temperature used", q(t.lowTemperatureK, 2, " K")),
		J("Permanent ice extent", t.permanentIceExtent ?? "—"),
		J("Agriculture thermally eligible", yh(t.agricultureThermallyEligible)),
		J("Unprotected settlement thermally eligible", yh(t.unprotectedSettlementThermallyEligible)),
		n.length ? `<div style="padding:0.4rem 0;"><strong>Broad region guidance</strong><ul style="margin:0.3rem 0 0 1.25rem;">${n.map((e) => `<li>${K(e)}</li>`).join("")}</ul></div>` : "<div class=\"hint\" style=\"padding:0.4rem 0;\">No additional broad-region guidance.</div>",
		bh([J("Generation policy", t.generationPolicy ?? "—"), xh(t.generationNotes)].join(""))
	].join("");
}
function Mh(e) {
	let t = U(U(e?.details)?.satellites), n = W(t?.moons), r = W(t?.rings), i = n.map((e, t) => {
		let n = U(e);
		return n ? `${n.designation ?? `Moon ${t + 1}`}: Size ${String(n.sizeCode ?? "?")}, ${q(n.orbitPd, 3, " PD")}, ${q(n.orbitKm, 0, " km")}, e=${q(n.eccentricity, 3)}, ${n.direction ?? "?"}, period ${q(n.periodHours, 3, " h")}` : `Moon ${t + 1}`;
	}).join("<br>"), a = r.map((e, t) => {
		let n = U(e);
		return n ? `${n.designation ?? `Ring ${t + 1}`}: centre ${q(n.centrePd, 3, " PD")}, span ${q(n.spanPd, 3, " PD")}` : `Ring ${t + 1}`;
	}).join("<br>");
	return [
		J("Hill sphere", q(t?.hillSphereAu, 6, " AU")),
		J("Moon limit", q(t?.hillSphereMoonLimitPd, 3, " PD")),
		J("Roche limit", q(t?.rocheLimitPd, 3, " PD")),
		J("MOR", q(t?.moonOrbitRangePd, 3, " PD")),
		`<div style="padding:0.35rem 0;"><strong>Moons</strong><div style="margin-top:0.25rem;overflow-wrap:anywhere;">${i || "None"}</div></div>`,
		`<div style="padding:0.35rem 0;"><strong>Rings</strong><div style="margin-top:0.25rem;overflow-wrap:anywhere;">${a || "None"}</div></div>`
	].join("");
}
function Nh(e) {
	let t = U(U(e?.details)?.nativeLife);
	if (!t) return "<p class=\"hint\">No WBH terrestrial native-life record is available for this body.</p>";
	let n = U(t.biomassDm), r = [
		J("Biomass roll", t.biomassRoll ?? "—"),
		J("Biomass atmosphere DM", n?.atmosphere ?? "—"),
		J("Biomass hydrographics DM", n?.hydrographics ?? "—"),
		J("Biomass age DM", n?.age ?? "—"),
		J("Biomass temperature DM", n?.temperature ?? "—"),
		J("Biomass DM before clamp", n?.totalBeforeClamp ?? "—"),
		J("Biomass DM applied", n?.totalApplied ?? "—"),
		J("Biocomplexity roll", t.biocomplexityRoll ?? "—"),
		J("Biocomplexity DM", t.biocomplexityDm ?? "—"),
		J("Biodiversity roll", t.biodiversityRoll ?? "—"),
		J("Compatibility roll", t.compatibilityRoll ?? "—"),
		J("Compatibility DM", t.compatibilityDm ?? "—"),
		J("Current sophont roll", t.currentNativeSophontRoll ?? "—"),
		J("Extinct sophont roll", t.extinctNativeSophontRoll ?? "—"),
		xh(t.generationNotes)
	].join("");
	return [
		`<div style="padding:0.5rem 0 0.65rem;text-align:center;"><div class="hint">IISS Native-Life Profile (MXDC)</div><strong style="font-size:1.35rem;letter-spacing:0.12em;">${K(G(t.profile) ?? "—")}</strong></div>`,
		J("Biomass", t.biomassRating ?? "—"),
		J("Biocomplexity", t.biocomplexityRating ?? "—"),
		J("Biodiversity", t.biodiversityRating ?? "—"),
		J("Compatibility", t.compatibilityRating ?? "—"),
		J("Biomass special case", t.biomassSpecialCase ?? "—"),
		J("Current native sophont", yh(t.currentNativeSophont)),
		J("Extinct native sophont evidence", yh(t.extinctNativeSophontEvidence)),
		bh(r)
	].join("");
}
function Ph(e) {
	let t = U(U(e?.details)?.resourceRating);
	if (!t) return "<p class=\"hint\">No WBH terrestrial Resource Rating is available for this body.</p>";
	let n = U(t.dm), r = [
		J("2D roll", t.roll ?? "—"),
		J("Size code", t.sizeCode ?? "—"),
		J("Density DM", n?.density ?? "—"),
		J("Biomass DM", n?.biomass ?? "—"),
		J("Biodiversity DM", n?.biodiversity ?? "—"),
		J("Compatibility DM", n?.compatibility ?? "—"),
		J("Total DM", n?.total ?? "—"),
		J("Unclamped total", t.unclampedTotal ?? "—"),
		xh(t.generationNotes)
	].join("");
	return [J("Resource Rating", `${t.code ?? "—"} (${t.rating ?? "—"})`), bh(r)].join("");
}
function Fh(e) {
	let t = U(U(e?.details)?.habitabilityRating);
	if (!t) return "<p class=\"hint\">No WBH Terragen Habitability Rating is available for this body.</p>";
	let n = U(t.dm), r = [
		J("Base rating", t.baseRating ?? 10),
		J("Size DM", n?.size ?? "—"),
		J("Atmosphere DM", n?.atmosphere ?? "—"),
		J("Low-oxygen taint DM", n?.lowOxygenTaint ?? "—"),
		J("Hydrographics DM", n?.hydrographics ?? "—"),
		J("Solar 1:1 tidal-lock DM", n?.solarTidalLock ?? "—"),
		J("High-temperature DM", n?.highTemperature ?? "—"),
		J("Mean-temperature DM", n?.meanTemperature ?? "—"),
		J("Low-temperature DM", n?.lowTemperature ?? "—"),
		J("Temperature fallback DM", n?.temperatureFallback ?? "—"),
		J("Gravity DM", n?.gravity ?? "—"),
		J("Miscellaneous Referee DM", n?.miscellaneous ?? "—"),
		J("Total DM", n?.total ?? "—"),
		J("Unclamped total", t.unclampedTotal ?? "—"),
		J("Detailed temperatures used", yh(t.usedDetailedTemperature)),
		J("Computed gravity used", yh(t.usedComputedGravity)),
		xh(t.generationNotes)
	].join("");
	return [
		J("Habitability Rating", `${t.code ?? "—"} (${t.rating ?? "—"})`),
		J("Remarks", t.remarks ?? "—"),
		bh(r)
	].join("");
}
function Ih(e) {
	let t = U(e.criterionWins), n = [
		t?.highestHabitability === !0 ? "Habitability" : null,
		t?.nativeSophontsPresent === !0 ? "Sophonts" : null,
		t?.highestResources === !0 ? "Resources" : null,
		t?.bestRefuelling === !0 ? "Refuelling" : null
	].filter((e) => !!e);
	return n.length ? n.join(", ") : "None";
}
function Lh(e) {
	let t = U(mh(e)?.mainworldDetermination);
	if (!t) return "<p class=\"hint\">No WBH Final Mainworld Determination is stored for this system.</p>";
	let n = W(t.candidates).map((e) => {
		let n = U(e);
		if (!n) return "";
		let r = U(n.refuelling), i = n.id === t.selectedMainworldId, a = n.id === t.recommendedMainworldId;
		return `<tr>
      <td style="white-space:nowrap;">${K(n.id)}${i ? " ★" : ""}</td>
      <td>${K(n.kind ?? "—")}</td>
      <td>${K(n.habitabilityRating ?? "—")}</td>
      <td>${K(yh(n.nativeSophontsPresent))}</td>
      <td>${K(n.resourceRating ?? "—")}</td>
      <td style="min-width:12rem;">${K(r?.description ?? "—")}</td>
      <td>${K(n.totalCriterionWins ?? 0)}</td>
      <td>${K(Ih(n))}${a ? " (recommended)" : ""}</td>
    </tr>`;
	}).join(""), r = W(t.explanation).map((e) => `<li>${K(e)}</li>`).join("");
	return [
		J("Recommended body", t.recommendedMainworldId ?? "—"),
		J("Selected body", t.selectedMainworldId ?? "—"),
		J("Selection source", t.selectionSource ?? "—"),
		`<div style="overflow:auto;margin-top:0.55rem;"><table style="width:100%;border-collapse:collapse;font-size:0.9em;">
      <thead><tr><th>Body</th><th>Kind</th><th>Hab.</th><th>Sophonts</th><th>Res.</th><th>Refuelling</th><th>Wins</th><th>Winning criteria</th></tr></thead>
      <tbody>${n}</tbody>
    </table></div>`,
		r ? `<div class="hint" style="margin-top:0.5rem;"><strong>Method notes</strong><ul>${r}</ul></div>` : ""
	].join("");
}
function Rh(e) {
	let t = U(mh(e)?.mainworldDetermination);
	if (!t) return "";
	let n = W(t.candidates).map(U).filter((e) => !!e), r = G(t.selectedMainworldId) ?? "";
	return n.length ? `<div class="form-group" style="min-width:0;">
    <label>GM Mainworld Selection</label>
    <select name="wbhMainworldOverrideId" style="width:100%;min-width:0;max-width:100%;">
      ${n.map((e) => {
		let t = G(e.id) ?? "", n = G(e.kind) ?? "Body";
		return `<option value="${K(t)}"${t === r ? " selected" : ""}>${K(`${t} — ${n}`)}</option>`;
	}).join("")}
    </select>
    <p class="hint" style="margin:0.25rem 0 0;">The generated recommendation remains recorded. Choosing another body applies a Referee override when this inspector is closed.</p>
  </div>` : "";
}
function zh(e) {
	let t = e.physical, n = ph(t?.sizeCode), r = ph(t?.atmosphereCode), i = ph(t?.hydrographicsCode), a = G(e.social?.uwp), o = JSON.stringify(e.source, null, 2);
	return `
    <div data-wbh-body-panel="${K(e.id)}" style="display:grid;gap:0.7rem;min-width:0;">
      <div style="padding:0.65rem;border:1px solid var(--color-border-light-primary);border-radius:6px;background:var(--color-bg-option);">
        <h3 style="margin:0 0 0.4rem;">${K(e.label)}</h3>
        ${J("Parent body", e.parentId ?? "Top-level system body")}
        ${J("UWP / physical profile", a ?? G(t?.uwpPhysical) ?? "—")}
      </div>
      ${Y("UWP / Detailed Consistency", Sh(n, r, i, t))}
      ${Y("Social Characteristics", qm(e.social), !1)}
      ${Y("Justice", Qp(e.social), !1)}
      ${Y("Physical", Ch(t))}
      ${Y("Atmosphere", wh(t), !1)}
      ${Y("Hydrographics / Climate", Eh(t), !1)}
      ${Y("Temperature Extremes", Dh(t), !1)}
      ${Y("Rotation / Tides", Oh(t), !1)}
      ${Y("Seismology", kh(t), !1)}
      ${Y("Surface Geology", Ah(t), !1)}
      ${Y("Surface Climate", jh(t), !1)}
      ${Y("Satellites", Mh(t), !1)}
      ${Y("Native Life", Nh(t), !1)}
      ${Y("Resource Rating", Ph(t), !1)}
      ${Y("Habitability Rating", Fh(t), !1)}
      ${Y("Raw Stored Body Data", `<pre style="white-space:pre-wrap;overflow:auto;max-height:24rem;margin:0;">${K(o)}</pre>`, !1)}
    </div>`;
}
function Bh(e, t) {
	return `<div style="display:grid;gap:0.7rem;min-width:0;">
    ${Y("Final Mainworld Determination", Lh(e), !0)}
    <div data-wbh-selected-body>${zh(t)}</div>
  </div>`;
}
function Vh(e) {
	let t = _h(e), n = t.find((e) => e.isMainworld) ?? t[0];
	return n ? `
    <div style="display:grid;gap:0.75rem;min-width:0;">
      <div class="form-group" style="min-width:0;">
        <label>Body</label>
        <select name="wbhInspectorBodyId" style="width:100%;min-width:0;max-width:100%;">
          ${t.map((e) => `<option value="${K(e.id)}"${e.id === n.id ? " selected" : ""}>${K(e.label)}</option>`).join("")}
        </select>
      </div>
      ${Rh(e)}
      <p class="hint" style="margin:0;">Read-only view of authoritative generated data stored on this World Actor. The GM mainworld selection is the only editable value here. It does not represent what characters have discovered through Sensors.</p>
      <div data-wbh-inspector-panel>${Bh(e, n)}</div>
    </div>` : "<p>No stored TSG body data is available on this Actor.</p>";
}
function Hh(e, t) {
	e.style.width = "900px", e.style.maxWidth = "calc(100vw - 2rem)", e.style.maxHeight = "calc(100vh - 2rem)", e.style.boxSizing = "border-box";
	let n = e.querySelector("select[name=\"wbhInspectorBodyId\"]"), r = e.querySelector("[data-wbh-selected-body]");
	if (!n || !r) return;
	let i = _h(t);
	n.addEventListener("change", () => {
		let e = i.find((e) => e.id === n.value);
		e && (r.innerHTML = zh(e));
	});
}
async function Uh(e, t, n) {
	if (!t.isGameMaster()) return;
	if (!hh(e)) {
		t.notifyWarning("This World Actor does not contain Traveller System Generator detail data.");
		return;
	}
	let r = G(U(mh(e)?.mainworldDetermination)?.selectedMainworldId), i = await t.prompt({
		window: { title: `WBH Detail Inspector — ${e.name}` },
		content: Vh(e),
		ok: { label: "Close" },
		rejectClose: !1,
		modal: !1,
		render: (t, n) => Hh(n.element, e)
	});
	if (!i || !n) return;
	let a = G(i.wbhMainworldOverrideId);
	if (!(!a || a === r)) try {
		await jm(e, a, n) ? t.notifyInfo(`Mainworld changed to ${a}. The WBH generated recommendation remains recorded.`) : t.notifyWarning("Mainworld override is only available for generator-managed expanded systems.");
	} catch (e) {
		t.notifyError(`Unable to change mainworld: ${e instanceof Error ? e.message : String(e)}`);
	}
}
//#endregion
//#region src/integrations/foundry/habitationOverride.ts
var Wh = "traveller-system-generator";
function Gh(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Kh(e) {
	return typeof e == "string" && e.length ? e : null;
}
function qh(e) {
	let t = e.flags?.[Wh];
	return t && typeof t == "object" ? t : null;
}
function Jh(e) {
	let t = Gh(Gh(e.sensorSystem)?.mainworldDetermination);
	if (t?.selectionSource === "referee-override") return Kh(t.selectedMainworldId) ?? void 0;
}
function Yh(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Xh(e) {
	let t = qh(e);
	return !!(e.type === "world" && t?.generationMethod !== "continuation" && Number.isFinite(t?.generationSeed));
}
function Zh(e, t) {
	let n = qh(e);
	if (!n || n.generationMethod === "continuation" || !Number.isFinite(n.generationSeed)) return null;
	let r = n.generationSettings ?? {}, i = Jh(n);
	return {
		method: "expanded",
		name: String(e.system.name ?? e.name.replace(/ System$/, "")),
		seed: n.generationSeed,
		settings: {
			starDistribution: r.starDistribution ?? "classic",
			detailLevel: r.detailLevel ?? "standard",
			allowUnusualPrimaries: r.allowUnusualPrimaries ?? !0,
			populationMode: r.populationMode ?? "established"
		},
		habitationOverrides: t,
		...i ? { mainworldOverrideId: i } : {}
	};
}
async function Qh(e, t, n) {
	let r = Zh(e, t);
	if (!r) return !1;
	let i = n.generateSystem(r), a = n.createTwodsixWorldActor(i);
	return await e.update(wm(e, a, Number(r.seed))), e.sheet?.render(!0), !0;
}
function $h(e) {
	qh(e)?.habitationOverrides;
	let t = _h(e).filter((e) => e.physical ? !Gh(Gh(e.physical.details)?.gasGiant) && e.kind !== "Gas Giant" : !1);
	return t.length ? `
    <p class="hint">Establish or clear a Referee-defined transplanted population. Native Sophonts are authoritative physical-generation results and cannot be removed here.</p>
    <div class="form-group">
      <label>Body</label>
      <select name="bodyId">
        ${t.map((e) => {
		let t = e.social, n = Kh(t?.habitationStatus) ?? "uninhabited";
		return `<option value="${Yh(e.id)}">${Yh(`${e.label} — ${n}`)}</option>`;
	}).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Habitation</label>
      <select name="habitationAction">
        <option value="transplanted">Inhabited — Transplanted / Colonial Population</option>
        <option value="clear">Uninhabited — Clear Referee Transplanted Population</option>
      </select>
    </div>
    <div class="form-group">
      <label>Population</label>
      <select name="populationMode">
        <option value="generate">Generate from WBH</option>
        <option value="manual">Set Population code manually</option>
      </select>
    </div>
    <div class="form-group" data-population-code-row style="display:none;">
      <label>Population code</label>
      <input name="populationCode" type="number" min="1" max="10" step="1" value="5">
      <p class="hint">1–10 (A). P value and additional significant digit are still generated by WBH procedures.</p>
    </div>
    <p class="hint">Generate from WBH uses the ordinary 2D-2 Population procedure conditioned on a known inhabited result, so Population 0 is rerolled. Environmental minimum Tech Level rules remain enforced.</p>` : "<p>No eligible physical bodies are available for habitation editing.</p>";
}
function eg(e) {
	let t = e.querySelector("select[name=\"habitationAction\"]"), n = e.querySelector("select[name=\"populationMode\"]"), r = e.querySelector("[data-population-code-row]");
	if (!t || !n || !r) return;
	let i = () => {
		let e = t.value === "transplanted";
		n.disabled = !e, r.style.display = e && n.value === "manual" ? "" : "none";
	};
	t.addEventListener("change", i), n.addEventListener("change", i), i();
}
async function tg(e, t, n) {
	if (!t.isGameMaster()) return;
	if (!Xh(e)) {
		t.notifyWarning("Habitation editing is only available for generator-managed expanded systems.");
		return;
	}
	let r = await t.prompt({
		window: { title: `Edit Habitation — ${e.name}` },
		content: $h(e),
		ok: { label: "Apply" },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => eg(t.element)
	});
	if (!r) return;
	let i = Kh(r.bodyId);
	if (!i) return;
	let a = _h(e).find((e) => e.id === i);
	if (!a) {
		t.notifyError(`Unable to find body ${i}.`);
		return;
	}
	if (Gh(Gh(a.physical?.details)?.nativeLife)?.currentNativeSophont === !0) {
		t.notifyWarning("This body has current native Sophonts. Its native habitation cannot be changed with the transplanted-population editor.");
		return;
	}
	let o = { ...qh(e)?.habitationOverrides ?? {} }, s = Kh(r.habitationAction);
	if (s === "clear") delete o[i];
	else {
		let e = Kh(r.populationMode) ?? "generate", n = null;
		if (e === "manual") {
			let e = Number(r.populationCode);
			if (!Number.isInteger(e) || e < 1 || e > 10) {
				t.notifyWarning("Population code must be an integer from 1 through 10.");
				return;
			}
			n = e;
		}
		o[i] = {
			origin: "transplanted",
			populationCode: n
		};
	}
	try {
		if (!await Qh(e, o, n)) {
			t.notifyWarning("Habitation editing is only available for generator-managed expanded systems.");
			return;
		}
		t.notifyInfo(s === "clear" ? `Cleared the Referee transplanted population from ${i}.` : `Established a transplanted population on ${i}.`);
	} catch (e) {
		t.notifyError(`Unable to update habitation: ${e instanceof Error ? e.message : String(e)}`);
	}
}
//#endregion
//#region src/integrations/foundry/secondaryPopulationInspectorRows.ts
function X(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function ng(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function rg(e) {
	return Array.isArray(e) ? e : [];
}
function ig(e) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.trunc(e)] ?? String(e);
}
function ag(e) {
	return e === !0 ? "Yes" : e === !1 ? "No" : "—";
}
function og(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(12rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${X(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${X(t ?? "—")}</span></div>`;
}
function sg(e) {
	switch (e) {
		case "eligible": return "Eligible for Referee-established secondary population";
		case "existing-inhabited": return "Already inhabited";
		case "tech-infeasible": return "Current mainworld TL is insufficient";
		case "population-ceiling-zero": return "Population ceiling is zero";
		default: return String(e ?? "—");
	}
}
function cg(e) {
	let t = ng(e);
	if (!t) return "<p class=\"hint\">No WBH Secondary World Population plan applies. This normally means the selected mainworld has Population 0 or the stored Actor predates this generation phase.</p>";
	let n = rg(t.candidates).map(ng).filter((e) => !!e), r = n.length ? `<div style="overflow:auto;margin-top:0.65rem;"><table style="width:100%;border-collapse:collapse;font-size:0.9em;">
        <thead><tr><th>Body</th><th>Kind</th><th>Existing Pop.</th><th>Native Sophonts</th><th>Min TL</th><th>Mainworld TL supports</th><th>Max Pop.</th><th>Status</th></tr></thead>
        <tbody>${n.map((e) => {
		let t = rg(e.minimumSustainableTechLevelBasis).map(String).join("; ");
		return `<tr>
            <td style="white-space:nowrap;">${X(e.parentId ? `${String(e.id ?? "—")} (moon of ${String(e.parentId)})` : String(e.id ?? "—"))}</td>
            <td>${X(e.kind ?? "—")}</td>
            <td>${X(e.existingPopulationCode === null || e.existingPopulationCode === void 0 ? "None" : ig(e.existingPopulationCode))}</td>
            <td>${X(ag(e.currentNativeSophonts))}</td>
            <td title="${X(t)}">${X(`TL${String(e.minimumSustainableTechLevel ?? "—")}`)}</td>
            <td>${X(ag(e.sustainableAtMainworldTechLevel))}</td>
            <td>${X(ig(e.effectiveMaximumPopulationCode))}</td>
            <td>${X(sg(e.status))}</td>
          </tr>`;
	}).join("")}</tbody>
      </table></div>` : "<p class=\"hint\">No eligible physical secondary-world candidates were found after excluding the mainworld, gas giants, and empty orbits.</p>", i = rg(t.generationNotes).map((e) => `<li>${X(e)}</li>`).join("");
	return [
		og("Mainworld", t.mainworldId ?? "—"),
		og("Mainworld Population", ig(t.mainworldPopulationCode)),
		og("Mainworld Tech Level", `TL${ig(t.mainworldTechLevel)}`),
		og("Normal individual maximum", `${ig(t.normalMaximumPopulationCode)} — mainworld Population − 1`),
		og("Optional offworld 1D roll", t.offworldMaximumRoll ?? "—"),
		og("Optional system maximum", `${ig(t.systemMaximumPopulationCode)} — mainworld Population − 1D`),
		og("Effective maximum", ig(t.effectiveMaximumPopulationCode)),
		og("Secondary populations possible", ag(t.secondaryPopulationsPossible)),
		r,
		i ? `<div class="hint" style="margin-top:0.55rem;"><strong>WBH method notes</strong><ul>${i}</ul></div>` : ""
	].join("");
}
//#endregion
//#region src/rules/worlds/wbhCityInformation.ts
function lg(e) {
	return Math.trunc(e).toLocaleString("en-US");
}
function ug(e, t, n, r) {
	return `${e}${t.length ? ` (${t.join(", ")})` : ""}: ${lg(n)}: ${r ?? "—"}`;
}
function dg(e) {
	return !e || e.numberMajorCities <= 0 || e.cities.length === 0 ? null : {
		method: "WBH city information",
		cities: [...e.cities].sort((e, t) => e.rank - t.rank).map((e) => {
			let t = `Major City ${e.rank}`, n = [];
			return {
				rank: e.rank,
				name: t,
				nameSource: "working-label",
				population: e.population,
				codes: n,
				port: null,
				profile: ug(t, n, e.population, null)
			};
		}),
		generationNotes: [
			"WBH specifies Name (Codes): Population: Port, but proper names and designation codes are Referee choices.",
			"Port association is left unset unless explicitly established; the world starport is not automatically assigned to the largest city.",
			"Neutral Major City N labels are working labels only and are intended to be replaceable by a later referee-editing workflow."
		]
	};
}
//#endregion
//#region src/rules/worlds/wbhUnusualCities.ts
var fg = [
	{
		code: "Ar",
		name: "Arcology, sealed city",
		minimumTechLevel: 8
	},
	{
		code: "Fb",
		name: "Flying, buoyant gas",
		minimumTechLevel: 8
	},
	{
		code: "Fg",
		name: "Flying, grav hover",
		minimumTechLevel: 10
	},
	{
		code: "Fm",
		name: "Flying, grav mobile",
		minimumTechLevel: 14
	},
	{
		code: "Mr",
		name: "Mobile, rails",
		minimumTechLevel: 6
	},
	{
		code: "Mt",
		name: "Mobile, tracked",
		minimumTechLevel: 9
	},
	{
		code: "Ss",
		name: "Space, spin",
		minimumTechLevel: 8
	},
	{
		code: "Sg",
		name: "Space, grav",
		minimumTechLevel: 10
	},
	{
		code: "Ub",
		name: "Underground, benign environment",
		minimumTechLevel: 6
	},
	{
		code: "Uh",
		name: "Underground, hostile environment",
		minimumTechLevel: 8
	},
	{
		code: "Wa",
		name: "Water, shore floating adjacent",
		minimumTechLevel: 0
	},
	{
		code: "Wd",
		name: "Water, static floating deep water",
		minimumTechLevel: 6
	},
	{
		code: "Wf",
		name: "Water, free floating",
		minimumTechLevel: 8
	},
	{
		code: "Ws",
		name: "Water, submerged",
		minimumTechLevel: 9
	},
	{
		code: "Wx",
		name: "Water, deep ocean",
		minimumTechLevel: 12
	}
];
function pg(e) {
	return fg.find((t) => t.code === e) ?? null;
}
function mg(e, t) {
	return e.some((e) => e === t || e.startsWith(`${t} `) || e.endsWith(`(${t})`));
}
function hg(e) {
	let t = [], n = (e, n) => {
		n !== 0 && t.push({
			source: e,
			dm: n
		});
	};
	e.starport === "A" && e.hasHighport && n("Starport A with highport", 1), (e.starport === "E" || e.starport === "X") && n(`Starport ${e.starport}`, -2), [
		0,
		1,
		10
	].includes(e.atmosphereCode) ? n("Atmosphere 0, 1, or A", 2) : e.atmosphereCode === 11 ? n("Atmosphere B", 3) : e.atmosphereCode === 12 && n("Atmosphere C", 4), e.techLevel >= 16 ? n("TL16+", 3) : e.techLevel >= 13 ? n("TL13–15", 2) : e.techLevel >= 9 && n("TL9–12", 1), mg(e.tradeCodes, "In") && n("Industrial", 1), mg(e.tradeCodes, "Ni") && n("Non-Industrial", -1), mg(e.tradeCodes, "Ri") && n("Rich", 1), mg(e.tradeCodes, "Po") && n("Poor", -1);
	let r = t.reduce((e, t) => e + t.dm, 0);
	return {
		target: 12,
		dmTotal: r,
		effectiveNaturalRollRequired: Math.max(2, 12 - r),
		dmBreakdown: t
	};
}
function gg(e, t) {
	let n = pg(e);
	return !!(n && t >= n.minimumTechLevel);
}
function _g(e, t, n) {
	let r = n?.[String(t)];
	return r?.code ? e.includes(r.code) ? [...e] : [...e, r.code] : [...e];
}
//#endregion
//#region src/integrations/foundry/unusualCityEditor.ts
var vg = "traveller-system-generator";
function yg(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function bg(e) {
	return typeof e == "string" && e.length ? e : null;
}
function xg(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function Sg(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Cg(e) {
	return yg(e.flags?.[vg]);
}
function wg(e) {
	let t = yg(Cg(e)?.cityOverrides);
	if (!t) return {};
	let n = {};
	for (let [e, r] of Object.entries(t)) {
		let t = yg(r), i = xg(t?.cityRank), a = bg(t?.code), o = bg(t?.description), s = t?.source === "custom" ? "custom" : t?.source === "standard" ? "standard" : null;
		i !== null && a && o && s && (n[e] = {
			cityRank: i,
			code: a,
			description: o,
			source: s
		});
	}
	return n;
}
function Tg(e) {
	return e?.source === "custom" ? {
		action: "custom",
		standardCode: fg[0]?.code ?? "",
		customCode: e.code,
		customDescription: e.description
	} : {
		action: "standard",
		standardCode: e?.source === "standard" ? e.code : fg[0]?.code ?? "",
		customCode: "",
		customDescription: ""
	};
}
function Eg(e) {
	return _h(e).find((e) => e.isMainworld);
}
function Dg(e) {
	let t = Eg(e)?.social, n = yg(t?.majorCities);
	return Array.isArray(n?.cities) ? n.cities.flatMap((e) => {
		let t = yg(e), n = xg(t?.rank), r = xg(t?.population);
		return n !== null && r !== null ? [{
			rank: n,
			population: r
		}] : [];
	}) : [];
}
function Og(e) {
	return e.type === "world" && !!Eg(e)?.social && Dg(e).length > 0;
}
function kg(e) {
	let t = Eg(e), n = t?.social, r = t?.physical, i = Dg(e), a = xg(n?.techLevel) ?? 0, o = xg(r?.atmosphereCode) ?? 0, s = Array.isArray(n?.tradeCodes) ? n.tradeCodes.map(String) : [], c = hg({
		starport: bg(n?.starport),
		hasHighport: !1,
		atmosphereCode: o,
		techLevel: a,
		tradeCodes: s
	}), l = wg(e), u = c.dmTotal >= 0 ? `+${c.dmTotal}` : String(c.dmTotal);
	return `
    <p class="hint">WBH unusual cities are optional Referee choices. This editor never assigns one automatically. The Handbook's optional random check is 2D 12+ with the displayed world DM; city type still remains a Referee choice.</p>
    <div style="padding:0.5rem;border:1px solid var(--color-border-light-primary);border-radius:6px;margin-bottom:0.65rem;">
      <strong>World guidance</strong><br>
      TL ${Sg(a)}; optional unusual-city occurrence DM ${Sg(u)}; natural 2D roll required ${Sg(c.effectiveNaturalRollRequired)}+.
      ${c.dmBreakdown.length ? `<div class="hint">${c.dmBreakdown.map((e) => `${Sg(e.source)}: DM${e.dm >= 0 ? "+" : ""}${e.dm}`).join("; ")}</div>` : ""}
      <div class="hint">Highport DM is not applied because TSG has not yet established a highport for this world.</div>
    </div>
    <div class="form-group"><label>Major city</label><select name="cityRank">
      ${i.map((e) => {
		let t = l[String(e.rank)];
		return `<option value="${e.rank}">Major City ${e.rank} — ${e.population.toLocaleString("en-US")}${t ? ` — currently ${Sg(t.code)}` : ""}</option>`;
	}).join("")}
    </select></div>
    <div class="form-group"><label>Action</label><select name="cityAction">
      <option value="standard">Assign WBH unusual-city type</option>
      <option value="custom">Assign custom Referee type</option>
      <option value="clear">Clear unusual-city designation</option>
    </select></div>
    <div class="form-group" data-standard-type-row><label>Unusual city type</label><select name="standardCode">
      ${fg.map((e) => `<option value="${e.code}"${a < e.minimumTechLevel ? " disabled" : ""}>${Sg(`${e.code} — ${e.name} — minimum TL${e.minimumTechLevel}${a < e.minimumTechLevel ? " — unavailable at current TL" : ""}`)}</option>`).join("")}
    </select></div>
    <div data-custom-type-row style="display:none;">
      <div class="form-group"><label>Custom code</label><input name="customCode" maxlength="4" placeholder="Mx"></div>
      <div class="form-group"><label>Description</label><input name="customDescription" maxlength="120" placeholder="Referee-defined unusual city"></div>
      <p class="hint">Custom types are deliberately not given automatic TL validation; the Referee is responsible for their technological plausibility.</p>
    </div>`;
}
function Ag(e, t) {
	let n = e.querySelector("select[name=\"cityRank\"]"), r = e.querySelector("select[name=\"cityAction\"]"), i = e.querySelector("select[name=\"standardCode\"]"), a = e.querySelector("input[name=\"customCode\"]"), o = e.querySelector("input[name=\"customDescription\"]"), s = e.querySelector("[data-standard-type-row]"), c = e.querySelector("[data-custom-type-row]");
	if (!n || !r || !i || !a || !o || !s || !c) return;
	let l = wg(t), u = () => {
		s.style.display = r.value === "standard" ? "" : "none", c.style.display = r.value === "custom" ? "" : "none";
	}, d = () => {
		let e = Tg(l[n.value]);
		r.value = e.action, e.standardCode && i.querySelector(`option[value="${e.standardCode}"]`) && (i.value = e.standardCode), a.value = e.customCode, o.value = e.customDescription, u();
	};
	n.addEventListener("change", d), r.addEventListener("change", u), d();
}
async function jg(e, t) {
	if (!t.isGameMaster()) return;
	if (!Og(e)) {
		t.notifyWarning("Unusual-city editing requires an inhabited TSG world with generated major cities.");
		return;
	}
	let n = await t.prompt({
		window: { title: `Edit Unusual Cities — ${e.name}` },
		content: kg(e),
		ok: { label: "Apply" },
		rejectClose: !1,
		modal: !1,
		render: (t, n) => Ag(n.element, e)
	});
	if (!n) return;
	let r = Number(n.cityRank);
	if (!Number.isInteger(r) || !Dg(e).some((e) => e.rank === r)) {
		t.notifyWarning("Select a valid generated major city.");
		return;
	}
	let i = { ...wg(e) }, a = bg(n.cityAction) ?? "standard";
	if (a === "clear") delete i[String(r)];
	else if (a === "custom") {
		let e = bg(n.customCode)?.trim(), a = bg(n.customDescription)?.trim();
		if (!e || !/^[A-Za-z0-9]{1,4}$/.test(e) || !a) {
			t.notifyWarning("Custom unusual-city types require a 1–4 character alphanumeric code and a description.");
			return;
		}
		i[String(r)] = {
			cityRank: r,
			code: e,
			description: a,
			source: "custom"
		};
	} else {
		let a = bg(n.standardCode), o = xg(Eg(e)?.social?.techLevel) ?? 0, s = fg.find((e) => e.code === a);
		if (!a || !s) {
			t.notifyWarning("Select a WBH unusual-city type.");
			return;
		}
		if (!gg(a, o)) {
			t.notifyWarning(`${a} requires TL${s.minimumTechLevel}; this world is TL${o}.`);
			return;
		}
		i[String(r)] = {
			cityRank: r,
			code: a,
			description: s.name,
			source: "standard"
		};
	}
	try {
		await e.update({ [`flags.${vg}.cityOverrides`]: i }), e.sheet?.render(!0), t.notifyInfo(a === "clear" ? `Cleared the unusual-city designation from Major City ${r}.` : `Updated the unusual-city designation for Major City ${r}.`);
	} catch (e) {
		t.notifyError(`Unable to update unusual-city designation: ${e instanceof Error ? e.message : String(e)}`);
	}
}
//#endregion
//#region src/integrations/foundry/unusualCityInspectorRows.ts
function Mg(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Ng(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function Pg(e) {
	return typeof e == "string" && e.length ? e : null;
}
function Fg(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Ig(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${Fg(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${Fg(t ?? "—")}</span></div>`;
}
function Lg(e) {
	let t = _h(e).find((e) => e.isMainworld), n = t?.social, r = t?.physical, i = dg(Mg(n?.majorCities));
	if (!t || !n || !i) return "<p class=\"hint\">No generated major cities are available for unusual-city designation.</p>";
	let a = Ng(n.techLevel) ?? 0, o = Ng(r?.atmosphereCode) ?? 0, s = Array.isArray(n.tradeCodes) ? n.tradeCodes.map(String) : [], c = hg({
		starport: Pg(n.starport),
		hasHighport: !1,
		atmosphereCode: o,
		techLevel: a,
		tradeCodes: s
	}), l = wg(e), u = c.dmTotal >= 0 ? `+${c.dmTotal}` : String(c.dmTotal), d = i.cities.map((e) => {
		let t = l[String(e.rank)], n = _g(e.codes, e.rank, l), r = `${e.name}${n.length ? ` (${n.join(", ")})` : ""}: ${Math.trunc(e.population).toLocaleString("en-US")}: ${e.port ?? "—"}`, i = t ? `${r} — ${t.description}${t.source === "custom" ? " — custom Referee type" : ""}` : `${r} — normal city / no unusual designation`;
		return Ig(`Major City ${e.rank}`, i);
	}).join(""), f = c.dmBreakdown.length ? `<div style="padding:0.35rem 0;"><strong>Optional occurrence modifiers</strong><ul style="margin:0.3rem 0 0 1.25rem;">${c.dmBreakdown.map((e) => `<li>${Fg(`${e.source}: DM${e.dm >= 0 ? "+" : ""}${e.dm}`)}</li>`).join("")}</ul></div>` : "<p class=\"hint\">No optional unusual-city occurrence DMs apply.</p>";
	return [
		Ig("World Tech Level", a),
		Ig("Optional occurrence check", `2D 12+; world DM ${u}; natural roll ${c.effectiveNaturalRollRequired}+ required`),
		Ig("Automatic assignment", "None — Referee controlled"),
		Ig("Highport modifier", "Not applied — no highport has been established by TSG yet"),
		f,
		"<div style=\"padding:0.45rem 0 0.15rem;\"><strong>Major city designations</strong></div>",
		d
	].join("");
}
//#endregion
//#region src/rules/worlds/wbhSecondaryWorldGovernments.ts
function Rg(e) {
	return Number.isFinite(e) ? Math.max(0, Math.min(10, Math.trunc(e))) : 0;
}
function zg(e) {
	return e <= 1 ? 0 : e === 2 ? 1 : e === 3 ? 2 : e === 4 ? 3 : 6;
}
function Bg(e, t) {
	return e === 0 ? -2 : e === 6 ? t : 0;
}
function Vg(e, t) {
	let n = Rg(t.secondaryPopulationCode);
	if (n <= 0) throw Error("WBH secondary world government generation requires an inhabited secondary world.");
	if (t.affiliation === "dependent") {
		if (!Number.isFinite(t.ownerGovernmentCode)) throw Error("Dependent secondary worlds require an owning government code.");
		let r = Math.max(0, Math.trunc(t.ownerGovernmentCode)), i = Rg(t.ownerPopulationCode ?? 0);
		if (r === 6 && !Number.isFinite(t.ownerPopulationCode)) throw Error("Government 6 owners require the owning mainworld Population code for the WBH secondary-government DM.");
		let a = e.die(6), o = Bg(r, i), s = a + o, c = zg(s);
		return {
			method: "WBH secondary world government",
			affiliation: "dependent",
			secondaryPopulationCode: n,
			ownerId: t.ownerId ?? null,
			ownerGovernmentCode: r,
			ownerPopulationCode: t.ownerPopulationCode == null ? null : i,
			dependentRoll: a,
			dependentDm: o,
			dependentTotal: s,
			governmentCode: c,
			independentGovernment: null,
			independentGovernmentSixReview: !1,
			generationNotes: ["WBH Case 1: secondary world is under the authority of the mainworld or one of its nations/factions.", r === 0 ? "Owner Government 0 applies DM-2." : r === 6 ? `Owner Government 6 applies DM+${i}, equal to the owning mainworld Population code.` : "Owner Government applies no Case 1 modifier."]
		};
	}
	let r = Fl(e, n), i = r.governmentCode, a = i === 6;
	return {
		method: "WBH secondary world government",
		affiliation: "independent",
		secondaryPopulationCode: n,
		ownerId: null,
		ownerGovernmentCode: null,
		ownerPopulationCode: null,
		dependentRoll: null,
		dependentDm: 0,
		dependentTotal: null,
		governmentCode: i,
		independentGovernment: r,
		independentGovernmentSixReview: a,
		generationNotes: ["WBH Case 2: independent secondary world Government is rolled normally using the secondary world Population code.", ...a ? ["Independent Government 6 requires a Referee decision: reroll the Government or make the secondary world a dependency."] : []]
	};
}
//#endregion
//#region src/rules/worlds/wbhSecondaryWorldLawLevels.ts
function Hg(e) {
	return Math.max(0, Math.min(18, Math.trunc(e)));
}
function Ug(e, t, n = 0) {
	let r = e.roll(2, 6).total, i = t - 7 + n;
	return {
		roll: r,
		dm: i,
		law: Hg(r + i)
	};
}
function Wg(e, t) {
	let n = Math.max(0, Math.trunc(t.secondaryGovernmentCode)), r = t.affiliation === "dependent", i = Number.isFinite(t.ownerGovernmentCode) ? Math.max(0, Math.trunc(t.ownerGovernmentCode)) : null, a = Number.isFinite(t.ownerLawLevelCode) ? Hg(t.ownerLawLevelCode) : null, o = t.penalColony === !0, s = t.militaryBase === !0, c = t.freeport === !0;
	if (r && n === 6) {
		if (a === null) throw Error("WBH captive secondary-world Law generation requires the owning authority Law Level.");
		let r = e.die(6), l = o || s ? 1 : 0, u = r + l, d = null, f = 0, p;
		if (u <= 2) {
			let t = Ug(e, 6);
			d = t.roll, f = t.dm, p = t.law;
		} else u <= 4 ? p = a : u === 5 ? p = Hg(a + 1) : (d = e.die(6), p = Hg(a + d));
		return {
			method: "WBH secondary world Law Level",
			case: 1,
			secondaryGovernmentCode: n,
			affiliation: t.affiliation,
			ownerGovernmentCode: i,
			ownerLawLevelCode: a,
			penalColony: o,
			militaryBase: s,
			freeport: c,
			caseRoll: r,
			caseDm: l,
			caseTotal: u,
			secondaryRoll: d,
			secondaryDm: f,
			lawLevelCode: p,
			generationNotes: ["WBH Case 1: captive Government 6 secondary world.", l ? "Penal colony or military base applies DM+1 to the Case 1 roll." : "No penal-colony or military-base DM applied."]
		};
	}
	if (r && n >= 1 && n <= 3) {
		if (i === null || a === null) throw Error("WBH dependent Government 1–3 Law generation requires the owning authority Government and Law Level.");
		let r = e.roll(2, 6).total, l = -i, u = r + l, d = null, f = 0, p;
		if (u <= 0) p = a;
		else {
			let t = e.die(6);
			if (d = t, t <= 3) p = t;
			else {
				let t = Ug(e, n);
				d = t.roll, f = t.dm, p = t.law;
			}
		}
		return {
			method: "WBH secondary world Law Level",
			case: 2,
			secondaryGovernmentCode: n,
			affiliation: t.affiliation,
			ownerGovernmentCode: i,
			ownerLawLevelCode: a,
			penalColony: o,
			militaryBase: s,
			freeport: c,
			caseRoll: r,
			caseDm: l,
			caseTotal: u,
			secondaryRoll: d,
			secondaryDm: f,
			lawLevelCode: p,
			generationNotes: ["WBH Case 2: Government 1–3 secondary world under mainworld authority."]
		};
	}
	let l = Ug(e, n, c ? -1 : 0);
	return {
		method: "WBH secondary world Law Level",
		case: 3,
		secondaryGovernmentCode: n,
		affiliation: t.affiliation,
		ownerGovernmentCode: i,
		ownerLawLevelCode: a,
		penalColony: o,
		militaryBase: s,
		freeport: c,
		caseRoll: null,
		caseDm: 0,
		caseTotal: null,
		secondaryRoll: l.roll,
		secondaryDm: l.dm,
		lawLevelCode: l.law,
		generationNotes: ["WBH Case 3: ordinary Law Level roll based on the secondary world Government code.", c ? "Referee-established freeport applies the optional DM-1." : "No freeport DM applied."]
	};
}
//#endregion
//#region src/integrations/foundry/secondaryGovernmentEditor.ts
var Gg = "traveller-system-generator";
function Kg(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function qg(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function Jg(e) {
	return typeof e == "string" && e.length ? e : null;
}
function Yg(e) {
	return e === !0 || e === "true" || e === "on" || e === 1;
}
function Xg(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Zg(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Qg(e) {
	return Kg(e.flags?.[Gg]);
}
function $g(e) {
	let t = Kg(Qg(e)?.secondaryGovernmentOverrides);
	if (!t) return {};
	let n = {};
	for (let [e, r] of Object.entries(t)) {
		let t = Kg(r), i = Kg(t?.details), a = Kg(t?.lawDetails), o = Kg(t?.lawModifiers), s = t?.affiliation === "dependent" || t?.affiliation === "independent" ? t.affiliation : null;
		!t || !i || !s || (n[e] = {
			bodyId: e,
			affiliation: s,
			ownerId: Jg(t.ownerId),
			details: i,
			lawDetails: a,
			lawModifiers: {
				penalColony: o?.penalColony === !0,
				militaryBase: o?.militaryBase === !0,
				freeport: o?.freeport === !0
			}
		});
	}
	return n;
}
function e_(e) {
	return _h(e).filter((e) => !e.isMainworld && e.social && (qg(e.social.populationCode) ?? 0) > 0);
}
function t_(e) {
	return _h(e).find((e) => e.isMainworld && e.social);
}
function n_(e, t) {
	let n = Kg(e.lawLevelDetails), r = Array.isArray(n?.balkanisedFactions) ? n.balkanisedFactions : [];
	for (let e of r) {
		let n = Kg(e), r = Kg(n?.details);
		if (n?.factionId === t) return qg(r?.lawLevelCode);
	}
	return null;
}
function r_(e) {
	let t = t_(e);
	if (!t?.social) return [];
	let n = qg(t.social.populationCode) ?? 0, r = qg(t.social.governmentCode) ?? 0, i = qg(t.social.lawLevelCode) ?? 0, a = [{
		id: t.id,
		label: `${t.label} — Government ${r}, Law ${i}`,
		governmentCode: r,
		populationCode: n,
		lawLevelCode: i
	}], o = Kg(t.social.balkanisation), s = Array.isArray(o?.factions) ? o.factions : [];
	for (let e of s) {
		let r = Kg(e), i = Jg(r?.id), o = qg(r?.governmentCode);
		if (!i || o === null) continue;
		let s = n_(t.social, i);
		s !== null && a.push({
			id: `${t.id}:${i}`,
			label: `${t.id} ${i} — Government ${o}, Law ${s}`,
			governmentCode: o,
			populationCode: n,
			lawLevelCode: s
		});
	}
	return a;
}
function i_(e) {
	return e.type === "world" && e_(e).length > 0 && r_(e).length > 0;
}
function a_(e) {
	let t = e_(e), n = r_(e), r = $g(e);
	return `
    <p class="hint">WBH requires the Referee to decide whether each inhabited secondary world is dependent on a mainworld authority or politically independent. TSG generates Government and overall Law Level after that choice.</p>
    <div class="form-group"><label>Secondary world</label><select name="bodyId">
      ${t.map((e) => {
		let t = r[e.id], n = qg(e.social?.populationCode) ?? 0, i = t?.lawDetails?.lawLevelCode;
		return `<option value="${Xg(e.id)}">${Xg(`${e.label} — Population ${n}${t ? ` — ${t.affiliation}, Government ${t.details.governmentCode}${i == null ? "" : `, Law ${i}`}` : ""}`)}</option>`;
	}).join("")}
    </select></div>
    <div class="form-group"><label>Political status</label><select name="affiliation">
      <option value="dependent">Dependent on mainworld authority</option>
      <option value="independent">Independent</option>
      <option value="clear">Clear Referee government assignment</option>
    </select></div>
    <div class="form-group" data-owner-row><label>Owning authority</label><select name="ownerId">
      ${n.map((e) => `<option value="${Xg(e.id)}">${Xg(e.label)}</option>`).join("")}
    </select></div>
    <fieldset style="margin-top:0.5rem;"><legend>Secondary-world Law modifiers</legend>
      <label style="display:block;"><input type="checkbox" name="penalColony"> Penal colony</label>
      <label style="display:block;"><input type="checkbox" name="militaryBase"> Military base</label>
      <label style="display:block;"><input type="checkbox" name="freeport"> Freeport</label>
    </fieldset>
    <p class="hint">Government 6 dependencies use the WBH captive-world table; Penal Colony or Military Base applies DM+1. Government 1–3 dependencies use the owner-authority comparison. Other worlds roll Law normally; Freeport applies the optional Referee DM-1. These flags record the Referee decision until the full secondary-world classification workflow is implemented.</p>`;
}
function o_(e, t) {
	let n = e.querySelector("select[name=\"bodyId\"]"), r = e.querySelector("select[name=\"affiliation\"]"), i = e.querySelector("select[name=\"ownerId\"]"), a = e.querySelector("[data-owner-row]"), o = e.querySelector("input[name=\"penalColony\"]"), s = e.querySelector("input[name=\"militaryBase\"]"), c = e.querySelector("input[name=\"freeport\"]");
	if (!n || !r || !i || !a || !o || !s || !c) return;
	let l = $g(t), u = () => {
		let e = l[n.value];
		r.value = e?.affiliation ?? "dependent", e?.ownerId && Array.from(i.options).some((t) => t.value === e.ownerId) && (i.value = e.ownerId), o.checked = e?.lawModifiers?.penalColony ?? !1, s.checked = e?.lawModifiers?.militaryBase ?? !1, c.checked = e?.lawModifiers?.freeport ?? !1, a.style.display = r.value === "dependent" ? "" : "none";
	};
	r.addEventListener("change", () => {
		a.style.display = r.value === "dependent" ? "" : "none";
	}), n.addEventListener("change", u), u();
}
async function s_(e, t) {
	if (!t.isGameMaster()) return;
	if (!i_(e)) {
		t.notifyWarning("Secondary-government editing requires at least one inhabited secondary world and an inhabited mainworld authority.");
		return;
	}
	let n = await t.prompt({
		window: { title: `Edit Secondary Governments — ${e.name}` },
		content: a_(e),
		ok: { label: "Apply" },
		rejectClose: !1,
		modal: !1,
		render: (t, n) => o_(n.element, e)
	});
	if (!n) return;
	let r = Jg(n.bodyId), i = e_(e).find((e) => e.id === r);
	if (!r || !i?.social) {
		t.notifyWarning("Select an inhabited secondary world.");
		return;
	}
	let a = { ...$g(e) }, o = Jg(n.affiliation);
	if (o === "clear") delete a[r];
	else if (o === "dependent" || o === "independent") {
		let s = qg(i.social.populationCode) ?? 0, c;
		if (o === "dependent") {
			let r = Jg(n.ownerId);
			if (c = r_(e).find((e) => e.id === r), !c) {
				t.notifyWarning("Select a valid owning authority for this dependency.");
				return;
			}
		}
		let l = qg(Qg(e)?.generationSeed) ?? 1, u = Vg(new S(Zg(`wbh-secondary-government-affiliation-v1|${l}|${r}|${o}|${c?.id ?? "independent"}`)), {
			affiliation: o,
			secondaryPopulationCode: s,
			ownerGovernmentCode: c?.governmentCode,
			ownerPopulationCode: c?.populationCode,
			ownerId: c?.id
		}), d = {
			penalColony: Yg(n.penalColony),
			militaryBase: Yg(n.militaryBase),
			freeport: Yg(n.freeport)
		}, f = Wg(new S(Zg(`wbh-secondary-law-level-v1|${l}|${r}|${o}|${c?.id ?? "independent"}|${u.governmentCode}|${+!!d.penalColony}${+!!d.militaryBase}${+!!d.freeport}`)), {
			affiliation: o,
			secondaryGovernmentCode: u.governmentCode,
			ownerGovernmentCode: c?.governmentCode,
			ownerLawLevelCode: c?.lawLevelCode,
			...d
		});
		a[r] = {
			bodyId: r,
			affiliation: o,
			ownerId: c?.id ?? null,
			details: u,
			lawDetails: f,
			lawModifiers: d
		};
	} else {
		t.notifyWarning("Select a valid secondary-world political status.");
		return;
	}
	try {
		await e.update({ [`flags.${Gg}.secondaryGovernmentOverrides`]: a }), e.sheet?.render(!0), t.notifyInfo(o === "clear" ? `Cleared the Referee secondary-government assignment for ${r}.` : `Updated the secondary-government and Law assignment for ${r}.`);
	} catch (e) {
		t.notifyError(`Unable to update secondary government: ${e instanceof Error ? e.message : String(e)}`);
	}
}
//#endregion
//#region src/integrations/foundry/secondaryGovernmentInspectorRows.ts
function c_(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function l_(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${c_(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${c_(t ?? "—")}</span></div>`;
}
function u_(e) {
	let t = $g(e), n = _h(e).filter((e) => !e.isMainworld && e.social && Number(e.social.populationCode ?? 0) > 0);
	return n.length ? [l_("WBH policy", "Referee chooses dependency or independence for each inhabited secondary world; Government and overall Law Level then follow the WBH secondary-world cases."), ...n.map((e) => {
		let n = t[e.id];
		if (!n) return l_(e.id, "No Referee secondary-government assignment");
		let r = n.details, i = n.affiliation === "dependent" ? n.ownerId ?? "—" : "Independent", a = n.affiliation === "dependent" ? `1D ${r.dependentRoll ?? "—"} DM${r.dependentDm >= 0 ? "+" : ""}${r.dependentDm} = ${r.dependentTotal ?? "—"}` : `ordinary Government 2D result ${r.independentGovernment?.roll ?? "—"} ${typeof r.independentGovernment?.modifier == "number" ? `${r.independentGovernment.modifier >= 0 ? "+" : ""}${r.independentGovernment.modifier}` : ""}`, o = n.lawDetails, s = o ? `Law ${o.lawLevelCode} — Case ${o.case}${o.penalColony ? " — Penal Colony" : ""}${o.militaryBase ? " — Military Base" : ""}${o.freeport ? " — Freeport" : ""}` : "Law not yet generated for this legacy assignment";
		return l_(e.id, `${n.affiliation} — owner ${i} — Government ${r.governmentCode} — ${a} — ${s}${r.independentGovernmentSixReview ? " — REVIEW: independent Government 6" : ""}`);
	})].join("") : "<p class=\"hint\">No inhabited secondary worlds are currently present.</p>";
}
//#endregion
//#region src/integrations/foundry/technologyInspectorRows.ts
function Z(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function d_(e) {
	return Array.isArray(e) ? e : [];
}
function f_(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Q(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${f_(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${f_(t ?? "—")}</span></div>`;
}
function $(e, t, n = !1) {
	return `<details${n ? " open" : ""} style="margin-top:0.5rem;padding:0.5rem;border:1px dashed var(--color-border-light-primary);border-radius:4px;"><summary style="cursor:pointer;font-weight:600;">${f_(e)}</summary><div style="margin-top:0.4rem;">${t}</div></details>`;
}
function p_(e) {
	let t = d_(e).flatMap((e) => {
		let t = Z(e);
		if (!t) return [];
		let n = typeof t.source == "string" ? t.source : "DM", r = typeof t.dm == "number" ? t.dm : 0;
		return [`${n} ${r >= 0 ? "+" : ""}${r}`];
	});
	return t.length ? t.join("; ") : "None";
}
function m_(e) {
	let t = Z(e);
	return t ? `2D ${t.roll ?? "—"} → ${typeof t.modifier == "number" && t.modifier >= 0 ? "+" : ""}${t.modifier ?? "—"}` : "—";
}
function h_(e, t) {
	let n = Z(t);
	return n ? $(e, [
		Q("Status", n.status ?? "complete"),
		Q("Tech Level", n.techLevel ?? "—"),
		Q("Base TL", n.baseTechLevel ?? "—"),
		Q("TLM", m_(n.tlm)),
		Q("DMs", p_(n.dmBreakdown)),
		Q("DM total", n.dmTotal ?? 0),
		Q("Unbounded TL", n.unboundedTechLevel ?? "—"),
		Q("Bounds", `${n.lowerBound ?? "—"} to ${n.upperBound ?? "—"}`)
	].join("")) : Q(e, "—");
}
function g_(e) {
	let t = Z(e);
	return t ? [
		Q("High Common TL input", t.highCommonTechLevel ?? "—"),
		Q("Minimum sustainable TL", t.minimumSustainableTechLevel ?? "—"),
		Q("Environmental meets sustainable minimum", t.environmentalMeetsSustainableMinimum === !0 ? "Yes" : t.environmentalMeetsSustainableMinimum === !1 ? "No" : "—"),
		h_("Energy", t.energy),
		h_("Electronics", t.electronics),
		h_("Manufacturing", t.manufacturing),
		h_("Medical", t.medical),
		h_("Environmental", t.environmental)
	].join("") : "<p class=\"hint\">No WBH Quality of Life Technology details are stored.</p>";
}
function __(e) {
	let t = Z(e);
	return t ? [
		Q("Energy TL input", t.energyTechLevel ?? "—"),
		Q("Electronics TL input", t.electronicsTechLevel ?? "—"),
		Q("Manufacturing TL input", t.manufacturingTechLevel ?? "—"),
		Q("PCR", t.pcr ?? "Unavailable for this faction candidate"),
		h_("Land", t.land),
		h_("Water", t.water),
		h_("Air", t.air),
		h_("Space", t.space)
	].join("") : "<p class=\"hint\">No WBH Transportation Technology details are stored.</p>";
}
function v_(e) {
	let t = Z(e);
	return t ? [
		Q("Manufacturing TL input", t.manufacturingTechLevel ?? "—"),
		Q("Electronics TL input", t.electronicsTechLevel ?? "—"),
		Q("Population", t.populationCode ?? "Unavailable for this faction candidate"),
		Q("Government", t.governmentCode ?? "—"),
		Q("Overall Law Level", t.overallLawLevel ?? "—"),
		Q("Weapons/Armour Law Level", t.weaponsAndArmourLawLevel ?? "Unavailable / incomplete"),
		Q("Industrial status", t.industrial === !0 ? "Yes" : t.industrial === !1 ? "No" : "Unavailable for this faction candidate"),
		Q("Government-7 world rule", t.worldGovernmentSeven === !0 ? "Applies" : "No"),
		h_("Personal Military", t.personal),
		h_("Heavy Military", t.heavy)
	].join("") : "<p class=\"hint\">No WBH Military Technology details are stored.</p>";
}
function y_(e) {
	let t = Z(e);
	if (!t) return "<p class=\"hint\">No WBH Novelty Technology details are stored.</p>";
	let n = d_(t.factors).map(Z).filter((e) => !!e);
	return [
		Q("Status", t.status ?? "—"),
		Q("Novelty TL", t.techLevel ?? "—"),
		Q("High Common TL input", t.highCommonTechLevel ?? "—"),
		Q("Minimum sustainable TL", t.minimumSustainableTechLevel ?? "—"),
		Q("Highest subcategory TL", t.highestSubcategoryTechLevel ?? "—"),
		Q("Nearby rich/industrial Class A TL", t.nearbyRichIndustrialClassATechLevel ?? "Unresolved / none established"),
		Q("Previous culture TL", t.previousCultureTechLevel ?? "Unresolved / none established"),
		Q("Survivable prototype TL", t.survivablePrototypeTechLevel ?? "Not required"),
		Q("Unresolved factors", d_(t.unresolvedFactors).join(", ") || "None"),
		$("Novelty factors", n.map((e) => Q(String(e.source ?? "Factor"), `${e.status ?? "—"}${typeof e.techLevel == "number" ? ` — TL${e.techLevel}` : ""}: ${e.note ?? ""}`)).join(""))
	].join("");
}
function b_(e) {
	let t = Z(e);
	if (!t) return "<p class=\"hint\">No final WBH Technology Profile is stored.</p>";
	let n = Z(t.components);
	return [
		Q("Status", t.status ?? "—"),
		Q("Technology Profile", t.profile ?? "—"),
		Q("Format", "H-L-QQQQQ-TTTT-MM-N"),
		Q("High / Low Common", `${n?.highCommon ?? "—"} / ${n?.lowCommon ?? "—"}`),
		Q("Quality of Life", `${n?.energy ?? "—"}, ${n?.electronics ?? "—"}, ${n?.manufacturing ?? "—"}, ${n?.medical ?? "—"}, ${n?.environmental ?? "—"}`),
		Q("Transportation", `${n?.land ?? "—"}, ${n?.water ?? "—"}, ${n?.air ?? "—"}, ${n?.space ?? "—"}`),
		Q("Military", `${n?.personalMilitary ?? "—"}, ${n?.heavyMilitary ?? "—"}`),
		Q("Novelty", n?.novelty ?? "—"),
		Q("Provisional reasons", d_(t.provisionalReasons).join("; ") || "None")
	].join("");
}
function x_(e) {
	let t = Z(e.commonTechnologyDetails);
	if (!t) return "<p class=\"hint\">No WBH Common Technology details are stored for this body.</p>";
	let n = Z(t.minimumSustainable);
	return [
		Q("UWP / High Common TL", t.highCommonTechLevel ?? e.techLevel ?? "—"),
		Q("Low Common TL", t.lowCommonTechLevel ?? "—"),
		Q("Low Common TLM", m_(t.lowCommonTlm)),
		Q("Low Common DMs", p_(t.lowCommonDmBreakdown)),
		Q("Low Common unbounded TL", t.lowCommonUnbounded ?? "—"),
		Q("Low Common bounds", `${t.lowCommonLowerBound ?? "—"} to ${t.lowCommonUpperBound ?? "—"}`),
		Q("Minimum sustainable TL", n?.minimumTechLevel ?? "—"),
		Q("Atmosphere minimum TL", n?.atmosphereMinimum ?? "—"),
		Q("Habitability minimum TL", n?.habitabilityMinimum ?? "—"),
		Q("Prosperous Low Common minimum", n?.prosperousLowCommonMinimum ?? "—"),
		Q("High Common sustainable", t.highCommonMeetsSustainableMinimum === !0 ? "Yes" : t.highCommonMeetsSustainableMinimum === !1 ? "No" : "—"),
		Q("Low Common prosperous", t.lowCommonMeetsProsperousMinimum === !0 ? "Yes" : t.lowCommonMeetsProsperousMinimum === !1 ? "No" : "—")
	].join("");
}
function S_(e) {
	let t = Z(e.balkanisedCommonTechnologyDetails);
	if (!t) return "";
	let n = d_(t.factions).map(Z).filter((e) => !!e);
	return $("Government-7 Common TL candidates", [
		Q("Host faction established", t.hostFactionId ?? "No — Referee choice remains unresolved"),
		Q("World High Common TL", t.worldHighCommonTechLevel ?? "—"),
		Q("World Low Common TL", t.worldLowCommonTechLevel ?? "—"),
		...n.map((e) => {
			let t = Z(e.hostOrAdjacentCandidate), n = Z(e.nonHostCandidate);
			return $(`Faction ${e.factionId ?? "?"}`, [
				Q("Government", e.governmentCode ?? "—"),
				Q("Host/adjacent High / Low", `${t?.highCommonTechLevel ?? "—"} / ${t?.lowCommonTechLevel ?? "—"}`),
				Q("Non-host status", n?.status ?? "—"),
				Q("Non-host High Common TL", n?.highCommonTechLevel ?? "—"),
				Q("Non-host High TLM", m_(n?.highCommonTlm)),
				Q("Non-host High DMs", p_(n?.highCommonDmBreakdown)),
				Q("Non-host Low Common TL", n?.lowCommonTechLevel ?? "Incomplete — faction PCR not established"),
				Q("Non-host Low DMs", p_(n?.lowCommonDmBreakdown))
			].join(""));
		})
	].join(""));
}
function C_(e, t, n) {
	let r = Z(e);
	if (!r) return `<p class="hint">${f_(n)}</p>`;
	let i = Z(r.world);
	if (i) return t(i);
	let a = d_(r.factions).map(Z).filter((e) => !!e);
	return a.length ? a.map((e) => $(`Faction ${e.factionId ?? "?"} candidates`, [$("Starport host / adjacent", t(e.hostOrAdjacent), !0), $("Non-host", t(e.nonHost), !1)].join(""))).join("") : `<p class="hint">${f_(n)}</p>`;
}
function w_(e) {
	let t = Z(e);
	return t ? t.populationCode === 0 ? "<p class=\"hint\">Population 0: no inhabited-world Technology profile is generated.</p>" : [
		$("Technology Profile", C_(t.technologyProfileDetails, b_, "No final WBH Technology Profile is stored."), !0),
		$("Common Technology", x_(t), !0),
		S_(t),
		$("Quality of Life Technology", C_(t.qualityOfLifeTechnologyDetails, g_, "No WBH Quality of Life Technology details are stored."), !0),
		$("Transportation Technology", C_(t.transportationTechnologyDetails, __, "No WBH Transportation Technology details are stored."), !0),
		$("Military Technology", C_(t.militaryTechnologyDetails, v_, "No WBH Military Technology details are stored."), !0),
		$("Novelty Technology", C_(t.noveltyTechnologyDetails, y_, "No WBH Novelty Technology details are stored."), !0),
		"<p class=\"hint\" style=\"margin:0.55rem 0 0;\">Secondary-world Technology remains follow-on work.</p>"
	].join("") : "<p class=\"hint\">No inhabited social profile is stored for this body.</p>";
}
//#endregion
//#region src/integrations/foundry/wbhInspectorSecondaryPopulations.ts
var T_ = "traveller-system-generator";
function E_(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function D_(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function O_(e, t) {
	return `<details style="border:1px solid var(--color-border-light-primary);border-radius:6px;padding:0.65rem;"><summary style="cursor:pointer;font-weight:700;">${D_(e)}</summary><div style="margin-top:0.5rem;">${t}</div></details>`;
}
function k_(e) {
	return E_(E_(e.flags?.[T_])?.sensorSystem)?.secondaryPopulationPlan ?? null;
}
function A_(e, t) {
	let n = e.indexOf("<div data-wbh-selected-body>");
	if (n < 0) return e;
	let r = [
		O_("Secondary World Populations", cg(k_(t))),
		O_("Secondary World Governments", u_(t)),
		O_("Unusual Cities", Lg(t))
	].join("\n    ");
	return `${e.slice(0, n)}${r}\n    ${e.slice(n)}`;
}
function j_(e, t) {
	let n = e.querySelector("select[name=\"wbhInspectorBodyId\"]"), r = e.querySelector("[data-wbh-selected-body] > [data-wbh-body-panel]");
	if (!n || !r || r.querySelector("[data-wbh-technology-section]")) return;
	let i = _h(t).find((e) => e.id === n.value);
	if (!i) return;
	let a = document.createElement("div");
	a.dataset.wbhTechnologySection = "true", a.innerHTML = O_("Technology", w_(i.social));
	let o = Array.from(r.children).find((e) => (e.querySelector?.(":scope > summary"))?.textContent?.trim() === "Physical");
	r.insertBefore(a, o ?? null);
}
function M_(e, t) {
	j_(e, t);
	let n = e.querySelector("select[name=\"wbhInspectorBodyId\"]");
	n && n.addEventListener("change", () => j_(e, t));
}
async function N_(e, t, n) {
	await Uh(e, {
		...t,
		prompt: async (n) => t.prompt({
			...n,
			content: A_(n.content, e),
			render: (t, r) => {
				n.render?.(t, r), M_(r.element, e);
			}
		})
	}, n);
}
//#endregion
//#region src/integrations/foundry/actorContextMenuV14.ts
function P_(e, t) {
	let n = Zm(e);
	return t.listGeneratedActors().find((e) => e.id === n);
}
function F_(e, t, n) {
	e.push({
		label: t.localizer.localize("TSG.Manager.ContextManage"),
		icon: "<i class=\"fa-solid fa-solar-system\"></i>",
		visible: (e) => {
			let n = P_(e, t);
			return !!(t.isGameMaster() && n?.type === "world");
		},
		onClick: (e, r) => {
			let i = P_(r, t);
			i && uh(t, n, {
				initialActorId: i.id,
				initialAction: bm(i) ? "adopt" : "update"
			});
		}
	});
}
function I_(e, t, n) {
	e.push({
		label: "Traveller System Generator: Inspect WBH Details",
		icon: "<i class=\"fa-solid fa-magnifying-glass-chart\"></i>",
		visible: (e) => {
			let n = P_(e, t);
			return !!(t.isGameMaster() && n && hh(n));
		},
		onClick: (e, r) => {
			let i = P_(r, t);
			i && N_(i, t, n);
		}
	}), e.push({
		label: "Traveller System Generator: Edit Unusual Cities",
		icon: "<i class=\"fa-solid fa-city\"></i>",
		visible: (e) => {
			let n = P_(e, t);
			return !!(t.isGameMaster() && n && Og(n));
		},
		onClick: (e, n) => {
			let r = P_(n, t);
			r && jg(r, t);
		}
	}), e.push({
		label: "Traveller System Generator: Edit Secondary Governments",
		icon: "<i class=\"fa-solid fa-landmark\"></i>",
		visible: (e) => {
			let n = P_(e, t);
			return !!(t.isGameMaster() && n && i_(n));
		},
		onClick: (e, n) => {
			let r = P_(n, t);
			r && s_(r, t);
		}
	}), n && e.push({
		label: "Traveller System Generator: Edit Habitation",
		icon: "<i class=\"fa-solid fa-people-roof\"></i>",
		visible: (e) => {
			let n = P_(e, t);
			return !!(t.isGameMaster() && n && Xh(n));
		},
		onClick: (e, r) => {
			let i = P_(r, t);
			i && tg(i, t, n);
		}
	});
}
//#endregion
//#region src/integrations/foundry/settingsControl.ts
var L_ = "traveller-system-generator", R_ = "useDefaultSystemFolder", z_ = "defaultSystemFolderId";
function B_(e, t) {
	return Object.fromEntries([["", t.localize("TSG.Dialog.ActorFolderRoot")], ...om(e).map((e) => [e.id, e.path])]);
}
function V_(e, t) {
	e.register(L_, R_, {
		name: t.localize("TSG.Settings.UseDefaultFolder.Name"),
		hint: t.localize("TSG.Settings.UseDefaultFolder.Hint"),
		scope: "world",
		config: !0,
		type: Boolean,
		default: !1
	}), e.register(L_, z_, {
		name: t.localize("TSG.Settings.DefaultFolder.Name"),
		hint: t.localize("TSG.Settings.DefaultFolder.Hint"),
		scope: "world",
		config: !0,
		type: String,
		choices: { "": t.localize("TSG.Dialog.ActorFolderRoot") },
		default: ""
	});
}
async function H_(e) {
	let t = B_(e.listActorFolders(), e.localizer), n = e.settings.settings.get(`${L_}.${z_}`);
	n && (n.choices = t);
	let r = String(e.settings.get("traveller-system-generator", "defaultSystemFolderId") ?? "");
	r && !(r in t) && (await e.settings.set(L_, z_, ""), e.settings.get("traveller-system-generator", "useDefaultSystemFolder") && e.notifyWarning(e.localizer.localize("TSG.Notification.DefaultFolderMissing")));
}
function U_(e, t) {
	if (!e.get("traveller-system-generator", "useDefaultSystemFolder")) return null;
	let n = String(e.get("traveller-system-generator", "defaultSystemFolderId") ?? "");
	return n && t.some((e) => e.id === n) ? n : null;
}
//#endregion
//#region src/integrations/foundry/bootstrap.ts
function W_(e) {
	let t = Ep();
	e.Hooks.once("init", () => {
		Dp(e.getModules(), t);
		let n = e.getDefaultFolderSettingsEnvironment();
		V_(n.settings, n.localizer);
	}), e.Hooks.once("ready", () => {
		H_(e.getDefaultFolderSettingsEnvironment());
	});
	for (let t of [
		"createFolder",
		"updateFolder",
		"deleteFolder"
	]) e.Hooks.on(t, () => {
		H_(e.getDefaultFolderSettingsEnvironment());
	});
	e.Hooks.on("getSceneControlButtons", (n) => {
		dh(n, e.getManagerEnvironment(), t);
	}), e.Hooks.on("getActorContextOptions", (n, r) => {
		let i = e.getManagerEnvironment();
		F_(r, i, t), I_(r, i, t);
	});
}
function G_(e) {
	return typeof e == "string" ? e || null : e?.id ?? null;
}
function K_(e) {
	return e.filter((e) => e.type === "Actor").map(({ id: e, name: t, folder: n, parent: r }) => ({
		id: e,
		name: t,
		parentId: G_(n ?? r)
	}));
}
function q_(e, t) {
	let n = new Map(t.map((e) => [e.id, e])), r = [], i = /* @__PURE__ */ new Set(), a = G_(e.folder);
	for (; a && !i.has(a);) {
		i.add(a);
		let e = n.get(a);
		if (!e) break;
		r.unshift(e.name), a = G_(e.folder ?? e.parent);
	}
	return r.join(" / ");
}
if (typeof Hooks < "u") {
	let e = {
		localize: (e) => game.i18n.localize(e),
		format: (e, t) => game.i18n.format(e, t)
	}, t = (e) => foundry.applications.api.DialogV2.input(e), n = () => K_(Array.from(game.folders));
	W_({
		Hooks,
		getModules: () => game.modules,
		getDefaultFolderSettingsEnvironment: () => ({
			settings: game.settings,
			localizer: e,
			listActorFolders: n,
			notifyWarning: (e) => ui.notifications.warn(e)
		}),
		getManagerEnvironment: () => {
			let n = Array.from(game.folders), r = K_(n);
			return {
				isGameMaster: () => game.user.isGM,
				canCreateActor: () => Actor.implementation.canUserCreate(game.user),
				listActorFolders: () => r,
				defaultSystemFolderId: () => U_(game.settings, r),
				listGeneratedActors: () => Array.from(game.actors).map((e) => Object.assign(e, {
					folderId: G_(e.folder),
					folderPath: q_(e, n.filter((e) => e.type === "Actor"))
				})),
				localizer: e,
				prompt: t,
				createActor: (e) => Actor.implementation.create(e),
				notifyInfo: (e) => ui.notifications.info(e),
				notifyWarning: (e) => ui.notifications.warn(e),
				notifyError: (e) => ui.notifications.error(e)
			};
		}
	});
}
//#endregion
export { W_ as registerFoundryBootstrap };
