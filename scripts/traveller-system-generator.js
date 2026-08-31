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
function i(e, t) {
	let n = t ?? e.find((e) => e.isMainworld)?.id ?? null;
	if (!n) return null;
	for (let t of e) {
		if (t.id === n) return {
			body: t,
			parent: null,
			moon: null
		};
		let e = t.physical?.details?.satellites?.moons ?? [];
		for (let i = 0; i < e.length; i += 1) {
			let a = e[i];
			if ((a.sourceId ?? `${t.id}.moon-${i + 1}`) === n || a.isMainworld) return {
				body: r(t, a, i),
				parent: t,
				moon: a
			};
		}
	}
	return null;
}
function a(e) {
	return i(e.worlds, e.summary.mainworldId ?? null);
}
//#endregion
//#region src/exporters/twodsixActorExport.ts
var o = "systems/twodsix/assets/icons/default_world.png";
function s(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function c(e, t = 3) {
	return e === void 0 || Number.isNaN(e) ? "-" : Number(e.toFixed(t)).toString();
}
function l(e) {
	return `${e.spectralType}${e.subtype ?? ""} ${e.luminosityClass}`;
}
function u(e) {
	return e.social?.uwp ?? e.physical?.uwpPhysical ?? "-";
}
function d(e) {
	return `<p>${s(e)}</p>`;
}
function f(e, t) {
	return e.length ? e.join("; ") : t;
}
function p(e) {
	return a(e)?.body;
}
function m(e) {
	if (!e?.physical) return "No mainworld climate profile was generated.";
	let t = e.physical;
	return `${t.temperatureBand} climate in the ${t.zone.toLowerCase()}; physical profile ${t.uwpPhysical}.`;
}
function h(e) {
	if (!e?.physical) return "No environmental hazards were generated.";
	let t = e.physical, n = [];
	return (t.atmosphereCode ?? 0) === 0 ? n.push("vacuum exposure") : (t.atmosphereCode ?? 0) <= 3 ? n.push("hostile or trace atmosphere") : (t.atmosphereCode ?? 0) >= 10 && n.push("exotic or corrosive atmosphere"), t.zone === "Inferno" && n.push("extreme heat"), t.zone === "Frozen" && n.push("extreme cold"), (t.hydrographicsCode ?? 0) === 10 && n.push("minimal exposed land"), f(n, "No exceptional environmental hazards were identified by the generated profile.");
}
function g(e) {
	if (!e?.social) return "No inhabited mainworld economy was generated.";
	let n = e.social, r = n.tradeCodes.length ? n.tradeCodes.join(", ") : "no assigned trade classifications";
	return `Population ${n.populationTotal.toLocaleString("en-US")}; tech level ${t(n.techLevel)}; importance ${n.importance}; ${r}.`;
}
function _(e) {
	if (!e?.social) return "Uninhabited or socially unprofiled market.";
	let n = e.social;
	return `Starport ${n.starport}; population code ${t(n.populationCode)} with multiplier ${n.populationMultiplier}; law ${t(n.lawLevelCode)}; government ${t(n.governmentCode)}.`;
}
function v(e) {
	let t = e.filter((e) => e.severity !== "info");
	return t.length ? `<ul>${t.map((e) => `<li><strong>${s(e.severity.toUpperCase())}:</strong> ${s(e.message)}${e.recommendation ? ` <em>${s(e.recommendation)}</em>` : ""}</li>`).join("")}</ul>` : "<p>No generation warnings or errors.</p>";
}
function y(e) {
	let t = p(e), n = e.stars.map((e) => `
    <tr>
      <td>${s(e.designation)}</td>
      <td>${s(l(e))}</td>
      <td>${s(e.stellarNature ?? "-")}</td>
      <td>${s(e.orbitClass)}</td>
      <td>${s(c(e.orbitAu))}</td>
      <td>${s(c(e.massSolar))}</td>
      <td>${s(c(e.luminositySolar))}</td>
    </tr>`).join(""), r = e.worlds.filter((e) => e.worldKind !== "Empty Orbit").map((e) => `
      <tr>
        <td>${s(e.id)}${e.isMainworld ? " ★" : ""}</td>
        <td>${s(e.aroundDesignation)}</td>
        <td>${s(e.worldKind)}</td>
        <td>${s(e.physical?.zone ?? "-")}</td>
        <td>${s(u(e))}</td>
        <td>${s(e.social?.populationTotal ?? "-")}</td>
        <td>${s(e.social?.tradeCodes.join(" ") || "-")}</td>
        <td>${s(c(e.au))}</td>
      </tr>`).join(""), i = e.generationSettings ? `${e.generationSettings.starDistribution}; ${e.generationSettings.detailLevel} detail; unusual primaries ${e.generationSettings.allowUnusualPrimaries ? "allowed" : "disabled"}` : "default settings";
	return [
		`<h2>${s(e.name)} System</h2>`,
		"<h3>Mainworld</h3>",
		`<p><strong>World:</strong> ${s(t?.id ?? "None")} &nbsp; <strong>UWP:</strong> ${s(t?.social?.uwp ?? e.summary.preliminaryUwp ?? "-")} &nbsp; <strong>Trade Codes:</strong> ${s(t?.social?.tradeCodes.join(" ") || e.summary.tradeCodes?.join(" ") || "-")}</p>`,
		`<p>${s(m(t))}</p>`,
		"<h3>System Summary</h3>",
		`<p><strong>Stars:</strong> ${e.stars.length} &nbsp; <strong>Terrestrial Worlds:</strong> ${e.summary.terrestrialPlanets} &nbsp; <strong>Gas Giants:</strong> ${e.summary.gasGiants} &nbsp; <strong>Planetoid Belts:</strong> ${e.summary.planetoidBelts}</p>`,
		"<h3>Stars</h3>",
		"<table><thead><tr><th>Designation</th><th>Class</th><th>Nature</th><th>Orbit</th><th>AU</th><th>Mass</th><th>Luminosity</th></tr></thead>",
		`<tbody>${n}</tbody></table>`,
		"<h3>Worlds</h3>",
		"<table><thead><tr><th>ID</th><th>Around</th><th>Kind</th><th>Zone</th><th>UWP</th><th>Population</th><th>Trade</th><th>AU</th></tr></thead>",
		`<tbody>${r}</tbody></table>`,
		"<h3>Generation Notes</h3>",
		`<p><strong>Method:</strong> ${s(e.generationMethod ?? "expanded")} &nbsp; <strong>Settings:</strong> ${s(i)} &nbsp; <strong>Schema:</strong> ${s(e.schemaVersion)}</p>`,
		v(e.validation)
	].join("");
}
function b(e) {
	let n = p(e), r = n?.social, i = n?.physical, a = `${e.name} System`, s = r?.tradeCodes.join(" ") ?? e.summary.tradeCodes?.join(" ") ?? "";
	return {
		name: a,
		type: "world",
		img: e.imageUrl || o,
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
			tradeCodes: s,
			travelZone: "none",
			description: y(e),
			worldImage: e.imageUrl ?? "",
			mainExports: s || "No trade classifications generated.",
			mainImports: "Not generated; assign during campaign preparation.",
			economicLevel: g(n),
			marketProfile: _(n),
			localCurrency: "Not generated.",
			portFees: `Starport ${r?.starport ?? "X"}; fees not generated.`,
			climate: d(m(n)),
			hazards: d(h(n)),
			specialRules: d(n?.generationNotes?.join("; ") || "No special world rules generated."),
			adventureHooks: "<p>Not generated; add campaign-specific hooks here.</p>",
			notes: d(e.refereeNotes || "Generated by Traveller System Generator."),
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
				src: e.imageUrl || o,
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
var x = class {
	state;
	constructor(e = 1) {
		this.state = e >>> 0;
	}
	nextFloat() {
		return this.state = 1664525 * this.state + 1013904223 >>> 0, this.state / 4294967296;
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
function S(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function ee(e) {
	let t = Math.max(2, Math.min(12, Math.trunc(e)));
	return t === 2 ? -3 : t === 3 ? -2 : t === 4 ? -1 : t <= 9 ? 0 : t === 10 ? 1 : t === 11 ? 2 : 3;
}
function C(e) {
	let t = e.roll(2, 6).total;
	return {
		roll: t,
		modifier: ee(t)
	};
}
function te(e) {
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
function ne(e) {
	return e === null ? null : e === 0 ? 8 : e <= 2 ? 5 : e <= 7 ? 3 : null;
}
function re(e, t) {
	let n = te(e), r = ne(t), i = Math.max(n ?? 0, r ?? 0), a = ["May 2024 WBH minimum sustainable Tech Level uses the highest applicable Atmosphere and Habitability minimum.", "Atmosphere F uses the published minimum floor of TL8; specific conditions may justify TL10 or higher at Referee discretion."];
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
function ie(e, t, n) {
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
function ae(e, t) {
	let n = Math.max(0, Math.trunc(t.highCommonTechLevel)), r = C(e), i = ie(t.populationCode, t.governmentCode, t.pcr), a = i.reduce((e, t) => e + t.dm, 0), o = Math.floor(n / 2), s = n, c = n + r.modifier + a, l = Math.max(o, Math.min(s, c)), u = re(t.atmosphereCode, t.habitabilityRating);
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
function oe(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function se(e) {
	let t = oe(e.populationConcentration);
	return typeof t?.rating == "number" ? t.rating : null;
}
function ce(e) {
	let t = e.physical?.details?.habitabilityRating?.rating;
	return typeof t == "number" ? t : null;
}
function le(e, t, n) {
	if (n.populationCode === 0) return {
		...n,
		commonTechnologyDetails: null
	};
	let r = ae(new x(S(`wbh-social-common-technology-v1|${e}|${t.id}|${n.uwp}`)), {
		highCommonTechLevel: n.techLevel,
		populationCode: n.populationCode,
		governmentCode: n.governmentCode,
		pcr: se(n),
		atmosphereCode: t.physical?.atmosphereCode ?? null,
		habitabilityRating: ce(t)
	});
	return {
		...n,
		commonTechnologyDetails: r
	};
}
function ue(e, t, n, r) {
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
		social: le(e, a, n.social)
	};
}
function de(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.physical?.details?.satellites, r = t.social ? le(e.id, t, t.social) : t.social;
			return n ? {
				...t,
				social: r,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...n,
							moons: n.moons.map((n, r) => ue(e.id, t, n, r))
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
function fe(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function pe(e) {
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
function me(e, t) {
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
function he(e, t) {
	let n = Math.max(0, Math.trunc(t.worldHighCommonTechLevel)), r = Math.max(0, Math.min(n, Math.trunc(t.worldLowCommonTechLevel))), i = Math.max(0, Math.trunc(t.faction.governmentCode)), a = C(e), o = pe(i), s = o.reduce((e, t) => e + t.dm, 0), c = n - 2 + a.modifier + s, l = Math.max(r, Math.min(n, c)), u = pe(i);
	t.factionPcr !== null && t.factionPcr >= 7 && u.push({
		source: `Faction PCR ${t.factionPcr}`,
		dm: 1
	});
	let d = u.reduce((e, t) => e + t.dm, 0), f = t.factionPcr !== null, p = f ? r + d : null, m = p === null ? null : Math.max(r, Math.min(l, p));
	return {
		factionId: t.faction.id,
		governmentCode: i,
		hostOrAdjacentCandidate: me(n, r),
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
function ge(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function _e(e, t, n) {
	let r = ge(n.commonTechnologyDetails), i = ge(n.balkanisation), a = Array.isArray(i?.factions) ? i.factions : [];
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
			let i = ge(r);
			return !i || typeof i.id != "string" || typeof i.governmentCode != "number" ? [] : [he(new x(fe(`wbh-social-balkanised-common-technology-v1|${e}|${t}|${i.id}|${n.uwp}`)), {
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
function ve(e, t, n, r) {
	if (!n.social) return n;
	let i = n.sourceId ?? `${t.id}.moon-${r + 1}`;
	return {
		...n,
		social: _e(e, i, n.social)
	};
}
function ye(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.social ? _e(e.id, t.id, t.social) : t.social, r = t.physical?.details?.satellites;
			return r ? {
				...t,
				social: n,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...r,
							moons: r.moons.map((n, r) => ve(e.id, t, n, r))
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
function be(e, t, n) {
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
function xe(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Se(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Ce(e, t, n) {
	if (n.governmentCode !== 7) return {
		method: "WBH death penalty audit",
		world: be(new x(xe(`wbh-social-death-penalty-v1|${e}|${t}|${n.uwp}`)), n.governmentCode, n.lawLevelCode),
		balkanisedFactions: [],
		generationNotes: n.governmentCode === 0 ? ["Government 0 still uses the WBH death-penalty roll with DM-4; formal legal processes may be absent."] : []
	};
	let r = Se(n.judicialSystemDetails), i = Array.isArray(r?.balkanisedFactions) ? r.balkanisedFactions : [], a = [];
	for (let r of i) {
		let i = Se(r), o = typeof i?.factionId == "string" ? i.factionId : null, s = Se(i?.details), c = typeof s?.governmentCode == "number" ? s.governmentCode : null, l = typeof s?.lawLevelCode == "number" ? s.lawLevelCode : null;
		!o || c === null || l === null || a.push({
			factionId: o,
			details: be(new x(xe(`wbh-social-death-penalty-v1|${e}|${t}|${n.uwp}|${o}`)), c, l)
		});
	}
	return {
		method: "WBH death penalty audit",
		world: null,
		balkanisedFactions: a,
		generationNotes: ["Government 7 determines death-penalty status separately for each represented sovereign faction."]
	};
}
function we(e, t) {
	t.social && (t.social.deathPenaltyDetails = Ce(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		if (!i.social) continue;
		let a = i.sourceId ?? `${t.id}.moon-${r + 1}`;
		i.social.deathPenaltyDetails = Ce(e, a, i.social);
	}
}
function Te(e) {
	for (let t of e.worlds) we(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhJusticeProfile.ts
function Ee(e) {
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
function w(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function De(e) {
	return e === "N" || e === "I" || e === "A" || e === "T" ? e : null;
}
function Oe(e) {
	return e === "P" || e === "T" || e === "U" ? e : null;
}
function ke(e) {
	return e === "Y" || e === "N" ? e : null;
}
function Ae(e) {
	let t = w(w(e.judicialSystemDetails)?.world), n = w(t?.secondarySystem), r = w(w(e.lawUniformityDetails)?.world), i = w(w(e.presumptionOfInnocenceDetails)?.world), a = w(w(e.deathPenaltyDetails)?.world);
	return {
		primaryJudicialSystemCode: De(t?.code),
		secondaryJudicialSystemCode: De(n?.code),
		lawUniformityCode: Oe(r?.code),
		presumptionOfInnocenceCode: ke(i?.code),
		deathPenaltyCode: ke(a?.code)
	};
}
function je(e, t) {
	let n = w(e), r = Array.isArray(n?.balkanisedFactions) ? n.balkanisedFactions : [];
	for (let e of r) {
		let n = w(e);
		if (n?.factionId === t) return n;
	}
	return null;
}
function Me(e, t) {
	let n = w(je(e.judicialSystemDetails, t)?.details), r = w(n?.secondarySystem), i = w(je(e.lawUniformityDetails, t)?.details), a = w(je(e.presumptionOfInnocenceDetails, t)?.details), o = w(je(e.deathPenaltyDetails, t)?.details);
	return {
		primaryJudicialSystemCode: De(n?.code),
		secondaryJudicialSystemCode: De(r?.code),
		lawUniformityCode: Oe(i?.code),
		presumptionOfInnocenceCode: ke(a?.code),
		deathPenaltyCode: ke(o?.code)
	};
}
function Ne(e) {
	if (e.governmentCode !== 7) {
		let t = Ee(Ae(e));
		return {
			method: "WBH justice profile audit",
			world: t,
			balkanisedFactions: [],
			generationNotes: t.status === "complete" ? [] : ["Justice Profile prerequisites are incomplete."]
		};
	}
	let t = w(e.judicialSystemDetails), n = Array.isArray(t?.balkanisedFactions) ? t.balkanisedFactions : [], r = [];
	for (let t of n) {
		let n = w(t), i = typeof n?.factionId == "string" ? n.factionId : null;
		i && r.push({
			factionId: i,
			details: Ee(Me(e, i))
		});
	}
	return {
		method: "WBH justice profile audit",
		world: null,
		balkanisedFactions: r,
		generationNotes: ["Government 7 derives a separate Justice Profile for each represented sovereign faction."]
	};
}
function Pe(e) {
	e.social && (e.social.justiceProfileDetails = Ne(e.social));
	let t = e.physical?.details?.satellites?.moons ?? [];
	for (let e of t) e.social && (e.social.justiceProfileDetails = Ne(e.social));
}
function Fe(e) {
	for (let t of e.worlds) Pe(t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhJudicialSystem.ts
function Ie(e) {
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
function Le(e) {
	return e === 1 || e >= 8 && e <= 12 || e === 15 ? -2 : e === 13 || e === 14 ? 4 : 0;
}
function Re(e, t, n) {
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
function ze(e, t) {
	let n = Math.max(0, Math.trunc(t.governmentCode)), r = Math.max(0, Math.trunc(t.lawLevelCode)), i = Math.max(0, Math.trunc(t.techLevel));
	if (n === 0) {
		let a = Re(e, "N", r);
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
	let a = [], o = Le(n);
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
	let s = e.roll(2, 6).total, c = a.reduce((e, t) => e + t.dm, 0), l = s + c, u = Ie(l), d = Re(e, u.code, r);
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
function Be(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Ve(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function He(e) {
	let t = Ve(Ve(e)?.authority);
	return typeof t?.code == "string" ? t.code === "J" : null;
}
function Ue(e, t, n) {
	if (n.populationCode <= 0) return {
		method: "WBH judicial system audit",
		world: ze(new x(Be(`wbh-social-judicial-system-v1|${e}|${t}|${n.uwp}`)), {
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
		world: ze(new x(Be(`wbh-social-judicial-system-v1|${e}|${t}|${n.uwp}`)), {
			governmentCode: n.governmentCode,
			lawLevelCode: n.lawLevelCode,
			techLevel: n.techLevel,
			judicialAuthoritative: He(n.governmentCentralisation)
		}),
		balkanisedFactions: [],
		generationNotes: []
	};
	let r = Ve(n.lawLevelDetails), i = Array.isArray(r?.balkanisedFactionLawLevels) ? r.balkanisedFactionLawLevels : [], a = Ve(n.balkanisation), o = Array.isArray(a?.factions) ? a.factions : [], s = /* @__PURE__ */ new Map();
	for (let e of o) {
		let t = Ve(e);
		typeof t?.id == "string" && s.set(t.id, t);
	}
	let c = [];
	for (let r of i) {
		let i = Ve(r), a = typeof i?.factionId == "string" ? i.factionId : null, o = typeof i?.governmentCode == "number" ? i.governmentCode : null, l = typeof i?.lawLevelCode == "number" ? i.lawLevelCode : null;
		if (!a || o === null || l === null) continue;
		let u = s.get(a), d = new x(Be(`wbh-social-judicial-system-v1|${e}|${t}|${n.uwp}|${a}`));
		c.push({
			factionId: a,
			details: ze(d, {
				governmentCode: o,
				lawLevelCode: l,
				techLevel: n.techLevel,
				judicialAuthoritative: He(u?.centralisation)
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
function We(e, t) {
	t.social && (t.social.judicialSystemDetails = Ue(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		if (!i.social) continue;
		let a = i.sourceId ?? `${t.id}.moon-${r + 1}`;
		i.social.judicialSystemDetails = Ue(e, a, i.social);
	}
}
function Ge(e) {
	for (let t of e.worlds) We(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhLawLevel.ts
function Ke(e) {
	return Math.max(0, Math.min(18, Math.trunc(e)));
}
function qe(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Je(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Ye(e) {
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
function Xe(e, t, n) {
	if (n.populationCode <= 0 || n.governmentCode !== 7) return [];
	let r = Je(n.balkanisation);
	return (Array.isArray(r?.factions) ? r.factions : []).flatMap((r) => {
		let i = Je(r), a = typeof i?.id == "string" ? i.id : null, o = typeof i?.governmentCode == "number" && Number.isFinite(i.governmentCode) ? Math.max(0, Math.trunc(i.governmentCode)) : null;
		if (!a || o === null) return [];
		let s = new x(qe(`wbh-social-law-level-balkanisation-v1|${e}|${t}|${n.uwp}|${a}`)).roll(2, 6).total, c = o - 7, l = s + c;
		return [{
			factionId: a,
			governmentCode: o,
			roll: s,
			modifier: c,
			unclampedTotal: l,
			lawLevelCode: Ke(l)
		}];
	});
}
function Ze(e, t, n, r) {
	let i = r === "generated" ? Ye(n) : {
		roll: null,
		modifier: null,
		unclampedTotal: null,
		clampingMayHaveOccurred: !1
	}, a = Xe(e, t, n);
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
function Qe(e, t) {
	return e.generationMethod === "continuation" && t ? "imported-uwp" : "generated";
}
function $e(e, t) {
	t.social && (t.social.lawLevelDetails = Ze(e.id, t.id, t.social, Qe(e, t.isMainworld === !0)));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		if (!i.social) continue;
		let a = i.sourceId ?? `${t.id}.moon-${r + 1}`;
		i.social.lawLevelDetails = Ze(e.id, a, i.social, Qe(e, i.isMainworld === !0));
	}
}
function et(e) {
	for (let t of e.worlds) $e(e, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhLawSubclassifications.ts
var tt = {
	W: "Weapons and Armour",
	E: "Economic",
	C: "Criminal",
	P: "Private",
	R: "Personal Rights"
};
function nt(e) {
	return Math.max(0, Math.min(18, Math.trunc(e)));
}
function rt(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[e] ?? String(e);
}
function it(e) {
	return e === 0 ? -2 : e === 1 ? 2 : e === 2 ? -1 : +(e === 9);
}
function at(e) {
	return e === 3 || e === 5 || e === 12 ? -1 : 0;
}
function ot(e) {
	return e === 0 || e === 2 ? -1 : e === 1 ? 2 : 0;
}
function st(e, t) {
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
		let e = it(t.governmentCode);
		e !== 0 && n.push({
			source: `Government ${rt(t.governmentCode)}`,
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
		let e = at(t.governmentCode);
		e !== 0 && n.push({
			source: `Government ${rt(t.governmentCode)}`,
			dm: e
		});
	} else {
		let e = ot(t.governmentCode);
		e !== 0 && n.push({
			source: `Government ${rt(t.governmentCode)}`,
			dm: e
		});
	}
	return {
		incompleteReason: null,
		dms: n
	};
}
function ct(e, t, n) {
	let r = nt(n.overallLawLevel), { incompleteReason: i, dms: a } = st(t, n);
	if (i) return {
		method: "WBH Law Level subclassification",
		categoryCode: t,
		categoryName: tt[t],
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
	let o = e.roll(2, 3).total, s = o - 4, c = a.reduce((e, t) => e + t.dm, 0), l = r + s + c, u = nt(l);
	return {
		method: "WBH Law Level subclassification",
		categoryCode: t,
		categoryName: tt[t],
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
function lt(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function ut(e, t) {
	return new x(lt(`${e}|${t}`));
}
function dt(e, t) {
	let n = {
		overallLawLevel: nt(t.overallLawLevel),
		governmentCode: Math.max(0, Math.trunc(t.governmentCode)),
		pcr: t.pcr === null ? null : Math.max(0, Math.min(9, Math.trunc(t.pcr))),
		primaryJudicialSystemCode: t.primaryJudicialSystemCode
	}, r = ct(ut(e, "W"), "W", n), i = ct(ut(e, "E"), "E", n), a = ct(ut(e, "C"), "C", n), o = ct(ut(e, "P"), "P", n), s = ct(ut(e, "R"), "R", n), c = [
		r,
		i,
		a,
		o,
		s
	], l = c.every((e) => e.status === "generated" && e.lawLevel !== null), u = l ? `${rt(n.overallLawLevel)}-${c.map((e) => rt(e.lawLevel)).join("")}` : null;
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
function ft(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function pt(e) {
	return e === "N" || e === "I" || e === "A" || e === "T" ? e : null;
}
function mt(e) {
	let t = ft(e.populationConcentration);
	return typeof t?.rating == "number" ? t.rating : null;
}
function ht(e, t) {
	let n = ft(e), r = Array.isArray(n?.balkanisedFactions) ? n.balkanisedFactions : [];
	for (let e of r) {
		let n = ft(e);
		if (n?.factionId === t) return n;
	}
	return null;
}
function gt(e, t, n) {
	if (n.populationCode <= 0) return {
		method: "WBH Law Level subclassifications audit",
		world: null,
		balkanisedFactions: [],
		generationNotes: ["Population 0 has no inhabited society for which Law Level subclassifications are generated."]
	};
	if (n.governmentCode !== 7) {
		let r = ft(ft(n.judicialSystemDetails)?.world);
		return {
			method: "WBH Law Level subclassifications audit",
			world: dt(`wbh-social-law-subclassifications-v1|${e}|${t}|${n.uwp}`, {
				overallLawLevel: n.lawLevelCode,
				governmentCode: n.governmentCode,
				pcr: mt(n),
				primaryJudicialSystemCode: pt(r?.code)
			}),
			balkanisedFactions: [],
			generationNotes: []
		};
	}
	let r = ft(n.lawLevelDetails), i = Array.isArray(r?.balkanisedFactionLawLevels) ? r.balkanisedFactionLawLevels : [], a = [];
	for (let r of i) {
		let i = ft(r), o = typeof i?.factionId == "string" ? i.factionId : null, s = typeof i?.governmentCode == "number" ? i.governmentCode : null, c = typeof i?.lawLevelCode == "number" ? i.lawLevelCode : null;
		if (!o || s === null || c === null) continue;
		let l = ft(ht(n.judicialSystemDetails, o)?.details);
		a.push({
			factionId: o,
			details: dt(`wbh-social-law-subclassifications-v1|${e}|${t}|${n.uwp}|${o}`, {
				overallLawLevel: c,
				governmentCode: s,
				pcr: null,
				primaryJudicialSystemCode: pt(l?.code)
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
function _t(e, t) {
	t.social && (t.social.lawSubclassificationsDetails = gt(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		if (!i.social) continue;
		let a = i.sourceId ?? `${t.id}.moon-${r + 1}`;
		i.social.lawSubclassificationsDetails = gt(e, a, i.social);
	}
}
function vt(e) {
	for (let t of e.worlds) _t(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhLawUniformity.ts
function yt(e) {
	return e === "P" ? "Personal" : e === "T" ? "Territorial" : "Universal";
}
function bt(e) {
	return e === 2 ? 1 : e === 3 || e === 5 || e >= 10 ? -1 : 0;
}
function xt(e, t, n) {
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
			uniformity: yt(i),
			generationNotes: ["Federal governments are Territorial on 1-5 and Personal on 6."]
		};
	}
	let r = e.die(6), i = bt(t), a = r + i, o = a <= 2 ? "P" : a === 3 ? "T" : "U";
	return {
		method: "WBH law uniformity",
		governmentCode: t,
		centralisationCode: n,
		roll: r,
		dm: i,
		total: a,
		code: o,
		uniformity: yt(o),
		generationNotes: ["Unitary governments use the WBH 1D+DM Law Uniformity table: 2- Personal, 3 Territorial, 4+ Universal."]
	};
}
function St(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Ct(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function wt(e) {
	let t = Ct(e);
	return t?.code === "C" || t?.code === "F" || t?.code === "U" ? t.code : null;
}
function Tt(e, t, n) {
	if (n.populationCode <= 0 || n.governmentCode === 0) return {
		method: "WBH law uniformity audit",
		world: null,
		balkanisedFactions: [],
		generationNotes: ["No established government means no formal overall law-uniformity result is generated."]
	};
	if (n.governmentCode !== 7) {
		let r = wt(n.governmentCentralisation), i = r ? xt(new x(St(`wbh-social-law-uniformity-v1|${e}|${t}|${n.uwp}`)), n.governmentCode, r) : null;
		return {
			method: "WBH law uniformity audit",
			world: i,
			balkanisedFactions: [],
			generationNotes: i ? [] : ["Government centralisation is required before Law Uniformity can be determined."]
		};
	}
	let r = Ct(n.balkanisation), i = Array.isArray(r?.factions) ? r.factions : [], a = [];
	for (let r of i) {
		let i = Ct(r), o = typeof i?.id == "string" ? i.id : null, s = typeof i?.governmentCode == "number" ? i.governmentCode : null, c = wt(i?.centralisation);
		!o || s === null || a.push({
			factionId: o,
			details: c ? xt(new x(St(`wbh-social-law-uniformity-v1|${e}|${t}|${n.uwp}|${o}`)), s, c) : null
		});
	}
	return {
		method: "WBH law uniformity audit",
		world: null,
		balkanisedFactions: a,
		generationNotes: ["Government 7 determines Law Uniformity separately for each represented sovereign faction."]
	};
}
function Et(e, t) {
	t.social && (t.social.lawUniformityDetails = Tt(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		i.social && (i.social.lawUniformityDetails = Tt(e, i.sourceId ?? `${t.id}.moon-${r + 1}`, i.social));
	}
}
function Dt(e) {
	for (let t of e.worlds) Et(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhMilitaryTechnology.ts
function Ot(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function kt(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(e);
}
function At(e, t) {
	return new x(Ot(`${e}|${t}`));
}
function jt(e, t, n) {
	let r = Math.max(0, Math.floor(t));
	return Math.max(r, Math.min(Math.max(r, Math.floor(n)), Math.trunc(e)));
}
function Mt(e, t, n, r, i, a, o, s) {
	let c = C(At(e, t)), l = a.reduce((e, t) => e + t.dm, 0), u = Math.trunc(n) + c.modifier + l;
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
		techLevel: jt(u, r, i),
		generationNotes: s
	};
}
function Nt(e) {
	return e === 0 || e >= 13 ? 2 : +(e >= 1 && e <= 4 || e >= 9 && e <= 12);
}
function Pt(e, t) {
	let n = Math.max(0, Math.trunc(t.manufacturingTechLevel)), r = Math.max(0, Math.trunc(t.electronicsTechLevel)), i = Math.max(0, Math.trunc(t.governmentCode)), a = t.worldGovernmentSeven === !0, o = [];
	(i === 0 || a || i === 7) && o.push({
		source: a && i !== 7 ? "Government 7 world" : `Government ${kt(i)}`,
		dm: 2
	});
	let s = "complete", c = 0, l = ["Personal Military TL = Manufacturing TL + TLM + DMs; upper bound is Electronics TL."];
	if (t.weaponsAndArmourLawLevel === null) s = "provisional", l.push("Weapons and Armour Law Level is unavailable, so its DM and the special Law 0 lower bound cannot be applied; this candidate is provisional.");
	else {
		let e = Math.max(0, Math.trunc(t.weaponsAndArmourLawLevel)), r = Nt(e);
		r !== 0 && o.push({
			source: `Weapons/Armour Law ${kt(e)}`,
			dm: r
		}), e === 0 && (c = n);
	}
	let u = Mt(e, "personal", n, c, r, o, s, l), d = [], f = "complete", p = ["Heavy Military TL = Manufacturing TL + TLM + DMs; upper bound is Manufacturing TL and lower bound is 0."];
	if (t.populationCode === null) f = "provisional", p.push("Nation-specific Population code is unavailable, so the Population DM is not applied.");
	else {
		let e = Math.max(0, Math.trunc(t.populationCode));
		e >= 1 && e <= 6 ? d.push({
			source: `Population ${kt(e)}`,
			dm: -1
		}) : e >= 8 && d.push({
			source: `Population ${kt(e)}`,
			dm: 1
		});
	}
	(a || i === 7) && d.push({
		source: "Government 7 world",
		dm: 2
	}), (i === 10 || i === 11 || i === 15) && d.push({
		source: `Government ${kt(i)}`,
		dm: 2
	}), t.overallLawLevel === null ? (f = "provisional", p.push("Nation-specific overall Law Level is unavailable, so the Law D+ DM is not applied.")) : t.overallLawLevel >= 13 && d.push({
		source: `Law ${kt(t.overallLawLevel)}`,
		dm: 2
	}), t.industrial === null ? (f = "provisional", p.push("Nation-specific Industrial status is unavailable, so the Industrial DM is not applied.")) : t.industrial && d.push({
		source: "Industrial",
		dm: 1
	});
	let m = Mt(e, "heavy", n, 0, n, d, f, p);
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
function T(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Ft(e) {
	return e.tradeCodes.some((e) => e.trim().toUpperCase() === "IN" || e.trim().toUpperCase() === "INDUSTRIAL");
}
function It(e) {
	let t = T(e), n = T(t?.manufacturing)?.techLevel, r = T(t?.electronics)?.techLevel;
	return typeof n != "number" || typeof r != "number" ? null : {
		manufacturingTechLevel: n,
		electronicsTechLevel: r
	};
}
function Lt(e) {
	let t = T(T(T(e.lawSubclassificationsDetails)?.world)?.weaponsAndArmour);
	return typeof t?.lawLevel == "number" ? t.lawLevel : null;
}
function Rt(e, t) {
	let n = T(e.lawLevelDetails), r = Array.isArray(n?.balkanisedFactionLawLevels) ? n.balkanisedFactionLawLevels : [];
	for (let e of r) {
		let n = T(e);
		if (n?.factionId === t) return typeof n.governmentCode != "number" || typeof n.lawLevelCode != "number" ? null : {
			governmentCode: n.governmentCode,
			lawLevelCode: n.lawLevelCode
		};
	}
	return null;
}
function zt(e, t) {
	let n = T(e.lawSubclassificationsDetails), r = Array.isArray(n?.balkanisedFactions) ? n.balkanisedFactions : [];
	for (let e of r) {
		let n = T(e);
		if (n?.factionId !== t) continue;
		let r = T(T(n.details)?.weaponsAndArmour);
		return typeof r?.lawLevel == "number" ? r.lawLevel : null;
	}
	return null;
}
function Bt(e, t, n) {
	if (n.populationCode === 0) return {
		...n,
		militaryTechnologyDetails: null
	};
	let r = T(n.qualityOfLifeTechnologyDetails);
	if (!r) return {
		...n,
		militaryTechnologyDetails: null
	};
	let i = It(r.world);
	if (i) {
		let r = Pt(`wbh-social-military-technology-v1|${e}|${t.id}|world|${n.uwp}`, {
			...i,
			populationCode: n.populationCode,
			governmentCode: n.governmentCode,
			overallLawLevel: n.lawLevelCode,
			weaponsAndArmourLawLevel: Lt(n),
			industrial: Ft(n)
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
		let i = T(r);
		if (!i) return [];
		let a = typeof i.factionId == "string" ? i.factionId : null;
		if (!a) return [];
		let o = Rt(n, a), s = It(i.hostOrAdjacent), c = It(i.nonHost);
		if (!o || !s || !c) return [];
		let l = {
			populationCode: null,
			governmentCode: o.governmentCode,
			overallLawLevel: o.lawLevelCode,
			weaponsAndArmourLawLevel: zt(n, a),
			industrial: null,
			worldGovernmentSeven: !0
		};
		return [{
			factionId: a,
			hostOrAdjacent: Pt(`wbh-social-military-technology-v1|${e}|${t.id}|${a}|host|${n.uwp}`, {
				...s,
				...l
			}),
			nonHost: Pt(`wbh-social-military-technology-v1|${e}|${t.id}|${a}|non-host|${n.uwp}`, {
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
function Vt(e, t, n, r) {
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
		social: Bt(e, a, n.social)
	};
}
function Ht(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.social ? Bt(e.id, t, t.social) : t.social, r = t.physical?.details?.satellites;
			return r ? {
				...t,
				social: n,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...r,
							moons: r.moons.map((n, r) => Vt(e.id, t, n, r))
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
function Ut(e) {
	return Math.max(0, Math.trunc(e));
}
function Wt(e) {
	let t = Ut(e.highCommonTechLevel), n = Ut(e.minimumSustainableTechLevel), r = Ut(e.environmentalTechLevel), i = e.subcategoryTechLevels.filter((e) => Number.isFinite(e)).map(Ut), a = i.length ? Math.max(...i) : 0, o = Math.max(t, r) < n ? Math.max(0, n - 2) : null, s = [{
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
		techLevel: Ut(l),
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
		techLevel: Ut(u),
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
		nearbyRichIndustrialClassATechLevel: l == null ? null : Ut(l),
		previousCultureTechLevel: u == null ? null : Ut(u),
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
function E(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Gt(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function Kt(e, t) {
	let n = E(e);
	if (!n) return null;
	let r = [];
	for (let e of t) {
		let t = Gt(E(n[e])?.techLevel);
		if (t === null) return null;
		r.push(t);
	}
	return r;
}
function qt(e, t) {
	let n = E(e), r = Array.isArray(n?.factions) ? n.factions : [];
	for (let e of r) {
		let n = E(e);
		if (n?.factionId === t) return n;
	}
	return null;
}
function Jt(e, t) {
	return qt(e.balkanisedCommonTechnologyDetails, t);
}
function Yt(e) {
	return Gt(E(E(e.commonTechnologyDetails)?.minimumSustainable)?.minimumTechLevel);
}
function Xt(e, t, n, r, i) {
	let a = Kt(t, [
		"energy",
		"electronics",
		"manufacturing",
		"medical",
		"environmental"
	]), o = Kt(n, [
		"land",
		"water",
		"air",
		"space"
	]), s = Kt(r, ["personal", "heavy"]), c = Yt(e), l = a?.[4] ?? null;
	return !a || !o || !s || c === null || l === null ? null : Wt({
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
function Zt(e) {
	if (e.populationCode === 0) return {
		...e,
		noveltyTechnologyDetails: null
	};
	let t = E(e.qualityOfLifeTechnologyDetails), n = E(e.transportationTechnologyDetails), r = E(e.militaryTechnologyDetails), i = E(e.commonTechnologyDetails);
	if (!t || !n || !r || !i) return {
		...e,
		noveltyTechnologyDetails: null
	};
	let a = E(t.world), o = E(n.world), s = E(r.world), c = Gt(i.highCommonTechLevel);
	if (a && o && s && c !== null) return {
		...e,
		noveltyTechnologyDetails: {
			method: "WBH novelty technology audit",
			world: Xt(e, a, o, s, c),
			factions: [],
			generationNotes: ["World Novelty TL retains unresolved regional and previous-culture factors rather than inventing them."]
		}
	};
	let l = (Array.isArray(t.factions) ? t.factions : []).flatMap((e) => {
		let t = E(e);
		return typeof t?.factionId == "string" ? [t.factionId] : [];
	}).flatMap((i) => {
		let a = qt(t, i), o = qt(n, i), s = qt(r, i), c = Jt(e, i);
		if (!a || !o || !s || !c) return [];
		let l = Gt(E(c.hostOrAdjacentCandidate)?.highCommonTechLevel), u = Gt(E(c.nonHostCandidate)?.highCommonTechLevel);
		if (l === null || u === null) return [];
		let d = Xt(e, a.hostOrAdjacent, o.hostOrAdjacent, s.hostOrAdjacent, l), f = Xt(e, a.nonHost, o.nonHost, s.nonHost, u);
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
function Qt(e, t, n) {
	return t.social ? (t.sourceId ?? `${e.id}${n + 1}`, {
		...t,
		social: Zt(t.social)
	}) : t;
}
function $t(e) {
	return {
		...e,
		worlds: e.worlds.map((e) => {
			let t = e.social ? Zt(e.social) : e.social, n = e.physical?.details?.satellites;
			return n ? {
				...e,
				social: t,
				physical: {
					...e.physical,
					details: {
						...e.physical.details,
						satellites: {
							...n,
							moons: n.moons.map((t, n) => Qt(e, t, n))
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
function en(e, t, n) {
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
function tn(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function nn(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function rn(e) {
	return e === "N" || e === "I" || e === "A" || e === "T" ? e : null;
}
function an(e, t, n) {
	let r = nn(n.judicialSystemDetails);
	if (n.governmentCode !== 7) {
		let i = nn(r?.world), a = rn(i?.code), o = typeof i?.lawLevelCode == "number" ? i.lawLevelCode : n.lawLevelCode, s = en(new x(tn(`wbh-social-presumption-innocence-v1|${e}|${t}|${n.uwp}`)), o, a);
		return {
			method: "WBH presumption of innocence audit",
			world: s,
			balkanisedFactions: [],
			generationNotes: s.status === "incomplete" ? ["Primary judicial-system details are incomplete, so no presumption result is fabricated."] : []
		};
	}
	let i = Array.isArray(r?.balkanisedFactions) ? r.balkanisedFactions : [], a = [];
	for (let r of i) {
		let i = nn(r), o = typeof i?.factionId == "string" ? i.factionId : null, s = nn(i?.details), c = typeof s?.lawLevelCode == "number" ? s.lawLevelCode : null;
		!o || c === null || a.push({
			factionId: o,
			details: en(new x(tn(`wbh-social-presumption-innocence-v1|${e}|${t}|${n.uwp}|${o}`)), c, rn(s?.code))
		});
	}
	return {
		method: "WBH presumption of innocence audit",
		world: null,
		balkanisedFactions: a,
		generationNotes: ["Government 7 determines presumption of innocence separately for each represented sovereign faction."]
	};
}
function on(e, t) {
	t.social && (t.social.presumptionOfInnocenceDetails = an(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		if (!i.social) continue;
		let a = i.sourceId ?? `${t.id}.moon-${r + 1}`;
		i.social.presumptionOfInnocenceDetails = an(e, a, i.social);
	}
}
function sn(e) {
	for (let t of e.worlds) on(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhQualityOfLifeTechnology.ts
function cn(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function ln(e, ...t) {
	let n = new Set(e.map((e) => e.trim().toUpperCase()));
	return t.some((e) => n.has(e.toUpperCase()));
}
function un(e, t, n) {
	let r = Math.max(0, Math.floor(t));
	return Math.max(r, Math.min(Math.max(r, Math.floor(n)), Math.trunc(e)));
}
function dn(e, t, n, r, i, a, o = []) {
	let s = C(e), c = a.reduce((e, t) => e + t.dm, 0), l = Math.trunc(n) + s.modifier + c, u = Math.max(0, Math.floor(r)), d = Math.max(u, Math.floor(i));
	return {
		category: t,
		baseTechLevel: Math.trunc(n),
		tlm: s,
		dmBreakdown: a,
		dmTotal: c,
		unboundedTechLevel: l,
		lowerBound: u,
		upperBound: d,
		techLevel: un(l, u, d),
		generationNotes: o
	};
}
function fn(e, t) {
	return new x(cn(`${e}|${t}`));
}
function pn(e, t) {
	let n = Math.max(0, Math.trunc(t.highCommonTechLevel)), r = Math.max(0, Math.trunc(t.populationCode)), i = ln(t.tradeCodes, "In", "Industrial"), a = ln(t.tradeCodes, "Ri", "Rich"), o = ln(t.tradeCodes, "Po", "Poor"), s = [];
	r >= 9 && s.push({
		source: `Population ${r}`,
		dm: 1
	}), i && s.push({
		source: "Industrial",
		dm: 1
	});
	let c = dn(fn(e, "energy"), "energy", n, n / 2, n * 1.2, s, ["Energy TL = High Common TL + TLM + DMs. All WBH Tech Level bounds are rounded down."]), l = [];
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
	let u = dn(fn(e, "electronics"), "electronics", n, c.techLevel - 3, c.techLevel + 1, l, ["Electronics TL = High Common TL + TLM + DMs."]), d = [];
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
	let f = dn(fn(e, "manufacturing"), "manufacturing", n, u.techLevel - 2, Math.max(c.techLevel, u.techLevel), d, ["Manufacturing TL = High Common TL + TLM + DMs."]), p = [];
	a && p.push({
		source: "Rich",
		dm: 1
	}), o && p.push({
		source: "Poor",
		dm: -1
	});
	let m = t.starport.toUpperCase() === "A" ? 6 : t.starport.toUpperCase() === "B" ? 4 : t.starport.toUpperCase() === "C" ? 2 : 0, h = dn(fn(e, "medical"), "medical", u.techLevel, m, u.techLevel, p, ["Medical TL = Electronics TL + TLM + DMs; the lower bound is the starport-class Tech Level DM (A=6, B=4, C=2, otherwise 0)."]), g = [];
	t.habitabilityRating !== null && t.habitabilityRating < 8 && g.push({
		source: `Habitability ${t.habitabilityRating}`,
		dm: 8 - t.habitabilityRating
	});
	let _ = dn(fn(e, "environmental"), "environmental", f.techLevel, c.techLevel - 5, c.techLevel, g, ["Environmental TL = Manufacturing TL + TLM + DMs.", t.habitabilityRating === null ? "Habitability is unavailable; no Habitability DM was invented." : "Habitability below 8 contributes DM = 8 - Habitability Rating."]);
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
function mn(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function hn(e) {
	let t = e.physical?.details?.habitabilityRating?.rating;
	return typeof t == "number" ? t : null;
}
function gn(e, t, n) {
	let r = mn(mn(e.commonTechnologyDetails)?.minimumSustainable);
	return {
		highCommonTechLevel: n,
		populationCode: e.populationCode,
		starport: e.starport,
		tradeCodes: e.tradeCodes,
		habitabilityRating: hn(t),
		minimumSustainableTechLevel: typeof r?.minimumTechLevel == "number" ? r.minimumTechLevel : 0
	};
}
function _n(e, t, n) {
	if (n.populationCode === 0 || !n.commonTechnologyDetails) return {
		...n,
		qualityOfLifeTechnologyDetails: null
	};
	let r = n.commonTechnologyDetails;
	if (n.governmentCode !== 7) {
		let i = pn(`wbh-social-quality-of-life-technology-v1|${e}|${t.id}|world|${n.uwp}`, gn(n, t, r.highCommonTechLevel));
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
	let i = mn(n.balkanisedCommonTechnologyDetails), a = (Array.isArray(i?.factions) ? i.factions : []).flatMap((r) => {
		let i = mn(r), a = typeof i?.factionId == "string" ? i.factionId : null, o = mn(i?.hostOrAdjacentCandidate), s = mn(i?.nonHostCandidate), c = typeof o?.highCommonTechLevel == "number" ? o.highCommonTechLevel : null, l = typeof s?.highCommonTechLevel == "number" ? s.highCommonTechLevel : null;
		return !a || c === null || l === null ? [] : [{
			factionId: a,
			hostOrAdjacent: pn(`wbh-social-quality-of-life-technology-v1|${e}|${t.id}|${a}|host|${n.uwp}`, gn(n, t, c)),
			nonHost: pn(`wbh-social-quality-of-life-technology-v1|${e}|${t.id}|${a}|non-host|${n.uwp}`, gn(n, t, l))
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
function vn(e, t, n, r) {
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
		social: _n(e, a, n.social)
	};
}
function yn(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.social ? _n(e.id, t, t.social) : t.social, r = t.physical?.details?.satellites;
			return r ? {
				...t,
				social: n,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...r,
							moons: r.moons.map((n, r) => vn(e.id, t, n, r))
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
function D(e) {
	return e === null ? "?" : t(Math.max(0, Math.trunc(e)));
}
function bn(e) {
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
		`${D(t.highCommon)}-${D(t.lowCommon)}`,
		`${D(t.energy)}${D(t.electronics)}${D(t.manufacturing)}${D(t.medical)}${D(t.environmental)}`,
		`${D(t.land)}${D(t.water)}${D(t.air)}${D(t.space)}`,
		`${D(t.personalMilitary)}${D(t.heavyMilitary)}`,
		D(t.novelty)
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
function O(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function xn(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function Sn(e, t) {
	return O(t)?.status === "provisional" ? [`${e} is provisional`] : [];
}
function Cn(e, t) {
	let n = O(e), r = Array.isArray(n?.factions) ? n.factions : [];
	for (let e of r) {
		let n = O(e);
		if (n?.factionId === t) return n;
	}
	return null;
}
function wn(e, t) {
	return xn(O(O(e)?.[t])?.techLevel);
}
function Tn(e, t, n, r, i) {
	let a = O(e), o = O(i), s = [
		...Sn("Novelty Technology", i),
		...[
			"energy",
			"electronics",
			"manufacturing",
			"medical",
			"environmental"
		].flatMap((e) => Sn(`Quality of Life ${e}`, O(t)?.[e])),
		...[
			"land",
			"water",
			"air",
			"space"
		].flatMap((e) => Sn(`Transportation ${e}`, O(n)?.[e])),
		...["personal", "heavy"].flatMap((e) => Sn(`Military ${e}`, O(r)?.[e]))
	];
	return {
		highCommon: xn(a?.highCommonTechLevel),
		lowCommon: xn(a?.lowCommonTechLevel),
		energy: wn(t, "energy"),
		electronics: wn(t, "electronics"),
		manufacturing: wn(t, "manufacturing"),
		medical: wn(t, "medical"),
		environmental: wn(t, "environmental"),
		land: wn(n, "land"),
		water: wn(n, "water"),
		air: wn(n, "air"),
		space: wn(n, "space"),
		personalMilitary: wn(r, "personal"),
		heavyMilitary: wn(r, "heavy"),
		novelty: xn(o?.techLevel),
		provisionalReasons: s
	};
}
function En(e) {
	if (e.populationCode === 0) return {
		...e,
		technologyProfileDetails: null
	};
	let t = O(e.commonTechnologyDetails), n = O(e.qualityOfLifeTechnologyDetails), r = O(e.transportationTechnologyDetails), i = O(e.militaryTechnologyDetails), a = O(e.noveltyTechnologyDetails);
	if (!t || !n || !r || !i || !a) return {
		...e,
		technologyProfileDetails: null
	};
	let o = O(n.world), s = O(r.world), c = O(i.world), l = O(a.world);
	if (o && s && c && l) return {
		...e,
		technologyProfileDetails: {
			method: "WBH technology profile audit",
			world: bn(Tn(t, o, s, c, l)),
			factions: [],
			generationNotes: ["Non-balkanised world profile assembled directly from its generated WBH technology components."]
		}
	};
	let u = O(e.balkanisedCommonTechnologyDetails), d = (Array.isArray(n.factions) ? n.factions : []).flatMap((e) => {
		let t = O(e);
		return typeof t?.factionId == "string" ? [t.factionId] : [];
	}).flatMap((e) => {
		let t = Cn(u, e), o = Cn(n, e), s = Cn(r, e), c = Cn(i, e), l = Cn(a, e);
		if (!t || !o || !s || !c || !l) return [];
		let d = O(t.hostOrAdjacentCandidate), f = O(t.nonHostCandidate);
		return !d || !f ? [] : [{
			factionId: e,
			hostOrAdjacent: bn(Tn(d, o.hostOrAdjacent, s.hostOrAdjacent, c.hostOrAdjacent, l.hostOrAdjacent)),
			nonHost: bn(Tn(f, o.nonHost, s.nonHost, c.nonHost, l.nonHost))
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
function Dn(e, t, n) {
	return t.social ? {
		...t,
		social: En(t.social)
	} : t;
}
function On(e) {
	return {
		...e,
		worlds: e.worlds.map((e) => {
			let t = e.social ? En(e.social) : e.social, n = e.physical?.details?.satellites;
			return n ? {
				...e,
				social: t,
				physical: {
					...e.physical,
					details: {
						...e.physical.details,
						satellites: {
							...n,
							moons: n.moons.map((t, n) => Dn(e, t, n))
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
function kn(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function An(e, t) {
	return new x(kn(`${e}|${t}`));
}
function jn(e, t, n) {
	let r = Math.max(0, Math.floor(t));
	return Math.max(r, Math.min(Math.max(r, Math.floor(n)), Math.trunc(e)));
}
function Mn(e, t, n, r, i, a, o, s) {
	let c = C(An(e, t)), l = a.reduce((e, t) => e + t.dm, 0), u = Math.trunc(n) + c.modifier + l;
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
		techLevel: jn(u, r, i),
		generationNotes: s
	};
}
function Nn(e, t) {
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
function Pn(e, t) {
	let n = Math.max(0, Math.trunc(t.energyTechLevel)), r = Math.max(0, Math.trunc(t.electronicsTechLevel)), i = Math.max(0, Math.trunc(t.manufacturingTechLevel)), a = t.pcr !== null, o = a && t.pcr <= 2, s = a ? "complete" : "provisional", c = [];
	t.hydrographicsCode === 10 && c.push({
		source: "Hydrographics A",
		dm: -1
	}), o && c.push({
		source: `PCR ${t.pcr}`,
		dm: 1
	});
	let l = Mn(e, "land", n, r - 5, n, c, s, a ? ["Land Transport TL = Energy TL + TLM + DMs."] : ["Faction PCR is unavailable; PCR 0–2 DM+1 is not applied, so this candidate is provisional."]), u = [];
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
	let d = Mn(e, "water", n, t.hydrographicsCode === 0 ? 0 : r - 5, n, u, s, a ? ["Water Transport TL = Energy TL + TLM + DMs."] : ["Faction PCR is unavailable; PCR 0–2 DM+1 is not applied, so this candidate is provisional."]), f;
	if (t.atmosphereCode === 0 && n <= 5) f = Nn("air", "WBH: Air Transport TL is automatically 0 for Atmosphere 0 at TL0–5.");
	else {
		let i = [];
		(t.atmosphereCode >= 0 && t.atmosphereCode <= 3 || t.atmosphereCode === 14) && n <= 7 ? i.push({
			source: `Atmosphere ${t.atmosphereCode}, TL0–7`,
			dm: -2
		}) : (t.atmosphereCode === 4 || t.atmosphereCode === 5) && n <= 7 && i.push({
			source: `Atmosphere ${t.atmosphereCode}, TL0–7`,
			dm: -1
		}), f = Mn(e, "air", n, r - 5, n, i, "complete", [
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
	let h = Mn(e, "space", i, Math.min(n - 3, i - 3), Math.min(n, i), p, "complete", ["Space Transport TL = Manufacturing TL + TLM + DMs.", "Referee options concerning jump-drive access and isolated-region minimums are recorded as policy choices and are not imposed automatically."]);
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
function Fn(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function In(e) {
	let t = Fn(e), n = Fn(t?.energy)?.techLevel, r = Fn(t?.electronics)?.techLevel, i = Fn(t?.manufacturing)?.techLevel;
	return typeof n != "number" || typeof r != "number" || typeof i != "number" ? null : {
		energyTechLevel: n,
		electronicsTechLevel: r,
		manufacturingTechLevel: i
	};
}
function Ln(e, t, n) {
	return {
		atmosphereCode: e.physical?.atmosphereCode ?? 0,
		hydrographicsCode: e.physical?.hydrographicsCode ?? 0,
		sizeCode: e.physical?.sizeCode ?? 0,
		populationCode: t.populationCode,
		pcr: n,
		starport: t.starport
	};
}
function Rn(e, t, n) {
	let r = Fn(n.qualityOfLifeTechnologyDetails);
	if (n.populationCode === 0 || !r) return {
		...n,
		transportationTechnologyDetails: null
	};
	let i = Ln(t, n, typeof n.populationConcentration?.rating == "number" ? n.populationConcentration.rating : null), a = In(r.world);
	if (a) return {
		...n,
		transportationTechnologyDetails: {
			method: "WBH transportation technology audit",
			world: Pn(`wbh-social-transportation-technology-v1|${e}|${t.id}|world|${n.uwp}`, {
				...i,
				...a
			}),
			factions: [],
			generationNotes: ["Non-balkanised world uses its world PCR and Quality of Life Tech Levels."]
		}
	};
	let o = (Array.isArray(r.factions) ? r.factions : []).flatMap((r) => {
		let i = Fn(r), a = typeof i?.factionId == "string" ? i.factionId : null, o = In(i?.hostOrAdjacent), s = In(i?.nonHost);
		if (!a || !o || !s) return [];
		let c = Ln(t, n, null);
		return [{
			factionId: a,
			hostOrAdjacent: Pn(`wbh-social-transportation-technology-v1|${e}|${t.id}|${a}|host|${n.uwp}`, {
				...c,
				...o
			}),
			nonHost: Pn(`wbh-social-transportation-technology-v1|${e}|${t.id}|${a}|non-host|${n.uwp}`, {
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
function zn(e, t, n, r) {
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
		social: Rn(e, a, n.social)
	};
}
function Bn(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.social ? Rn(e.id, t, t.social) : t.social, r = t.physical?.details?.satellites;
			return r ? {
				...t,
				social: n,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...r,
							moons: r.moons.map((n, r) => zn(e.id, t, n, r))
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
var Vn = /* @__PURE__ */ new Map([
	[-2, .01],
	[-1, .04],
	[0, .1],
	[1, .2],
	[2, .4],
	[3, .7],
	[4, 1],
	[5, 1.6],
	[6, 2.8],
	[7, 5.2],
	[8, 10],
	[9, 20],
	[10, 40],
	[11, 77],
	[12, 154],
	[13, 308],
	[14, 615],
	[15, 1230],
	[16, 2500],
	[17, 4900],
	[18, 9800]
]), Hn = -2, Un = 18;
function Wn(e) {
	if (!Number.isFinite(e)) throw Error(`Orbit# ${e} is not finite.`);
	if (e < Hn) throw Error(`Orbit# ${e} is below supported range.`);
	if (e > Un) return Vn.get(Un) * 2 ** (e - Un);
	let t = Math.floor(e), n = Math.ceil(e), r = Vn.get(t), i = Vn.get(n);
	if (r === void 0 || i === void 0) throw Error(`Orbit# ${e} is outside supported range.`);
	if (t === n) return r;
	let a = e - t;
	return r + (i - r) * a;
}
function Gn(e) {
	let t = [...Vn.entries()].sort((e, t) => e[0] - t[0]);
	if (e <= t[0][1]) return t[0][0];
	for (let n = 0; n < t.length - 1; n += 1) {
		let [r, i] = t[n], [a, o] = t[n + 1];
		if (e >= i && e <= o) return r + (e - i) / (o - i);
	}
	let [n, r] = t.at(-1);
	return n + Math.log2(e / r);
}
function k(e, t = 3) {
	return Number(e.toFixed(t));
}
//#endregion
//#region src/rules/orbits/eccentricity.ts
function Kn(e, t = 0) {
	let n = e.roll(2, 6, t).total, r;
	return r = n <= 5 ? Math.max(0, -.001 + e.d6() / 1e3) : n <= 7 ? e.d6() / 200 : n <= 9 ? .03 + e.d6() / 100 : n === 10 ? .05 + e.d6() / 20 : n === 11 ? .05 + e.roll(2, 6).total / 20 : .3 + e.roll(2, 6).total / 20, k(Math.max(0, Math.min(.999, r)), 3);
}
//#endregion
//#region src/rules/stars/starTables.ts
function qn(e, t = "classic") {
	return t === "realistic" ? e <= 2 ? "Special" : e <= 8 ? "M" : e === 9 ? "K" : e === 10 ? "G" : e === 11 ? "F" : "Hot" : e <= 2 ? "Special" : e <= 6 ? "M" : e <= 8 ? "K" : e <= 10 ? "G" : e === 11 ? "F" : "Hot";
}
function Jn(e, t) {
	return t ? e <= 3 ? "VI" : e <= 5 ? "BD" : e <= 8 ? "D" : e <= 10 ? "III" : e === 11 ? "II" : "Peculiar" : e <= 5 ? "VI" : e <= 8 ? "IV" : "III";
}
function Yn(e) {
	return e <= 8 ? "III" : e <= 10 ? "II" : e === 11 ? "Ib" : "Ia";
}
function Xn(e) {
	return e <= 9 ? "A" : e <= 11 ? "B" : "O";
}
function Zn(e, t, n) {
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
var Qn = [
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
], $n = {
	starDistribution: "classic",
	allowUnusualPrimaries: !0,
	detailLevel: "standard"
};
function er(e) {
	return {
		...$n,
		...e
	};
}
function tr(e, t, n) {
	if (n === "IV") {
		if (e === "M") return {
			spectralType: "K",
			subtype: 4
		};
		if (e === "K") return {
			spectralType: "K",
			subtype: Math.min(t, 4)
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
function nr(e, t, n, r) {
	let i = Qn.filter((t) => t.spectralType === e);
	if (i.length === 0) throw Error(`No rows for spectral type ${e}`);
	let a = i.filter((e) => e.subtype <= t).at(-1) ?? i[0], o = i.find((e) => e.subtype >= t) ?? i.at(-1), s = o.subtype - a.subtype || 1, c = (t - a.subtype) / s, l = (e) => {
		if (r === "temperatureK") return e.temperatureK;
		let t = e[r][n];
		return t === void 0 ? e[r].V ?? e[r].III ?? 1 : t;
	};
	return l(a) + (l(o) - l(a)) * c;
}
function rr(e, t) {
	return e ** 2 * (t / 5772) ** 4;
}
function ir(e, t) {
	let n = 10 / Math.max(t, .08) ** 2.5;
	if (t < .9) return e.d6() * 2 + Math.ceil(e.d6() / 2) - 1;
	let r = Math.max(.01, e.d10ZeroToNine() / 10);
	return Math.max(.01, Math.min(n, n * r));
}
function ar(e, t, n, r, i) {
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
			luminositySolar: Number(rr(s, o).toFixed(6)),
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
			luminositySolar: Number(rr(o, r).toFixed(6)),
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
function or(e, t, n) {
	let r = qn(e.roll(2, 6, t ? 0 : -1).total, n);
	return r === "Hot" ? Xn(e.roll(2, 6).total) : r;
}
function sr(e, t, n, r, i) {
	let a = er(i), o = or(e, r, a.starDistribution), s = "V", c = "";
	if (o === "Special") {
		let i = Jn(e.roll(2, 6).total, a.allowUnusualPrimaries);
		if (i === "BD" || i === "D" || i === "Peculiar") return ar(e, t, n, i, r);
		s = i === "III" ? Yn(e.roll(2, 6).total) : i, c = `Special-system result resolved as luminosity class ${s}.`;
	}
	let l;
	if (o === "Special") {
		let t = qn(e.roll(2, 6, 1).total, a.starDistribution);
		l = t === "Hot" ? Xn(e.roll(2, 6).total) : t === "Special" ? "M" : t;
	} else l = o;
	let u = Zn(e.roll(2, 6).total, l, r), d = tr(l, u, s);
	l = d.spectralType, u = d.subtype;
	let f = nr(l, u, s, "mass"), p = nr(l, u, s, "diameter"), m = nr(l, u, s, "temperatureK"), h = rr(p, m), g = s === "V" || s === "VI" ? ir(e, f) : Math.max(ir(e, Math.max(.9, Math.min(f, 3))), 1);
	return {
		id: n,
		name: t,
		designation: n,
		orbitClass: r ? "Primary" : "Far",
		spectralType: l,
		subtype: u,
		luminosityClass: s,
		massSolar: Number(f.toFixed(3)),
		diameterSolar: Number(p.toFixed(3)),
		temperatureK: Math.round(m),
		luminositySolar: Number(h.toFixed(4)),
		ageGyr: Number(g.toFixed(3)),
		stellarNature: s === "V" ? "Main sequence" : s === "IV" ? "Subgiant" : s === "VI" ? "Subdwarf" : "Giant or supergiant",
		generationNote: c || void 0
	};
}
function cr(e, t, n, r, i) {
	return sr(e, t, n, r, i);
}
//#endregion
//#region src/rules/system/worldCounts.ts
function lr(e) {
	return e <= 4 ? 1 : e <= 7 ? 2 : e <= 10 ? 3 : e === 11 ? 4 : 5;
}
function ur(e) {
	return e <= 7 ? 1 : e <= 10 ? 2 : e === 11 ? 3 : 4;
}
function dr(e, t) {
	let n = e.roll(2, 6).total <= 9 ? lr(e.roll(2, 6).total) : 0, r = +(n > 0), i = e.roll(2, 6).total >= 8 ? ur(e.roll(2, 6, r).total) : 0, a = t >= 2 ? -1 : 0, o = Math.max(0, e.roll(2, 6, -2 + a).total);
	return {
		gasGiants: n,
		planetoidBelts: i,
		terrestrialPlanets: o,
		totalWorlds: n + i + o
	};
}
//#endregion
//#region src/rules/worlds/wbhTidalLock.ts
var fr = 8766;
function pr(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function mr(e, t) {
	return new x(pr([
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
function hr(e, t) {
	let n = e.roll(2, 6, t).total, r;
	return r = n <= 5 ? -.001 + e.d6() / 1e3 : n <= 7 ? e.d6() / 200 : n <= 9 ? .03 + e.d6() / 100 : n === 10 ? .05 + e.d6() / 20 : n === 11 ? .05 + e.roll(2, 6).total / 20 : .3 + e.roll(2, 6).total / 20, k(Math.max(0, Math.min(.999, r)), 3);
}
function gr(e, t, n, r, i) {
	let a = 0;
	return e !== null && e >= 1 && (a += Math.ceil(e / 3)), t > .1 && (a -= Math.floor(t * 10)), n > 30 && (a -= 2), n >= 60 && n <= 120 && (a -= 4), n >= 80 && n <= 100 && (a -= 4), r !== null && r > 2.5 && (a -= 2), i < 1 ? a -= 2 : i > 10 ? a += 4 : i >= 5 && (a += 2), a;
}
function _r(e) {
	return e < .5 ? -2 : e < 1 ? -1 : e <= 2 ? 0 : e <= 5 ? 1 : 2;
}
function vr(e, t, n) {
	let r = -4;
	e.orbitNumber < 1 ? r += 4 + Math.floor(10 * (1 - e.orbitNumber)) : e.orbitNumber < 2 ? r += 4 : e.orbitNumber <= 3 ? r += 1 : r -= Math.floor(e.orbitNumber) * 2;
	let i = Math.max(1, t.starCount ?? 1), a = t.totalStarMassSolar ?? n.massSolar;
	r += _r(a), i > 1 && (r -= i);
	let o = (t.satellites ?? []).reduce((e, t) => e + (typeof t.sizeCode == "number" && t.sizeCode >= 1 ? t.sizeCode : 0), 0);
	return r -= o, r;
}
function yr(e) {
	let t = 6;
	return e.orbitPd > 20 && (t -= Math.floor(e.orbitPd / 20)), e.direction === "Retrograde" && (t -= 2), e.parentMassTerra > 1e3 ? t += 8 : e.parentMassTerra > 100 ? t += 6 : e.parentMassTerra > 10 ? t += 4 : e.parentMassTerra >= 1 && (t += 2), t;
}
function br(e, t) {
	let n = -10;
	typeof e.sizeCode == "number" && e.sizeCode >= 1 && (n += e.sizeCode);
	let r = e.orbitPd;
	return r < 5 ? n += 5 + Math.ceil((5 - r) * 5) : r < 10 ? n += 4 : r < 20 ? n += 2 : r < 40 ? n += 1 : r > 60 && (n -= 6), n -= Math.max(0, t - 1) * 2, n;
}
function xr(e, t, n) {
	let r = e / (n ? -t : t) - 1;
	return Math.abs(r) < 1e-9 ? {
		solarDaysPerYear: 0,
		solarDayHours: null,
		infinite: !0
	} : {
		solarDaysPerYear: k(r, 6),
		solarDayHours: k(Math.abs(e / r), 6),
		infinite: !1
	};
}
function Sr(e, t) {
	return t <= 3 ? t : k(e.roll(2, 6, -2).total / 10, 3);
}
function Cr(e, t, n, r, i) {
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
	else if (a === 11) s = r.targetPeriodHours * 2 / 3, l = Sr(e, l), d = "3:2";
	else if (d = "1:1", s = r.targetPeriodHours, l = Sr(e, l), u > .1 && (u = Math.min(u, hr(e, -2))), e.roll(2, 6).total === 12) {
		let t = e.roll(2, 6).total, a = Cr(e, t, n, r, i);
		if (r.case === "moon-planet" && a.siderealHours > r.targetPeriodHours) o.push("WBH broken-lock reroll would exceed the moon orbital period; the moon remains in a 1:1 lock.");
		else return a.notes.push("WBH natural-12 broken-lock check replaced the initial 1:1 result with a no-DM Tidal Lock Status roll."), a;
	}
	return {
		status: d,
		siderealHours: k(s, 6),
		direction: c,
		axialTiltDegrees: k(l, 4),
		adjustedEccentricity: k(u, 3),
		result: a,
		notes: o
	};
}
function wr(e, t, n, r) {
	let i = gr(r.sizeCode, r.moon?.eccentricity ?? e.eccentricity, n.axialTiltDegrees, r.atmospherePressureBar, t.ageGyr);
	if (r.moon) return [{
		case: "moon-planet",
		dm: i + yr(r.moon),
		targetId: r.moon.parentId,
		targetPeriodHours: r.moon.orbitalPeriodHours
	}];
	let a = [{
		case: "planet-star",
		dm: i + vr(e, r, t),
		targetId: t.id,
		targetPeriodHours: r.orbitalPeriodYears * fr
	}];
	if (r.sizeCode !== null && r.sizeCode >= 1 && r.satellites?.length) {
		let e = r.satellites.filter((e) => e.physical?.details?.rotation?.tidalLockStatus === "1:1" && e.physical.details.rotation.tidalLockCase === "moon-planet");
		for (let t of e) a.push({
			case: "planet-moon",
			dm: i + br(t, r.satellites.length),
			targetId: t.sourceId ?? t.designation,
			targetPeriodHours: t.periodHours,
			moon: t
		});
	}
	return a;
}
function Tr(e, t, n, r) {
	if (n.tidalLockStatus !== "unresolved") return n;
	let i = wr(e, t, n, r);
	if (!i.length) return n;
	let a = Math.max(...i.map((e) => e.dm)), o = i.filter((e) => e.dm === a).sort((e, t) => e.case === t.case && e.case === "planet-moon" ? (e.moon?.orbitPd ?? 0) - (t.moon?.orbitPd ?? 0) : e.case === "planet-moon" ? -1 : +(t.case === "planet-moon")), s = o[0], c = null, l = -Infinity;
	for (let t of o) {
		let i = mr(e, t), a;
		a = t.dm <= -10 ? 2 : t.dm >= 10 ? 12 : i.roll(2, 6, t.dm).total;
		let o = Cr(i, a, n, t, r.moon?.eccentricity ?? e.eccentricity);
		if (a > l && (c = o, l = a, s = t), o.status === "3:2" || o.status === "1:1") {
			c = o, s = t;
			break;
		}
	}
	if (!c) return n;
	let u = r.orbitalPeriodYears * fr, d = s.case === "planet-star" && c.status === "1:1" ? {
		solarDaysPerYear: 0,
		solarDayHours: null,
		infinite: !0
	} : xr(u, c.siderealHours, c.direction === "Retrograde");
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
//#region src/rules/worlds/wbhSurfaceTides.ts
var Er = 1e6;
function Dr(e, t, n) {
	return t <= 0 || n <= 0 ? 0 : e * t / (32 * n ** 3);
}
function Or(e, t, n) {
	if (e <= 0 || t <= 0 || n <= 0) return 0;
	let r = n / Er;
	return e * t / (3.2 * r ** 3);
}
function A(e) {
	return k(e, 6);
}
function kr(e) {
	let t = [], n = e.rotationLockStatus === "1:1" && e.rotationLockCase === "planet-star", r = n ? 0 : Dr(e.star.massSolar, e.sizeCode, e.distanceAu);
	t.push({
		sourceType: "star",
		sourceId: e.star.id,
		sourceDesignation: e.star.designation,
		amplitudeMetres: A(r),
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
		let o = e.rotationLockStatus === "1:1" && e.rotationLockCase === "planet-moon" && e.rotationLockTargetId === (n.sourceId ?? n.designation), s = o ? 0 : Or(r, e.sizeCode, n.orbitKm);
		i += s, t.push({
			sourceType: "moon",
			sourceId: n.sourceId ?? n.designation,
			sourceDesignation: n.designation,
			amplitudeMetres: A(s),
			suppressedByOneToOneLock: o,
			distance: A(n.orbitKm / Er),
			distanceUnit: "Mkm"
		});
	}
	return {
		method: "WBH surface tidal effects",
		totalAmplitudeMetres: A(r + i),
		stellarAmplitudeMetres: A(r),
		directSatelliteAmplitudeMetres: A(i),
		directParentAmplitudeMetres: 0,
		contributions: t,
		optionalMoonPairEffectsIncluded: !1,
		generationNotes: a
	};
}
function Ar(e) {
	let t = [], n = Dr(e.star.massSolar, e.sizeCode, e.stellarDistanceAu);
	t.push({
		sourceType: "star",
		sourceId: e.star.id,
		sourceDesignation: e.star.designation,
		amplitudeMetres: A(n),
		suppressedByOneToOneLock: !1,
		distance: e.stellarDistanceAu,
		distanceUnit: "AU"
	});
	let r = e.rotationLockStatus === "1:1" && e.rotationLockCase === "moon-planet", i = r ? 0 : Or(e.parentMassTerra, e.sizeCode, e.parentDistanceKm);
	return t.push({
		sourceType: "planet",
		sourceId: e.parentId,
		sourceDesignation: e.parentDesignation,
		amplitudeMetres: A(i),
		suppressedByOneToOneLock: r,
		distance: A(e.parentDistanceKm / Er),
		distanceUnit: "Mkm"
	}), {
		method: "WBH surface tidal effects",
		totalAmplitudeMetres: A(n + i),
		stellarAmplitudeMetres: A(n),
		directSatelliteAmplitudeMetres: 0,
		directParentAmplitudeMetres: A(i),
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
//#region src/rules/system/wbhSystemSurfaceTides.ts
function jr(e) {
	return e.details?.size?.massTerra ?? e.details?.gasGiant?.massTerra ?? null;
}
function Mr(e, t, n, r) {
	let i = r.physical, a = jr(t);
	if (!i?.details || a === null || typeof r.sizeCode != "number" || r.sizeCode <= 0 || i.details.gasGiant) return r;
	let o = i.details.rotation, s = Ar({
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
function Nr(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = t.find((t) => t.id === e.aroundStarId);
	if (!r) return e;
	let i = n.details.satellites, a = i && {
		...i,
		moons: i.moons.map((t) => Mr(e, n, r, t))
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
	let o = n.details.rotation, s = kr({
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
function Pr(e, t) {
	return e.map((e) => Nr(e, t));
}
//#endregion
//#region src/rules/worlds/wbhTemperatureExtremes.ts
function Fr(e) {
	return Math.max(0, Math.min(1, e));
}
function Ir(e, t) {
	let n = Math.sin(Math.max(0, Math.min(180, e)) * Math.PI / 180);
	return t < .1 ? n /= 2 : t > 2 && (n += Math.min(.25, .01 * t)), Fr(n);
}
function Lr(e) {
	if (e.tidalLockStatus === "1:1" && e.tidalLockCase === "planet-star" || e.solarDayInfinite) return 1;
	let t = Math.abs(e.solarDayHours ?? 0);
	return t >= 2500 ? 1 : Fr(Math.sqrt(t) / 50);
}
function Rr(e) {
	return e ? e.code >= 9 ? .1 : e.code <= 1 ? -.1 : 0 : 0;
}
function zr(e, t) {
	return (10 - e) / 20 + (e >= 2 && e <= 8 ? Rr(t?.distribution) : 0);
}
function Br(e, t) {
	return t === null ? e.initialGreenhouseFactor === 0 ? 1 : null : Math.max(1, 1 + t);
}
function Vr(e, t, n, r) {
	let i = e * (1 - t) * (1 + n) / Math.max(r, 1e-6) ** 2;
	return Math.max(3, Math.round(279 * Math.max(0, i) ** .25));
}
function Hr(e) {
	let t = Ir(e.rotation.axialTiltDegrees, e.seasonalPeriodYears), n = Lr(e.rotation), r = zr(e.hydrographicsCode, e.hydrographics), i = Fr(t + n + r), a = Br(e.climate, e.pressureBar), o = a === null ? null : Fr(i / a), s = Math.max(0, Math.min(.999999, e.eccentricity)), c = Math.max(1e-6, e.distanceAu * (1 - s)), l = Math.max(1e-6, e.distanceAu * (1 + s)), u = null, d = null, f = null, p = null;
	o !== null && e.climate.greenhouseFactor !== null && (u = e.luminositySolar * (1 + o), d = e.luminositySolar * (1 - o), f = Vr(u, e.climate.albedo, e.climate.greenhouseFactor, c), p = Vr(d, e.climate.albedo, e.climate.greenhouseFactor, l));
	let m = [
		"WBH high/low temperatures are baseline planetwide values at mean baseline altitude, not absolute local extremes.",
		"Variance combines axial tilt, rotation and hydrographic geography, then clamps the result to the WBH 0-1 range.",
		e.isMoon ? "For this significant moon, near/far stellar AU uses the parent planet orbital eccentricity; optional moon-orbit distance correction is not included." : "Near/far stellar AU uses the world's final post-lock orbital eccentricity."
	];
	return a === null && m.push("Temperature extremes remain unresolved because no mean atmospheric pressure is available for the WBH atmospheric factor."), e.rotation.tidalLockStatus === "1:1" && e.rotation.tidalLockCase === "planet-star" && m.push("WBH rotation factor is forced to 1.0 for a world in a 1:1 stellar tidal lock."), {
		method: "WBH high and low temperatures",
		axialTiltFactor: k(t, 6),
		rotationFactor: k(n, 6),
		geographicFactor: k(r, 6),
		varianceFactor: k(i, 6),
		atmosphericFactor: a === null ? null : k(a, 6),
		luminosityModifier: o === null ? null : k(o, 6),
		highLuminositySolar: u === null ? null : k(u, 6),
		lowLuminositySolar: d === null ? null : k(d, 6),
		nearAu: k(c, 6),
		farAu: k(l, 6),
		highTemperatureK: f,
		highTemperatureC: f === null ? null : f - 273,
		lowTemperatureK: p,
		lowTemperatureC: p === null ? null : p - 273,
		generationNotes: m
	};
}
//#endregion
//#region src/rules/system/wbhSystemTemperatureExtremes.ts
var Ur = 8766;
function Wr(e) {
	return e.details?.atmosphere?.meanBaselinePressureBar ?? null;
}
function Gr(e, t, n) {
	let r = n.physical, i = r?.details, a = i?.climate, o = i?.rotation;
	if (!r || !i || !a || !o || typeof n.sizeCode != "number" || n.sizeCode <= 0 || i.gasGiant || r.hydrographicsCode === null) return n;
	let s = Hr({
		climate: a,
		rotation: o,
		hydrographics: i.hydrographics,
		hydrographicsCode: r.hydrographicsCode,
		pressureBar: Wr(r),
		luminositySolar: t.luminositySolar,
		distanceAu: e.au,
		eccentricity: e.eccentricity,
		seasonalPeriodYears: n.periodHours / Ur,
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
function Kr(e, t) {
	let n = e.physical, r = n?.details;
	if (!n || !r) return e;
	let i = t.find((t) => t.id === e.aroundStarId);
	if (!i) return e;
	let a = r.satellites ? {
		...r.satellites,
		moons: r.satellites.moons.map((t) => Gr(e, i, t))
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
	let o = Hr({
		climate: r.climate,
		rotation: r.rotation,
		hydrographics: r.hydrographics,
		hydrographicsCode: n.hydrographicsCode,
		pressureBar: Wr(n),
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
function qr(e, t) {
	return e.map((e) => Kr(e, t));
}
//#endregion
//#region src/rules/worlds/wbhSeismology.ts
var Jr = 332971, Yr = 1e6, Xr = 24, Zr = 365.25;
function Qr(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function $r(e) {
	return new x(Qr(`wbh-seismology-v1|${e}`));
}
function ei(e, t, n, r, i = []) {
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
function ti(e) {
	return Math.max(0, Math.floor(e / 10));
}
function ni(e, t, n, r, i, a) {
	if (e <= 0 || t <= 0 || n <= 0 || r <= 0 || i <= 0 || a <= 0) return 0;
	let o = e ** 2 * t ** 5 * n ** 2 / (3e3 * r ** 5 * i * a);
	return o < 1 ? 0 : Math.floor(o);
}
function ri(e, t) {
	return e === null ? null : k((e ** 4 + Math.max(0, t) ** 4) ** .25, 6);
}
function ii(e, t, n, r, i) {
	if (!r || n < 1 || i <= 0) return {
		count: 0,
		roll: null,
		dm: 0
	};
	let a = i > 100 ? 2 : +(i >= 10), o = $r(e).roll(2, 6).total, s = t + n - o + a;
	return {
		count: s <= 1 ? 0 : s,
		roll: o,
		dm: a
	};
}
function ai(e) {
	let t = e.profile.details, n = t?.size, r = e.profile.sizeCode;
	if (!t || !n || r === null || r <= 0) return null;
	let i = t.satellites?.moons ?? [], a = ei(r, e.star.ageGyr, n.densityTerra, !1, i), o = ti(t.surfaceTides?.totalAmplitudeMetres ?? 0), s = ni(e.star.massSolar * Jr, r, e.eccentricity, e.profile.details?.climate?.distanceAuUsed ? e.profile.details.climate.distanceAuUsed * 149.5978709 : 0, e.profile.orbitalPeriodYears * Zr, n.massTerra), c = a.stress + o + s, l = t.hydrographics?.composition === "H2O", u = ii(e.id, r, e.profile.hydrographicsCode ?? 0, l, c);
	return {
		method: "WBH seismology",
		residualSeismicStress: a.stress,
		residualStressDm: a.dm,
		tidalStressFactor: o,
		tidalHeatingFactor: s,
		totalSeismicStress: c,
		seismicAdjustedMeanTemperatureK: ri(t.climate?.meanTemperatureK ?? null, c),
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
function oi(e) {
	let t = e.profile.details, n = t?.size;
	if (!t || !n || e.sizeCode <= 0) return null;
	let r = ei(e.sizeCode, e.starAgeGyr, n.densityTerra, !0), i = ti(t.surfaceTides?.totalAmplitudeMetres ?? 0), a = ni(e.parentMassTerra, e.sizeCode, e.eccentricity, e.orbitKm / Yr, e.periodHours / Xr, n.massTerra), o = r.stress + i + a, s = t.hydrographics?.composition === "H2O", c = ii(e.id, e.sizeCode, e.profile.hydrographicsCode ?? 0, s, o);
	return {
		method: "WBH seismology",
		residualSeismicStress: r.stress,
		residualStressDm: r.dm,
		tidalStressFactor: i,
		tidalHeatingFactor: a,
		totalSeismicStress: o,
		seismicAdjustedMeanTemperatureK: ri(t.climate?.meanTemperatureK ?? null, o),
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
function si(e) {
	return e.details?.size?.massTerra ?? e.details?.gasGiant?.massTerra ?? null;
}
function ci(e, t, n, r) {
	let i = r.physical, a = si(t);
	if (!i?.details || a === null || typeof r.sizeCode != "number" || r.sizeCode <= 0 || i.details.gasGiant) return r;
	let o = oi({
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
function li(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = t.find((t) => t.id === e.aroundStarId);
	if (!r) return e;
	let i = n.details.satellites, a = i && {
		...i,
		moons: i.moons.map((t) => ci(e, n, r, t))
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
	}, s = ai({
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
function di(e, t) {
	return e.map((e) => li(e, t));
}
//#endregion
//#region src/rules/worlds/wbhSurfaceGeology.ts
function fi(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function pi(e, t) {
	return e <= 1 || t <= 1 ? e > 1 ? "limited" : "inactive" : e > 100 ? "extreme" : e >= 10 ? "active" : "limited";
}
function mi(e) {
	let t = e.die(100);
	return t <= 35 ? "convergent" : t <= 60 ? "divergent" : t <= 85 ? "transform" : "stable";
}
function hi(e) {
	return (e?.surfaceFeatures?.bodies ?? []).map((e) => e.id);
}
function gi(e, t) {
	if (!t.length) return [];
	let n = t[e.die(t.length) - 1];
	if (t.length === 1 || e.d6() <= 3) return [n];
	let r = n;
	for (let i = 0; i < 4 && r === n; i += 1) r = t[e.die(t.length) - 1];
	return r === n ? [n] : [n, r];
}
function _i(e) {
	return e > 100 ? "severe" : e >= 10 ? "major" : "minor";
}
function vi(e, t, n) {
	if (e === "convergent") {
		let e = ["mountain-chain"];
		return (t?.coveragePercent ?? 0) >= 40 && n % 2 == 0 && e.push("ocean-trench"), e;
	}
	return e === "divergent" ? n % 2 == 0 ? ["rift-system", "volcanic-belt"] : ["rift-system"] : e === "transform" ? ["fault-zone"] : [];
}
function yi(e, t, n) {
	if (!t) return null;
	let r = t.totalSeismicStress, i = t.majorTectonicPlates, a = pi(r, i), o = hi(n), s = new x(fi(`wbh-surface-geology-v1|${e}|${r}|${i}|${o.join(",")}`)), c = i > 1 ? Math.max(3, Math.round(i * 1.5)) : 0, l = {
		convergent: 0,
		divergent: 0,
		transform: 0,
		stable: 0
	}, u = [], d = _i(r);
	for (let e = 0; e < c; e += 1) {
		let t = mi(s);
		l[t] += 1;
		for (let r of vi(t, n, e)) u.push({
			id: `geology-${u.length + 1}`,
			kind: r,
			intensity: d,
			relatedSurfaceBodyIds: gi(s, o),
			sourceBoundary: t
		});
	}
	return i <= 1 && r > 1 && u.push({
		id: "geology-1",
		kind: s.d6() <= 3 ? "isolated-volcanic-region" : "uplift-highland",
		intensity: d,
		relatedSurfaceBodyIds: gi(s, o),
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
function bi(e, t) {
	let n = t.physical;
	if (!n?.details || n.details.gasGiant) return t;
	let r = yi(t.sourceId ?? `${e.id}.${t.designation}`, n.details.seismology, n.details.hydrographics);
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
function xi(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites, r = n && {
		...n,
		moons: n.moons.map((t) => bi(e, t))
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
	}, a = yi(e.id, i.details?.seismology, i.details?.hydrographics);
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
function Si(e) {
	return e.map(xi);
}
//#endregion
//#region src/rules/worlds/wbhSurfaceClimate.ts
function Ci(e) {
	return e < 253 ? "frigid" : e < 273 ? "cold" : e < 303 ? "temperate" : e < 323 ? "warm" : "hot";
}
function wi(e, t, n) {
	return n <= 273 ? "pervasive" : t <= 273 ? "substantial" : e <= 273 ? "localized" : "none";
}
function Ti(e) {
	let t = e.details?.climate, n = t?.temperatureExtremes;
	if (!t || !n || t.meanTemperatureK === null || n.highTemperatureK === null || n.lowTemperatureK === null) return null;
	let r = t.meanTemperatureK, i = n.highTemperatureK, a = n.lowTemperatureK, o = wi(a, r, i), s = i > 278 && r > 273, c = s && (i < 323 || r < 318), l = [];
	return o === "pervasive" ? l.push("Permanent ice or glaciation can dominate nearly all mapped latitude bands.") : o === "substantial" ? l.push("Large permanent polar or high-altitude ice regions are expected.") : o === "localized" ? l.push("Permanent ice is plausible in polar or high-altitude regions.") : l.push("The baseline temperature range does not imply permanent surface ice."), s ? l.push("At least some regions satisfy the WBH thermal threshold for agriculture.") : l.push("The global baseline temperatures do not satisfy the WBH thermal threshold for agriculture."), c ? l.push("At least some regions satisfy the WBH thermal threshold for unprotected human settlement.") : l.push("The global baseline temperatures do not satisfy the WBH thermal threshold for unprotected human settlement."), e.details?.rotation?.tidalLockStatus === "1:1" && e.details.rotation.tidalLockCase === "planet-star" && l.push("For mapping a stellar 1:1 tidal lock, treat the terminator/twilight zone as the principal surface-climate axis rather than ordinary latitude."), {
		method: "WBH surface climate phase 1",
		meanTemperatureK: r,
		highTemperatureK: i,
		lowTemperatureK: a,
		thermalRegime: Ci(r),
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
function Ei(e) {
	let t = e.physical;
	if (!t?.details || t.details.gasGiant || typeof e.sizeCode != "number" || e.sizeCode <= 0) return e;
	let n = Ti(t);
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
function Di(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites ? {
		...t.details.satellites,
		moons: t.details.satellites.moons.map(Ei)
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
	}, i = Ti(r);
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
function Oi(e) {
	return e.map(Di);
}
//#endregion
//#region src/rules/worlds/wbhNativeLife.ts
function ki(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Ai(e, t, n, r) {
	return new x(ki([
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
function ji(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(Math.max(0, Math.trunc(e)));
}
function Mi(e) {
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
function Ni(e) {
	return e === 0 ? -4 : e >= 1 && e <= 3 ? -2 : e >= 6 && e <= 8 ? 1 : e >= 9 ? 2 : 0;
}
function Pi(e) {
	return e < .2 ? -6 : e < 1 ? -2 : +(e > 4);
}
function Fi(e) {
	let t = e.details?.climate, n = t?.temperatureExtremes?.highTemperatureK ?? null, r = t?.meanTemperatureK ?? null, i = 0;
	return n !== null && (n > 353 ? i -= 2 : n < 273 && (i -= 4)), r === null ? e.temperatureBand === "Temperate" ? i + 2 : e.temperatureBand === "Cold" ? i - 2 : e.temperatureBand === "Frozen" || e.temperatureBand === "Boiling" ? i - 6 : i : (r > 353 ? i -= 4 : r < 273 ? i -= 2 : r >= 279 && r <= 303 && (i += 2), i);
}
function Ii(e) {
	return e ? e.taints.some((e) => e.type.toLowerCase().includes("biologic")) || e.hazards.some((e) => e.type === "Biologic") : !1;
}
function Li(e) {
	return e === 0 || e === 1 || e === 10 || e === 11 || e === 12 || e >= 15;
}
function Ri(e, t) {
	let n = 0, r = e.atmosphereCode ?? 0;
	return (r < 4 || r > 9) && (n -= 2), e.details?.atmosphere?.oxygenSafety === "low" && (n -= 2), t <= 1 ? n -= 10 : t <= 2 ? n -= 8 : t <= 3 ? n -= 4 : t <= 4 && (n -= 2), n;
}
function zi(e, t) {
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
function Bi(e, t, n) {
	return t <= 0 ? 0 : Math.max(1, Math.ceil(e - 7 + (t + n) / 2));
}
function Vi(e, t, n) {
	return Math.max(0, Math.floor(e + 3 - t / 2 + n));
}
function Hi(e) {
	let { id: t, profile: n, ageGyr: r } = e, i = n.atmosphereCode, a = n.hydrographicsCode;
	if (i === null || a === null || !n.details) return null;
	let o = Mi(i), s = Ni(a), c = Pi(r), l = Fi(n), u = o + s + c + l, d = Math.max(-12, Math.min(4, u)), f = Ai(t, "biomass", n, r), p = Math.max(0, f + d), m = "none", h = [`WBH biomass DM ${u >= 0 ? "+" : ""}${u} is clamped to ${d >= 0 ? "+" : ""}${d} within the -12/+4 limits.`];
	if (p === 0 && Ii(n.details.atmosphere)) p = 1, m = "biologic-taint-floor", h.push("Biologic atmospheric taint forces Biomass 1 and Biocomplexity 1 under the WBH special case.");
	else if (p >= 1 && Li(i)) {
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
	m === "biologic-taint-floor" ? (g = 1, _ = null) : (v = Ri(n, r), _ = Ai(t, "biocomplexity", n, r), g = Math.max(1, _ - 7 + Math.min(9, p) + v));
	let y = null, b = null, x = null, S = null;
	if (g >= 8) {
		let e = Math.min(9, g);
		b = Ai(t, "current-sophont", n, r), y = b + e - 7 >= 13, S = Ai(t, "extinct-sophont", n, r), x = S + e - 7 + +(r > 5) >= 13;
	}
	let ee = Ai(t, "biodiversity", n, r), C = Bi(ee, p, g), te = zi(n, r), ne = Ai(t, "compatibility", n, r), re = Vi(ne, g, te), ie = `${ji(p)}${ji(g)}${ji(C)}${ji(re)}`;
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
		biodiversityRating: C,
		biodiversityRoll: ee,
		compatibilityRating: re,
		compatibilityRoll: ne,
		compatibilityDm: te,
		currentNativeSophont: y,
		currentNativeSophontRoll: b,
		extinctNativeSophontEvidence: x,
		extinctNativeSophontRoll: S,
		profile: ie,
		generationNotes: h
	};
}
//#endregion
//#region src/rules/system/wbhSystemNativeLife.ts
function Ui(e, t, n) {
	let r = n.physical;
	if (!r?.details || typeof n.sizeCode != "number" || r.details.gasGiant) return n;
	let i = Hi({
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
function Wi(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = t.find((t) => t.id === e.aroundStarId);
	if (!r) return e;
	let i = n.details.satellites, a = i && {
		...i,
		moons: i.moons.map((t) => Ui(e, r, t))
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
	let s = Hi({
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
function Gi(e, t) {
	return e.map((e) => Wi(e, t));
}
//#endregion
//#region src/rules/worlds/wbhResourceRating.ts
function Ki(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function qi(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(Math.max(0, Math.trunc(e)));
}
function Ji(e) {
	return e === null ? 0 : e > 1.12 ? 2 : e < .5 ? -2 : 0;
}
function Yi(e) {
	return e >= 11 ? 2 : +(e >= 8);
}
function Xi(e, t) {
	return e < 1 ? 0 : t <= 3 ? -1 : t >= 8 ? 2 : 0;
}
function Zi(e) {
	let { id: t, profile: n } = e;
	if (typeof n.sizeCode != "number" || n.sizeCode <= 0 || n.details?.gasGiant) return null;
	let r = n.details?.nativeLife ?? null, i = n.details?.size?.densityTerra ?? null, a = r?.biomassRating ?? 0, o = r?.biodiversityRating ?? 0, s = r?.compatibilityRating ?? 0, c = Ji(i), l = a >= 3 ? 2 : 0, u = Yi(o), d = Xi(a, s), f = c + l + u + d, p = new x(Ki([
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
		code: qi(h),
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
function Qi(e, t) {
	let n = t.physical;
	if (!n?.details || typeof t.sizeCode != "number" || t.sizeCode <= 0 || n.details.gasGiant) return t;
	let r = Zi({
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
function $i(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites, r = n && {
		...n,
		moons: n.moons.map((t) => Qi(e, t))
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
	let a = Zi({
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
function ea(e, t) {
	return e.map($i);
}
//#endregion
//#region src/rules/worlds/wbhHabitabilityRating.ts
function ta(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(Math.max(0, Math.trunc(e)));
}
function na(e) {
	return e <= 4 ? -1 : +(e >= 9);
}
function ra(e) {
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
function ia(e) {
	return e === 0 ? -4 : e >= 1 && e <= 3 ? -2 : e === 9 ? -1 : e >= 10 ? -2 : 0;
}
function aa(e) {
	return e < .2 ? -4 : e <= .4 ? -2 : e <= .7 ? -1 : e < .9 ? 1 : e < 1.1 ? 0 : e < 1.4 ? -1 : e < 2 ? -3 : -6;
}
function oa(e) {
	return 1 - Math.abs(6 - e);
}
function sa(e) {
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
function ca(e) {
	return e <= 0 ? "Actively hostile world: not survivable without specialised equipment" : e <= 2 ? "Barely habitable world: full protective equipment often needed" : e <= 5 ? "Marginally survivable world with proper equipment" : e <= 7 ? "Regionally habitable world: may require acclimation" : e <= 9 ? "Suitable for human habitation with minimal equipment or acclimation" : "Terra-equivalent garden world";
}
function la(e) {
	let { profile: t } = e, n = t.sizeCode, r = t.atmosphereCode, i = t.hydrographicsCode;
	if (n === null || r === null || i === null) return null;
	let a = t.details?.atmosphere, o = t.details?.size?.gravityG ?? null, s = sa(t), c = Math.trunc(e.miscellaneousAdjustment ?? 0), l = a?.taints.some((e) => e.code === "L") ? -2 : 0, u = t.details?.rotation?.tidalLockStatus === "1:1" && t.details.rotation.tidalLockCase === "planet-star" ? -2 : 0, d = {
		size: na(n),
		atmosphere: ra(r),
		lowOxygenTaint: l,
		hydrographics: ia(i),
		solarTidalLock: u,
		highTemperature: s.high,
		meanTemperature: s.mean,
		lowTemperature: s.low,
		temperatureFallback: s.fallback,
		gravity: o === null ? oa(n) : aa(o),
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
		code: ta(p),
		baseRating: 10,
		dm: d,
		unclampedTotal: f,
		remarks: ca(p),
		usedDetailedTemperature: s.detailed,
		usedComputedGravity: o !== null,
		generationNotes: m
	};
}
//#endregion
//#region src/rules/system/wbhSystemHabitabilityRating.ts
function ua(e, t) {
	let n = t.physical;
	if (!n?.details || typeof t.sizeCode != "number" || t.sizeCode <= 0 || n.details.gasGiant) return t;
	let r = la({ profile: n });
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
function da(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites, r = n && {
		...n,
		moons: n.moons.map((t) => ua(e, t))
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
	let a = la({ profile: i });
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
function fa(e, t) {
	return e.map(da);
}
//#endregion
//#region src/rules/system/wbhSystemTidalLocks.ts
function pa(e) {
	return e ? e.meanBaselinePressureBar === null ? e.pressureRangeBar?.minimumBar !== void 0 && e.pressureRangeBar.minimumBar > 2.5 ? e.pressureRangeBar.minimumBar : e.specialSubtype?.minimumPressureBar !== null && e.specialSubtype?.minimumPressureBar !== void 0 && e.specialSubtype.minimumPressureBar > 2.5 ? e.specialSubtype.minimumPressureBar : null : e.meanBaselinePressureBar : null;
}
function ma(e) {
	return e.details?.size?.massTerra ?? e.details?.gasGiant?.massTerra ?? null;
}
function ha(e, t) {
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
function ga(e, t, n, r) {
	let i = r.physical, a = i?.details?.rotation, o = ma(t);
	if (!i || !a || o === null) return r;
	let s = i.details?.gasGiant ? null : typeof r.sizeCode == "number" ? r.sizeCode : 0, c = Tr(ha(e, r), n, a, {
		sizeCode: s,
		atmospherePressureBar: pa(i.details?.atmosphere),
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
function _a(e, t) {
	let n = e.physical, r = n?.details?.rotation;
	if (!n || !r) return e;
	let i = t.find((t) => t.id === e.aroundStarId);
	if (!i) return e;
	let a = n.details?.satellites, o = a && {
		...a,
		moons: a.moons.map((t) => ga(e, n, i, t))
	}, s = Tr(e, i, r, {
		sizeCode: n.sizeCode,
		atmospherePressureBar: pa(n.details?.atmosphere),
		orbitalPeriodYears: n.orbitalPeriodYears,
		satellites: o?.moons ?? null,
		starCount: 1,
		totalStarMassSolar: i.massSolar
	});
	return {
		...e,
		eccentricity: s.adjustedEccentricity ?? e.eccentricity,
		physical: {
			...n,
			details: n.details ? {
				...n.details,
				rotation: s,
				satellites: o
			} : n.details
		}
	};
}
function va(e, t) {
	return fa(ea(Gi(Oi(Si(di(qr(Pr(e.map((e) => _a(e, t)), t), t), t))), t), t), t);
}
//#endregion
//#region src/rules/worlds/wbhAtmosphereGasMix.ts
var ya = {
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
}, ba = {
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
}, xa = {
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
}, Sa = {
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
}, Ca = {
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
}, wa = {
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
}, Ta = {
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
}, Ea = {
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
function Da(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Oa(e, t, n, r) {
	return new x(Da([
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
function ka(e) {
	return e >= 453 ? {
		table: ba,
		label: "Boiling 453K+",
		minimum: -2,
		maximum: 13
	} : e >= 353 ? {
		table: xa,
		label: "Boiling 353-453K",
		minimum: 1,
		maximum: 13
	} : e >= 303 ? {
		table: Sa,
		label: "Hot 303-353K",
		minimum: 1,
		maximum: 13
	} : e >= 273 ? {
		table: Ca,
		label: "Temperate 273-303K",
		minimum: 1,
		maximum: 13
	} : e >= 223 ? {
		table: wa,
		label: "Cold 223-273K",
		minimum: 1,
		maximum: 13
	} : e >= 123 ? {
		table: Ta,
		label: "Frozen 123-223K",
		minimum: 1,
		maximum: 13
	} : {
		table: Ea,
		label: "Frozen below 123K",
		minimum: 1,
		maximum: 13
	};
}
function Aa(e, t) {
	let n = 0;
	return t >= 453 ? (t > 2e3 ? n -= 5 : t >= 700 && (n -= 2), e >= 1 && e <= 7 && --n) : t >= 223 ? e >= 1 && e <= 7 && --n : t >= 123 ? e >= 1 && e <= 7 && (n -= 2) : (t < 70 ? n += 5 : t <= 100 && (n += 3), e >= 1 && e <= 7 && (n -= 3)), e >= 10 && (n += 1), n;
}
function ja(e) {
	return e?.composition === "H2O";
}
function Ma(e, t, n) {
	return e !== "CO" || n > 900 ? e : ja(t) ? "CO2" : e;
}
function Na(e, t) {
	if (!e || e.diameterKm <= 0 || e.massTerra <= 0 || t <= 0) return null;
	let n = e.diameterKm / 12742;
	return k(1e3 * e.massTerra / (n * t), 3);
}
function Pa(e, t, n) {
	let r = ya[e] ?? {
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
function Fa(e, t) {
	let n = e.find((e) => e.code === t.code);
	n ? n.percentage = k(n.percentage + t.percentage, 1) : e.push(t);
}
function Ia(e) {
	let t = [...e].sort((e, t) => t.percentage - e.percentage).slice(0, 3);
	return t.length ? t.map((e) => `${e.code}-${Math.round(e.percentage).toString().padStart(2, "0")}`).join(":") : null;
}
function La(e, t, n, r, i, a, o) {
	if (![
		10,
		11,
		12
	].includes(r) || o === null) return null;
	let s = Oa(e, t, r, o), c = r, l = ka(o), u = Aa(n, o), d = Na(i, o), f = [], p = 0;
	for (let e = 0; e < 6 && p < 95; e += 1) {
		let e = s.roll(2, 6, u).total, t = Math.max(l.minimum, Math.min(l.maximum, e)), n = l.table[t][c], r = Ma(n, a, o), i = 100 - p, m = (s.d6() + 3) / 10;
		Fa(f, Pa(r, k(Math.min(i, i * m), 1), d)), p = k(f.reduce((e, t) => e + t.percentage, 0), 1);
	}
	let m = k(Math.max(0, 100 - p), 1), h = ["Gas identities use the WBH temperature/type quick-reference tables; percentages use the Handbook (1D+3)×10% alternative applied successively to the remaining atmosphere.", "WBH quick gas tables are intentionally inspirational and do not guarantee chemically stable combinations; generated values remain Referee-editable source truth."];
	return d !== null && h.push(`Long-term gas-retention threshold is ${d}; a component passes when its WBH escape value is lower than this threshold.`), f.some((e) => e.retainedLongTerm === !1) && h.push("One or more generated gases fail the >1 Gyr WBH retention test and therefore imply replenishment, artificial support, unusual youth, or Referee revision. They are not silently rerolled."), m > 0 && h.push(`${m}% remains unallocated as trace/other gases.`), t.ageGyr < 1 && h.push("World or system is younger than 1 Gyr; WBH permits the Referee to reduce gas escape values for young worlds, but this optional adjustment is not applied automatically."), {
		method: "WBH temperature/type quick table",
		temperatureBand: l.label,
		retentionThreshold: d,
		components: f.sort((e, t) => t.percentage - e.percentage),
		unallocatedPercent: m,
		profile: Ia(f),
		generationNotes: h
	};
}
//#endregion
//#region src/rules/worlds/wbhClimateDetails.ts
function Ra(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function za(e, t, n, r) {
	return new x(Ra([
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
function Ba(e) {
	return k(Math.max(.02, Math.min(.98, e)), 3);
}
function Va(e, t, n, r, i) {
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
	].includes(r) || r >= 16 ? a += (e.roll(2, 6).total - 2) * .05 : r === 13 && (a += e.roll(2, 6).total * .03), i >= 2 && i <= 5 ? a += (e.roll(2, 6).total - 2) * .02 : i >= 6 && (a += (e.roll(2, 6).total - 4) * .03), Ba(a);
}
function Ha(e, t, n) {
	if (t === 0) return {
		initial: 0,
		effective: 0
	};
	let r = n?.meanBaselinePressureBar ?? null;
	if (r === null) return {
		initial: null,
		effective: null
	};
	let i = k(.5 * Math.sqrt(Math.max(0, r)), 3), a = i;
	if (t >= 1 && t <= 9 || t === 13 || t === 14) a += e.roll(3, 6).total * .01;
	else if (t === 10 || t === 15) a *= Math.max(.5, e.d6() - 1);
	else if ([11, 12].includes(t) || t >= 16) {
		let t = e.d6();
		a *= t <= 5 ? t : e.roll(3, 6).total;
	}
	return {
		initial: i,
		effective: k(a, 3)
	};
}
function Ua(e) {
	return e < 222 ? "Frozen" : e < 273 ? "Cold" : e <= 303 ? "Temperate" : e <= 353 ? "Hot" : "Boiling";
}
function Wa(e, t, n, r, i, a, o) {
	let s = za(e, t, n, r), c = Va(s, e, i, n, r), l = Ha(s, n, a), u = Math.max(e.au, 1e-6), d = Math.max(t.luminositySolar, 0), f = null, p = null, m = null;
	if (l.effective !== null) {
		let e = d * (1 - c) * (1 + l.effective) / u ** 2;
		f = Math.max(3, Math.round(279 * Math.max(0, e) ** .25)), p = f - 273, m = Ua(f);
	}
	let h = i?.gravityG ?? 0, g = f !== null && h > 0 && n !== 0 ? k(8.5 * f / (h * 288), 3) : null, _ = f !== null && f > 303 && n >= 2 && n <= 15, v = [];
	return v.push("Mean temperature uses the WBH luminosity/albedo/greenhouse equation at mean baseline altitude."), v.push("This phase uses the immediate parent star luminosity. WBH combined luminosity for worlds orbiting multiple interior stars remains a later hierarchy-aware refinement."), l.effective === null && v.push("Mean temperature is unresolved because the atmosphere has no resolved mean pressure; no greenhouse factor is invented."), _ && v.push("WBH optional runaway-greenhouse check is eligible at mean temperature above 303K. It is not automatically applied because this optional rule can change the established Atmosphere and Hydrographics codes."), v.push("High/low temperature extremes are finalized later after rotation, axial tilt, tidal-lock state and post-lock eccentricity are known."), {
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
var Ga = 12742;
function Ka(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function qa(e, t) {
	return t.primaryStar ? t.primaryStar : e.orbitClass === "Primary" ? e : void 0;
}
function Ja(e, t, n, r = "wbh-gas-giant-v1") {
	let i = qa(t, n);
	return new x(Ka([
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
function Ya(e, t) {
	let n = 0, r = [];
	return e ? (e.spectralType === "BD" || e.spectralType === "M" && e.luminosityClass === "V" || e.luminosityClass === "VI") && (--n, r.push("WBH gas-giant category DM-1 applied for a brown dwarf, M-class V, or Class VI primary star.")) : r.push("System primary-star context was unavailable; the WBH primary-star gas-giant category DM was not inferred from the secondary star being orbited."), t !== void 0 && t < .1 ? (--n, r.push("WBH gas-giant category DM-1 applied because system spread is below 0.1.")) : t === void 0 && r.push("System spread was unavailable to the gas-giant sizing procedure; the WBH spread <0.1 DM could not be evaluated."), {
		dm: n,
		notes: r
	};
}
function Xa(e, t) {
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
function Za(e) {
	return e === "Small" ? "S" : e === "Medium" ? "M" : "L";
}
function Qa(e) {
	return {
		diameterTerra: e.die(3) + e.die(3),
		massTerra: 5 * (e.d6() + 1),
		adjusted: !1,
		notes: []
	};
}
function $a(e) {
	return {
		diameterTerra: e.d6() + 6,
		massTerra: 20 * e.roll(3, 6, -1).total,
		adjusted: !1,
		notes: ["WBH Medium row prints a 6–12 Terra-diameter range but specifies 1D+6; TSG follows the explicit formula, producing 7–12."]
	};
}
function eo(e) {
	let t = e.roll(2, 6, 6).total, n = e.die(3), r = e.roll(3, 6).total, i = n * 50 * (r + 4), a = i, o = !1, s = [];
	return i >= 3e3 && (a = 4e3 - e.roll(2, 6, -2).total * 200, o = !0, s.push(`WBH high-mass Large gas-giant rule replaced initial ${i} Terra masses with ${a}.`)), s.push("The WBH high-mass footnote is keyed to an initial mass of at least 3,000 Terra masses; TSG tests the computed initial mass rather than inferring the trigger only from the parenthetical 3D example."), {
		diameterTerra: t,
		massTerra: a,
		adjusted: o,
		notes: s
	};
}
function to(e, t) {
	return t === "Small" ? Qa(e) : t === "Medium" ? $a(e) : eo(e);
}
function no(e, n, r, i, a) {
	let o = Za(e);
	return {
		method: "WBH Gas Giant Sizing",
		category: e,
		categoryCode: o,
		categoryRoll: n,
		categoryDm: r,
		diameterTerra: i.diameterTerra,
		diameterKm: i.diameterTerra * Ga,
		massTerra: i.massTerra,
		massAdjustedByHighMassRule: i.adjusted,
		profile: `G${o}${t(i.diameterTerra)}`,
		generationNotes: a
	};
}
function ro(e, t, n = {}) {
	let r = qa(t, n), i = Ja(e, t, n), a = Ya(r, n.systemSpread), o = Xa(i, a.dm), s = to(i, o.category);
	return no(o.category, o.roll, a.dm, s, [
		...a.notes,
		...s.notes,
		"Gas-giant mass variance is optional in WBH and is not applied automatically."
	]);
}
function io(e, t, n, r, i = {}) {
	let a = Ja(e, t, i, `wbh-gas-giant-moon-${n.toLowerCase()}-v1`), o = to(a, n), s = 1;
	for (; o.diameterTerra >= r && s < 64;) o = to(a, n), s += 1;
	if (o.diameterTerra >= r) throw Error(`Unable to generate a ${n} gas-giant moon smaller than parent diameter ${r} Terra.`);
	return no(n, 0, 0, o, [
		...o.notes,
		`Gas-giant moon category ${n} was fixed by the WBH Gas Giant Special Moon Sizing table rather than a gas-giant category roll.`,
		`Moon diameter was constrained to be smaller than its parent gas giant (${r} Terra diameters); resolved after ${s} sizing attempt${s === 1 ? "" : "s"}.`,
		"Gas-giant mass variance is optional in WBH and is not applied automatically."
	]);
}
//#endregion
//#region src/rules/worlds/wbhHydrographicsDetails.ts
var ao = {
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
		effect: "Roughly 70-80% of body coverage is in major bodies."
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
}, oo = {
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
}, so = [
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
function co(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function lo(e, t, n) {
	return new x(co([
		"wbh-hydrographics-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		n
	].join("|")));
}
function uo(e, t, n) {
	return new x(co([
		"wbh-surface-features-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		n
	].join("|")));
}
function fo(e, t, n, r) {
	return new x(co([
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
function po(e, t, n) {
	return n <= 0 ? Math.max(0, -4 + e.d10ZeroToNine()) : n >= 10 ? t > 9 ? 100 : Math.min(100, 96 + e.d10ZeroToNine()) : n * 10 - 4 + e.d10ZeroToNine();
}
function mo(e, t) {
	return t >= 6 ? "ocean" : t <= 4 ? "land" : e.d6() <= 3 ? "ocean" : "land";
}
function ho(e) {
	let t = Math.max(0, Math.min(10, e.roll(2, 6, -2).total)), n = ao[t];
	return {
		code: t,
		description: n.description,
		effect: n.effect
	};
}
function go(e) {
	return e === "ocean" ? {
		majorBodyKind: "continents",
		minorBodyKind: "continents",
		smallBodyKind: "islands"
	} : {
		majorBodyKind: "oceans",
		minorBodyKind: "oceans",
		smallBodyKind: "seas"
	};
}
function _o(e) {
	return Number(e.toFixed(2));
}
function vo(e) {
	return (e.die(1e4) - 1) / 9999;
}
function yo(e, t, n, r, i) {
	if (t <= 0 || e <= 0) return [];
	let a = [], o = e;
	for (let e = 0; e < t; e += 1) {
		let s = t - e - 1;
		if (s === 0) {
			a.push(o);
			break;
		}
		let c = Math.max(n, r === null ? n : o - r * s), l = Math.min(r ?? o, o - n * s), u = l <= c ? c : c + (l - c) * vo(i);
		a.push(u), o -= u;
	}
	let s = a.map(_o), c = _o(e - s.reduce((e, t) => e + t, 0));
	return s.length && c !== 0 && (s[s.length - 1] = _o(s[s.length - 1] + c)), s;
}
function bo(e, t) {
	return t === 1 ? e : e === "sea" ? "seas" : `${e}s`;
}
function xo(e, t, n, r, i, a) {
	let o = uo(e, t, n), s = i === "ocean" ? Math.max(0, 100 - r) : Math.max(0, r), c = i === "ocean" ? "land" : "water", [l, u] = oo[a], d = s * (l === u ? l : l + (u - l) * vo(o));
	d > 0 && d < 5 && (d = 0);
	let f = Math.max(0, s - d), p = f * (f === 0 ? 0 : .15 + .2 * vo(o)), m = f - p;
	m > 0 && m < 1 && (p += m, m = 0);
	let h = Math.floor(d / 5), g = h <= 0 ? 0 : a >= 9 ? 1 : o.die(Math.min(h, 4) + 1) - 1 || 1, _ = Math.min(4.5, 1.5 + a * .25), v = m > 0 ? Math.ceil(m / 4.99) : 0, y = m > 0 ? Math.ceil(m / _) : 0, b = m >= 1 ? Math.max(1, v, y) : 0, x = p > 0 ? Math.max(1, Math.ceil(p / .8)) : 0, S = i === "ocean" ? "continent" : "ocean", ee = S, C = i === "ocean" ? "island" : "sea", te = yo(d, g, 5, null, o), ne = yo(m, b, 1, 4.99, o), re = yo(p, x, .01, .99, o), ie = [
		...te.map((e, t) => ({
			id: `${S}-major-${t + 1}`,
			classification: "major",
			kind: S,
			surfacePercent: e
		})),
		...ne.map((e, t) => ({
			id: `${ee}-minor-${t + 1}`,
			classification: "minor",
			kind: ee,
			surfacePercent: e
		})),
		...re.map((e, t) => ({
			id: `${C}-small-${t + 1}`,
			classification: "small",
			kind: C,
			surfacePercent: e
		}))
	];
	return {
		method: "WBH surface feature distribution",
		discreteFeatureCoveragePercent: _o(s),
		discreteFeatureType: c,
		majorCoveragePercent: _o(te.reduce((e, t) => e + t, 0)),
		minorCoveragePercent: _o(ne.reduce((e, t) => e + t, 0)),
		smallCoveragePercent: _o(re.reduce((e, t) => e + t, 0)),
		majorBodyCount: g,
		minorBodyCount: b,
		smallBodyCount: x,
		bodies: ie,
		generationPolicy: `WBH supplies the 2D-2 distribution class and map thresholds (major >=5%, minor >=1%, small <1%) but not an exact count formula. Traveller System Generator deterministically allocates the discrete ${c} coverage into ${g} major ${bo(S, g)}, ${b} minor ${bo(ee, b)}, and ${x} small ${bo(C, x)} while preserving those thresholds and the table's major-body coverage band.`
	};
}
function So(e, t) {
	let n = t.reduce((e, t) => e + t.relativeAbundance, 0), r = e.die(n);
	for (let e of t) if (r -= e.relativeAbundance, r <= 0) return e;
	return t[t.length - 1];
}
function Co(e, t, n, r, i) {
	let a = lo(e, t, i), o = po(a, n, i), s = mo(a, i), c = go(s), l = ho(a), u = xo(e, t, i, o, s, l.code), d = [u.generationPolicy], f = null;
	return i === 0 ? f = "None" : [
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
	].includes(r) ? f = "H2O" : d.push("Hydrographic liquid composition awaits the WBH mean-temperature result before selecting a viable exotic liquid."), {
		coveragePercent: o,
		foundation: s,
		...c,
		distribution: l,
		majorBodyMinimumSurfacePercent: 5,
		minorBodyMinimumSurfacePercent: 1,
		minorBodyMaximumSurfacePercent: 5,
		smallBodyMaximumSurfacePercent: 1,
		majorBodyCount: u.majorBodyCount,
		minorBodyCount: u.minorBodyCount,
		surfaceFeatures: u,
		composition: f,
		profile: `${i.toString(16).toUpperCase()}-D${l.code.toString(16).toUpperCase()}:${o}%:${u.majorBodyCount}M/${u.minorBodyCount}m/${u.smallBodyCount}s`,
		generationNotes: d
	};
}
function wo(e, t, n, r, i) {
	if (e.composition === "None" || e.composition === "H2O" || i === null) return e;
	let a = e.generationNotes.filter((e) => !e.includes("awaits the WBH mean-temperature result"));
	if (i > 1e3) return a.push("WBH notes that above 1000K the surface liquid may be magma (liquid rock)."), {
		...e,
		composition: "Magma",
		generationNotes: a
	};
	let o = so.filter((e) => i >= e.meltingPointK && i <= e.boilingPointK);
	if (o.length === 0) return a.push(`No WBH Possible Exotic Liquid spans the generated mean surface temperature of ${i}K at standard-pressure reference points; Referee determination required.`), {
		...e,
		composition: null,
		generationNotes: a
	};
	let s = So(fo(t, n, r, i), o);
	return a.push(`WBH temperature-qualified liquid candidates at ${i}K: ${o.map((e) => e.code).join(", ")}. Selection is weighted by the Handbook relative-abundance values.`), a.push("Melting/boiling reference points assume approximately standard atmospheric pressure; pressure-dependent phase chemistry remains outside the Handbook procedure."), {
		...e,
		composition: s.code,
		generationNotes: a
	};
}
//#endregion
//#region src/rules/worlds/wbhOrdinaryAtmosphereGasMix.ts
var To = /* @__PURE__ */ new Set([
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
function Eo(e, t, n) {
	return {
		name: e,
		code: t,
		percentage: k(n, 1),
		escapeValue: null,
		retainedLongTerm: null,
		taint: !1
	};
}
function Do(e, t) {
	if (!t || !To.has(e) || t.oxygenFraction === null) return null;
	let n = k(t.oxygenFraction * 100, 1), r = k(Math.max(0, 100 - n), 1), i = [];
	return r > 0 && i.push(Eo("Nitrogen", "N2", r)), n > 0 && i.push(Eo("Oxygen", "O2", n)), {
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
var Oo = 12742, ko = 11186, Ao = 8.5, jo = {
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
}, Mo = {
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
}, No = [
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
function Po(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Fo(e, t, n, r, i) {
	return new x(Po([
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
function Io(e, t) {
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
function Lo(e, t, n) {
	let r = n <= 4 ? -1 : n >= 10 ? 3 : +(n >= 6);
	return e.hzDeviation <= 0 ? r += 1 : r -= 1 + Math.floor(e.hzDeviation), t.ageGyr > 10 && --r, r;
}
function Ro(e, t, n, r) {
	let i = e.roll(2, 6, Lo(t, n, r)).total;
	return i <= -4 ? "Exotic Ice" : i <= 2 ? "Mostly Ice" : i <= 6 ? "Mostly Rock" : i <= 11 ? "Rock and Metal" : i <= 14 ? "Mostly Metal" : "Compressed Metal";
}
function zo(e, t) {
	return Mo[t][e.roll(2, 6).total - 2];
}
function Bo(e, t, n, r) {
	if (r <= 0) return null;
	let i = Io(e, r), a = Ro(e, t, n, r), o = zo(e, a), s = i / Oo, c = o * s, l = o * s ** 3;
	return {
		diameterKm: i,
		composition: a,
		densityTerra: o,
		gravityG: k(c, 3),
		massTerra: k(l, 3),
		escapeVelocityKps: k(Math.sqrt(l / s) * ko / 1e3, 3)
	};
}
function Vo(e) {
	return ((e.d6() - 1) * 5 + (e.d6() - 1)) / 30;
}
function Ho(e) {
	return e >= 2 && e <= 9 || e === 13 || e === 14;
}
function Uo(e, t) {
	let n = +(t.ageGyr > 4), r = (e.d6() + n) / 20 + e.roll(2, 6, -7).total / 100;
	return r <= 0 && (r = e.d6() * .01), k(Math.max(0, Math.min(.4, r)), 3);
}
function Wo(e) {
	return e === null ? "not-applicable" : e < .1 ? "low" : e > .5 ? "high" : "within-human-range";
}
function Go(e, t) {
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
function Ko(e, t, n) {
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
function qo(e, t) {
	let n = t === 4 ? -2 : t === 9 ? 2 : 0, r = e.roll(2, 6, n).total, i = No.find((e) => r <= e.max);
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
	let a = Go(e, i.code), o = Ko(e, i.code, a.code);
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
function Jo(e, t) {
	let n = t === "low" ? "L" : "H", r = Go(e, n), i = Ko(e, n, r.code);
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
function Yo(e, t, n) {
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
		r.push(Jo(e, n));
		let i = qo(e, t);
		return i.extra && (r.push(i.detail), qo(e, t).extra && r.push(qo(e, t).detail)), r.slice(0, 3);
	}
	let i = qo(e, t);
	if (r.push(i.detail), i.extra && r.length < 3) {
		let n = qo(e, t);
		r.push(n.detail), n.extra && r.length < 3 && r.push(qo(e, t).detail);
	}
	return r.slice(0, 3);
}
function j(e, t, n, r, i, a) {
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
function Xo(e, t, n = !1) {
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
function Zo(e, t, n) {
	let r = n >= 2 && n <= 4 ? -2 : 0;
	t.hzDeviation < -1 && (r -= 2), t.hzDeviation > 2 && (r += 2);
	let i = e.roll(2, 6, r).total;
	return i <= 2 ? j("2", "Very Thin, Irritant", !0, .1, .42, .32) : i === 3 ? j("3", "Very Thin", !1, .1, .42, .32) : i === 4 ? j("4", "Thin, Irritant", !0, .43, .7, .27) : i === 5 ? j("5", "Thin", !1, .43, .7, .27) : i === 6 ? j("6", "Standard", !1, .7, 1.49, .79) : i === 7 ? j("7", "Standard, Irritant", !0, .7, 1.49, .79) : i === 8 ? j("8", "Dense", !1, 1.5, 2.49, .99) : i === 9 ? j("9", "Dense, Irritant", !0, 1.5, 2.49, .99) : i === 10 || i === 13 ? j("A", "Very Dense", !1, 2.5, 10, 7.5) : i === 11 || i >= 14 ? j("B", "Very Dense, Irritant", !0, 2.5, 10, 7.5) : j("C", "Very Dense, Occasionally Corrosive", !1, 2.5, 10, 7.5);
}
function Qo(e, t, n, r) {
	let i = 0;
	n >= 2 && n <= 4 && (i -= 3), n >= 8 && (i += 2), t.hzDeviation < -1 && (i += 4), t.hzDeviation > 2 && (i -= 2), r === 12 && (i += 2);
	let a = e.roll(2, 6, i).total;
	return a <= 1 ? j("1", "Very Thin, Temperature 50K or less", !1, .1, .42, .32) : a === 2 ? j("2", "Very Thin, Irritant", !0, .1, .42, .32) : a === 3 ? j("3", "Very Thin", !1, .1, .42, .32) : a === 4 ? j("4", "Thin, Irritant", !0, .43, .7, .27) : a === 5 ? j("5", "Thin", !1, .43, .7, .27) : a === 6 ? j("6", "Standard", !1, .7, 1.49, .79) : a === 7 ? j("7", "Standard, Irritant", !0, .7, 1.49, .79) : a === 8 ? j("8", "Dense", !1, 1.5, 2.49, .99) : a === 9 ? j("9", "Dense, Irritant", !0, 1.5, 2.49, .99) : a === 10 ? j("A", "Very Dense", !1, 2.5, 10, 7.5) : a === 11 ? j("B", "Very Dense, Irritant", !0, 2.5, 10, 7.5) : a === 12 ? Xo("C", "Extremely Dense") : a === 13 ? Xo("D", "Extremely Dense, Temperature 500K+") : Xo("E", "Extremely Dense, Temperature 500K+, Irritant", !0);
}
function $o(e, t) {
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
function es(e, t, n) {
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
	}, $o(e, !0)] : [$o(e, r)];
}
function ts(e, t, n, r, i, a) {
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
function ns(e, t, n, r) {
	if (e !== 13 || t === null || n === null || r === null) return null;
	let i = Math.max(n / 2, r / .5);
	return i <= 1 ? 0 : k(Math.log(i) * t, 3);
}
function rs(e, t, n, r) {
	if (e !== 14 || t === null || n === null || r === null || r <= 0) return null;
	if (r >= .1) return 0;
	let i = .1 / r;
	return n * i > 2 ? null : k(Math.log(i) * t, 3);
}
function is(e, t, n, r, i, a) {
	let o = jo[r] ?? { classification: `Atmosphere ${r}` }, s = null;
	r === 10 ? s = Zo(e, t, i) : (r === 11 || r === 12) && (s = Qo(e, t, i, r));
	let c = s ? {
		minimumBar: s.pressureRangeBar?.minimumBar,
		maximumBar: s.pressureRangeBar?.maximumBar,
		spanBar: s.pressureSpanBar
	} : o, l = c.minimumBar !== void 0 && c.maximumBar !== void 0 ? {
		minimumBar: c.minimumBar,
		maximumBar: c.maximumBar
	} : null, u = null;
	r === 0 ? u = 0 : c.minimumBar !== void 0 && c.spanBar !== void 0 && c.spanBar !== null && (u = k(c.minimumBar + c.spanBar * Vo(e), 3));
	let d = null, f = null, p = null, m = null;
	Ho(r) && u !== null && (d = Uo(e, n), f = k(u * d, 3), p = k(u - f, 3), a && a.gravityG > 0 && (m = k(Ao / a.gravityG, 3)));
	let h = Wo(f), g = Yo(e, r, h);
	s?.irritant && g.push(qo(e, r).detail);
	let _ = es(e, r, s), v = [];
	return [
		5,
		6,
		8
	].includes(r) && h !== "within-human-range" && v.push("WBH Referee choice required: nominally breathable atmosphere has oxygen partial pressure outside 0.1-0.5 bar; preserve established Atmosphere code until reviewed."), Ho(r) && v.push("Scale height currently uses the WBH temperate baseline 8.5 km / gravity; apply Kelvin temperature refinement when detailed mean temperature is implemented."), r === 10 && v.push("Exotic subtype and pressure are generated; detailed gas composition is deferred until gas-retention/temperature-aware composition is implemented."), (r === 11 || r === 12) && (v.push("Corrosive/Insidious subtype and applicable hazard are generated; detailed gas composition remains deferred until WBH temperature-aware gas-mix procedures are implemented."), v.push("WBH runaway-greenhouse subtype DM is not applied until runaway-greenhouse status is represented as structured source data."), s?.pressureUnbounded && v.push("WBH defines this subtype as 10+ bar with no upper bound; no mean pressure is invented before a bounded pressure procedure is available."), _.some((e) => e.code === "B") && v.push("Insidious biologic hazard implies Biomass Rating at least 1; enforce that constraint when WBH native-life generation is implemented."), _.some((e) => e.code === "R") && v.push("Insidious radioactivity hazard source is recorded; detailed radiation exposure values remain a later hazard-effect integration.")), r === 15 && v.push("Unusual atmosphere subtype remains deferred: WBH outcomes depend on prerequisite-specific conditions such as Panthalassic hydrographics and other world state; no subtype is invented here."), {
		classification: o.classification,
		pressureRangeBar: l,
		pressureSpanBar: c.spanBar ?? null,
		meanBaselinePressureBar: u,
		oxygenFraction: d,
		oxygenPartialPressureBar: f,
		nitrogenPartialPressureBar: p,
		scaleHeightKm: m,
		oxygenSafety: h,
		minimumSafeAltitudeKm: ns(r, m, p, f),
		safeAltitudeBelowMeanKm: rs(r, m, p, f),
		taints: g,
		hazards: _,
		specialSubtype: s,
		profile: ts(r, u, f, g, _, s),
		generationNotes: v
	};
}
function as(e, t, n, r, i) {
	let a = Fo(e, t, n, r, i), o = Bo(a, e, t, n);
	return {
		size: o,
		atmosphere: is(a, e, t, r, n, o)
	};
}
//#endregion
//#region src/rules/worlds/wbhPlanetoidBeltDetails.ts
function os(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function ss(e, t) {
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
function cs(e, t, n) {
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
function ls(e, n) {
	let r = new x(os(`wbh-planetoid-belt-prereq-v1|${e.id}|${e.orbitNumber}|${e.hzco}|${n.ageGyr}`)), i = e.orbitNumber < e.hzco ? -4 : e.orbitNumber > e.hzco + 2 ? 4 : 0, a = r.roll(2, 6).total + i, o = cs(ss(r, a), a, i), s = r.roll(2, 6).total + 2, c = -Math.floor(n.ageGyr / 2), l = Math.floor(o.carbonaceousPercent / 10), u = c + l, d = Math.max(1, s + u), f = r.roll(2, 6).total, p = Math.floor(o.metallicPercent / 10), m = -Math.ceil(o.carbonaceousPercent / 10), h = d + p + m, g = f - 7 + h, _ = Math.max(1, g);
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
var us = 8766;
function ds(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function fs(e, t, n, r) {
	return new x(ds([
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
function ps(e) {
	return (e.d6() - 1) * 10 + e.d10ZeroToNine();
}
function ms(e, t, n) {
	let r = Math.floor(Math.max(0, t) / 2), i = n ? 2 : 4, a = () => e.roll(2, 6, -2).total * i + 2 + e.d6() + r, o = a(), s = 0, c = 0;
	for (; o >= 40 && c < 16 && (c += 1, !(e.d6() < 5));) o += a(), s += 1;
	return {
		hours: o,
		additions: s
	};
}
function hs(e) {
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
		let a = ps(e), o = ps(e);
		n += a / 60 + o / 3600, i.push("WBH linear minute/second variance applied to an Extreme Axial Tilt result.");
	}
	for (; n > 180;) n = 360 - n;
	return {
		degrees: k(Math.max(0, Math.min(180, n)), 4),
		extreme: r,
		notes: i
	};
}
function gs(e, t, n) {
	let r = e / (n ? -t : t) - 1;
	return Math.abs(r) < 1e-9 ? {
		solarDaysPerYear: 0,
		solarDayHours: null,
		infinite: !0
	} : {
		solarDaysPerYear: k(r, 6),
		solarDayHours: k(Math.abs(e / r), 6),
		infinite: !1
	};
}
function _s(e, t, n) {
	let r = fs(e, t, n.isGasGiant ?? !1, n.sizeCode ?? null), i = (n.isGasGiant ?? !1) || n.sizeCode === 0, a = ms(r, t.ageGyr, i), o = ps(r), s = ps(r), c = k(a.hours + o / 60 + s / 3600, 6), l = hs(r), u = l.degrees > 90 ? "Retrograde" : "Prograde", d = gs(Math.max(0, n.orbitalPeriodYears) * us, c, u === "Retrograde"), f = [
		`WBH basic rotation uses ${i ? "×2" : "×4"} because this ${i ? "is a gas giant or Size 0/S body" : "is not a gas giant or Size 0/S body"}.`,
		`System age ${k(t.ageGyr, 3)} Gyr contributes DM+${Math.floor(Math.max(0, t.ageGyr) / 2)}.`,
		...a.additions > 0 ? [`WBH 40+ hour extension added ${a.additions} additional basic rotation determination(s).`] : [],
		...l.notes,
		"Axial tilt is provisional until WBH tidal-lock effects are evaluated."
	];
	return e.id.includes(".") && f.push("For this subordinate moon, the solar-day calculation uses the inherited parent-planet stellar year, following the WBH approximation."), d.infinite && f.push("Sidereal period equals the local year closely enough that the solar day is undefined/infinite."), {
		method: "WBH basic rotation and axial tilt",
		baseSiderealHours: k(a.hours, 6),
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
var vs = 149597870.9, ys = 3e-6, bs = 1.5;
function xs(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Ss(e, t, n, r) {
	return r ? new x(xs([
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
	].join("|"))) : new x(xs([
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
function Cs(e, t, n, r) {
	return new x(xs([
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
function ws(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Ts(e, t, n, r) {
	let i, a;
	r ? r.category === "Small" ? (i = 3, a = -7) : (i = 4, a = -6) : t <= 2 ? (i = 1, a = -5) : t <= 9 ? (i = 2, a = -8) : (i = 2, a = -6);
	let o = n < 1 ? -i : 0;
	return e.roll(i, 6, a + o).total;
}
function Es(e, t) {
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
function Ds(e, t) {
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
function Os(e, t) {
	let n = e.d6();
	if (n <= 3) return { sizeCode: "S" };
	if (n <= 5) {
		let t = e.die(3) - 1;
		return t === 0 ? "R" : { sizeCode: t };
	}
	return Ds(e, t);
}
function ks(e, t) {
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
	let r = ws(e.roll(2, 6, -7 + n).total, 0, 15), i = 0;
	return (r <= 1 || r >= 10) && (i -= 4), {
		numericSizeCode: n,
		atmosphereCode: r,
		hydrographicsCode: ws(e.roll(2, 6, -7 + r + i).total, 0, 10)
	};
}
function As(e, t, n) {
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
function js(e, t, n) {
	let r = n.massTerra * ys, i = Math.max(t.massSolar, 1e-6), a = e.au * (1 - e.eccentricity) * Math.cbrt(r / (3 * i)), o = a * vs / n.diameterKm;
	return {
		au: k(a, 6),
		pd: k(o, 3),
		moonLimitPd: k(o / 2, 3)
	};
}
function Ms(e, t) {
	let n = Math.max(0, Math.floor(e) - 2);
	return n <= 200 ? n : Math.min(n, 200 + t);
}
function Ns(e, t) {
	return t ? 6 : e === "Inner" ? -1 : e === "Middle" ? 1 : 4;
}
function Ps(e, t) {
	let n = e.d6() + +(t < 60), r, i;
	return n <= 3 ? (r = "Inner", i = e.roll(2, 6, -2).total * t / 60 + 2) : n <= 5 ? (r = "Middle", i = e.roll(2, 6, -2).total * t / 30 + t / 6 + 3) : (r = "Outer", i = e.roll(2, 6, -2).total * t / 20 + t / 2 + 4), {
		range: r,
		pd: k(Math.max(2, i), 2)
	};
}
function Fs(e, t) {
	let n = e.roll(2, 6, t).total, r;
	return r = n <= 5 ? -.001 + e.d6() / 1e3 : n <= 7 ? e.d6() / 200 : n <= 9 ? .03 + e.d6() / 100 : n === 10 ? .05 + e.d6() / 20 : n === 11 ? .05 + e.roll(2, 6).total / 20 : .3 + e.roll(2, 6).total / 20, k(Math.max(0, Math.min(.999, r)), 3);
}
function Is(e, t) {
	let n = [];
	for (let r = 0; r < t; r += 1) {
		let t = k(.4 + e.roll(2, 6).total / 8, 3), i = k(e.roll(3, 6).total / 100 + .07, 3);
		t - i / 2 < .55 && (i = k(Math.max(0, 2 * (t - .55)), 3));
		let a = n[n.length - 1];
		if (a) {
			let e = a.centrePd + a.spanPd / 2;
			t - i / 2 < e && (t = k(e + i / 2, 3));
		}
		n.push({
			designation: `R${String(r + 1).padStart(2, "0")}`,
			centrePd: t,
			spanPd: i
		});
	}
	return n;
}
function Ls(e, t) {
	return t <= 0 ? 0 : k(Math.sqrt(e ** 3 / t) / 361730, 3);
}
function Rs(e, t) {
	return t ? {
		diameterKm: t.diameterKm,
		massTerra: t.massTerra
	} : e ? {
		diameterKm: e.diameterKm,
		massTerra: e.massTerra
	} : null;
}
function zs(e, t, n, r, i, a, o) {
	let s = Rs(r, a);
	if (!s || !a && n <= 0) return null;
	let c = Ss(e, t, n, a), l = Ts(c, n, e.orbitNumber, a), u = +(l === 0), d = Math.max(0, l), f = js(e, t, s), p = ["WBH Hill sphere currently uses the immediate parent star mass supplied to the physical-world generator. Full multiple-interior-star mass aggregation remains a hierarchy-aware refinement.", "WBH companion/unavailability adjacency DMs for significant-moon quantity require broader system-slot context and are not yet applied in this per-world phase."];
	a && (p.push(`Gas-giant significant-moon quantity uses the WBH ${a.category === "Small" ? "3D-7" : "4D-6"} row for ${a.category} gas giants.`), p.push("Gas-giant moon sizing uses the WBH Gas Giant Special Moon Sizing table, including rare smaller gas-giant moons."));
	let m = d;
	f.moonLimitPd < bs && (d > 0 && f.moonLimitPd >= .55 && (u += 1), m = 0, p.push("Hill Sphere Moon Limit is below the Roche limit; significant moons are removed per WBH.")), f.moonLimitPd < .55 && (u = 0, p.push("Hill Sphere Moon Limit is below 0.55 PD; significant rings are also precluded."));
	let h = [];
	for (let e = 0; e < m; e += 1) if (a) {
		let e = Os(c, a);
		e === "R" ? u += 1 : h.push(e);
	} else {
		let e = Es(c, n);
		e === "R" ? u += 1 : h.push({ sizeCode: e });
	}
	let g = Ms(f.moonLimitPd, h.length), _ = h.map(() => Ps(c, g)).sort((e, t) => e.pd - t.pd);
	for (let e = 1; e < _.length; e += 1) _[e].pd <= _[e - 1].pd && (_[e].pd = k(_[e - 1].pd + 1, 2));
	let v = h.map((n, r) => {
		let l = String.fromCharCode(97 + r), u = _[r], d = u.pd > g, p = u.pd > f.moonLimitPd, m = Ns(u.range, d), h = Fs(c, m), v = m + (p ? 2 : 0), y = c.roll(2, 6, v).total >= 10, b = k(u.pd * s.diameterKm, 0), x = `${e.id}.${l}`, S, ee = As(e, l, h);
		if (n.gasGiantCategory && o && a) S = o(ee, n.gasGiantCategory, a.diameterTerra);
		else if (i) {
			let r = ks(Cs(e, t, l, n.sizeCode), n.sizeCode);
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
			periodHours: Ls(b, s.massTerra),
			beyondHillMoonLimit: p,
			sourceId: x,
			physical: S
		};
	}), y = Is(c, u);
	y.some((e) => e.centrePd + e.spanPd / 2 > bs) && p.push("At least one significant ring extends beyond the nominal 1.5 PD Roche limit; WBH permits the span to remain and later moon-gap handling can refine overlaps."), (i || o) && v.length > 0 && p.push("Significant moons include additive WBH physical profiles generated from dedicated moon sub-seeds; adding moon detail does not perturb established satellite geometry.");
	let b = v.map((e) => {
		let t = e.physical?.details?.gasGiant?.profile;
		return `${e.designation}:${t ?? e.sizeCode}@${e.orbitPd}PD`;
	}).join(","), x = y.length ? `R${String(y.length).padStart(2, "0")}:${y.map((e) => `${e.centrePd}-${e.spanPd}`).join(",")}` : "R00";
	return {
		method: "WBH significant moons and rings",
		hillSphereAu: f.au,
		hillSpherePd: f.pd,
		hillSphereMoonLimitPd: f.moonLimitPd,
		rocheLimitPd: bs,
		moonOrbitRangePd: g,
		moons: v,
		rings: y,
		profile: `${x}${b ? ` ${b}` : ""}`,
		generationNotes: p
	};
}
//#endregion
//#region src/rules/worlds/wbhUnusualAtmosphereDetails.ts
var Bs = {
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
function Vs(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Hs(e, t, n) {
	return new x(Vs([
		"wbh-unusual-atmosphere-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		n
	].join("|")));
}
function Us(e) {
	return e.die(2) * 10 + e.d6();
}
function Ws(e) {
	switch (Us(e)) {
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
function Gs(e, t, n) {
	return e === "6" ? (t?.gravityG ?? 0) > 1.2 : e === "7" ? n >= 10 : e !== "8" || n >= 5;
}
function Ks(e, t, n) {
	let r = Bs[e], i = [];
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
function qs(e, t, n, r = /* @__PURE__ */ new Set()) {
	for (let i = 0; i < 64; i += 1) {
		let i = Ws(e);
		if (i !== "COMBINATION" && !r.has(i) && Gs(i, t, n)) return i;
	}
	return "F";
}
function Js(e, t) {
	let n = /* @__PURE__ */ new Set([
		"1",
		"2",
		"3"
	]);
	return !!(n.has(e) && n.has(t) || e === "F" || t === "F");
}
function Ys(e, t, n) {
	let r = [];
	for (let i = 0; i < 64; i += 1) {
		let i = Ws(e);
		if (i === "COMBINATION") {
			let i = qs(e, t, n, /* @__PURE__ */ new Set(["F"])), a = qs(e, t, n, /* @__PURE__ */ new Set([i, "F"]));
			for (let r = 0; r < 32 && Js(i, a); r += 1) a = qs(e, t, n, /* @__PURE__ */ new Set([i, "F"]));
			return Js(i, a) ? (r.push("WBH Combination could not produce two compatible automated results; resolved as Other for Referee definition."), {
				codes: ["F"],
				combination: !1,
				notes: r
			}) : (r.push("WBH Combination result resolved as two independently rolled, prerequisite-valid, compatible subtypes."), {
				codes: [i, a],
				combination: !0,
				notes: r
			});
		}
		if (Gs(i, t, n)) return {
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
function Xs(e, t) {
	let n = t.filter((e) => e.minimumPressureBar !== null && e.maximumPressureBar !== null);
	if (n.length === 1) {
		let t = n[0].minimumPressureBar, r = n[0].maximumPressureBar, i = r - t, a = ((e.d6() - 1) * 5 + (e.d6() - 1)) / 30;
		return {
			pressureRangeBar: {
				minimumBar: t,
				maximumBar: r
			},
			pressureSpanBar: i,
			meanBaselinePressureBar: k(t + i * a, 3)
		};
	}
	return {
		pressureRangeBar: null,
		pressureSpanBar: null,
		meanBaselinePressureBar: null
	};
}
function Zs(e, t, n, r) {
	let i = Hs(e, t, r), a = Ys(i, n, r), o = a.codes.map((e) => Ks(e, n, r)), s = Xs(i, o), c = [...a.notes];
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
//#region src/rules/worlds/physicalWorld.ts
function Qs(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function $s(e) {
	return e <= -3 ? "Inner" : e < -.75 ? "Inferno" : e <= .75 ? "Habitable Zone" : e <= 3 ? "Outer" : "Frozen";
}
function ec(e, t, n) {
	let r = t >= 10 ? 1 : t >= 4 ? 0 : -1, i = n >= 6 ? -1 : 0, a = {
		Inner: 4,
		Inferno: 3,
		"Habitable Zone": 1,
		Outer: -1,
		Frozen: -3
	}[e] + r + i;
	return a >= 4 ? "Inferno" : a >= 2 ? "Hot" : a >= 0 ? "Temperate" : a >= -2 ? "Cold" : "Frozen";
}
function tc(e) {
	return e === "Inner" || e === "Inferno" ? "Hot" : e === "Frozen" ? "Frozen" : "Cold";
}
function nc(e, t) {
	return k(Math.sqrt(e ** 3 / Math.max(t, .01)), 3);
}
function rc(e, t) {
	let n = e.roll(2, 6, -2).total;
	return (t === "Inner" || t === "Frozen") && --n, t === "Habitable Zone" && (n += 1), Qs(n, 0, 15);
}
function ic(e, t, n) {
	if (t === 0) return 0;
	let r = e.roll(2, 6, -7 + t).total;
	return (n === "Inner" || n === "Inferno") && (r += 1), n === "Frozen" && (r -= 2), Qs(r, 0, 15);
}
function ac(e, t, n, r) {
	if (t <= 1 || n <= 1) return 0;
	let i = e.roll(2, 6, -7 + t).total;
	return (r === "Inner" || r === "Inferno") && (i -= 4), r === "Outer" && --i, r === "Frozen" && (i -= 3), [
		10,
		11,
		12
	].includes(n) && (i -= 2), Qs(i, 0, 10);
}
function oc(e, t, n, r, i, a = !0) {
	let o = as(e, t, n, r, i), s = Co(e, t, n, r, i), c = o.atmosphere;
	if (r === 15 && o.atmosphere) {
		let n = Zs(e, t, o.size, i);
		c = {
			...o.atmosphere,
			pressureRangeBar: n.pressureRangeBar,
			pressureSpanBar: n.pressureSpanBar,
			meanBaselinePressureBar: n.meanBaselinePressureBar,
			unusual: n.detail,
			generationNotes: [...o.atmosphere.generationNotes.filter((e) => !e.startsWith("Unusual atmosphere subtype remains deferred")), ...n.detail.generationNotes]
		};
	}
	let l = Wa(e, t, r, i, o.size, c, s), u = wo(s, e, t, r, l.meanTemperatureK), d = La(e, t, n, r, o.size, u, l.meanTemperatureK) ?? Do(r, c), f = c && {
		...c,
		gasMix: d
	}, p = _s(e, t, {
		sizeCode: n,
		orbitalPeriodYears: nc(e.au, t.massSolar)
	}), m = a ? zs(e, t, n, o.size, (e, n, r, i) => fc(e, t, n, r, i, !1, "Physical profile generated for a WBH significant moon.")) : null;
	return {
		...o,
		atmosphere: f,
		hydrographics: u,
		climate: l,
		rotation: p,
		satellites: m
	};
}
function sc(e, t, n, r, i) {
	let a = $s(e.hzDeviation), o = nc(e.au, t.massSolar), s = io(e, t, n, r, i), c = _s(e, t, {
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
		temperatureBand: tc(a),
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
function cc(e, t, n, r, i) {
	e.roll(2, 6), e.roll(2, 6);
	let a = nc(t.au, n.massSolar), o = ro(t, n, i), s = _s(t, n, {
		isGasGiant: !0,
		sizeCode: null,
		orbitalPeriodYears: a
	}), c = zs(t, n, 0, null, (e, t, r, i) => fc(e, n, t, r, i, !1, "Physical profile generated for a WBH significant gas-giant moon."), o, (e, t, r) => sc(e, n, t, r, i));
	return {
		zone: r,
		sizeCode: null,
		atmosphereCode: null,
		hydrographicsCode: null,
		uwpPhysical: o.profile,
		temperatureBand: tc(r),
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
function lc(e, t, n) {
	return {
		zone: n,
		sizeCode: 0,
		atmosphereCode: 0,
		hydrographicsCode: 0,
		uwpPhysical: "000",
		temperatureBand: n === "Habitable Zone" ? "Temperate" : n,
		notes: "Planetoid belt; WBH composition, bulk and natural Resource Rating generated for system comparison.",
		orbitalPeriodYears: nc(e.au, t.massSolar),
		details: {
			size: null,
			atmosphere: null,
			planetoidBelt: ls(e, t)
		}
	};
}
function uc(e) {
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
function dc(e, n, r, i) {
	let a = rc(e, i), o = ic(e, a, i), s = ac(e, a, o, i);
	return {
		zone: i,
		sizeCode: a,
		atmosphereCode: o,
		hydrographicsCode: s,
		uwpPhysical: `${t(a)}${t(o)}${t(s)}`,
		temperatureBand: ec(i, o, s),
		notes: n.hzDeviation > 3 ? "Distant ice/rock world." : n.hzDeviation < -2 ? "Inner rocky world." : "Terrestrial world candidate.",
		orbitalPeriodYears: nc(n.au, r.massSolar),
		details: oc(n, r, a, o, s)
	};
}
function fc(e, n, r, i, a, o, s) {
	let c = $s(e.hzDeviation);
	return {
		zone: c,
		sizeCode: r,
		atmosphereCode: i,
		hydrographicsCode: a,
		uwpPhysical: `${t(r)}${t(i)}${t(a)}`,
		temperatureBand: ec(c, i, a),
		notes: s,
		orbitalPeriodYears: nc(e.au, n.massSolar),
		details: oc(e, n, r, i, a, o)
	};
}
function pc(e, t, n, r = {}) {
	let i = $s(t.hzDeviation), a, o = t.worldKind;
	return a = o === "Gas Giant" ? cc(e, t, n, i, r) : o === "Planetoid Belt" ? lc(t, n, i) : o === "Empty Orbit" ? uc(i) : dc(e, t, n, i), {
		...a,
		orbitalPeriodYears: nc(t.au, n.massSolar)
	};
}
function mc(e, t, n, r, i) {
	return fc(e, t, n, r, i, !0, "Physical profile imported from source UWP.");
}
//#endregion
//#region src/rules/worlds/wbhGovernmentType.ts
var hc = [
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
function gc(e) {
	return Math.max(0, Math.min(15, Math.trunc(e)));
}
function _c(e) {
	return hc[gc(e)] ?? "Unknown";
}
function vc(e, t) {
	if (t <= 0) return {
		method: "WBH government type",
		source: "generated",
		populationCode: 0,
		roll: null,
		modifier: null,
		unclampedTotal: 0,
		governmentCode: 0,
		governmentType: _c(0),
		generationNotes: ["Population 0 has Government 0."]
	};
	let n = t - 7, r = e.roll(2, 6).total, i = r + n, a = gc(i);
	return {
		method: "WBH government type",
		source: "generated",
		populationCode: t,
		roll: r,
		modifier: n,
		unclampedTotal: i,
		governmentCode: a,
		governmentType: _c(a),
		generationNotes: ["Government code = 2D - 7 + Population code, bounded to 0-F."]
	};
}
function yc(e, t) {
	let n = e <= 0 ? 0 : gc(t);
	return {
		method: "WBH government type",
		source: "imported",
		populationCode: e,
		roll: null,
		modifier: null,
		unclampedTotal: n,
		governmentCode: n,
		governmentType: _c(n),
		generationNotes: [e <= 0 ? "Population 0 forces Government 0." : "Government code preserved from the source UWP."]
	};
}
//#endregion
//#region src/rules/worlds/wbhBalkanisation.ts
function bc(e, t, n) {
	if (t <= 0 || n !== 7) return null;
	let r = e.die(3), i = r + 1, a = [];
	for (let n = 0; n < i; n += 1) {
		let r = vc(e, t);
		if (r.roll === null || r.modifier === null) throw Error("Balkanised inhabited factions require a Government roll.");
		a.push({
			id: `F${n + 1}`,
			governmentCode: r.governmentCode,
			governmentType: _c(r.governmentCode),
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
var xc = [
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
function Sc(e) {
	return e === "D" ? "Demos" : e === "S" ? "Single Council" : e === "R" ? "Ruler" : "Multiple Councils";
}
function Cc(e, t, n, r, i, a = 0, o = i, s = null) {
	return {
		functionCode: e,
		functionName: t,
		code: n,
		structure: Sc(n),
		method: r,
		roll: i,
		dm: a,
		total: o,
		sharedFromFunction: s
	};
}
function wc(e) {
	return e <= 3 ? "D" : e === 4 ? "S" : e === 5 || e === 6 ? "M" : e === 7 || e === 8 ? "R" : e === 9 ? "M" : e === 10 ? "S" : e === 11 ? "M" : "S";
}
function Tc(e, t, n, r = 0) {
	let i = e.roll(2, 6).total, a = i + r;
	return Cc(t, n, wc(a), "2D functional structure table", i, r, a);
}
function Ec(e, t, n, r, i) {
	let a = n !== "B" && n === r;
	if (t === 2 && (a || n === "B" && r === "L")) return Cc(r, i, "D", "fixed", null, 0, null);
	if (t === 8 || t === 9) return Cc(r, i, "M", "fixed", null, 0, null);
	if ([
		3,
		12,
		15
	].includes(t)) {
		let t = e.die(6);
		return Cc(r, i, t <= 4 ? "S" : "M", "1D council split", t);
	}
	if ([
		10,
		11,
		13,
		14
	].includes(t) && a) {
		let t = e.die(6);
		return Cc(r, i, t <= 5 ? "R" : "S", "1D authoritative ruler split", t);
	}
	if (n === "L" && r === "L") {
		let t = e.roll(2, 6).total;
		return Cc(r, i, t <= 3 ? "D" : t <= 8 ? "M" : "S", "2D legislative-authority table", t);
	}
	return Tc(e, r, i, [
		10,
		11,
		13,
		14
	].includes(t) ? 2 : 0);
}
function Dc(e, t, n, r) {
	let i = /* @__PURE__ */ new Map();
	if (r !== "B") {
		let a = xc.find((e) => e.code === r);
		if (a) {
			let o = Ec(e, t, r, a.code, a.name);
			if (i.set(o.functionCode, o), n === "U" && (o.code === "R" || o.code === "S")) {
				for (let e of xc) e.code !== o.functionCode && i.set(e.code, Cc(e.code, e.name, o.code, "unitary shared leadership", null, 0, null, o.functionCode));
				return {
					method: "WBH government functional structure",
					governmentCode: t,
					centralisationCode: n,
					authorityCode: r,
					functions: xc.map((e) => i.get(e.code))
				};
			}
		}
	}
	for (let n of xc) i.has(n.code) || i.set(n.code, Ec(e, t, r, n.code, n.name));
	return {
		method: "WBH government functional structure",
		governmentCode: t,
		centralisationCode: n,
		authorityCode: r,
		functions: xc.map((e) => i.get(e.code))
	};
}
//#endregion
//#region src/rules/worlds/wbhGovernmentProfile.ts
var Oc = [
	"L",
	"E",
	"J"
];
function kc(e, t) {
	let n = e.functions.find((e) => e.functionCode === t);
	if (!n) throw Error(`WBH government profile requires a ${t} functional structure.`);
	return n.code;
}
function Ac(e, n, r, i) {
	let a = t(e);
	if (r === "B") {
		let t = `${a}-${n}BB-${Oc.map((e) => `${e}${kc(i, e)}`).join("-")}`;
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
	let o = r, s = kc(i, o), c = `${a}-${n}${r}${s}`;
	return {
		method: "WBH government profile",
		governmentCode: e,
		centralisationCode: n,
		authorityCode: r,
		primaryStructureCode: s,
		profile: c,
		basicProfile: c,
		fullProfile: [c, ...Oc.filter((e) => e !== o).map((e) => `${e}${kc(i, e)}`)].join("-")
	};
}
//#endregion
//#region src/rules/worlds/wbhGovernmentAuthority.ts
function jc(e) {
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
function Mc(e) {
	return e === "C" ? -2 : e === "U" ? 2 : 0;
}
function Nc(e) {
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
function Pc(e, t, n) {
	let r = [], i = jc(t);
	i !== 0 && r.push({
		source: `Government ${t}`,
		dm: i
	});
	let a = Mc(n);
	a !== 0 && r.push({
		source: `${n} centralisation`,
		dm: a
	});
	let o = e.roll(2, 6).total, s = r.reduce((e, t) => e + t.dm, 0), c = o + s, l = Nc(c), u = Dc(e, t, n, l.code), d = Ac(t, n, l.code, u);
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
function Fc(e) {
	return e >= 2 && e <= 5 ? -1 : e === 6 || e >= 8 && e <= 11 ? 1 : e >= 12 ? 2 : 0;
}
function Ic(e) {
	return e >= 0 && e <= 3 ? -1 : e >= 7 && e <= 8 ? 1 : e === 9 ? 3 : 0;
}
function Lc(e) {
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
function Rc(e, t, n, r = !1) {
	let i = [], a = Fc(t);
	a !== 0 && i.push({
		source: `Government ${t}`,
		dm: a
	}), r && i.push({
		source: "Government 7 balkanised faction",
		dm: 1
	});
	let o = Ic(n);
	o !== 0 && i.push({
		source: `PCR ${n}`,
		dm: o
	});
	let s = e.roll(2, 6).total, c = i.reduce((e, t) => e + t.dm, 0), l = s + c, u = Lc(l), d = Pc(e, t, u.code);
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
var zc = 4, Bc = 64;
function Vc(e) {
	return e === 0 || e === 7 ? 1 : e >= 10 ? -1 : 0;
}
function Hc(e) {
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
function Uc(e) {
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
function Wc(e) {
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
function Gc(e, n, r) {
	return `${e}-${t(n)}-${r}`;
}
function Kc(e, t, n) {
	return `${e}+${t}=${n}`;
}
function qc(e, t, n) {
	if (t <= 0) return null;
	let r = e.die(3), i = Vc(n), a = r + i, o = Math.max(1, a);
	Math.max(0, o - 1);
	let s = [], c = !1, l = (e, t, n, r, i, a, o, l, u, d, f, p) => {
		if (s.length >= Bc) {
			c = !0;
			return;
		}
		s.push({
			id: e,
			parentId: t,
			depth: n,
			ruling: r,
			governmentCode: i,
			governmentType: _c(i),
			governmentRoll: a,
			governmentModifier: o,
			governmentUnclampedTotal: l,
			strengthRoll: u,
			strengthCode: d,
			strengthDescription: f,
			profile: Gc(e, i, d),
			spawnedByBalkanisation: p
		});
	};
	l("I", null, 0, !0, n, null, null, n, null, "G", "Official government", !1);
	let u = (n, r, i, a) => {
		if (s.length >= Bc) {
			c = !0;
			return;
		}
		let o = vc(e, t);
		if (o.roll === null || o.modifier === null) throw Error("WBH outside faction on an inhabited world requires a Government roll.");
		let d = e.roll(2, 6).total, f = Hc(d);
		if (l(n, r, i, !1, o.governmentCode, o.roll, o.modifier, o.unclampedTotal, d, f.code, f.description, a), o.governmentCode !== 7) return;
		if (i >= zc) {
			c = !0;
			return;
		}
		let p = e.die(3) + 1;
		for (let e = 1; e <= p; e += 1) u(`${n}.${Wc(e)}`, n, i + 1, !0);
	};
	for (let e = 2; e <= o; e += 1) u(Wc(e), null, 0, !1);
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
		let o = a.reduce((e, t) => e + t.dm, 0), c = e.die(6), l = c + o, u = Uc(l);
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
			profile: Kc(r.id, i.id, u.code)
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
			`Recursion is capped at depth ${zc} and ${Bc} total factions to prevent pathological infinite Government-7 chains.`,
			"Faction relationships roll 1D for every pair, with DM+1 for the ruling faction and DM-1 for matching Government codes."
		]
	};
}
//#endregion
//#region src/rules/worlds/wbhMajorCities.ts
function Jc(e) {
	return Math.max(0, Math.ceil(e));
}
function Yc(e, t, n, r) {
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
function Xc(e, t, n, r, i) {
	if (n === 0) {
		let t = e.d6(), n = Math.min(i / 100, (t + 2) * 1e4);
		return n < 100 && (n = Math.max(i / 10, t + 1)), {
			populationAllocationCase: 1,
			largestNonMajorCityPopulation: Jc(n),
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
		cities: Yc(r, [100], [[]], [null])
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
			cities: Yc(r, t, i, Array(n).fill(null))
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
		cities: Yc(r, h, d, u)
	};
}
function Zc(e, t) {
	let n = t.populationConcentration, r = t.urbanisation;
	if (t.populationCode <= 0 || !n || !r) return null;
	let i = t.populationCode, a = n.rating, o = r.totalUrbanPopulation, s = r.urbanisationPercent, c = [];
	if (a === 0) {
		c.push("WBH Major Cities Case 1: PCR 0 has no major cities.");
		let t = Xc(e, a, 0, 0, o);
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
		let t = Xc(e, a, 1, o, o);
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
		let n = Xc(e, a, t, o, o);
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
		let r = Xc(e, a, n, o, o);
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
	let f = e.d6(), p = Jc(a / (f + 7) * o), m = o > 0 ? p / o * 100 : 0, h = Xc(e, a, d, p, o);
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
var Qc = [
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
function $c(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function el(e) {
	let t = e.physical?.details?.rotation;
	return t?.tidalLockStatus === "1:1" && t.tidalLockCase === "planet-star";
}
function tl(e) {
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
function nl(e, t) {
	let n = [], r = e.physical?.sizeCode ?? 0, i = t.populationCode, a = t.governmentCode, o = t.techLevel, s = tl(e), c = new Set(t.tradeCodes), l = (e, t) => {
		n.push({
			source: e,
			dm: t
		});
	};
	return r === 1 ? l("Size 1", 2) : (r === 2 || r === 3) && l(`Size ${r}`, 1), el(e) && l("Twilight zone world", 2), s >= 8 ? l(`Minimum sustainable TL ${s}`, 3) : s >= 3 && l(`Minimum sustainable TL ${s}`, 1), i === 8 ? l("Population 8", -1) : i >= 9 && l(`Population ${i}`, -2), a === 7 && l("Government 7", -2), o <= 1 ? l(`Tech Level ${o}`, -2) : o <= 3 ? l(`Tech Level ${o}`, -1) : o <= 9 && l(`Tech Level ${o}`, 1), c.has("Ag") && l("Agricultural", -2), c.has("In") && l("Industrial", 1), c.has("Na") && l("Non-Agricultural", -1), c.has("Ri") && l("Rich", 1), n;
}
function rl(e, t, n) {
	if (n.populationCode <= 0) return null;
	let r = n.populationCode, i = +(r >= 9), a = [], o = null;
	if (r < 6) {
		if (o = e.d6(), o > r) return a.push("Population below 6 and the preliminary 1D roll exceeded the Population code: the entire population occupies one settlement area, so PCR is 9."), {
			method: "WBH population concentration rating",
			rating: 9,
			description: Qc[9],
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
	let s = e.d6(), c = nl(t, n), l = c.reduce((e, t) => e + t.dm, 0), u = s + l, d = $c(u, i, 9);
	return a.push(r >= 9 ? "Population 9+ sets the WBH minimum PCR to 1." : "WBH minimum PCR is 0 for Population below 9."), a.push("PCR is bounded to a maximum of 9."), {
		method: "WBH population concentration rating",
		rating: d,
		description: Qc[d],
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
function il(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function al(e) {
	return e.die(2);
}
function ol(e, t) {
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
		percentage: 22 + e.d6() * 2 + al(e),
		range: "25–36%"
	} : t === 6 ? {
		percentage: 34 + e.d6() * 2 + al(e),
		range: "37–48%"
	} : t === 7 ? {
		percentage: 46 + e.d6() * 2 + al(e),
		range: "49–60%"
	} : t === 8 ? {
		percentage: 58 + e.d6() * 2 + al(e),
		range: "61–72%"
	} : t === 9 ? {
		percentage: 70 + e.d6() * 2 + al(e),
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
function sl(e, t, n) {
	let r = [], i = (e, t) => {
		r.push({
			source: e,
			dm: t
		});
	}, a = tl(e), o = e.physical?.sizeCode ?? 0, s = t.populationCode, c = t.governmentCode, l = t.lawLevelCode, u = t.techLevel, d = new Set(t.tradeCodes);
	return n <= 2 ? i(`PCR ${n}`, -3 + n) : n >= 7 && i(`PCR ${n}`, -6 + n), a <= 3 && i(`Minimum sustainable TL ${a}`, -1), o === 0 && i("Size 0", 2), s === 8 ? i("Population 8", 1) : s === 9 ? i("Population 9", 2) : s >= 10 && i(`Population ${s}`, 4), c === 0 && i("Government 0", -2), l >= 9 && i(`Law Level ${l}`, 1), u <= 2 ? i(`Tech Level ${u}`, -2) : u === 3 ? i("Tech Level 3", -1) : u === 4 ? i("Tech Level 4", 1) : u <= 9 ? i(`Tech Level ${u}`, 2) : i(`Tech Level ${u}`, 1), d.has("Ag") && i("Agricultural", -2), d.has("Na") && i("Non-Agricultural", 2), r;
}
function cl(e, t) {
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
function ll(e, t, n) {
	if (n.populationCode <= 0 || !n.populationConcentration) return null;
	let r = n.populationConcentration.rating, i = sl(t, n, r), a = i.reduce((e, t) => e + t.dm, 0), o = e.roll(2, 6).total, s = o + a, c = ol(e, s), l = cl(e, n), u = l.minimums.length ? l.minimums.reduce((e, t) => t.percentage > e.percentage ? t : e) : null, d = l.maximums.length ? l.maximums.reduce((e, t) => t.percentage < e.percentage ? t : e) : null, f = c.percentage, p = null, m = null;
	u && f < u.percentage && (f = u.percentage, p = u), d && f > d.percentage && (!u || u.percentage <= d.percentage) && (f = d.percentage, m = d), f = il(f, 0, 100);
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
function ul(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function dl(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function M(e) {
	return t(ul(e, 0, 33));
}
function fl(e) {
	return e >= 11 ? "A" : e >= 9 ? "B" : e >= 7 ? "C" : e >= 5 ? "D" : e >= 3 ? "E" : "X";
}
function pl(e) {
	let t = e.physical, n = 0;
	return t?.zone === "Habitable Zone" && (n += 1), t?.temperatureBand === "Temperate" && (n += 1), e.worldKind === "Planetoid Belt" && --n, e.worldKind === "Gas Giant" && (n -= 3), n;
}
function ml(e) {
	return e.physical?.details?.nativeLife?.currentNativeSophont === !0;
}
function hl(e, t) {
	return ml(e) ? {
		status: "native-sophont",
		basis: "Current native Sophonts establish an inhabited world."
	} : t?.origin === "transplanted" ? {
		status: "transplanted",
		basis: t.populationCode === null ? "Referee established a transplanted population; Population is generated with the ordinary WBH procedure." : `Referee established a transplanted population with Population code ${M(t.populationCode)}.`
	} : {
		status: "uninhabited",
		basis: e.isMainworld ? "Mainworld designation identifies the system reference world; it does not itself establish inhabitants." : "No native Sophonts or explicit transplanted population has been established for this body."
	};
}
function gl(e, t) {
	return e.isMainworld === !0 || ml(e) || t?.origin === "transplanted";
}
function _l(e) {
	for (let t = 0; t < 32; t += 1) {
		let t = ul(e.roll(2, 6, -2).total, 0, 10);
		if (t > 0) return t;
	}
	return 1;
}
function vl(e, t, n) {
	return t === "native-sophont" ? e.die(3) + e.die(3) + 4 : t === "transplanted" ? typeof n?.populationCode == "number" ? ul(Math.trunc(n.populationCode), 1, 10) : _l(e) : 0;
}
function yl(e, t) {
	if (t === 0) return 0;
	let n = e.die(3), r = e.die(3);
	return (n - 1) * 3 + r;
}
function bl(e, t, n = null) {
	if (e === 0 || t === 0) return 0;
	let r = t + (n === null ? 0 : n / 10);
	return Math.round(r * 10 ** e);
}
function xl(e, t, n, r, i) {
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
	let a = e.d10ZeroToNine(), o = bl(t, n, a), s = `${n}.${a}`, c = ["P value uses the WBH two-D3 procedure; one d10 supplies an additional significant digit."];
	return r === "native-sophont" && c.push("Population code uses the WBH native-sophont 2D3+4 option."), r === "transplanted" && c.push(typeof i?.populationCode == "number" ? "Population code was set explicitly by the Referee for this transplanted population." : "Population code uses ordinary WBH 2D-2 conditioned on an established non-zero transplanted population."), {
		method: "WBH population phase 1",
		populationCode: t,
		pValue: n,
		additionalSignificantDigit: a,
		estimatedPopulation: o,
		profilePrefix: `${M(t)}-${s}`,
		nativeSophontPopulationProcedure: r === "native-sophont" ? "2D3+4" : "none",
		generationNotes: c
	};
}
function Sl(e, t, n) {
	return n === 0 ? 0 : ul(e.roll(2, 6, -7 + t).total, 0, 18);
}
function Cl(e, t, n, r, i, a) {
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
function wl(e) {
	let t = e.physical?.sizeCode ?? 0, n = e.physical?.atmosphereCode ?? 0, r = e.physical?.hydrographicsCode ?? 0, i = e.physical?.details?.habitabilityRating?.rating, a = 0, o = [], s = (e, t) => {
		e > a && (a = e), o.push(`${t}: TL${e}`);
	};
	return [
		0,
		1,
		10
	].includes(n) ? s(8, `WBH Atmosphere ${M(n)}`) : [
		2,
		3,
		13,
		14
	].includes(n) ? s(5, `WBH Atmosphere ${M(n)}`) : [
		4,
		7,
		9
	].includes(n) ? s(3, `WBH Atmosphere ${M(n)}`) : n === 11 ? s(9, "WBH Atmosphere B") : n === 12 ? s(10, "WBH Atmosphere C") : n === 15 ? s(8, "WBH Atmosphere F conservative floor") : (n === 16 || n === 17) && s(14, `WBH Atmosphere ${M(n)}`), typeof i == "number" && (i === 0 ? s(8, "WBH Habitability 0") : i <= 2 ? s(5, `WBH Habitability ${i}`) : i <= 7 && s(3, `WBH Habitability ${i}`)), r === 0 && n >= 4 && s(4, "Existing dry-world survival floor"), t === 0 && s(8, "Existing Size 0 survival floor"), {
		minimum: a,
		basis: o
	};
}
function Tl(e, t, n, r, i, a) {
	if (r === 0) return 0;
	let o = n.physical, s = o?.sizeCode ?? 0, c = o?.atmosphereCode ?? 0, l = o?.hydrographicsCode ?? 0, u = e.die(6) + Cl(t, s, c, l, r, i);
	return ul(Math.max(u, a), 0, 15);
}
function N(e, t, n) {
	return e >= t && e <= n;
}
function El(e, t, n, r) {
	let i = e.populationCode, a = e.governmentCode, o = e.lawLevelCode, s = e.techLevel, c = [];
	return N(t, 4, 9) && N(n, 4, 8) && N(r, 5, 7) && c.push("Ag"), t === 0 && n === 0 && r === 0 && c.push("As"), i === 0 && a === 0 && o === 0 && c.push("Ba"), N(t, 2, 9) && r === 0 && c.push("De"), (N(n, 10, 12) || n >= 15) && r >= 1 && c.push("Fl"), N(t, 6, 8) && [
		5,
		6,
		8
	].includes(n) && N(r, 5, 7) && c.push("Ga"), i >= 9 && c.push("Hi"), s >= 12 && c.push("Ht"), (n === 0 || n === 1) && r >= 1 && c.push("Ic"), [
		0,
		1,
		2,
		4,
		7,
		9,
		10,
		11,
		12
	].includes(n) && i >= 9 && c.push("In"), i >= 1 && i <= 3 && c.push("Lo"), i >= 1 && s <= 5 && c.push("Lt"), N(n, 0, 3) && N(r, 0, 3) && i >= 6 && c.push("Na"), N(i, 4, 6) && c.push("Ni"), N(n, 2, 5) && N(r, 0, 3) && c.push("Po"), (n === 6 || n === 8) && N(i, 6, 8) && N(a, 4, 9) && c.push("Ri"), n === 0 && c.push("Va"), N(t, 2, 9) && r === 10 && c.push("Wa"), c;
}
function Dl(e) {
	let t = 0;
	return (e.starport === "A" || e.starport === "B") && (t += 1), (e.starport === "D" || e.starport === "E" || e.starport === "X") && --t, e.populationCode <= 6 && --t, e.populationCode >= 9 && (t += 1), e.techLevel <= 8 && --t, e.techLevel >= 10 && e.techLevel <= 15 && (t += 1), e.techLevel >= 16 && (t += 2), e.tradeCodes.includes("Ag") && (t += 1), e.tradeCodes.includes("In") && (t += 1), e.tradeCodes.includes("Ri") && (t += 1), t;
}
function Ol(e, t, n) {
	if (!t.physical || t.worldKind === "Empty Orbit" || t.worldKind === "Gas Giant" || !gl(t, n)) return;
	let r = hl(t, n), i = vl(e, r.status, n), a = yl(e, i), o = xl(e, i, a, r.status, n), s = o.estimatedPopulation, c = vc(e, i), l = c.governmentCode, u = Sl(e, l, i), d = i === 0 ? "X" : fl(e.roll(2, 6, pl(t)).total), f = i === 0 ? {
		minimum: 0,
		basis: []
	} : wl(t), p = Tl(e, d, t, i, l, f.minimum), m = t.physical.sizeCode ?? 0, h = t.physical.atmosphereCode ?? 0, g = t.physical.hydrographicsCode ?? 0, _ = {
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
	if (_.tradeCodes = El(_, m, h, g), _.importance = Dl(_), _.uwp = `${d}${t.physical.uwpPhysical}${M(i)}${M(l)}${M(u)}-${M(p)}`, _.populationConcentration = rl(new x(dl(`wbh-social-pcr-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), t, _), _.urbanisation = ll(new x(dl(`wbh-social-urbanisation-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), t, _), _.majorCities = Zc(new x(dl(`wbh-social-major-cities-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), _), _.balkanisation = bc(new x(dl(`wbh-social-balkanisation-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), i, l), i > 0) if (l === 7 && _.balkanisation) for (let e of _.balkanisation.factions) e.internalFactions = qc(new x(dl(`wbh-social-government-factions-v1|${t.id}|${_.uwp}|${e.id}`)), i, e.governmentCode);
	else _.governmentFactions = qc(new x(dl(`wbh-social-government-factions-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), i, l);
	let v = _.populationConcentration?.rating;
	if (i > 0 && typeof v == "number") if (l === 7 && _.balkanisation) for (let e of _.balkanisation.factions) e.centralisation = Rc(new x(dl(`wbh-social-centralisation-v1|${t.id}|${_.uwp}|${e.id}`)), e.governmentCode, v, !0);
	else l !== 0 && (_.governmentCentralisation = Rc(new x(dl(`wbh-social-centralisation-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), l, v, !1));
	return _;
}
function kl(e, t, n, r, i, a, o, s, c) {
	let l = yc(t, r), u = {
		starport: e,
		populationCode: t,
		populationMultiplier: n,
		populationTotal: bl(t, n),
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
	if (u.tradeCodes = El(u, o, s, c), u.importance = Dl(u), u.uwp = `${e}${M(o)}${M(s)}${M(c)}${M(t)}${M(u.governmentCode)}${M(i)}-${M(a)}`, u.balkanisation = bc(new x(dl(`wbh-social-balkanisation-v1|imported|${u.uwp}`)), t, u.governmentCode), t > 0) if (u.governmentCode === 7 && u.balkanisation) for (let e of u.balkanisation.factions) e.internalFactions = qc(new x(dl(`wbh-social-government-factions-v1|imported|${u.uwp}|${e.id}`)), t, e.governmentCode);
	else u.governmentFactions = qc(new x(dl(`wbh-social-government-factions-v1|imported|${u.uwp}`)), t, u.governmentCode);
	return u;
}
//#endregion
//#region src/rules/validation/systemValidation.ts
function P(e, t, n, r, i) {
	e.push({
		severity: t,
		scope: n,
		message: r,
		recommendation: i
	});
}
function Al(e, t) {
	if (t.worldKind === "Empty Orbit") return;
	let n = t.physical;
	if (!n) {
		P(e, "warning", t.id, "World has no physical profile.", "Regenerate the system or check the physical world generation step.");
		return;
	}
	let r = n.sizeCode ?? 0, i = n.atmosphereCode ?? 0, a = n.hydrographicsCode ?? 0, o = t.social;
	r === 0 && (i !== 0 || a !== 0) && P(e, "error", t.id, "Size 0 world has non-zero atmosphere or hydrographics.", "Set atmosphere and hydrographics to 0 for asteroid-size bodies."), i === 0 && a > 0 && n.temperatureBand !== "Frozen" && P(e, "warning", t.id, "Vacuum world has surface hydrographics outside a frozen environment.", "Treat water as ice, subsurface reservoirs, or reroll hydrographics."), a === 10 && ["Inferno", "Inner"].includes(n.zone) && P(e, "warning", t.id, "Very high hydrographics on a hot inner-zone world.", "Consider revising temperature, hydrographics, or atmosphere."), t.worldKind === "Gas Giant" && n.uwpPhysical !== "---" && P(e, "info", t.id, "Gas giant is excluded from UWP-style physical coding.", "This is expected for the current generator."), o && (o.populationCode === 0 && (o.governmentCode !== 0 || o.lawLevelCode !== 0 || o.starport !== "X") && P(e, "error", t.id, "Uninhabited world has government, law, or starport values that imply habitation.", "Set starport X and social codes 000."), o.populationCode > 0 && o.techLevel === 0 && P(e, "warning", t.id, "Inhabited world has TL 0.", "Confirm this is intentional for a primitive or collapsed society."), o.techLevel < 5 && (i <= 3 || i >= 10) && o.populationCode >= 6 && P(e, "warning", t.id, "Large population on a hostile-atmosphere world with low TL.", "Raise TL, reduce population, or explain outside support."), o.starport === "A" && o.populationCode <= 3 && P(e, "info", t.id, "Excellent starport with very low population.", "This may indicate a depot, research station, or external installation."), o.tradeCodes.includes("Ba") && o.populationCode !== 0 && P(e, "error", t.id, "Barren trade code conflicts with non-zero population.", "Recalculate trade codes."));
}
function jl(e) {
	let t = [], n = e.worlds.find((e) => e.isMainworld);
	n ? n.social?.uwp || P(t, "warning", "system", "Selected mainworld does not have a complete UWP.", "Generate or manually assign social characteristics.") : P(t, "error", "system", "No mainworld was selected.", "Choose the most habitable terrestrial world or belt as the mainworld."), e.worlds.filter((e) => e.isMainworld).length > 1 && P(t, "error", "system", "More than one world is marked as the mainworld.", "Keep exactly one mainworld flag."), e.stars.length === 0 && P(t, "error", "system", "System has no stars.", "Regenerate primary star data."), e.summary.totalWorlds !== e.worlds.filter((e) => e.worldKind !== "Empty Orbit").length && P(t, "warning", "system", "Summary world count does not match generated non-empty world rows.", "Check world placement and empty-orbit accounting.");
	for (let n of e.worlds) Al(t, n);
	return t.length === 0 && P(t, "info", "system", "No validation issues found."), t;
}
//#endregion
//#region src/rules/system/wbhMainworldDetermination.ts
function Ml(e) {
	return (e.physical?.details?.satellites?.moons ?? []).flatMap((t, n) => !t.physical || t.physical.details?.gasGiant ? [] : [{
		id: t.sourceId ?? `${e.id}.moon-${n + 1}`,
		parentId: e.id,
		kind: "Significant Moon",
		physical: t.physical,
		parentWorldKind: e.worldKind
	}]);
}
function Nl(e) {
	return e.flatMap((e) => {
		let t = Ml(e);
		return e.worldKind === "Empty Orbit" || e.worldKind === "Gas Giant" ? t : [{
			id: e.id,
			parentId: null,
			kind: e.worldKind,
			physical: e.physical,
			parentWorldKind: null
		}, ...t];
	});
}
function Pl(e) {
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
function Fl(e) {
	let t = e.physical?.details;
	return {
		id: e.id,
		parentId: e.parentId,
		kind: e.kind,
		habitabilityRating: t?.habitabilityRating?.rating ?? null,
		nativeSophontsPresent: t?.nativeLife?.currentNativeSophont === !0,
		resourceRating: t?.resourceRating?.rating ?? t?.planetoidBelt?.resourceRating.rating ?? null,
		refuelling: Pl(e)
	};
}
function Il(e) {
	let t = e.filter((e) => e !== null && Number.isFinite(e));
	return t.length ? Math.max(...t) : null;
}
function Ll(e, t) {
	return e.totalCriterionWins === t.totalCriterionWins ? (e.habitabilityRating ?? -1) === (t.habitabilityRating ?? -1) ? e.nativeSophontsPresent === t.nativeSophontsPresent ? (e.resourceRating ?? -1) === (t.resourceRating ?? -1) ? e.refuelling.rank === t.refuelling.rank ? e.id.localeCompare(t.id) : t.refuelling.rank - e.refuelling.rank : (t.resourceRating ?? -1) - (e.resourceRating ?? -1) : Number(t.nativeSophontsPresent) - Number(e.nativeSophontsPresent) : (t.habitabilityRating ?? -1) - (e.habitabilityRating ?? -1) : t.totalCriterionWins - e.totalCriterionWins;
}
function Rl(e) {
	let t = Nl(e).map(Fl), n = Il(t.map((e) => e.habitabilityRating)), r = Il(t.map((e) => e.resourceRating)), i = Math.max(0, ...t.map((e) => e.refuelling.rank)), a = t.map((e) => {
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
	}).sort(Ll), o = a[0]?.id ?? null;
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
function zl(e, t) {
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
function Bl(e, t) {
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
//#region src/rules/system/generateExpandedSystem.ts
function Vl(e) {
	return {
		...$n,
		...e,
		populationMode: e?.populationMode ?? "established"
	};
}
function Hl(e) {
	return [
		"O",
		"B",
		"A",
		"F"
	].includes(e.spectralType) ? 1 : e.spectralType === "M" || e.spectralType === "BD" || e.spectralType === "D" || [
		"Ia",
		"Ib",
		"II",
		"III"
	].includes(e.luminosityClass) ? -1 : 0;
}
function Ul(e, t) {
	return t === "Close" ? Math.max(.5, e.d6() - 1) + e.d10ZeroToNine() / 10 : t === "Near" ? e.d6() + 5 + e.d10ZeroToNine() / 10 : t === "Far" ? e.d6() + 11 + e.d10ZeroToNine() / 10 : e.d6() / 10 + e.roll(2, 6, -7).total / 100;
}
function Wl(e, t, n, r) {
	let i = [n], a = Hl(n);
	for (let o of [
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
	].slice(0, {
		basic: 1,
		standard: 3,
		deep: 4
	}[r.detailLevel])) if (!(o.orbitClass === "Close" && [
		"Ia",
		"Ib",
		"II",
		"III"
	].includes(n.luminosityClass)) && e.roll(2, 6, a).total >= 10) {
		let n = cr(e, `${t} ${o.designation}`, o.designation, !1, r);
		n.orbitClass = o.orbitClass, n.orbitNumber = k(Ul(e, o.orbitClass), 2), n.orbitAu = k(Wn(n.orbitNumber), 3), n.eccentricity = Kn(e, 2), i.push(n);
	}
	if (r.detailLevel !== "basic") {
		let n = [...i];
		for (let o of n) if (e.roll(2, 6, a - (r.detailLevel === "deep" ? 0 : 1)).total >= 10) {
			let n = `${o.designation}b`, a = cr(e, `${t} ${n}`, n, !1, r);
			a.orbitClass = "Companion", a.parentId = o.id, a.orbitNumber = k(Ul(e, "Companion"), 2), a.orbitAu = k(Wn(a.orbitNumber), 3), a.eccentricity = Kn(e, 2), i.push(a);
		}
	}
	return i;
}
function Gl(e) {
	let t = Math.max(.01, .01 * e.diameterSolar);
	return k(Math.max(-2, Gn(t)), 2);
}
function Kl(e) {
	return k(Gn(Math.sqrt(Math.max(e.luminositySolar, 1e-6))), 2);
}
function ql(e) {
	let t = [];
	for (let n of e) {
		if (n.orbitClass === "Companion" || n.orbitClass === "Primary" || n.orbitNumber === void 0) continue;
		let e = n.orbitClass === "Close" ? 1.5 : n.orbitClass === "Near" ? 2.5 : 3.5;
		t.push({
			source: n.designation,
			aroundStarId: "A",
			centerOrbitNumber: n.orbitNumber,
			inner: k(n.orbitNumber - e, 2),
			outer: k(n.orbitNumber + e, 2),
			reason: `${n.orbitClass} stellar companion clears or destabilises nearby planetary orbits.`
		});
	}
	return t;
}
function Jl(e, t, n) {
	return n.find((n) => n.aroundStarId === t && e >= n.inner && e <= n.outer);
}
function Yl(e, t) {
	let n = e.reduce((e, t) => e + Math.max(0, Math.floor(t.availableOrbitCount)), 0);
	if (n <= 0) return e.map((e) => ({
		...e,
		allocatedWorlds: 0
	}));
	let r = t;
	return e.map((i, a) => {
		let o = t * Math.max(0, Math.floor(i.availableOrbitCount)) / n, s;
		return s = a === e.length - 1 ? r : a === 0 ? Math.ceil(o) : Math.floor(o), r -= s, {
			...i,
			allocatedWorlds: Math.max(0, s)
		};
	});
}
function Xl(e, t) {
	return Math.max(1, Math.min(t, e.roll(2, 6).total));
}
function Zl(e, t, n) {
	let r = [], i = Math.abs(t.hzDeviation);
	n["Empty Orbit"] > 0 && r.push({
		kind: "Empty Orbit",
		weight: 1 + +(t.orbitNumber > 8)
	}), n["Gas Giant"] > 0 && r.push({
		kind: "Gas Giant",
		weight: t.hzDeviation > 1 ? 8 : t.hzDeviation > -.5 ? 3 : 1
	}), n["Planetoid Belt"] > 0 && r.push({
		kind: "Planetoid Belt",
		weight: i > 1.5 ? 4 : 2
	}), n["Terrestrial Planet"] > 0 && r.push({
		kind: "Terrestrial Planet",
		weight: i <= 1 ? 8 : t.hzDeviation < -1 ? 5 : 3
	});
	let a = r.reduce((e, t) => e + t.weight, 0);
	if (a <= 0 || r.length === 0) return "Empty Orbit";
	if (a === 1) {
		let e = r[0].kind;
		return n[e] = Math.max(0, n[e] - 1), e;
	}
	let o = e.die(a);
	for (let e of r) if (o -= e.weight, o <= 0) return n[e.kind] = Math.max(0, n[e.kind] - 1), e.kind;
	let s = r[0].kind;
	return n[s] = Math.max(0, n[s] - 1), s;
}
function Ql(e, t) {
	return t === "basic" ? +(e.roll(2, 6).total >= 11) : t === "deep" ? e.roll(2, 6).total >= 9 ? Math.max(0, e.d6() - 2) : 0 : e.roll(2, 6).total >= 10 ? Math.max(0, Math.min(3, e.d6() - 3)) : 0;
}
function $l(e, t, n, r, i) {
	let a = Math.max(1, n.totalWorlds), o = Ql(e, i.detailLevel), s = a + Math.max(0, o), c = Xl(e, a), l = t[0], u = l?.hzco ?? 4, d = l?.minimumAllowableOrbit ?? -2, f = k(Math.max(.1, (u - d) / c), 2), p = {
		"Empty Orbit": o,
		"Gas Giant": n.gasGiants,
		"Planetoid Belt": n.planetoidBelts,
		"Terrestrial Planet": n.terrestrialPlanets
	}, m = [];
	for (let n of t) {
		let t = 1, i = 0;
		for (; t <= n.allocatedWorlds && i < n.allocatedWorlds * 8 + 16;) {
			i += 1;
			let a = t - c, o = e.roll(2, 6, -7).total * .05 * f, s = k(Math.max(n.minimumAllowableOrbit, n.hzco + a * f + o), 2), l = Jl(s, n.star.id, r), u = [];
			if (l && (s = k(l.outer + .2 + e.d10ZeroToNine() / 20, 2), u.push(`Moved outward to avoid forbidden zone from ${l.source}.`)), s > n.outerLimit && (s = k(n.outerLimit - e.d10ZeroToNine() / 10, 2)), Jl(s, n.star.id, r)) continue;
			let d = k(Wn(s), 3), h = k(s - n.hzco, 2), g = Kn(e, s < 1 ? -1 : 0), _ = {
				orbitNumber: s,
				hzDeviation: h
			};
			m.push({
				id: `${n.star.designation}-${t}`,
				aroundStarId: n.star.id,
				aroundDesignation: n.star.designation,
				sequence: t,
				orbitNumber: s,
				au: d,
				eccentricity: g,
				hzco: n.hzco,
				hzDeviation: h,
				worldKind: Zl(e, _, p),
				generationNotes: u.length ? u : void 0
			}), t += 1;
		}
	}
	for (; m.length < s;) {
		let n = t[0], r = m.filter((e) => e.aroundStarId === n.star.id).length + 1, i = k(n.hzco + r * f, 2), a = k(i - n.hzco, 2);
		m.push({
			id: `${n.star.designation}-${r}`,
			aroundStarId: n.star.id,
			aroundDesignation: n.star.designation,
			sequence: r,
			orbitNumber: i,
			au: k(Wn(i), 3),
			eccentricity: Kn(e, 0),
			hzco: n.hzco,
			hzDeviation: a,
			worldKind: Zl(e, {
				orbitNumber: i,
				hzDeviation: a
			}, p),
			generationNotes: ["Fallback slot added to preserve generated world count."]
		});
	}
	return m.sort((e, t) => e.au - t.au), {
		worlds: m,
		emptyOrbits: o,
		baselineNumber: c,
		baselineOrbitNumber: u,
		spread: f
	};
}
function eu(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function tu(e, t, n) {
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
function nu(e, t, n = {}) {
	return t.map((t) => {
		let r = Ol(e, t, n[t.id]), i = t.physical?.details?.satellites, a = i && {
			...i,
			moons: i.moons.map((e, r) => {
				if (!e.physical || e.physical.details?.gasGiant) return e;
				let i = e.sourceId ?? `${t.id}.moon-${r + 1}`, a = new x(eu(`wbh-moon-social-v1|${t.id}|${e.sourceId ?? r}`));
				return {
					...e,
					social: Ol(a, tu(t, e, r), n[i])
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
function ru(e, t) {
	return e + Math.imul(t, 2654435761) >>> 0;
}
function iu(e, t, n, r) {
	let i = { ...r ?? {} };
	if (n.populationMode === "survey" || r !== void 0 || !t) return i;
	let a = Bl(e, t);
	return (a?.moon?.physical ?? a?.world?.physical)?.details?.nativeLife?.currentNativeSophont === !0 || (i[t] = {
		origin: "transplanted",
		populationCode: null
	}), i;
}
function au(e = {}) {
	let t = Vl(e.settings), n = e.seed ?? Date.now(), r = new x(ru(n, e.rerollIndex ?? 0)), i = e.name ?? "Uncharted System", a = cr(r, `${i} A`, "A", !0, t), o = Wl(r, i, a, t).sort((e, t) => (e.orbitAu ?? 0) - (t.orbitAu ?? 0)), s = dr(r, o.length), c = ql(o), l = o.filter((e) => e.orbitClass !== "Companion"), u = t.detailLevel === "deep" ? 4 : t.detailLevel === "basic" ? -2 : 0, d = $l(r, Yl(l.map((e) => {
		let t = Gl(e), n = Kl(e), r = e.orbitClass === "Primary" ? 18 + u : Math.max(2, (e.orbitNumber ?? 10) - 1), i = c.filter((t) => t.aroundStarId === e.id).sort((e, t) => e.inner - t.inner)[0], a = Math.max(t + 1, Math.min(r, i ? i.inner - .2 : r));
		return {
			star: e,
			minimumAllowableOrbit: t,
			hzco: n,
			availableOrbitCount: Math.max(0, a - t),
			outerLimit: a,
			allocatedWorlds: 0
		};
	}), s.totalWorlds), s, c, t), f = va(d.worlds.map((e) => {
		let t = o.find((t) => t.id === e.aroundStarId) ?? a;
		return {
			...e,
			physical: pc(r, e, t)
		};
	}), o), p = Rl(f), m = e.mainworldOverrideId, h = m && p.candidates.some((e) => e.id === m) ? {
		...p,
		selectedMainworldId: m,
		selectionSource: "referee-override",
		explanation: [...p.explanation, `Referee override selected ${m}.`]
	} : p, g = h.selectedMainworldId ?? void 0, _ = zl(f, h.selectedMainworldId), v = iu(_, g, t, e.habitationOverrides), y = nu(r, _, v), b = Bl(y, h.selectedMainworldId), S = b?.moon ? tu(b.world, b.moon, b.world.physical?.details?.satellites?.moons.indexOf(b.moon) ?? 0) : b?.world, ee = S?.social?.uwp ?? (S?.physical?.uwpPhysical ? `X${S.physical.uwpPhysical}000-0` : void 0), C = {
		schemaVersion: "traveller-system-generator/v9",
		id: `system-${n}-${e.rerollIndex ?? 0}-${i.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
		name: i,
		generationMethod: "expanded",
		generationSettings: t,
		habitationOverrides: v,
		primary: a,
		stars: o,
		worlds: y,
		summary: {
			...s,
			emptyOrbits: d.emptyOrbits,
			baselineNumber: d.baselineNumber,
			baselineOrbitNumber: d.baselineOrbitNumber,
			spread: d.spread,
			mainworldId: g,
			mainworldDetermination: h,
			preliminaryUwp: ee,
			tradeCodes: S?.social?.tradeCodes,
			importance: S?.social?.importance,
			forbiddenZones: c.map((e) => `${e.source}: orbit ${e.inner}-${e.outer}`)
		},
		refereeNotes: "",
		imageUrl: "",
		mapUrl: ""
	};
	return {
		...C,
		validation: jl(C)
	};
}
//#endregion
//#region src/rules/system/continuationUwp.ts
var ou = /^([ABCDEX])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])-([0-9A-HJ-NP-Z])$/i;
function su(e) {
	let t = e.trim().toUpperCase().replace(/\s+/g, "").match(ou);
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
function cu(e, t, n) {
	if (e <= 0 || t <= 0) return 0;
	let r = t + (n === null ? 0 : n / 10);
	return Math.round(r * 10 ** e);
}
function lu(e, t) {
	if (t <= 0) return 0;
	let n = e.die(3), r = e.die(3);
	return (n - 1) * 3 + r;
}
function uu(e, t) {
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
	let n = lu(e, t), r = e.d10ZeroToNine();
	return {
		method: "WBH population phase 1",
		populationCode: t,
		pValue: n,
		additionalSignificantDigit: r,
		estimatedPopulation: cu(t, n, r),
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
function du(e, t) {
	return e + Math.imul(t, 2246822507) >>> 0;
}
function fu(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function pu(e, t) {
	let n = e.primary, r = Math.round((e.worlds.find((e) => e.aroundStarId === n.id)?.hzco ?? 4) * 100) / 100, i = k(r + t.roll(2, 6, -7).total * .04, 2), a = k(Wn(i), 3);
	return {
		id: "A-MW",
		aroundStarId: n.id,
		aroundDesignation: n.designation,
		sequence: 0,
		orbitNumber: i,
		au: a,
		eccentricity: Kn(t, 0),
		hzco: r,
		hzDeviation: k(i - r, 2),
		worldKind: "Terrestrial Planet",
		isMainworld: !0
	};
}
function mu(e, t) {
	return e.isMainworld ? e : {
		...e,
		id: `${e.aroundDesignation}-${t + 1}`,
		sequence: t + 1
	};
}
function hu(e) {
	let t = su(e.sourceUwp), n = au(e), r = e.seed ?? Date.now(), i = pu(n, new x(du(r, (e.rerollIndex ?? 0) + 101))), a = mc(i, n.primary, t.size, t.atmosphere, t.hydrographics), o = uu(new x(fu(`wbh-continuation-population-v1|${r}|${e.rerollIndex ?? 0}|${t.normalized}`)), t.population), s = {
		...kl(t.starport, t.population, o.pValue, t.government, t.law, t.techLevel, t.size, t.atmosphere, t.hydrographics),
		populationMultiplier: o.pValue,
		populationTotal: o.estimatedPopulation,
		populationDetails: o
	}, c = n.worlds.filter((e) => !e.isMainworld).map((e) => ({
		...e,
		isMainworld: !1
	})).sort((e, t) => e.au - t.au).map(mu), l = va([{
		...i,
		physical: a,
		social: s
	}, ...c].sort((e, t) => e.au - t.au || (e.isMainworld ? -1 : 1)), n.stars).map((t) => {
		if (!t.isMainworld || !t.social) return t;
		let n = rl(new x(fu(`wbh-social-pcr-v1|${r}|${e.rerollIndex ?? 0}|${t.id}|${t.social.uwp}`)), t, t.social), i = {
			...t.social,
			populationConcentration: n
		}, a = ll(new x(fu(`wbh-social-urbanisation-v1|${r}|${e.rerollIndex ?? 0}|${t.id}|${t.social.uwp}`)), t, i), o = {
			...i,
			urbanisation: a
		}, s = new x(fu(`wbh-social-major-cities-v1|${r}|${e.rerollIndex ?? 0}|${t.id}|${t.social.uwp}`));
		return {
			...t,
			social: {
				...o,
				majorCities: Zc(s, o)
			}
		};
	}), u = (l.find((e) => e.isMainworld) ?? l[0])?.social ?? s, d = {
		...n,
		schemaVersion: "traveller-system-generator/v9",
		generationMethod: "continuation",
		sourceUwp: t.normalized,
		worlds: l,
		summary: {
			...n.summary,
			totalWorlds: l.filter((e) => e.worldKind !== "Empty Orbit").length,
			mainworldId: i.id,
			preliminaryUwp: u.uwp,
			tradeCodes: u.tradeCodes,
			importance: u.importance
		}
	};
	return {
		...d,
		id: `system-${e.seed ?? "date"}-${e.rerollIndex ?? 0}-${t.normalized.toLowerCase()}`,
		validation: jl(d)
	};
}
//#endregion
//#region src/rules/system/generateContinuationSystemWithLawLevels.ts
function gu(e) {
	return On($t(Ht(Bn(yn(ye(de(vt(Fe(Te(sn(Dt(Ge(et(hu(e)))))))))))))));
}
//#endregion
//#region src/rules/worlds/wbhSecondaryWorldPopulations.ts
function _u(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.min(33, Math.trunc(e)))] ?? String(e);
}
function vu(e) {
	let t = e.physical?.sizeCode ?? 0, n = e.physical?.atmosphereCode ?? 0, r = e.physical?.hydrographicsCode ?? 0, i = e.physical?.details?.habitabilityRating?.rating, a = 0, o = [], s = (e, t) => {
		e > a && (a = e), o.push(`${t}: TL${e}`);
	};
	return [
		0,
		1,
		10
	].includes(n) ? s(8, `WBH Atmosphere ${_u(n)}`) : [
		2,
		3,
		13,
		14
	].includes(n) ? s(5, `WBH Atmosphere ${_u(n)}`) : [
		4,
		7,
		9
	].includes(n) ? s(3, `WBH Atmosphere ${_u(n)}`) : n === 11 ? s(9, "WBH Atmosphere B") : n === 12 ? s(10, "WBH Atmosphere C") : n === 15 ? s(8, "WBH Atmosphere F conservative floor") : (n === 16 || n === 17) && s(14, `WBH Atmosphere ${_u(n)}`), typeof i == "number" && (i === 0 ? s(8, "WBH Habitability 0") : i <= 2 ? s(5, `WBH Habitability ${i}`) : i <= 7 && s(3, `WBH Habitability ${i}`)), r === 0 && n >= 4 && s(4, "Existing dry-world survival floor"), t === 0 && s(8, "Existing Size 0 survival floor"), {
		minimum: a,
		basis: o
	};
}
function yu(e, t, n) {
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
function bu(e, t, n) {
	return e !== null && e > 0 ? "existing-inhabited" : n <= 0 ? "population-ceiling-zero" : t ? "eligible" : "tech-infeasible";
}
function xu(e, t, n, r, i, a, o) {
	if (!e.physical || e.worldKind === "Empty Orbit" || e.worldKind === "Gas Giant" || e.isMainworld) return null;
	let s = vu(e), c = typeof e.social?.populationCode == "number" ? e.social.populationCode : null, l = e.physical.details?.nativeLife?.currentNativeSophont === !0, u = r >= s.minimum;
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
		status: bu(c, u, o)
	};
}
function Su(e, t, n) {
	let r = n?.social?.populationCode ?? 0;
	if (!n || r <= 0) return null;
	let i = n.social?.techLevel ?? 0, a = Math.max(0, r - 1), o = e.d6(), s = Math.max(0, r - o), c = Math.min(a, s), l = [];
	for (let e of t) {
		let t = xu(e, null, !1, i, a, s, c);
		t && l.push(t), (e.physical?.details?.satellites?.moons ?? []).forEach((t, n) => {
			if (!t.physical || t.physical.details?.gasGiant) return;
			let r = xu(yu(e, t, n), e.id, !0, i, a, s, c);
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
function Cu(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function wu(e, t, n) {
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
function Tu(e) {
	let t = e.summary.mainworldId;
	if (t) for (let n of e.worlds) {
		if (n.id === t) return n;
		let e = n.physical?.details?.satellites?.moons ?? [], r = e.findIndex((e, r) => (e.sourceId ?? `${n.id}.moon-${r + 1}`) === t);
		if (r >= 0) return wu(n, e[r], r);
	}
}
function Eu(e = {}) {
	let t = On($t(Ht(Bn(yn(ye(de(vt(Fe(Te(sn(Dt(Ge(et(au(e))))))))))))))), n = Tu(t), r = t.summary.mainworldId ?? "none", i = n?.social?.uwp ?? "none", a = Su(new x(Cu(`wbh-secondary-populations-v1|${t.id}|${r}|${i}`)), t.worlds, n);
	return {
		...t,
		secondaryPopulationPlan: a
	};
}
//#endregion
//#region src/rules/orbits/orbitalState.ts
var Du = "traveller-system-generator/orbital-state-v1", Ou = "tsg-system-epoch-v1", ku = 149597870.7, Au = 365.25 * 86400;
function ju(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Mu(e, t) {
	return ju(`tsg-orbital-state-v1|${e}|${t}`) / 4294967296 * 360;
}
function Nu(e) {
	return e.worlds.filter((e) => e.worldKind !== "Empty Orbit" && e.physical).map((t) => ({
		sourceId: t.id,
		objectKind: "world",
		parentSourceId: t.aroundStarId,
		parentKind: "star",
		semiMajorAxisAu: t.au,
		semiMajorAxisKm: t.au * ku,
		eccentricity: t.eccentricity,
		periodSeconds: t.physical.orbitalPeriodYears * Au,
		meanAnomalyAtEpochDegrees: Mu(e.id, t.id),
		direction: "Prograde"
	}));
}
function Pu(e, t, n) {
	return t.sourceId ?? `${e}.moon-${n + 1}`;
}
function Fu(e) {
	let t = [];
	for (let n of e.worlds) (n.physical?.details?.satellites?.moons ?? []).forEach((r, i) => {
		let a = Pu(n.id, r, i);
		t.push({
			sourceId: a,
			objectKind: "significant-moon",
			parentSourceId: n.id,
			parentKind: "world",
			semiMajorAxisAu: null,
			semiMajorAxisKm: r.orbitKm,
			eccentricity: r.eccentricity,
			periodSeconds: r.periodHours * 3600,
			meanAnomalyAtEpochDegrees: Mu(e.id, a),
			direction: r.direction
		});
	});
	return t;
}
function Iu(e) {
	return {
		schemaVersion: Du,
		sourceSystemId: e.id,
		epoch: {
			convention: Ou,
			epochSeconds: 0
		},
		objects: [...Nu(e), ...Fu(e)]
	};
}
//#endregion
//#region src/integrations/foundry/sensorSystemPayload.ts
function Lu(e) {
	let t = new Map(e.stars.map((e) => [e.id, e.designation]));
	return {
		schemaVersion: "traveller-system-generator/sensors-v2",
		sourceSystemId: e.id,
		mainworldDetermination: e.summary.mainworldDetermination,
		secondaryPopulationPlan: e.secondaryPopulationPlan ?? null,
		orbitalState: Iu(e),
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
var Ru = "traveller-system-generator";
function zu() {
	return {
		moduleId: Ru,
		generateSystem(e = {}) {
			return e.method === "continuation" ? gu(e) : Eu(e);
		},
		createTwodsixWorldActor(e) {
			let t = b(e), n = t.flags[Ru];
			return t.flags[Ru] = {
				...n && typeof n == "object" ? n : {},
				habitationOverrides: e.habitationOverrides ?? {},
				sensorSystem: Lu(e)
			}, t;
		}
	};
}
function Bu(e, t = zu()) {
	let n = e.get(Ru);
	if (!n) throw Error(`Foundry module ${Ru} is not registered.`);
	return n.api = t, t;
}
//#endregion
//#region src/integrations/foundry/lawInspectorRows.ts
function Vu(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function F(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Hu(e) {
	return Array.isArray(e) ? e : [];
}
function I(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${Vu(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${Vu(t ?? "—")}</span></div>`;
}
function Uu(e, t) {
	return `<details style="margin-top:0.55rem;padding:0.45rem;border:1px dashed var(--color-border-light-primary);border-radius:4px;"><summary style="cursor:pointer;font-weight:600;">${Vu(e)}</summary><div style="margin-top:0.4rem;">${t}</div></details>`;
}
function Wu(e) {
	return typeof e == "number" && Number.isFinite(e) ? `${e >= 0 ? "+" : ""}${e}` : "—";
}
function Gu(e) {
	let t = Hu(e).map((e) => String(e));
	return t.length ? `<div style="padding:0.35rem 0;"><strong>Notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${t.map((e) => `<li>${Vu(e)}</li>`).join("")}</ul></div>` : "";
}
function Ku(e, t) {
	if (!t) return I(e, "Unavailable");
	if (t.status !== "generated" || typeof t.lawLevel != "number") return [I(e, "Incomplete"), Uu(`${e} Calculation`, [
		I("Status", t.status ?? "incomplete"),
		I("Overall Law Level", t.overallLawLevel ?? "—"),
		Gu(t.generationNotes)
	].join(""))].join("");
	let n = Hu(t.dmBreakdown).map(F).filter((e) => !!e).map((e) => `${String(e.source ?? "Modifier")}: DM${Wu(e.dm)}`).join("; ");
	return [I(e, t.lawLevel), Uu(`${e} Calculation`, [
		I("Overall Law Level", t.overallLawLevel ?? "—"),
		I("2D3 roll", t.roll ?? "—"),
		I("2D3 - 4 variance", Wu(t.variance)),
		I("DM total", Wu(t.dmTotal)),
		n ? I("Modifiers", n) : "",
		I("Unclamped total", t.unclampedTotal ?? "—"),
		I("Final Law Level", t.lawLevel ?? "—"),
		Gu(t.generationNotes)
	].join(""))].join("");
}
function qu(e) {
	return e ? [
		I("Law Level Profile (O-WECPR)", e.profile ?? "Incomplete"),
		I("Profile status", e.status ?? "—"),
		I("Overall Law Level", e.overallLawLevel ?? "—"),
		I("Weapons & Armour", F(e.weaponsAndArmour)?.lawLevel ?? "Incomplete"),
		I("Economic", F(e.economic)?.lawLevel ?? "Incomplete"),
		I("Criminal", F(e.criminal)?.lawLevel ?? "Incomplete"),
		I("Private", F(e.privateLaw)?.lawLevel ?? "Incomplete"),
		I("Personal Rights", F(e.personalRights)?.lawLevel ?? "Incomplete"),
		Uu("Subclassifications", [
			Ku("Weapons & Armour", F(e.weaponsAndArmour)),
			Ku("Economic", F(e.economic)),
			Ku("Criminal", F(e.criminal)),
			Ku("Private", F(e.privateLaw)),
			Ku("Personal Rights", F(e.personalRights)),
			Gu(e.generationNotes)
		].join(""))
	].join("") : "<p class=\"hint\">No WBH Law Level subclassification result is stored.</p>";
}
function Ju(e) {
	return F(F(e)?.world);
}
function Yu(e, t) {
	for (let n of Hu(F(e)?.balkanisedFactions)) {
		let e = F(n);
		if (e?.factionId === t) return F(e.details);
	}
	return null;
}
function Xu(e) {
	if (!e) return "<p class=\"hint\">No WBH Law Level subclassification detail is stored for this body.</p>";
	let t = F(e.lawSubclassificationsDetails);
	if (!t) return "<p class=\"hint\">No WBH Law Level subclassification detail is stored for this body.</p>";
	if (e.governmentCode !== 7) return qu(Ju(t));
	let n = Hu(t.balkanisedFactions).flatMap((e) => {
		let t = F(e);
		return typeof t?.factionId == "string" ? [t.factionId] : [];
	});
	return n.length ? ["<p class=\"hint\">Government 7 has no single world-level Law Level Profile. Each represented sovereign faction is shown separately. Weapons & Armour may remain incomplete until faction-specific PCR is available.</p>", ...n.map((e) => `<div style="margin-top:0.65rem;padding:0.55rem;border:1px solid var(--color-border-light-primary);border-radius:5px;"><h4 style="margin:0 0 0.35rem;">${Vu(e)}</h4>${qu(Yu(t, e))}</div>`)].join("") : "<p class=\"hint\">Government 7 uses faction-specific Law Level subclassifications, but no represented sovereign-faction results are stored.</p>";
}
//#endregion
//#region src/integrations/foundry/justiceInspectorRows.ts
function Zu(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function L(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Qu(e) {
	return Array.isArray(e) ? e : [];
}
function R(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${Zu(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${Zu(t ?? "—")}</span></div>`;
}
function $u(e, t) {
	return `<details style="margin-top:0.55rem;padding:0.45rem;border:1px dashed var(--color-border-light-primary);border-radius:4px;"><summary style="cursor:pointer;font-weight:600;">${Zu(e)}</summary><div style="margin-top:0.4rem;">${t}</div></details>`;
}
function ed(e) {
	let t = Qu(e).map((e) => String(e));
	return t.length ? `<div style="padding:0.35rem 0;"><strong>Notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${t.map((e) => `<li>${Zu(e)}</li>`).join("")}</ul></div>` : "";
}
function td(e) {
	return typeof e == "number" && Number.isFinite(e) ? `${e >= 0 ? "+" : ""}${e}` : "—";
}
function nd(e) {
	if (!e) return "—";
	let t = e.code ?? "—", n = e.judicialSystem ?? "—";
	return `${String(t)} — ${String(n)}`;
}
function rd(e) {
	if (!e) return "<p class=\"hint\">No primary judicial-system result is stored.</p>";
	let t = L(e.secondarySystem), n = Qu(e.dmBreakdown).map(L).filter((e) => !!e).map((e) => `${String(e.source ?? "Modifier")}: DM${td(e.dm)}`).join("; "), r = [
		R("Status", e.status ?? "—"),
		R("2D roll", e.roll ?? "—"),
		R("DM total", td(e.dmTotal)),
		n ? R("Modifiers", n) : "",
		R("Final total", e.total ?? "—"),
		R("Government code", e.governmentCode ?? "—"),
		R("Law Level", e.lawLevelCode ?? "—"),
		R("Tech Level", e.techLevel ?? "—"),
		R("Judicial function authoritative", e.judicialAuthoritative === !0 ? "Yes" : e.judicialAuthoritative === !1 ? "No" : "Unknown"),
		ed(e.generationNotes)
	].join(""), i = t ? [
		R("Scope", t.scope ?? "economic and regulatory"),
		R("2D roll", t.roll ?? "Not required"),
		R("Law Level DM", td(t.lawLevelDm)),
		R("Final total", t.total ?? "—"),
		R("Changed from primary", t.changedFromPrimary === !0 ? "Yes" : "No"),
		ed(t.generationNotes)
	].join("") : "";
	return [
		R("Primary Judicial System", nd(e)),
		t ? R("Secondary Judicial System", nd(t)) : R("Secondary Judicial System", "—"),
		$u("Judicial System Calculation", r),
		t ? $u("Secondary System Calculation", i) : ""
	].join("");
}
function id(e) {
	return e ? [R("Law Uniformity", `${String(e.code ?? "—")} — ${String(e.uniformity ?? "—")}`), $u("Law Uniformity Calculation", [
		R("Centralisation", e.centralisationCode ?? "—"),
		R("Roll", e.roll ?? "Not required"),
		R("DM", td(e.dm)),
		R("Final total", e.total ?? "—"),
		ed(e.generationNotes)
	].join(""))].join("") : R("Law Uniformity", "Unavailable");
}
function ad(e) {
	return e ? [R("Presumption of Innocence", e.code === "Y" ? "Y — Yes" : e.code === "N" ? "N — No" : "Unavailable"), $u("Presumption Calculation", [
		R("Status", e.status ?? "—"),
		R("2D roll", e.roll ?? "—"),
		R("Law Level DM", td(e.lawLevelDm)),
		R("Adversarial DM", td(e.adversarialDm)),
		R("DM total", td(e.dmTotal)),
		R("Final total", e.total ?? "—"),
		ed(e.generationNotes)
	].join(""))].join("") : R("Presumption of Innocence", "Unavailable");
}
function od(e) {
	return e ? [R("Death Penalty", e.code === "Y" ? "Y — Yes" : e.code === "N" ? "N — No" : "Unavailable"), $u("Death Penalty Calculation", [
		R("2D roll", e.roll ?? "—"),
		R("Government DM", td(e.governmentDm)),
		R("Law Level DM", td(e.lawLevelDm)),
		R("DM total", td(e.dmTotal)),
		R("Final total", e.total ?? "—"),
		ed(e.generationNotes)
	].join(""))].join("") : R("Death Penalty", "Unavailable");
}
function sd(e) {
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
		ed(e.generationNotes)
	].join("");
}
function cd(e) {
	return L(L(e)?.world);
}
function ld(e, t) {
	for (let n of Qu(L(e)?.balkanisedFactions)) {
		let e = L(n);
		if (e?.factionId === t) return L(e.details);
	}
	return null;
}
function ud(e, t, n, r, i) {
	return [
		sd(e),
		rd(t),
		id(n),
		ad(r),
		od(i)
	].join("");
}
function dd(e) {
	if (!e) return "<p class=\"hint\">No WBH Law or Justice detail is stored for this body.</p>";
	let t = $u("Law Level Profile & Subclassifications", Xu(e)), n = L(e.justiceProfileDetails), r = L(e.judicialSystemDetails), i = L(e.lawUniformityDetails), a = L(e.presumptionOfInnocenceDetails), o = L(e.deathPenaltyDetails);
	if (!(n || r || i || a || o)) return t;
	if (e.governmentCode !== 7) return [t, $u("Justice Profile & Systems", ud(cd(n), cd(r), cd(i), cd(a), cd(o)))].join("");
	let s = /* @__PURE__ */ new Set();
	for (let e of [
		n,
		r,
		i,
		a,
		o
	]) for (let t of Qu(e?.balkanisedFactions)) {
		let e = L(t);
		typeof e?.factionId == "string" && s.add(e.factionId);
	}
	return s.size ? [t, $u("Justice Profile & Systems", ["<p class=\"hint\">Government 7 has no single world-level Justice Profile. Each represented sovereign faction is shown separately.</p>", ...Array.from(s).map((e) => `<div style="margin-top:0.65rem;padding:0.55rem;border:1px solid var(--color-border-light-primary);border-radius:5px;"><h4 style="margin:0 0 0.35rem;">${Zu(e)}</h4>${ud(ld(n, e), ld(r, e), ld(i, e), ld(a, e), ld(o, e))}</div>`)].join(""))].join("") : [t, "<p class=\"hint\">Government 7 uses faction-specific Justice results, but no represented sovereign-faction results are stored.</p>"].join("");
}
//#endregion
//#region src/integrations/foundry/localization.ts
var fd = {
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
}, pd = {
	localize(e) {
		return fd[e];
	},
	format(e, t) {
		return Object.entries(t).reduce((e, [t, n]) => e.replaceAll(`{${t}}`, String(n)), fd[e]);
	}
};
//#endregion
//#region src/integrations/foundry/generatorControl.ts
function md(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function hd(e, t) {
	return e.name.localeCompare(t.name, void 0, { sensitivity: "base" }) || e.id.localeCompare(t.id);
}
function gd(e) {
	e.style.width = "720px", e.style.maxWidth = "calc(100vw - 2rem)", e.style.boxSizing = "border-box";
	for (let t of e.querySelectorAll("select, input[type=\"text\"], input[type=\"number\"]")) t.style.maxWidth = "100%", t.style.minWidth = "0", t.style.boxSizing = "border-box";
}
function _d(e = Math.random) {
	return Math.floor(e() * 4294967296) >>> 0;
}
function vd(e) {
	let t = new Map(e.map((e) => [e.id, e])), n = /* @__PURE__ */ new Map();
	for (let r of e) {
		let e = r.parentId && r.parentId !== r.id && t.has(r.parentId) ? r.parentId : null, i = n.get(e) ?? [];
		i.push(r), n.set(e, i);
	}
	for (let e of n.values()) e.sort(hd);
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
	for (let t of [...e].sort(hd)) i.has(t.id) || a(t, 0, []);
	return r;
}
function yd(e, t, n = "") {
	let r = vd(e).map((e) => {
		let t = e.depth > 0 ? `${"\xA0\xA0".repeat(e.depth)}└─ ` : "", r = e.id === n ? " selected" : "";
		return `<option value="${md(e.id)}"${r}>${md(`${t}${e.path}`)}</option>`;
	});
	return [`<option value=""${n ? "" : " selected"}>${md(t.localize("TSG.Dialog.ActorFolderRoot"))}</option>`, ...r].join("");
}
function bd(e = 1105, t = [], n = pd, r = "") {
	let i = n.localize;
	return `
    <div class="form-group"><label>${i("TSG.Dialog.SystemName")}</label><input name="name" type="text" value="${md(i("TSG.Dialog.DefaultSystemName"))}" autofocus></div>
    <div class="form-group"><label>${i("TSG.Dialog.Seed")}</label><input name="seed" type="number" value="${md(String(e))}" step="1"></div>
    <div class="form-group"><label>${i("TSG.Dialog.Method")}</label><select name="method"><option value="expanded" selected>${i("TSG.Dialog.MethodExpanded")}</option><option value="continuation">${i("TSG.Dialog.MethodContinuation")}</option></select></div>
    <div class="form-group"><label>Expanded System Population</label><select name="populationMode"><option value="established" selected>Established / Settled</option><option value="survey">Survey / Unexplored</option></select><p class="hint">Established generates an ordinary WBH population for the selected mainworld. Survey leaves worlds uninhabited unless native Sophonts or Referee habitation are present.</p></div>
    <div class="form-group"><label>${i("TSG.Dialog.SourceUwp")}</label><input name="sourceUwp" type="text" value="A867A74-C" maxlength="9"><p class="hint">${i("TSG.Dialog.SourceUwpHint")}</p></div>
    <div class="form-group"><label>${i("TSG.Dialog.StarDistribution")}</label><select name="starDistribution"><option value="classic" selected>${i("TSG.Dialog.DistributionClassic")}</option><option value="realistic">${i("TSG.Dialog.DistributionRealistic")}</option></select></div>
    <div class="form-group"><label>${i("TSG.Dialog.DetailLevel")}</label><select name="detailLevel"><option value="basic">${i("TSG.Dialog.DetailBasic")}</option><option value="standard" selected>${i("TSG.Dialog.DetailStandard")}</option><option value="deep">${i("TSG.Dialog.DetailDeep")}</option></select></div>
    <div class="form-group"><label class="checkbox"><input name="allowUnusualPrimaries" type="checkbox" checked> ${i("TSG.Dialog.AllowUnusualPrimaries")}</label></div>
    <div class="form-group"><label>${i("TSG.Dialog.ActorFolder")}</label><select name="folder">${yd(t, n, r)}</select></div>
    <div class="form-group"><label class="checkbox"><input name="openSheet" type="checkbox" checked> ${i("TSG.Dialog.OpenSheet")}</label></div>`;
}
function xd(e, t = "") {
	return typeof e == "string" ? e : t;
}
function Sd(e, t) {
	let n = typeof e == "number" ? e : Number(e);
	return Number.isFinite(n) ? Math.trunc(n) : t;
}
function Cd(e, t = !1) {
	return typeof e == "boolean" ? e : typeof e == "string" ? e === "true" || e === "on" : t;
}
function wd(e) {
	let t = xd(e.name, "Uncharted System").trim() || "Uncharted System", n = Sd(e.seed, 1105), r = xd(e.method, "expanded"), i = {
		name: t,
		seed: n,
		settings: {
			starDistribution: xd(e.starDistribution, "classic") === "realistic" ? "realistic" : "classic",
			detailLevel: ["basic", "deep"].includes(xd(e.detailLevel)) ? xd(e.detailLevel) : "standard",
			allowUnusualPrimaries: Cd(e.allowUnusualPrimaries, !0),
			populationMode: xd(e.populationMode, "established") === "survey" ? "survey" : "established"
		}
	};
	return {
		request: r === "continuation" ? {
			...i,
			method: "continuation",
			sourceUwp: xd(e.sourceUwp, "A867A74-C").trim().toUpperCase()
		} : {
			...i,
			method: "expanded"
		},
		folder: xd(e.folder).trim() || null,
		openSheet: Cd(e.openSheet, !0)
	};
}
function Td(e) {
	return wd(e).request;
}
async function Ed(e, t) {
	let { localizer: n } = e;
	if (!e.isGameMaster() || !e.canCreateActor()) {
		e.notifyWarning(n.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	let r = e.listActorFolders(), i = e.defaultSystemFolderId?.() ?? "", a = await e.prompt({
		window: { title: n.localize("TSG.Dialog.Title") },
		content: bd(_d(), r, n, i),
		ok: { label: n.localize("TSG.Dialog.Generate") },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => gd(t.element)
	});
	if (a) try {
		let r = wd(a), i = t.generateSystem(r.request), o = t.createTwodsixWorldActor(i), s = o.flags && typeof o.flags == "object" ? o.flags : {};
		s["traveller-system-generator"] = {
			...s["traveller-system-generator"] && typeof s["traveller-system-generator"] == "object" ? s["traveller-system-generator"] : {},
			generationSeed: Number(r.request.seed ?? 1105)
		}, o.flags = s, r.folder && (o.folder = r.folder);
		let c = await e.createActor(o);
		r.openSheet && c.sheet?.render(!0), e.notifyInfo(n.format("TSG.Notification.Created", { name: String(c.name ?? o.name ?? i.name) }));
	} catch (t) {
		let r = t instanceof Error ? t.message : String(t);
		e.notifyError(n.format("TSG.Notification.Failed", { message: r }));
	}
}
//#endregion
//#region src/integrations/foundry/regenerateControl.ts
var Dd = "traveller-system-generator", Od = [
	"notes",
	"adventureHooks",
	"relatedActors",
	"worldImage"
];
function kd(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function Ad(e) {
	let t = e.flags?.[Dd];
	return t && typeof t == "object" ? t : null;
}
function jd(e) {
	return !!(e && e.type === "world" && Ad(e));
}
function Md(e) {
	return !!(e && e.type === "world" && !Ad(e));
}
function Nd(e, t, { adopting: n = !1 } = {}) {
	let r = Ad(e) ?? {}, i = r.generationSettings ?? {}, a = String(e.system.name ?? e.name.replace(/ System$/, "")), o = r.generationMethod ?? "expanded", s = r.sourceUwp ?? String(e.system.uwp ?? "A867A74-C"), c = r.generationSeed ?? (n ? _d() : 1105), l = i.starDistribution ?? "classic", u = i.detailLevel ?? "standard", d = i.allowUnusualPrimaries ?? !0, f = t.localize;
	return `
    <p class="hint">${kd(f(n ? "TSG.Dialog.AdoptHint" : "TSG.Dialog.RegenerateHint"))}</p>
    <div class="form-group"><label>${f("TSG.Dialog.SystemName")}</label><input name="name" type="text" value="${kd(a)}" autofocus></div>
    <div class="form-group"><label>${f("TSG.Dialog.Seed")}</label><input name="seed" type="number" value="${c}" step="1"></div>
    <div class="form-group"><label>${f("TSG.Dialog.Method")}</label><select name="method"><option value="expanded"${o === "expanded" ? " selected" : ""}>${f("TSG.Dialog.MethodExpanded")}</option><option value="continuation"${o === "continuation" ? " selected" : ""}>${f("TSG.Dialog.MethodContinuation")}</option></select></div>
    <div class="form-group"><label>${f("TSG.Dialog.SourceUwp")}</label><input name="sourceUwp" type="text" value="${kd(s)}" maxlength="9"><p class="hint">${f("TSG.Dialog.SourceUwpHint")}</p></div>
    <div class="form-group"><label>${f("TSG.Dialog.StarDistribution")}</label><select name="starDistribution"><option value="classic"${l === "classic" ? " selected" : ""}>${f("TSG.Dialog.DistributionClassic")}</option><option value="realistic"${l === "realistic" ? " selected" : ""}>${f("TSG.Dialog.DistributionRealistic")}</option></select></div>
    <div class="form-group"><label>${f("TSG.Dialog.DetailLevel")}</label><select name="detailLevel"><option value="basic"${u === "basic" ? " selected" : ""}>${f("TSG.Dialog.DetailBasic")}</option><option value="standard"${u === "standard" ? " selected" : ""}>${f("TSG.Dialog.DetailStandard")}</option><option value="deep"${u === "deep" ? " selected" : ""}>${f("TSG.Dialog.DetailDeep")}</option></select></div>
    <div class="form-group"><label class="checkbox"><input name="allowUnusualPrimaries" type="checkbox"${d ? " checked" : ""}> ${f("TSG.Dialog.AllowUnusualPrimaries")}</label></div>
    <div class="form-group"><label class="checkbox"><input name="openSheet" type="checkbox" checked> ${f("TSG.Dialog.OpenSheet")}</label></div>`;
}
function Pd(e, t) {
	return Nd(e, t);
}
function Fd(e, t) {
	return Nd(e, t, { adopting: !0 });
}
function Id(e, t, n) {
	let r = { ...t.system };
	for (let t of Od) e.system[t] !== void 0 && (r[t] = e.system[t]);
	let i = { ...t.flags }, a = Ad(e);
	return i[Dd] = {
		...i[Dd] ?? {},
		...a?.cityOverrides === void 0 ? {} : { cityOverrides: a.cityOverrides },
		...a?.secondaryGovernmentOverrides === void 0 ? {} : { secondaryGovernmentOverrides: a.secondaryGovernmentOverrides },
		generationSeed: n
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
async function Ld(e, t, n, r) {
	let i = Td(t), a = r.generateSystem(i), o = r.createTwodsixWorldActor(a);
	await e.update(Id(e, o, Number(i.seed ?? 1105))), t.openSheet !== !1 && e.sheet?.render(!0);
}
async function Rd(e, t) {
	let n = e.getSelectedActor();
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	if (!jd(n)) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.SelectGeneratedActor"));
		return;
	}
	let r = await e.prompt({
		window: { title: e.localizer.localize("TSG.Dialog.RegenerateTitle") },
		content: Pd(n, e.localizer),
		ok: { label: e.localizer.localize("TSG.Dialog.Regenerate") },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => gd(t.element)
	});
	if (r) try {
		await Ld(n, r, e, t), e.notifyInfo(e.localizer.format("TSG.Notification.Regenerated", { name: n.name }));
	} catch (t) {
		let n = t instanceof Error ? t.message : String(t);
		e.notifyError(e.localizer.format("TSG.Notification.Failed", { message: n }));
	}
}
async function zd(e, t) {
	let n = e.getSelectedActor();
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	if (!Md(n)) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.SelectUnmanagedActor"));
		return;
	}
	let r = await e.prompt({
		window: { title: e.localizer.localize("TSG.Dialog.AdoptTitle") },
		content: Fd(n, e.localizer),
		ok: { label: e.localizer.localize("TSG.Dialog.Adopt") },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => gd(t.element)
	});
	if (r) try {
		await Ld(n, r, e, t), e.notifyInfo(e.localizer.format("TSG.Notification.Adopted", { name: n.name }));
	} catch (t) {
		let n = t instanceof Error ? t.message : String(t);
		e.notifyError(e.localizer.format("TSG.Notification.Failed", { message: n }));
	}
}
//#endregion
//#region src/integrations/foundry/mainworldOverride.ts
var Bd = "traveller-system-generator";
function Vd(e) {
	let t = e.flags?.[Bd];
	return t && typeof t == "object" ? t : null;
}
function Hd(e, t) {
	let n = Vd(e);
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
async function Ud(e, t, n) {
	let r = Hd(e, t);
	if (!r) return !1;
	let i = n.generateSystem(r), a = n.createTwodsixWorldActor(i);
	return await e.update(Id(e, a, Number(r.seed))), e.sheet?.render(!0), !0;
}
//#endregion
//#region src/rules/worlds/wbhPopulationProfile.ts
function Wd(e, n, r, i) {
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
function Gd(e) {
	return Array.isArray(e) ? e : [];
}
function Kd(e) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.trunc(e)] ?? String(e);
}
function V(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${z(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${z(t ?? "—")}</span></div>`;
}
function qd(e, t) {
	return `<div style="margin-top:0.55rem;padding-top:0.35rem;"><h4 style="margin:0 0 0.25rem;">${z(e)}</h4>${t}</div>`;
}
function Jd(e) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : Math.trunc(e).toLocaleString("en-US");
}
function Yd(e) {
	return e === "native-sophont" ? "Inhabited — Native Sophonts" : e === "transplanted" ? "Inhabited — Transplanted / Colonial Population" : e === "uninhabited" ? "Uninhabited" : "—";
}
function Xd(e) {
	let t = B(e);
	if (!t) return String(e ?? "—");
	let n = String(t.source ?? "Unknown"), r = typeof t.dm == "number" ? t.dm : 0;
	return `${n}: DM${r >= 0 ? "+" : ""}${r}`;
}
function Zd(e) {
	let t = B(e);
	return t ? `${String(t.source ?? "Unknown")}: ${t.kind === "minimum" ? "minimum" : "maximum"} ${typeof t.percentage == "number" ? t.percentage : "—"}%` : String(e ?? "—");
}
function Qd(e, t = 1) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : `${e.toFixed(t).replace(/\.0$/, "")}%`;
}
function $d(e) {
	if (!e) return "<p class=\"hint\">No WBH functional-structure detail is stored.</p>";
	let t = Gd(e.functions).map((e) => B(e)).filter((e) => !!e);
	return t.length ? `<div style="padding:0.35rem 0;"><strong>Functional Structure</strong>${t.map((e) => {
		let t = e.roll === null || e.roll === void 0 ? "—" : String(e.roll), n = typeof e.dm == "number" && e.dm !== 0 ? ` DM${e.dm >= 0 ? "+" : ""}${e.dm}` : "", r = e.total === null || e.total === void 0 ? "" : ` = ${String(e.total)}`, i = e.sharedFromFunction ? ` — shared from ${String(e.sharedFromFunction)}` : "";
		return V(`${String(e.functionCode ?? "—")} — ${String(e.functionName ?? "Function")}`, `${String(e.code ?? "—")} — ${String(e.structure ?? "—")} — ${String(e.method ?? "—")} — roll ${t}${n}${r}${i}`);
	}).join("")}</div>` : "<p class=\"hint\">No WBH functional-structure branch records are stored.</p>";
}
function ef(e) {
	if (!e) return "<p class=\"hint\">No WBH authority detail is stored.</p>";
	let t = B(e.governmentProfile);
	return [
		V("Authority", `${String(e.code ?? "—")} — ${String(e.authoritativeFunction ?? "—")}`),
		V("Authority 2D roll", e.roll ?? "—"),
		V("Authority DM total", typeof e.dmTotal == "number" ? `${e.dmTotal >= 0 ? "+" : ""}${e.dmTotal}` : "—"),
		V("Authority final total", e.total ?? "—"),
		Array.isArray(e.dmBreakdown) && e.dmBreakdown.length ? `<div style="padding:0.35rem 0;"><strong>Authority modifiers</strong><ul style="margin:0.3rem 0 0 1.25rem;">${e.dmBreakdown.map((e) => `<li>${z(Xd(e))}</li>`).join("")}</ul></div>` : "",
		$d(B(e.functionalStructure)),
		t ? V("Government Profile", t.profile ?? "—") : "",
		t && t.fullProfile !== t.profile ? V("Expanded Government Profile", t.fullProfile ?? "—") : ""
	].join("");
}
function tf(e) {
	if (!e) return "<p class=\"hint\">No WBH internal-faction detail is stored for this effective government.</p>";
	let t = Gd(e.factions).map((e) => B(e)).filter((e) => !!e), n = Gd(e.relationships).map((e) => B(e)).filter((e) => !!e);
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
			let t = Gd(e.dmBreakdown).map(Xd).join("; ");
			return V(String(e.profile ?? `${String(e.leftFactionId ?? "?")}+${String(e.rightFactionId ?? "?")}`), `${String(e.relationship ?? "—")} — 1D ${String(e.roll ?? "—")} ${typeof e.dmTotal == "number" ? `${e.dmTotal >= 0 ? "+" : ""}${e.dmTotal}` : ""} = ${String(e.total ?? "—")}${t ? ` — ${t}` : ""}`);
		}).join("")}</div>` : "<p class=\"hint\">No pairwise faction relationships apply because there is only one stored faction.</p>",
		Array.isArray(e.generationNotes) && e.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>Faction notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${e.generationNotes.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : ""
	].join("");
}
function nf(e) {
	let t = Gd(e.cities).map((e) => B(e)).filter((e) => !!e), n = [
		V("Population allocation case", e.populationAllocationCase ?? "—"),
		e.largestNonMajorCityPopulation !== null && e.largestNonMajorCityPopulation !== void 0 ? V("Largest non-major city", Jd(e.largestNonMajorCityPopulation)) : "",
		e.largestNonMajorCityRoll !== null && e.largestNonMajorCityRoll !== void 0 ? V("Largest non-major city 1D roll", e.largestNonMajorCityRoll) : "",
		e.allocationChunkPercent !== null && e.allocationChunkPercent !== void 0 ? V("Allocation chunk size", Qd(e.allocationChunkPercent, 2)) : "",
		e.allocationRemainderPercent !== null && e.allocationRemainderPercent !== void 0 ? V("Allocation remainder", Qd(e.allocationRemainderPercent, 2)) : ""
	].join("");
	return t.length ? `${n}<div style="padding:0.45rem 0 0.15rem;"><strong>Individual city allocations</strong></div>${t.map((e, t) => {
		let n = Gd(e.allocationRolls).map((e) => String(e)).join(", "), r = e.chunkCount === null || e.chunkCount === void 0 ? "—" : String(e.chunkCount);
		return V(`City ${e.rank ?? t + 1}`, `${Jd(e.population)} — ${Qd(e.sharePercent, 2)} share — chunks ${r} — rolls ${n || "—"}`);
	}).join("")}` : n;
}
function rf(e) {
	return e ? [
		V("Centralisation", `${String(e.code ?? "—")} — ${String(e.description ?? "—")}`),
		V("2D roll", e.roll ?? "—"),
		V("DM total", typeof e.dmTotal == "number" ? `${e.dmTotal >= 0 ? "+" : ""}${e.dmTotal}` : "—"),
		V("Final total", e.total ?? "—"),
		Array.isArray(e.dmBreakdown) && e.dmBreakdown.length ? `<div style="padding:0.35rem 0;"><strong>Centralisation modifiers</strong><ul style="margin:0.3rem 0 0 1.25rem;">${e.dmBreakdown.map((e) => `<li>${z(Xd(e))}</li>`).join("")}</ul></div>` : "",
		ef(B(e.authority))
	].join("") : "<p class=\"hint\">No world-level WBH centralisation applies or has been generated.</p>";
}
function af(e) {
	if (!e) return "<p class=\"hint\">This world is not represented as a WBH balkanised Government-7 world.</p>";
	let t = Gd(e.factions).map((e) => B(e)).filter((e) => !!e);
	return [
		V("Representation", e.representation ?? "—"),
		V("D3 faction-count roll", e.factionCountRoll ?? "—"),
		V("Sovereign factions", e.factionCount ?? "—"),
		t.length ? `<div style="padding:0.35rem 0;"><strong>Faction governments</strong>${t.map((e) => {
			let t = B(e.centralisation), n = B(t?.authority), r = B(n?.functionalStructure), i = B(n?.governmentProfile), a = Gd(r?.functions).map((e) => B(e)).filter((e) => !!e).map((e) => `${String(e.functionCode ?? "—")}${String(e.code ?? "—")}`).join("/"), o = t ? ` — centralisation ${String(t.code ?? "—")} (${String(t.roll ?? "—")} ${typeof t.dmTotal == "number" ? `${t.dmTotal >= 0 ? "+" : ""}${t.dmTotal}` : ""} = ${String(t.total ?? "—")})` : "", s = n ? ` — authority ${String(n.code ?? "—")} ${String(n.authoritativeFunction ?? "—")} (${String(n.roll ?? "—")} ${typeof n.dmTotal == "number" ? `${n.dmTotal >= 0 ? "+" : ""}${n.dmTotal}` : ""} = ${String(n.total ?? "—")})` : "", c = a ? ` — structure ${a}` : "", l = i ? ` — profile ${String(i.profile ?? "—")}` : "";
			return [V(String(e.id ?? "Faction"), `${Kd(e.governmentCode)} — ${String(e.governmentType ?? "—")} — 2D ${String(e.governmentRoll ?? "—")} ${typeof e.governmentModifier == "number" ? `${e.governmentModifier >= 0 ? "+" : ""}${e.governmentModifier}` : ""} = ${String(e.governmentUnclampedTotal ?? "—")}${o}${s}${c}${l}`), `<div style="margin-left:0.8rem;padding:0.25rem 0 0.45rem;"><strong>${z(String(e.id ?? "Faction"))} internal factions</strong>${tf(B(e.internalFactions))}</div>`].join("");
		}).join("")}</div>` : "",
		Array.isArray(e.generationNotes) && e.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>Balkanisation notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${e.generationNotes.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : ""
	].join("");
}
function of(e) {
	if (!e) return "<p class=\"hint\">No generated social profile is available for this body.</p>";
	let t = B(e.populationDetails), n = B(e.populationConcentration), r = B(e.urbanisation), i = B(e.majorCities), a = B(e.governmentDetails), o = B(e.governmentCentralisation), s = B(e.governmentFactions), c = B(e.balkanisation), l = Gd(e.tradeCodes).map((e) => String(e)).join(" "), u = Gd(e.minimumSustainableTechLevelBasis).map((e) => String(e)), d = typeof e.notes == "string" ? e.notes : null, f = Wd(t, n, r, i), p = [V("Habitation", Yd(e.habitationStatus)), V("Basis", e.habitationBasis ?? "—")].join(""), m = t ? [
		V("WBH method", t.method ?? "—"),
		V("Population phase-1 prefix", t.profilePrefix ?? "—"),
		V("Population code", Kd(t.populationCode)),
		V("P value", t.pValue ?? "—"),
		V("Additional significant digit", t.additionalSignificantDigit ?? "—"),
		V("Estimated population", Jd(t.estimatedPopulation)),
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
		Array.isArray(n.dmBreakdown) && n.dmBreakdown.length ? `<div style="padding:0.35rem 0;"><strong>PCR modifiers</strong><ul style="margin:0.3rem 0 0 1.25rem;">${n.dmBreakdown.map((e) => `<li>${z(Xd(e))}</li>`).join("")}</ul></div>` : "",
		Array.isArray(n.generationNotes) && n.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>PCR notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${n.generationNotes.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : e.populationCode === 0 ? "<p class=\"hint\">Population 0: no Population Concentration Rating applies.</p>" : "<p class=\"hint\">No WBH Population Concentration Rating detail is stored for this body.</p>", g = r ? [
		V("Urbanisation", `${r.urbanisationPercent ?? "—"}%`),
		V("Total urban population", Jd(r.totalUrbanPopulation)),
		V("PCR used", r.pcr ?? "—"),
		V("2D roll", r.baseRoll ?? "—"),
		V("DM total", typeof r.dmTotal == "number" ? `${r.dmTotal >= 0 ? "+" : ""}${r.dmTotal}` : "—"),
		V("Table result", r.tableResult ?? "—"),
		V("Table range", r.tableRange ?? "—"),
		V("Rolled percentage", `${r.rolledPercentage ?? "—"}%`),
		B(r.appliedMinimum) ? V("Applied minimum", Zd(r.appliedMinimum)) : "",
		B(r.appliedMaximum) ? V("Applied maximum", Zd(r.appliedMaximum)) : "",
		Array.isArray(r.dmBreakdown) && r.dmBreakdown.length ? `<div style="padding:0.35rem 0;"><strong>Urbanisation modifiers</strong><ul style="margin:0.3rem 0 0 1.25rem;">${r.dmBreakdown.map((e) => `<li>${z(Xd(e))}</li>`).join("")}</ul></div>` : "",
		Array.isArray(r.minimumLimits) && r.minimumLimits.length ? `<div style="padding:0.35rem 0;"><strong>Minimum restrictions</strong><ul style="margin:0.3rem 0 0 1.25rem;">${r.minimumLimits.map((e) => `<li>${z(Zd(e))}</li>`).join("")}</ul></div>` : "",
		Array.isArray(r.maximumLimits) && r.maximumLimits.length ? `<div style="padding:0.35rem 0;"><strong>Maximum restrictions</strong><ul style="margin:0.3rem 0 0 1.25rem;">${r.maximumLimits.map((e) => `<li>${z(Zd(e))}</li>`).join("")}</ul></div>` : "",
		Array.isArray(r.generationNotes) && r.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>Urbanisation notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${r.generationNotes.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : e.populationCode === 0 ? "<p class=\"hint\">Population 0: no urbanisation percentage applies.</p>" : "<p class=\"hint\">No WBH urbanisation detail is stored for this body.</p>", _ = i ? [
		V("WBH case", i.case ?? "—"),
		V("Major cities", i.numberMajorCities ?? "—"),
		V("Combined major-city population", Jd(i.totalMajorCityPopulation)),
		V("Share of urban population", Qd(i.totalMajorCitySharePercent)),
		V("2D count roll", i.countRoll ?? "—"),
		V("Unrounded city-count result", typeof i.countUnrounded == "number" ? i.countUnrounded.toFixed(2).replace(/\.00$/, "") : "—"),
		V("Major-city population 1D roll", i.majorCityPopulationRoll ?? "—"),
		nf(i),
		Array.isArray(i.generationNotes) && i.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>Major-city notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${i.generationNotes.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : e.populationCode === 0 ? "<p class=\"hint\">Population 0: no major-city procedure applies.</p>" : "<p class=\"hint\">No WBH major-city summary is stored for this body.</p>", v = f ? [
		V("Profile", f.profile),
		V("Format", "P-p.pp-C-%%-M"),
		V("Population", Kd(f.populationCode)),
		V("P value", f.pValueText),
		V("PCR", f.pcr),
		V("Urbanisation", `${f.urbanisationPercent}%`),
		V("Major cities", f.numberMajorCities)
	].join("") : e.populationCode === 0 ? "<p class=\"hint\">Population 0: no WBH Population Profile applies.</p>" : "<p class=\"hint\">A complete WBH Population Profile requires Population/P value, PCR, Urbanisation and Major Cities detail.</p>", y = a ? [
		V("Government code", Kd(a.governmentCode)),
		V("Government type", a.governmentType ?? "—"),
		V("Source", a.source ?? "—"),
		V("2D roll", a.roll ?? "—"),
		V("Population modifier", typeof a.modifier == "number" ? `${a.modifier >= 0 ? "+" : ""}${a.modifier}` : "—"),
		V("Unclamped result", a.unclampedTotal ?? "—"),
		Array.isArray(a.generationNotes) && a.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>Government notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${a.generationNotes.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : "<p class=\"hint\">No WBH government-type detail is stored for this body.</p>", b = [
		V("UWP", e.uwp ?? "—"),
		V("Starport", e.starport ?? "—"),
		V("Government code", Kd(e.governmentCode)),
		V("Law Level", Kd(e.lawLevelCode)),
		V("Tech Level", Kd(e.techLevel)),
		V("Minimum sustainable TL", e.minimumSustainableTechLevel ?? "—"),
		u.length ? `<div style="padding:0.35rem 0;"><strong>Minimum TL basis</strong><ul style="margin:0.3rem 0 0 1.25rem;">${u.map((e) => `<li>${z(e)}</li>`).join("")}</ul></div>` : "",
		V("Trade codes", l || "—"),
		V("Importance", e.importance ?? "—"),
		d ? V("Notes", d) : "",
		"<p class=\"hint\" style=\"margin:0.45rem 0 0;\">Mainworld designation and habitation are independent. Uninhabited mainworlds retain a Population-0 UWP. Referee-established transplanted populations generate their own social values without changing the physical world.</p>"
	].join("");
	return [
		qd("Habitation", p),
		qd("Population", m),
		qd("Population Concentration", h),
		qd("Urbanisation", g),
		qd("Major Cities", _),
		qd("Population Profile", v),
		qd("Government", y),
		qd("Centralisation, Authority, Structure & Profile", rf(o)),
		qd("Government Factions", e.governmentCode === 7 ? "<p class=\"hint\">Government 7 uses the sovereign Balkanisation layer below; internal factions are shown inside each sovereign government.</p>" : tf(s)),
		qd("Balkanisation", af(c)),
		qd("Current UWP Social Values", b)
	].join("");
}
//#endregion
//#region src/integrations/foundry/managerControl.ts
var sf = "traveller-system-generator", cf = "__all__", lf = "__root__";
function H(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function uf(e) {
	return e.dataset.documentId ?? e.dataset.entryId ?? e.dataset.actorId ?? "";
}
function df(e) {
	return e.filter((e) => e.type === "world").sort((e, t) => (e.folderPath ?? "").localeCompare(t.folderPath ?? "") || e.name.localeCompare(t.name));
}
function ff(e, t = "", n = cf) {
	return df(e).filter((e) => n === cf || (n === lf ? !e.folderId : e.folderId === n)).map((e) => {
		let n = jd(e), r = `${e.name}${n ? "" : " — not generator-managed"}`;
		return `<option value="${H(e.id)}" data-folder-id="${H(e.folderId ?? "")}" data-generator-managed="${n ? "true" : "false"}"${e.id === t ? " selected" : ""}>${H(r)}</option>`;
	}).join("");
}
function pf(e, t = cf) {
	let n = e.localizer.localize("TSG.Dialog.ActorFolderRoot"), r = vd(e.listActorFolders());
	return [
		`<option value="${cf}"${t === cf ? " selected" : ""}>All Actor folders</option>`,
		`<option value="${lf}"${t === lf ? " selected" : ""}>${H(n)}</option>`,
		...r.map((e) => `<option value="${H(e.id)}"${e.id === t ? " selected" : ""}>${H(e.path)}</option>`)
	].join("");
}
function mf(e) {
	if (!e) return null;
	let t = e.flags?.[sf], n = t && typeof t == "object" ? t : {}, r = n.generationSettings, i = r && typeof r == "object" ? r : {}, a = jd(e);
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
function hf(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(8rem,0.8fr) minmax(0,1.2fr);gap:0.75rem;padding:0.3rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${H(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${H(t)}</span></div>`;
}
function gf(e, t) {
	let n = t.localizer.localize, r = mf(e);
	return !e || !r ? "<p class=\"hint\">No World Actors found in the selected folder.</p>" : `
    <div style="padding:0.75rem;border:1px solid var(--color-border-light-primary);border-radius:6px;background:var(--color-bg-option);min-width:0;">
      <h3 style="margin:0 0 0.5rem;">${H(e.name)}</h3>
      ${hf("Generator status", r.managed ? "Generator-managed" : "Not generator-managed")}
      ${hf(n("TSG.Manager.Folder"), r.folderPath)}
      ${hf(n("TSG.Manager.Uwp"), r.uwp)}
      ${hf(n("TSG.Manager.Method"), r.method)}
      ${hf(n("TSG.Manager.Seed"), r.seed)}
      ${hf(n("TSG.Manager.Distribution"), r.distribution)}
      ${hf(n("TSG.Manager.DetailLevel"), r.detailLevel)}
      ${r.managed ? "" : `<p class="hint" style="margin:0.6rem 0 0;">${H(n("TSG.Manager.AdoptHint"))}</p>`}
    </div>`;
}
function _f(e, t, n, r, i = !1) {
	return `
    <label style="display:block;padding:0.75rem;border:1px solid var(--color-border-light-primary);border-radius:6px;cursor:${i ? "not-allowed" : "pointer"};opacity:${i ? "0.55" : "1"};" data-manager-action-card="${e}">
      <span style="display:flex;align-items:flex-start;gap:0.6rem;">
        <input type="radio" name="action" value="${e}"${r ? " checked" : ""}${i ? " disabled" : ""}>
        <span><strong>${H(t)}</strong><br><span class="hint">${H(n)}</span></span>
      </span>
    </label>`;
}
function vf(e) {
	return e?.folderId || (e ? lf : cf);
}
function yf(e, t, n = {}) {
	let r = t.localizer.localize, i = df(e), a = i.find((e) => e.id === n.initialActorId) ?? i[0], o = n.initialActorId ? vf(a) : cf, s = o === cf ? i : i.filter((e) => o === lf ? !e.folderId : e.folderId === o), c = s.find((e) => e.id === a?.id) ?? s[0], l = ff(i, c?.id, o), u = n.initialAction ?? "generate", d = i.length > 0, f = !!(c && jd(c)), p = !!(c && Md(c));
	return `
    <section style="display:grid;gap:0.8rem;min-width:0;">
      <header>
        <h2 style="margin:0;">${r("TSG.Manager.GenerateHeading")}</h2>
        <p class="hint">${r("TSG.Manager.GenerateHint")}</p>
      </header>
      ${_f("generate", r("TSG.Manager.Generate"), r("TSG.Manager.GenerateDescription"), u === "generate")}
    </section>
    <hr style="margin:1rem 0;">
    <section style="display:grid;gap:0.8rem;min-width:0;">
      <header>
        <h2 style="margin:0;">${r("TSG.Manager.ManageHeading")}</h2>
        <p class="hint">Choose an Actor folder, then select any World Actor. Generator-managed Actors can be updated; unmanaged World Actors can be explicitly adopted.</p>
      </header>
      <div class="form-group" style="min-width:0;"><label>Actor Folder</label><select name="managerFolderId" aria-label="Actor Folder" style="width:100%;min-width:0;max-width:100%;">${pf(t, o)}</select></div>
      <div class="form-group" style="min-width:0;"><label>${r("TSG.Manager.Actor")}</label><select name="actorId" aria-label="${r("TSG.Manager.Actor")}" style="width:100%;min-width:0;max-width:100%;"${d ? "" : " disabled"}>
        ${l || "<option value=\"\">No World Actors found in this folder</option>"}
      </select></div>
      <div data-manager-actor-details style="min-width:0;">${gf(c, t)}</div>
      <div style="display:grid;grid-template-columns:1fr;gap:0.75rem;">
        ${_f("open", r("TSG.Manager.Open"), r("TSG.Manager.OpenDescription"), u === "open", !d)}
        ${_f("update", r("TSG.Manager.Update"), r("TSG.Manager.UpdateDescription"), u === "update" && f, !f)}
        ${_f("adopt", r("TSG.Manager.Adopt"), r("TSG.Manager.AdoptDescription"), u === "adopt" && p, !p)}
      </div>
    </section>`;
}
function bf(e) {
	return typeof e == "string" ? e : "";
}
function xf(e, t, n) {
	let r = df(t);
	e.style.width = "720px", e.style.maxWidth = "calc(100vw - 2rem)", e.style.boxSizing = "border-box";
	for (let t of e.querySelectorAll("select, input[type=\"text\"], input[type=\"number\"]")) t.style.maxWidth = "100%", t.style.minWidth = "0", t.style.boxSizing = "border-box";
	let i = e.querySelector("select[name=\"managerFolderId\"]"), a = e.querySelector("select[name=\"actorId\"]"), o = e.querySelector("[data-manager-actor-details]"), s = e.querySelector("input[name=\"action\"][value=\"update\"]"), c = e.querySelector("[data-manager-action-card=\"update\"]"), l = e.querySelector("input[name=\"action\"][value=\"adopt\"]"), u = e.querySelector("[data-manager-action-card=\"adopt\"]");
	if (!i || !a || !o) return;
	let d = (e, t, n) => {
		e && (e.disabled = !n), t && (t.style.opacity = n ? "1" : "0.55", t.style.cursor = n ? "pointer" : "not-allowed");
	}, f = () => {
		let t = r.find((e) => e.id === a.value);
		o.innerHTML = gf(t, n);
		let i = !!(t && jd(t)), f = !!(t && Md(t));
		if (d(s, c, i), d(l, u, f), e.querySelector("input[name=\"action\"]:checked")?.disabled) {
			let t = f ? l : i ? s : e.querySelector("input[name=\"action\"][value=\"open\"]");
			t && (t.checked = !0);
		}
	};
	i.addEventListener("change", () => {
		let e = i.value || cf, t = a.value, n = ff(r, t, e);
		a.innerHTML = n || "<option value=\"\">No World Actors found in this folder</option>", a.disabled = !n, n && !a.value && (a.selectedIndex = 0), f();
	}), a.addEventListener("change", f), f();
}
function Sf(e, t) {
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
async function Cf(e, t, n = {}) {
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	let r = e.listGeneratedActors(), i = await e.prompt({
		window: { title: e.localizer.localize("TSG.Manager.Title") },
		content: yf(r, e, n),
		ok: { label: e.localizer.localize("TSG.Manager.Continue") },
		rejectClose: !1,
		modal: !1,
		render: (t, n) => xf(n.element, r, e)
	});
	if (!i) return;
	let a = bf(i.action) || n.initialAction || "generate";
	if (a === "generate") {
		await Ed(e, t);
		return;
	}
	let o = df(r).find((e) => e.id === bf(i.actorId));
	if (!o) {
		e.notifyWarning("Select a World Actor.");
		return;
	}
	if (a === "open") {
		o.sheet?.render(!0);
		return;
	}
	if (a === "adopt") {
		await zd(Sf(o, e), t);
		return;
	}
	await Rd(Sf(o, e), t);
}
function wf(e, t, n) {
	let r = e.tokens;
	r && (r.tools ??= {}, r.tools.travellerSystemGenerator = {
		name: "travellerSystemGenerator",
		title: t.localizer.localize("TSG.Control.Manager"),
		icon: "fa-solid fa-solar-system",
		order: Object.keys(r.tools).length,
		button: !0,
		visible: t.isGameMaster(),
		onChange: () => {
			Cf(t, n);
		}
	});
}
//#endregion
//#region src/integrations/foundry/wbhInspector.ts
var Tf = "traveller-system-generator";
function U(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function W(e) {
	return Array.isArray(e) ? e : [];
}
function Ef(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function G(e) {
	return typeof e == "string" && e.length ? e : null;
}
function K(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Df(e) {
	return U(U(e.flags?.[Tf])?.sensorSystem);
}
function Of(e) {
	let t = Df(e);
	return e.type === "world" && !!(t && Array.isArray(t.bodies));
}
function kf(e) {
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
function Af(e) {
	return (Df(e)?.bodies ?? []).flatMap((e, t) => {
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
	}).flatMap((e) => [e, ...kf(e)]);
}
function jf(e) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.trunc(e)] ?? String(e);
}
function q(e, t = 3, n = "") {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : `${Number(e.toFixed(t))}${n}`;
}
function Mf(e) {
	return e === !0 ? "Yes" : e === !1 ? "No" : "—";
}
function J(e, t, n = "") {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${K(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${n ? `${K(n)} ` : ""}${K(t ?? "—")}</span></div>`;
}
function Y(e, t, n = !0) {
	return `<details${n ? " open" : ""} style="border:1px solid var(--color-border-light-primary);border-radius:6px;padding:0.65rem;"><summary style="cursor:pointer;font-weight:700;">${K(e)}</summary><div style="margin-top:0.5rem;">${t}</div></details>`;
}
function Nf(e) {
	return `<details style="margin-top:0.55rem;padding:0.45rem;border:1px dashed var(--color-border-light-primary);border-radius:4px;"><summary style="cursor:pointer;font-weight:600;">Calculation Details</summary><div style="margin-top:0.4rem;">${e}</div></details>`;
}
function Pf(e) {
	let t = W(e).map((e) => String(e));
	return t.length ? `<div style="margin-top:0.45rem;"><strong>Generation notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${t.map((e) => `<li>${K(e)}</li>`).join("")}</ul></div>` : "";
}
function Ff(e, t, n, r) {
	let i = U(r?.details), a = U(i?.size), o = U(i?.atmosphere), s = U(i?.hydrographics), c = [];
	if (e !== null) {
		let t = Ef(a?.diameterKm);
		c.push(`Size ${jf(e)} → ${t === null ? "no precise diameter" : `${q(t, 0, " km")} precise diameter`} ${t === null ? "⚠" : "✓"}`);
	}
	if (t !== null) {
		let e = G(o?.classification), n = Ef(o?.meanBaselinePressureBar);
		c.push(`Atmosphere ${jf(t)} → ${e ?? "no detailed classification"}${n === null ? "" : `, ${q(n, 3, " bar")}`} ${e ? "✓" : "⚠"}`);
	}
	if (n !== null) {
		let e = Ef(s?.coveragePercent), t = n === 0 ? 0 : Math.max(0, n * 10 - 5), r = n === 10 ? 100 : Math.min(100, n * 10 + 5), i = e !== null && e >= t && e <= r;
		c.push(`Hydrographics ${jf(n)} → ${e === null ? "no precise coverage" : `${q(e, 1, "%")} coverage`} ${e === null ? "⚠" : i ? "✓" : "⚠ review"}`);
	}
	return c.map((e) => `<div style="padding:0.2rem 0;">${K(e)}</div>`).join("") || "<p class=\"hint\">No SAH consistency data available for this body.</p>";
}
function If(e) {
	let t = U(e?.details), n = U(t?.size), r = U(t?.gasGiant);
	return [
		J("Physical profile", e?.uwpPhysical ?? "—"),
		J("Size code", jf(e?.sizeCode)),
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
function Lf(e) {
	let t = e?.atmosphereCode, n = U(U(e?.details)?.atmosphere), r = W(n?.taints).map((e) => U(e)?.profile ?? U(e)?.type ?? e).join(", "), i = W(n?.hazards).map((e) => U(e)?.type ?? e).join(", "), a = W(U(n?.gasMix)?.components).map((e) => {
		let t = U(e);
		return t ? `${t.name ?? "?"} ${t.percentage ?? "?"}%${t.retainedLongTerm === !1 ? " (not retained)" : ""}` : String(e);
	}).join(", ");
	return [
		J("Atmosphere code", jf(t)),
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
function Rf(e) {
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
function zf(e) {
	let t = U(e?.details), n = U(t?.hydrographics), r = U(t?.climate);
	return [
		J("Hydrographics code", jf(e?.hydrographicsCode)),
		J("Precise coverage", q(n?.coveragePercent, 2, "%")),
		J("Foundation", n?.foundation ?? "—"),
		J("Liquid composition", n?.composition ?? "—"),
		J("Distribution", U(n?.distribution)?.description ?? "—"),
		J("Hydrographics profile", n?.profile ?? "—"),
		Rf(n),
		J("Mean temperature", `${q(r?.meanTemperatureK, 2, " K")} / ${q(r?.meanTemperatureC, 2, " °C")}`),
		J("Temperature class", r?.temperatureClass ?? "—"),
		J("Albedo", q(r?.albedo, 4)),
		J("Greenhouse factor", q(r?.greenhouseFactor, 4)),
		J("Runaway greenhouse eligible", Mf(r?.runawayGreenhouseEligible))
	].join("");
}
function Bf(e) {
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
		Pf(t.generationNotes)
	].join("");
	return [
		J("High temperature", `${q(t.highTemperatureK, 2, " K")} / ${q(t.highTemperatureC, 2, " °C")}`),
		J("Low temperature", `${q(t.lowTemperatureK, 2, " K")} / ${q(t.lowTemperatureC, 2, " °C")}`),
		J("Near stellar distance", q(t.nearAu, 6, " AU")),
		J("Far stellar distance", q(t.farAu, 6, " AU")),
		Nf(n)
	].join("");
}
function Vf(e) {
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
function Hf(e) {
	let t = U(U(e?.details)?.seismology);
	if (!t) return "<p class=\"hint\">No WBH terrestrial seismology record is available for this body.</p>";
	let n = [
		J("Residual stress DM", t.residualStressDm ?? "—"),
		J("Tectonic plate roll", t.tectonicPlateRoll ?? "—"),
		J("Tectonic plate DM", t.tectonicPlateDm ?? "—"),
		Pf(t.generationNotes)
	].join("");
	return [
		J("Residual seismic stress", t.residualSeismicStress ?? "—"),
		J("Tidal stress factor", t.tidalStressFactor ?? "—"),
		J("Tidal heating factor", t.tidalHeatingFactor ?? "—"),
		J("Total seismic stress", t.totalSeismicStress ?? "—"),
		J("Seismic-adjusted mean temperature", q(t.seismicAdjustedMeanTemperatureK, 3, " K")),
		J("Major tectonic plates", t.majorTectonicPlates ?? "—"),
		J("Water-based tectonics eligible", Mf(t.waterBasedTectonicsEligible)),
		Nf(n)
	].join("");
}
function Uf(e) {
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
		Nf([J("Generation policy", t.generationPolicy ?? "—"), Pf(t.generationNotes)].join(""))
	].join("");
}
function Wf(e) {
	let t = U(U(e?.details)?.surfaceClimate);
	if (!t) return "<p class=\"hint\">No WBH-derived surface climate guidance is available for this body.</p>";
	let n = W(t.broadRegionGuidance).map((e) => String(e));
	return [
		J("Thermal regime", t.thermalRegime ?? "—"),
		J("Mean temperature used", q(t.meanTemperatureK, 2, " K")),
		J("High temperature used", q(t.highTemperatureK, 2, " K")),
		J("Low temperature used", q(t.lowTemperatureK, 2, " K")),
		J("Permanent ice extent", t.permanentIceExtent ?? "—"),
		J("Agriculture thermally eligible", Mf(t.agricultureThermallyEligible)),
		J("Unprotected settlement thermally eligible", Mf(t.unprotectedSettlementThermallyEligible)),
		n.length ? `<div style="padding:0.4rem 0;"><strong>Broad region guidance</strong><ul style="margin:0.3rem 0 0 1.25rem;">${n.map((e) => `<li>${K(e)}</li>`).join("")}</ul></div>` : "<div class=\"hint\" style=\"padding:0.4rem 0;\">No additional broad-region guidance.</div>",
		Nf([J("Generation policy", t.generationPolicy ?? "—"), Pf(t.generationNotes)].join(""))
	].join("");
}
function Gf(e) {
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
function Kf(e) {
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
		Pf(t.generationNotes)
	].join("");
	return [
		`<div style="padding:0.5rem 0 0.65rem;text-align:center;"><div class="hint">IISS Native-Life Profile (MXDC)</div><strong style="font-size:1.35rem;letter-spacing:0.12em;">${K(G(t.profile) ?? "—")}</strong></div>`,
		J("Biomass", t.biomassRating ?? "—"),
		J("Biocomplexity", t.biocomplexityRating ?? "—"),
		J("Biodiversity", t.biodiversityRating ?? "—"),
		J("Compatibility", t.compatibilityRating ?? "—"),
		J("Biomass special case", t.biomassSpecialCase ?? "—"),
		J("Current native sophont", Mf(t.currentNativeSophont)),
		J("Extinct native sophont evidence", Mf(t.extinctNativeSophontEvidence)),
		Nf(r)
	].join("");
}
function qf(e) {
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
		Pf(t.generationNotes)
	].join("");
	return [J("Resource Rating", `${t.code ?? "—"} (${t.rating ?? "—"})`), Nf(r)].join("");
}
function Jf(e) {
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
		J("Detailed temperatures used", Mf(t.usedDetailedTemperature)),
		J("Computed gravity used", Mf(t.usedComputedGravity)),
		Pf(t.generationNotes)
	].join("");
	return [
		J("Habitability Rating", `${t.code ?? "—"} (${t.rating ?? "—"})`),
		J("Remarks", t.remarks ?? "—"),
		Nf(r)
	].join("");
}
function Yf(e) {
	let t = U(e.criterionWins), n = [
		t?.highestHabitability === !0 ? "Habitability" : null,
		t?.nativeSophontsPresent === !0 ? "Sophonts" : null,
		t?.highestResources === !0 ? "Resources" : null,
		t?.bestRefuelling === !0 ? "Refuelling" : null
	].filter((e) => !!e);
	return n.length ? n.join(", ") : "None";
}
function Xf(e) {
	let t = U(Df(e)?.mainworldDetermination);
	if (!t) return "<p class=\"hint\">No WBH Final Mainworld Determination is stored for this system.</p>";
	let n = W(t.candidates).map((e) => {
		let n = U(e);
		if (!n) return "";
		let r = U(n.refuelling), i = n.id === t.selectedMainworldId, a = n.id === t.recommendedMainworldId;
		return `<tr>
      <td style="white-space:nowrap;">${K(n.id)}${i ? " ★" : ""}</td>
      <td>${K(n.kind ?? "—")}</td>
      <td>${K(n.habitabilityRating ?? "—")}</td>
      <td>${K(Mf(n.nativeSophontsPresent))}</td>
      <td>${K(n.resourceRating ?? "—")}</td>
      <td style="min-width:12rem;">${K(r?.description ?? "—")}</td>
      <td>${K(n.totalCriterionWins ?? 0)}</td>
      <td>${K(Yf(n))}${a ? " (recommended)" : ""}</td>
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
function Zf(e) {
	let t = U(Df(e)?.mainworldDetermination);
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
function Qf(e) {
	let t = e.physical, n = Ef(t?.sizeCode), r = Ef(t?.atmosphereCode), i = Ef(t?.hydrographicsCode), a = G(e.social?.uwp), o = JSON.stringify(e.source, null, 2);
	return `
    <div data-wbh-body-panel="${K(e.id)}" style="display:grid;gap:0.7rem;min-width:0;">
      <div style="padding:0.65rem;border:1px solid var(--color-border-light-primary);border-radius:6px;background:var(--color-bg-option);">
        <h3 style="margin:0 0 0.4rem;">${K(e.label)}</h3>
        ${J("Parent body", e.parentId ?? "Top-level system body")}
        ${J("UWP / physical profile", a ?? G(t?.uwpPhysical) ?? "—")}
      </div>
      ${Y("UWP / Detailed Consistency", Ff(n, r, i, t))}
      ${Y("Social Characteristics", of(e.social), !1)}
      ${Y("Justice", dd(e.social), !1)}
      ${Y("Physical", If(t))}
      ${Y("Atmosphere", Lf(t), !1)}
      ${Y("Hydrographics / Climate", zf(t), !1)}
      ${Y("Temperature Extremes", Bf(t), !1)}
      ${Y("Rotation / Tides", Vf(t), !1)}
      ${Y("Seismology", Hf(t), !1)}
      ${Y("Surface Geology", Uf(t), !1)}
      ${Y("Surface Climate", Wf(t), !1)}
      ${Y("Satellites", Gf(t), !1)}
      ${Y("Native Life", Kf(t), !1)}
      ${Y("Resource Rating", qf(t), !1)}
      ${Y("Habitability Rating", Jf(t), !1)}
      ${Y("Raw Stored Body Data", `<pre style="white-space:pre-wrap;overflow:auto;max-height:24rem;margin:0;">${K(o)}</pre>`, !1)}
    </div>`;
}
function $f(e, t) {
	return `<div style="display:grid;gap:0.7rem;min-width:0;">
    ${Y("Final Mainworld Determination", Xf(e), !0)}
    <div data-wbh-selected-body>${Qf(t)}</div>
  </div>`;
}
function ep(e) {
	let t = Af(e), n = t.find((e) => e.isMainworld) ?? t[0];
	return n ? `
    <div style="display:grid;gap:0.75rem;min-width:0;">
      <div class="form-group" style="min-width:0;">
        <label>Body</label>
        <select name="wbhInspectorBodyId" style="width:100%;min-width:0;max-width:100%;">
          ${t.map((e) => `<option value="${K(e.id)}"${e.id === n.id ? " selected" : ""}>${K(e.label)}</option>`).join("")}
        </select>
      </div>
      ${Zf(e)}
      <p class="hint" style="margin:0;">Read-only view of authoritative generated data stored on this World Actor. The GM mainworld selection is the only editable value here. It does not represent what characters have discovered through Sensors.</p>
      <div data-wbh-inspector-panel>${$f(e, n)}</div>
    </div>` : "<p>No stored TSG body data is available on this Actor.</p>";
}
function tp(e, t) {
	e.style.width = "900px", e.style.maxWidth = "calc(100vw - 2rem)", e.style.maxHeight = "calc(100vh - 2rem)", e.style.boxSizing = "border-box";
	let n = e.querySelector("select[name=\"wbhInspectorBodyId\"]"), r = e.querySelector("[data-wbh-selected-body]");
	if (!n || !r) return;
	let i = Af(t);
	n.addEventListener("change", () => {
		let e = i.find((e) => e.id === n.value);
		e && (r.innerHTML = Qf(e));
	});
}
async function np(e, t, n) {
	if (!t.isGameMaster()) return;
	if (!Of(e)) {
		t.notifyWarning("This World Actor does not contain Traveller System Generator detail data.");
		return;
	}
	let r = G(U(Df(e)?.mainworldDetermination)?.selectedMainworldId), i = await t.prompt({
		window: { title: `WBH Detail Inspector — ${e.name}` },
		content: ep(e),
		ok: { label: "Close" },
		rejectClose: !1,
		modal: !1,
		render: (t, n) => tp(n.element, e)
	});
	if (!i || !n) return;
	let a = G(i.wbhMainworldOverrideId);
	if (!(!a || a === r)) try {
		await Ud(e, a, n) ? t.notifyInfo(`Mainworld changed to ${a}. The WBH generated recommendation remains recorded.`) : t.notifyWarning("Mainworld override is only available for generator-managed expanded systems.");
	} catch (e) {
		t.notifyError(`Unable to change mainworld: ${e instanceof Error ? e.message : String(e)}`);
	}
}
//#endregion
//#region src/integrations/foundry/habitationOverride.ts
var rp = "traveller-system-generator";
function ip(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function ap(e) {
	return typeof e == "string" && e.length ? e : null;
}
function op(e) {
	let t = e.flags?.[rp];
	return t && typeof t == "object" ? t : null;
}
function sp(e) {
	let t = ip(ip(e.sensorSystem)?.mainworldDetermination);
	if (t?.selectionSource === "referee-override") return ap(t.selectedMainworldId) ?? void 0;
}
function cp(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function lp(e) {
	let t = op(e);
	return !!(e.type === "world" && t?.generationMethod !== "continuation" && Number.isFinite(t?.generationSeed));
}
function up(e, t) {
	let n = op(e);
	if (!n || n.generationMethod === "continuation" || !Number.isFinite(n.generationSeed)) return null;
	let r = n.generationSettings ?? {}, i = sp(n);
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
async function dp(e, t, n) {
	let r = up(e, t);
	if (!r) return !1;
	let i = n.generateSystem(r), a = n.createTwodsixWorldActor(i);
	return await e.update(Id(e, a, Number(r.seed))), e.sheet?.render(!0), !0;
}
function fp(e) {
	op(e)?.habitationOverrides;
	let t = Af(e).filter((e) => e.physical ? !ip(ip(e.physical.details)?.gasGiant) && e.kind !== "Gas Giant" : !1);
	return t.length ? `
    <p class="hint">Establish or clear a Referee-defined transplanted population. Native Sophonts are authoritative physical-generation results and cannot be removed here.</p>
    <div class="form-group">
      <label>Body</label>
      <select name="bodyId">
        ${t.map((e) => {
		let t = e.social, n = ap(t?.habitationStatus) ?? "uninhabited";
		return `<option value="${cp(e.id)}">${cp(`${e.label} — ${n}`)}</option>`;
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
function pp(e) {
	let t = e.querySelector("select[name=\"habitationAction\"]"), n = e.querySelector("select[name=\"populationMode\"]"), r = e.querySelector("[data-population-code-row]");
	if (!t || !n || !r) return;
	let i = () => {
		let e = t.value === "transplanted";
		n.disabled = !e, r.style.display = e && n.value === "manual" ? "" : "none";
	};
	t.addEventListener("change", i), n.addEventListener("change", i), i();
}
async function mp(e, t, n) {
	if (!t.isGameMaster()) return;
	if (!lp(e)) {
		t.notifyWarning("Habitation editing is only available for generator-managed expanded systems.");
		return;
	}
	let r = await t.prompt({
		window: { title: `Edit Habitation — ${e.name}` },
		content: fp(e),
		ok: { label: "Apply" },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => pp(t.element)
	});
	if (!r) return;
	let i = ap(r.bodyId);
	if (!i) return;
	let a = Af(e).find((e) => e.id === i);
	if (!a) {
		t.notifyError(`Unable to find body ${i}.`);
		return;
	}
	if (ip(ip(a.physical?.details)?.nativeLife)?.currentNativeSophont === !0) {
		t.notifyWarning("This body has current native Sophonts. Its native habitation cannot be changed with the transplanted-population editor.");
		return;
	}
	let o = { ...op(e)?.habitationOverrides ?? {} }, s = ap(r.habitationAction);
	if (s === "clear") delete o[i];
	else {
		let e = ap(r.populationMode) ?? "generate", n = null;
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
		if (!await dp(e, o, n)) {
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
function hp(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function gp(e) {
	return Array.isArray(e) ? e : [];
}
function _p(e) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.trunc(e)] ?? String(e);
}
function vp(e) {
	return e === !0 ? "Yes" : e === !1 ? "No" : "—";
}
function yp(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(12rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${X(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${X(t ?? "—")}</span></div>`;
}
function bp(e) {
	switch (e) {
		case "eligible": return "Eligible for Referee-established secondary population";
		case "existing-inhabited": return "Already inhabited";
		case "tech-infeasible": return "Current mainworld TL is insufficient";
		case "population-ceiling-zero": return "Population ceiling is zero";
		default: return String(e ?? "—");
	}
}
function xp(e) {
	let t = hp(e);
	if (!t) return "<p class=\"hint\">No WBH Secondary World Population plan applies. This normally means the selected mainworld has Population 0 or the stored Actor predates this generation phase.</p>";
	let n = gp(t.candidates).map(hp).filter((e) => !!e), r = n.length ? `<div style="overflow:auto;margin-top:0.65rem;"><table style="width:100%;border-collapse:collapse;font-size:0.9em;">
        <thead><tr><th>Body</th><th>Kind</th><th>Existing Pop.</th><th>Native Sophonts</th><th>Min TL</th><th>Mainworld TL supports</th><th>Max Pop.</th><th>Status</th></tr></thead>
        <tbody>${n.map((e) => {
		let t = gp(e.minimumSustainableTechLevelBasis).map(String).join("; ");
		return `<tr>
            <td style="white-space:nowrap;">${X(e.parentId ? `${String(e.id ?? "—")} (moon of ${String(e.parentId)})` : String(e.id ?? "—"))}</td>
            <td>${X(e.kind ?? "—")}</td>
            <td>${X(e.existingPopulationCode === null || e.existingPopulationCode === void 0 ? "None" : _p(e.existingPopulationCode))}</td>
            <td>${X(vp(e.currentNativeSophonts))}</td>
            <td title="${X(t)}">${X(`TL${String(e.minimumSustainableTechLevel ?? "—")}`)}</td>
            <td>${X(vp(e.sustainableAtMainworldTechLevel))}</td>
            <td>${X(_p(e.effectiveMaximumPopulationCode))}</td>
            <td>${X(bp(e.status))}</td>
          </tr>`;
	}).join("")}</tbody>
      </table></div>` : "<p class=\"hint\">No eligible physical secondary-world candidates were found after excluding the mainworld, gas giants, and empty orbits.</p>", i = gp(t.generationNotes).map((e) => `<li>${X(e)}</li>`).join("");
	return [
		yp("Mainworld", t.mainworldId ?? "—"),
		yp("Mainworld Population", _p(t.mainworldPopulationCode)),
		yp("Mainworld Tech Level", `TL${_p(t.mainworldTechLevel)}`),
		yp("Normal individual maximum", `${_p(t.normalMaximumPopulationCode)} — mainworld Population − 1`),
		yp("Optional offworld 1D roll", t.offworldMaximumRoll ?? "—"),
		yp("Optional system maximum", `${_p(t.systemMaximumPopulationCode)} — mainworld Population − 1D`),
		yp("Effective maximum", _p(t.effectiveMaximumPopulationCode)),
		yp("Secondary populations possible", vp(t.secondaryPopulationsPossible)),
		r,
		i ? `<div class="hint" style="margin-top:0.55rem;"><strong>WBH method notes</strong><ul>${i}</ul></div>` : ""
	].join("");
}
//#endregion
//#region src/rules/worlds/wbhCityInformation.ts
function Sp(e) {
	return Math.trunc(e).toLocaleString("en-US");
}
function Cp(e, t, n, r) {
	return `${e}${t.length ? ` (${t.join(", ")})` : ""}: ${Sp(n)}: ${r ?? "—"}`;
}
function wp(e) {
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
				profile: Cp(t, n, e.population, null)
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
var Tp = [
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
function Ep(e) {
	return Tp.find((t) => t.code === e) ?? null;
}
function Dp(e, t) {
	return e.some((e) => e === t || e.startsWith(`${t} `) || e.endsWith(`(${t})`));
}
function Op(e) {
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
	].includes(e.atmosphereCode) ? n("Atmosphere 0, 1, or A", 2) : e.atmosphereCode === 11 ? n("Atmosphere B", 3) : e.atmosphereCode === 12 && n("Atmosphere C", 4), e.techLevel >= 16 ? n("TL16+", 3) : e.techLevel >= 13 ? n("TL13–15", 2) : e.techLevel >= 9 && n("TL9–12", 1), Dp(e.tradeCodes, "In") && n("Industrial", 1), Dp(e.tradeCodes, "Ni") && n("Non-Industrial", -1), Dp(e.tradeCodes, "Ri") && n("Rich", 1), Dp(e.tradeCodes, "Po") && n("Poor", -1);
	let r = t.reduce((e, t) => e + t.dm, 0);
	return {
		target: 12,
		dmTotal: r,
		effectiveNaturalRollRequired: Math.max(2, 12 - r),
		dmBreakdown: t
	};
}
function kp(e, t) {
	let n = Ep(e);
	return !!(n && t >= n.minimumTechLevel);
}
function Ap(e, t, n) {
	let r = n?.[String(t)];
	return r?.code ? e.includes(r.code) ? [...e] : [...e, r.code] : [...e];
}
//#endregion
//#region src/integrations/foundry/unusualCityEditor.ts
var jp = "traveller-system-generator";
function Mp(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Np(e) {
	return typeof e == "string" && e.length ? e : null;
}
function Pp(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function Fp(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Ip(e) {
	return Mp(e.flags?.[jp]);
}
function Lp(e) {
	let t = Mp(Ip(e)?.cityOverrides);
	if (!t) return {};
	let n = {};
	for (let [e, r] of Object.entries(t)) {
		let t = Mp(r), i = Pp(t?.cityRank), a = Np(t?.code), o = Np(t?.description), s = t?.source === "custom" ? "custom" : t?.source === "standard" ? "standard" : null;
		i !== null && a && o && s && (n[e] = {
			cityRank: i,
			code: a,
			description: o,
			source: s
		});
	}
	return n;
}
function Rp(e) {
	return e?.source === "custom" ? {
		action: "custom",
		standardCode: Tp[0]?.code ?? "",
		customCode: e.code,
		customDescription: e.description
	} : {
		action: "standard",
		standardCode: e?.source === "standard" ? e.code : Tp[0]?.code ?? "",
		customCode: "",
		customDescription: ""
	};
}
function zp(e) {
	return Af(e).find((e) => e.isMainworld);
}
function Bp(e) {
	let t = zp(e)?.social, n = Mp(t?.majorCities);
	return Array.isArray(n?.cities) ? n.cities.flatMap((e) => {
		let t = Mp(e), n = Pp(t?.rank), r = Pp(t?.population);
		return n !== null && r !== null ? [{
			rank: n,
			population: r
		}] : [];
	}) : [];
}
function Vp(e) {
	return e.type === "world" && !!zp(e)?.social && Bp(e).length > 0;
}
function Hp(e) {
	let t = zp(e), n = t?.social, r = t?.physical, i = Bp(e), a = Pp(n?.techLevel) ?? 0, o = Pp(r?.atmosphereCode) ?? 0, s = Array.isArray(n?.tradeCodes) ? n.tradeCodes.map(String) : [], c = Op({
		starport: Np(n?.starport),
		hasHighport: !1,
		atmosphereCode: o,
		techLevel: a,
		tradeCodes: s
	}), l = Lp(e), u = c.dmTotal >= 0 ? `+${c.dmTotal}` : String(c.dmTotal);
	return `
    <p class="hint">WBH unusual cities are optional Referee choices. This editor never assigns one automatically. The Handbook's optional random check is 2D 12+ with the displayed world DM; city type still remains a Referee choice.</p>
    <div style="padding:0.5rem;border:1px solid var(--color-border-light-primary);border-radius:6px;margin-bottom:0.65rem;">
      <strong>World guidance</strong><br>
      TL ${Fp(a)}; optional unusual-city occurrence DM ${Fp(u)}; natural 2D roll required ${Fp(c.effectiveNaturalRollRequired)}+.
      ${c.dmBreakdown.length ? `<div class="hint">${c.dmBreakdown.map((e) => `${Fp(e.source)}: DM${e.dm >= 0 ? "+" : ""}${e.dm}`).join("; ")}</div>` : ""}
      <div class="hint">Highport DM is not applied because TSG has not yet established a highport for this world.</div>
    </div>
    <div class="form-group"><label>Major city</label><select name="cityRank">
      ${i.map((e) => {
		let t = l[String(e.rank)];
		return `<option value="${e.rank}">Major City ${e.rank} — ${e.population.toLocaleString("en-US")}${t ? ` — currently ${Fp(t.code)}` : ""}</option>`;
	}).join("")}
    </select></div>
    <div class="form-group"><label>Action</label><select name="cityAction">
      <option value="standard">Assign WBH unusual-city type</option>
      <option value="custom">Assign custom Referee type</option>
      <option value="clear">Clear unusual-city designation</option>
    </select></div>
    <div class="form-group" data-standard-type-row><label>Unusual city type</label><select name="standardCode">
      ${Tp.map((e) => `<option value="${e.code}"${a < e.minimumTechLevel ? " disabled" : ""}>${Fp(`${e.code} — ${e.name} — minimum TL${e.minimumTechLevel}${a < e.minimumTechLevel ? " — unavailable at current TL" : ""}`)}</option>`).join("")}
    </select></div>
    <div data-custom-type-row style="display:none;">
      <div class="form-group"><label>Custom code</label><input name="customCode" maxlength="4" placeholder="Mx"></div>
      <div class="form-group"><label>Description</label><input name="customDescription" maxlength="120" placeholder="Referee-defined unusual city"></div>
      <p class="hint">Custom types are deliberately not given automatic TL validation; the Referee is responsible for their technological plausibility.</p>
    </div>`;
}
function Up(e, t) {
	let n = e.querySelector("select[name=\"cityRank\"]"), r = e.querySelector("select[name=\"cityAction\"]"), i = e.querySelector("select[name=\"standardCode\"]"), a = e.querySelector("input[name=\"customCode\"]"), o = e.querySelector("input[name=\"customDescription\"]"), s = e.querySelector("[data-standard-type-row]"), c = e.querySelector("[data-custom-type-row]");
	if (!n || !r || !i || !a || !o || !s || !c) return;
	let l = Lp(t), u = () => {
		s.style.display = r.value === "standard" ? "" : "none", c.style.display = r.value === "custom" ? "" : "none";
	}, d = () => {
		let e = Rp(l[n.value]);
		r.value = e.action, e.standardCode && i.querySelector(`option[value="${e.standardCode}"]`) && (i.value = e.standardCode), a.value = e.customCode, o.value = e.customDescription, u();
	};
	n.addEventListener("change", d), r.addEventListener("change", u), d();
}
async function Wp(e, t) {
	if (!t.isGameMaster()) return;
	if (!Vp(e)) {
		t.notifyWarning("Unusual-city editing requires an inhabited TSG world with generated major cities.");
		return;
	}
	let n = await t.prompt({
		window: { title: `Edit Unusual Cities — ${e.name}` },
		content: Hp(e),
		ok: { label: "Apply" },
		rejectClose: !1,
		modal: !1,
		render: (t, n) => Up(n.element, e)
	});
	if (!n) return;
	let r = Number(n.cityRank);
	if (!Number.isInteger(r) || !Bp(e).some((e) => e.rank === r)) {
		t.notifyWarning("Select a valid generated major city.");
		return;
	}
	let i = { ...Lp(e) }, a = Np(n.cityAction) ?? "standard";
	if (a === "clear") delete i[String(r)];
	else if (a === "custom") {
		let e = Np(n.customCode)?.trim(), a = Np(n.customDescription)?.trim();
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
		let a = Np(n.standardCode), o = Pp(zp(e)?.social?.techLevel) ?? 0, s = Tp.find((e) => e.code === a);
		if (!a || !s) {
			t.notifyWarning("Select a WBH unusual-city type.");
			return;
		}
		if (!kp(a, o)) {
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
		await e.update({ [`flags.${jp}.cityOverrides`]: i }), e.sheet?.render(!0), t.notifyInfo(a === "clear" ? `Cleared the unusual-city designation from Major City ${r}.` : `Updated the unusual-city designation for Major City ${r}.`);
	} catch (e) {
		t.notifyError(`Unable to update unusual-city designation: ${e instanceof Error ? e.message : String(e)}`);
	}
}
//#endregion
//#region src/integrations/foundry/unusualCityInspectorRows.ts
function Gp(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Kp(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function qp(e) {
	return typeof e == "string" && e.length ? e : null;
}
function Jp(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Yp(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${Jp(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${Jp(t ?? "—")}</span></div>`;
}
function Xp(e) {
	let t = Af(e).find((e) => e.isMainworld), n = t?.social, r = t?.physical, i = wp(Gp(n?.majorCities));
	if (!t || !n || !i) return "<p class=\"hint\">No generated major cities are available for unusual-city designation.</p>";
	let a = Kp(n.techLevel) ?? 0, o = Kp(r?.atmosphereCode) ?? 0, s = Array.isArray(n.tradeCodes) ? n.tradeCodes.map(String) : [], c = Op({
		starport: qp(n.starport),
		hasHighport: !1,
		atmosphereCode: o,
		techLevel: a,
		tradeCodes: s
	}), l = Lp(e), u = c.dmTotal >= 0 ? `+${c.dmTotal}` : String(c.dmTotal), d = i.cities.map((e) => {
		let t = l[String(e.rank)], n = Ap(e.codes, e.rank, l), r = `${e.name}${n.length ? ` (${n.join(", ")})` : ""}: ${Math.trunc(e.population).toLocaleString("en-US")}: ${e.port ?? "—"}`, i = t ? `${r} — ${t.description}${t.source === "custom" ? " — custom Referee type" : ""}` : `${r} — normal city / no unusual designation`;
		return Yp(`Major City ${e.rank}`, i);
	}).join(""), f = c.dmBreakdown.length ? `<div style="padding:0.35rem 0;"><strong>Optional occurrence modifiers</strong><ul style="margin:0.3rem 0 0 1.25rem;">${c.dmBreakdown.map((e) => `<li>${Jp(`${e.source}: DM${e.dm >= 0 ? "+" : ""}${e.dm}`)}</li>`).join("")}</ul></div>` : "<p class=\"hint\">No optional unusual-city occurrence DMs apply.</p>";
	return [
		Yp("World Tech Level", a),
		Yp("Optional occurrence check", `2D 12+; world DM ${u}; natural roll ${c.effectiveNaturalRollRequired}+ required`),
		Yp("Automatic assignment", "None — Referee controlled"),
		Yp("Highport modifier", "Not applied — no highport has been established by TSG yet"),
		f,
		"<div style=\"padding:0.45rem 0 0.15rem;\"><strong>Major city designations</strong></div>",
		d
	].join("");
}
//#endregion
//#region src/rules/worlds/wbhSecondaryWorldGovernments.ts
function Zp(e) {
	return Number.isFinite(e) ? Math.max(0, Math.min(10, Math.trunc(e))) : 0;
}
function Qp(e) {
	return e <= 1 ? 0 : e === 2 ? 1 : e === 3 ? 2 : e === 4 ? 3 : 6;
}
function $p(e, t) {
	return e === 0 ? -2 : e === 6 ? t : 0;
}
function em(e, t) {
	let n = Zp(t.secondaryPopulationCode);
	if (n <= 0) throw Error("WBH secondary world government generation requires an inhabited secondary world.");
	if (t.affiliation === "dependent") {
		if (!Number.isFinite(t.ownerGovernmentCode)) throw Error("Dependent secondary worlds require an owning government code.");
		let r = Math.max(0, Math.trunc(t.ownerGovernmentCode)), i = Zp(t.ownerPopulationCode ?? 0);
		if (r === 6 && !Number.isFinite(t.ownerPopulationCode)) throw Error("Government 6 owners require the owning mainworld Population code for the WBH secondary-government DM.");
		let a = e.die(6), o = $p(r, i), s = a + o, c = Qp(s);
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
	let r = vc(e, n), i = r.governmentCode, a = i === 6;
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
function tm(e) {
	return Math.max(0, Math.min(18, Math.trunc(e)));
}
function nm(e, t, n = 0) {
	let r = e.roll(2, 6).total, i = t - 7 + n;
	return {
		roll: r,
		dm: i,
		law: tm(r + i)
	};
}
function rm(e, t) {
	let n = Math.max(0, Math.trunc(t.secondaryGovernmentCode)), r = t.affiliation === "dependent", i = Number.isFinite(t.ownerGovernmentCode) ? Math.max(0, Math.trunc(t.ownerGovernmentCode)) : null, a = Number.isFinite(t.ownerLawLevelCode) ? tm(t.ownerLawLevelCode) : null, o = t.penalColony === !0, s = t.militaryBase === !0, c = t.freeport === !0;
	if (r && n === 6) {
		if (a === null) throw Error("WBH captive secondary-world Law generation requires the owning authority Law Level.");
		let r = e.die(6), l = o || s ? 1 : 0, u = r + l, d = null, f = 0, p;
		if (u <= 2) {
			let t = nm(e, 6);
			d = t.roll, f = t.dm, p = t.law;
		} else u <= 4 ? p = a : u === 5 ? p = tm(a + 1) : (d = e.die(6), p = tm(a + d));
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
				let t = nm(e, n);
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
	let l = nm(e, n, c ? -1 : 0);
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
var im = "traveller-system-generator";
function am(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function om(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function sm(e) {
	return typeof e == "string" && e.length ? e : null;
}
function cm(e) {
	return e === !0 || e === "true" || e === "on" || e === 1;
}
function lm(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function um(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function dm(e) {
	return am(e.flags?.[im]);
}
function fm(e) {
	let t = am(dm(e)?.secondaryGovernmentOverrides);
	if (!t) return {};
	let n = {};
	for (let [e, r] of Object.entries(t)) {
		let t = am(r), i = am(t?.details), a = am(t?.lawDetails), o = am(t?.lawModifiers), s = t?.affiliation === "dependent" || t?.affiliation === "independent" ? t.affiliation : null;
		!t || !i || !s || (n[e] = {
			bodyId: e,
			affiliation: s,
			ownerId: sm(t.ownerId),
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
function pm(e) {
	return Af(e).filter((e) => !e.isMainworld && e.social && (om(e.social.populationCode) ?? 0) > 0);
}
function mm(e) {
	return Af(e).find((e) => e.isMainworld && e.social);
}
function hm(e, t) {
	let n = am(e.lawLevelDetails), r = Array.isArray(n?.balkanisedFactions) ? n.balkanisedFactions : [];
	for (let e of r) {
		let n = am(e), r = am(n?.details);
		if (n?.factionId === t) return om(r?.lawLevelCode);
	}
	return null;
}
function gm(e) {
	let t = mm(e);
	if (!t?.social) return [];
	let n = om(t.social.populationCode) ?? 0, r = om(t.social.governmentCode) ?? 0, i = om(t.social.lawLevelCode) ?? 0, a = [{
		id: t.id,
		label: `${t.label} — Government ${r}, Law ${i}`,
		governmentCode: r,
		populationCode: n,
		lawLevelCode: i
	}], o = am(t.social.balkanisation), s = Array.isArray(o?.factions) ? o.factions : [];
	for (let e of s) {
		let r = am(e), i = sm(r?.id), o = om(r?.governmentCode);
		if (!i || o === null) continue;
		let s = hm(t.social, i);
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
function _m(e) {
	return e.type === "world" && pm(e).length > 0 && gm(e).length > 0;
}
function vm(e) {
	let t = pm(e), n = gm(e), r = fm(e);
	return `
    <p class="hint">WBH requires the Referee to decide whether each inhabited secondary world is dependent on a mainworld authority or politically independent. TSG generates Government and overall Law Level after that choice.</p>
    <div class="form-group"><label>Secondary world</label><select name="bodyId">
      ${t.map((e) => {
		let t = r[e.id], n = om(e.social?.populationCode) ?? 0, i = t?.lawDetails?.lawLevelCode;
		return `<option value="${lm(e.id)}">${lm(`${e.label} — Population ${n}${t ? ` — ${t.affiliation}, Government ${t.details.governmentCode}${i == null ? "" : `, Law ${i}`}` : ""}`)}</option>`;
	}).join("")}
    </select></div>
    <div class="form-group"><label>Political status</label><select name="affiliation">
      <option value="dependent">Dependent on mainworld authority</option>
      <option value="independent">Independent</option>
      <option value="clear">Clear Referee government assignment</option>
    </select></div>
    <div class="form-group" data-owner-row><label>Owning authority</label><select name="ownerId">
      ${n.map((e) => `<option value="${lm(e.id)}">${lm(e.label)}</option>`).join("")}
    </select></div>
    <fieldset style="margin-top:0.5rem;"><legend>Secondary-world Law modifiers</legend>
      <label style="display:block;"><input type="checkbox" name="penalColony"> Penal colony</label>
      <label style="display:block;"><input type="checkbox" name="militaryBase"> Military base</label>
      <label style="display:block;"><input type="checkbox" name="freeport"> Freeport</label>
    </fieldset>
    <p class="hint">Government 6 dependencies use the WBH captive-world table; Penal Colony or Military Base applies DM+1. Government 1–3 dependencies use the owner-authority comparison. Other worlds roll Law normally; Freeport applies the optional Referee DM-1. These flags record the Referee decision until the full secondary-world classification workflow is implemented.</p>`;
}
function ym(e, t) {
	let n = e.querySelector("select[name=\"bodyId\"]"), r = e.querySelector("select[name=\"affiliation\"]"), i = e.querySelector("select[name=\"ownerId\"]"), a = e.querySelector("[data-owner-row]"), o = e.querySelector("input[name=\"penalColony\"]"), s = e.querySelector("input[name=\"militaryBase\"]"), c = e.querySelector("input[name=\"freeport\"]");
	if (!n || !r || !i || !a || !o || !s || !c) return;
	let l = fm(t), u = () => {
		let e = l[n.value];
		r.value = e?.affiliation ?? "dependent", e?.ownerId && Array.from(i.options).some((t) => t.value === e.ownerId) && (i.value = e.ownerId), o.checked = e?.lawModifiers?.penalColony ?? !1, s.checked = e?.lawModifiers?.militaryBase ?? !1, c.checked = e?.lawModifiers?.freeport ?? !1, a.style.display = r.value === "dependent" ? "" : "none";
	};
	r.addEventListener("change", () => {
		a.style.display = r.value === "dependent" ? "" : "none";
	}), n.addEventListener("change", u), u();
}
async function bm(e, t) {
	if (!t.isGameMaster()) return;
	if (!_m(e)) {
		t.notifyWarning("Secondary-government editing requires at least one inhabited secondary world and an inhabited mainworld authority.");
		return;
	}
	let n = await t.prompt({
		window: { title: `Edit Secondary Governments — ${e.name}` },
		content: vm(e),
		ok: { label: "Apply" },
		rejectClose: !1,
		modal: !1,
		render: (t, n) => ym(n.element, e)
	});
	if (!n) return;
	let r = sm(n.bodyId), i = pm(e).find((e) => e.id === r);
	if (!r || !i?.social) {
		t.notifyWarning("Select an inhabited secondary world.");
		return;
	}
	let a = { ...fm(e) }, o = sm(n.affiliation);
	if (o === "clear") delete a[r];
	else if (o === "dependent" || o === "independent") {
		let s = om(i.social.populationCode) ?? 0, c;
		if (o === "dependent") {
			let r = sm(n.ownerId);
			if (c = gm(e).find((e) => e.id === r), !c) {
				t.notifyWarning("Select a valid owning authority for this dependency.");
				return;
			}
		}
		let l = om(dm(e)?.generationSeed) ?? 1, u = em(new x(um(`wbh-secondary-government-affiliation-v1|${l}|${r}|${o}|${c?.id ?? "independent"}`)), {
			affiliation: o,
			secondaryPopulationCode: s,
			ownerGovernmentCode: c?.governmentCode,
			ownerPopulationCode: c?.populationCode,
			ownerId: c?.id
		}), d = {
			penalColony: cm(n.penalColony),
			militaryBase: cm(n.militaryBase),
			freeport: cm(n.freeport)
		}, f = rm(new x(um(`wbh-secondary-law-level-v1|${l}|${r}|${o}|${c?.id ?? "independent"}|${u.governmentCode}|${+!!d.penalColony}${+!!d.militaryBase}${+!!d.freeport}`)), {
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
		await e.update({ [`flags.${im}.secondaryGovernmentOverrides`]: a }), e.sheet?.render(!0), t.notifyInfo(o === "clear" ? `Cleared the Referee secondary-government assignment for ${r}.` : `Updated the secondary-government and Law assignment for ${r}.`);
	} catch (e) {
		t.notifyError(`Unable to update secondary government: ${e instanceof Error ? e.message : String(e)}`);
	}
}
//#endregion
//#region src/integrations/foundry/secondaryGovernmentInspectorRows.ts
function xm(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Sm(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${xm(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${xm(t ?? "—")}</span></div>`;
}
function Cm(e) {
	let t = fm(e), n = Af(e).filter((e) => !e.isMainworld && e.social && Number(e.social.populationCode ?? 0) > 0);
	return n.length ? [Sm("WBH policy", "Referee chooses dependency or independence for each inhabited secondary world; Government and overall Law Level then follow the WBH secondary-world cases."), ...n.map((e) => {
		let n = t[e.id];
		if (!n) return Sm(e.id, "No Referee secondary-government assignment");
		let r = n.details, i = n.affiliation === "dependent" ? n.ownerId ?? "—" : "Independent", a = n.affiliation === "dependent" ? `1D ${r.dependentRoll ?? "—"} DM${r.dependentDm >= 0 ? "+" : ""}${r.dependentDm} = ${r.dependentTotal ?? "—"}` : `ordinary Government 2D result ${r.independentGovernment?.roll ?? "—"} ${typeof r.independentGovernment?.modifier == "number" ? `${r.independentGovernment.modifier >= 0 ? "+" : ""}${r.independentGovernment.modifier}` : ""}`, o = n.lawDetails, s = o ? `Law ${o.lawLevelCode} — Case ${o.case}${o.penalColony ? " — Penal Colony" : ""}${o.militaryBase ? " — Military Base" : ""}${o.freeport ? " — Freeport" : ""}` : "Law not yet generated for this legacy assignment";
		return Sm(e.id, `${n.affiliation} — owner ${i} — Government ${r.governmentCode} — ${a} — ${s}${r.independentGovernmentSixReview ? " — REVIEW: independent Government 6" : ""}`);
	})].join("") : "<p class=\"hint\">No inhabited secondary worlds are currently present.</p>";
}
//#endregion
//#region src/integrations/foundry/technologyInspectorRows.ts
function Z(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function wm(e) {
	return Array.isArray(e) ? e : [];
}
function Tm(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Q(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${Tm(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${Tm(t ?? "—")}</span></div>`;
}
function $(e, t, n = !1) {
	return `<details${n ? " open" : ""} style="margin-top:0.5rem;padding:0.5rem;border:1px dashed var(--color-border-light-primary);border-radius:4px;"><summary style="cursor:pointer;font-weight:600;">${Tm(e)}</summary><div style="margin-top:0.4rem;">${t}</div></details>`;
}
function Em(e) {
	let t = wm(e).flatMap((e) => {
		let t = Z(e);
		if (!t) return [];
		let n = typeof t.source == "string" ? t.source : "DM", r = typeof t.dm == "number" ? t.dm : 0;
		return [`${n} ${r >= 0 ? "+" : ""}${r}`];
	});
	return t.length ? t.join("; ") : "None";
}
function Dm(e) {
	let t = Z(e);
	return t ? `2D ${t.roll ?? "—"} → ${typeof t.modifier == "number" && t.modifier >= 0 ? "+" : ""}${t.modifier ?? "—"}` : "—";
}
function Om(e, t) {
	let n = Z(t);
	return n ? $(e, [
		Q("Status", n.status ?? "complete"),
		Q("Tech Level", n.techLevel ?? "—"),
		Q("Base TL", n.baseTechLevel ?? "—"),
		Q("TLM", Dm(n.tlm)),
		Q("DMs", Em(n.dmBreakdown)),
		Q("DM total", n.dmTotal ?? 0),
		Q("Unbounded TL", n.unboundedTechLevel ?? "—"),
		Q("Bounds", `${n.lowerBound ?? "—"} to ${n.upperBound ?? "—"}`)
	].join("")) : Q(e, "—");
}
function km(e) {
	let t = Z(e);
	return t ? [
		Q("High Common TL input", t.highCommonTechLevel ?? "—"),
		Q("Minimum sustainable TL", t.minimumSustainableTechLevel ?? "—"),
		Q("Environmental meets sustainable minimum", t.environmentalMeetsSustainableMinimum === !0 ? "Yes" : t.environmentalMeetsSustainableMinimum === !1 ? "No" : "—"),
		Om("Energy", t.energy),
		Om("Electronics", t.electronics),
		Om("Manufacturing", t.manufacturing),
		Om("Medical", t.medical),
		Om("Environmental", t.environmental)
	].join("") : "<p class=\"hint\">No WBH Quality of Life Technology details are stored.</p>";
}
function Am(e) {
	let t = Z(e);
	return t ? [
		Q("Energy TL input", t.energyTechLevel ?? "—"),
		Q("Electronics TL input", t.electronicsTechLevel ?? "—"),
		Q("Manufacturing TL input", t.manufacturingTechLevel ?? "—"),
		Q("PCR", t.pcr ?? "Unavailable for this faction candidate"),
		Om("Land", t.land),
		Om("Water", t.water),
		Om("Air", t.air),
		Om("Space", t.space)
	].join("") : "<p class=\"hint\">No WBH Transportation Technology details are stored.</p>";
}
function jm(e) {
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
		Om("Personal Military", t.personal),
		Om("Heavy Military", t.heavy)
	].join("") : "<p class=\"hint\">No WBH Military Technology details are stored.</p>";
}
function Mm(e) {
	let t = Z(e);
	if (!t) return "<p class=\"hint\">No WBH Novelty Technology details are stored.</p>";
	let n = wm(t.factors).map(Z).filter((e) => !!e);
	return [
		Q("Status", t.status ?? "—"),
		Q("Novelty TL", t.techLevel ?? "—"),
		Q("High Common TL input", t.highCommonTechLevel ?? "—"),
		Q("Minimum sustainable TL", t.minimumSustainableTechLevel ?? "—"),
		Q("Highest subcategory TL", t.highestSubcategoryTechLevel ?? "—"),
		Q("Nearby rich/industrial Class A TL", t.nearbyRichIndustrialClassATechLevel ?? "Unresolved / none established"),
		Q("Previous culture TL", t.previousCultureTechLevel ?? "Unresolved / none established"),
		Q("Survivable prototype TL", t.survivablePrototypeTechLevel ?? "Not required"),
		Q("Unresolved factors", wm(t.unresolvedFactors).join(", ") || "None"),
		$("Novelty factors", n.map((e) => Q(String(e.source ?? "Factor"), `${e.status ?? "—"}${typeof e.techLevel == "number" ? ` — TL${e.techLevel}` : ""}: ${e.note ?? ""}`)).join(""))
	].join("");
}
function Nm(e) {
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
		Q("Provisional reasons", wm(t.provisionalReasons).join("; ") || "None")
	].join("");
}
function Pm(e) {
	let t = Z(e.commonTechnologyDetails);
	if (!t) return "<p class=\"hint\">No WBH Common Technology details are stored for this body.</p>";
	let n = Z(t.minimumSustainable);
	return [
		Q("UWP / High Common TL", t.highCommonTechLevel ?? e.techLevel ?? "—"),
		Q("Low Common TL", t.lowCommonTechLevel ?? "—"),
		Q("Low Common TLM", Dm(t.lowCommonTlm)),
		Q("Low Common DMs", Em(t.lowCommonDmBreakdown)),
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
function Fm(e) {
	let t = Z(e.balkanisedCommonTechnologyDetails);
	if (!t) return "";
	let n = wm(t.factions).map(Z).filter((e) => !!e);
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
				Q("Non-host High TLM", Dm(n?.highCommonTlm)),
				Q("Non-host High DMs", Em(n?.highCommonDmBreakdown)),
				Q("Non-host Low Common TL", n?.lowCommonTechLevel ?? "Incomplete — faction PCR not established"),
				Q("Non-host Low DMs", Em(n?.lowCommonDmBreakdown))
			].join(""));
		})
	].join(""));
}
function Im(e, t, n) {
	let r = Z(e);
	if (!r) return `<p class="hint">${Tm(n)}</p>`;
	let i = Z(r.world);
	if (i) return t(i);
	let a = wm(r.factions).map(Z).filter((e) => !!e);
	return a.length ? a.map((e) => $(`Faction ${e.factionId ?? "?"} candidates`, [$("Starport host / adjacent", t(e.hostOrAdjacent), !0), $("Non-host", t(e.nonHost), !1)].join(""))).join("") : `<p class="hint">${Tm(n)}</p>`;
}
function Lm(e) {
	let t = Z(e);
	return t ? t.populationCode === 0 ? "<p class=\"hint\">Population 0: no inhabited-world Technology profile is generated.</p>" : [
		$("Technology Profile", Im(t.technologyProfileDetails, Nm, "No final WBH Technology Profile is stored."), !0),
		$("Common Technology", Pm(t), !0),
		Fm(t),
		$("Quality of Life Technology", Im(t.qualityOfLifeTechnologyDetails, km, "No WBH Quality of Life Technology details are stored."), !0),
		$("Transportation Technology", Im(t.transportationTechnologyDetails, Am, "No WBH Transportation Technology details are stored."), !0),
		$("Military Technology", Im(t.militaryTechnologyDetails, jm, "No WBH Military Technology details are stored."), !0),
		$("Novelty Technology", Im(t.noveltyTechnologyDetails, Mm, "No WBH Novelty Technology details are stored."), !0),
		"<p class=\"hint\" style=\"margin:0.55rem 0 0;\">Secondary-world Technology remains follow-on work.</p>"
	].join("") : "<p class=\"hint\">No inhabited social profile is stored for this body.</p>";
}
//#endregion
//#region src/integrations/foundry/wbhInspectorSecondaryPopulations.ts
var Rm = "traveller-system-generator";
function zm(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Bm(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Vm(e, t) {
	return `<details style="border:1px solid var(--color-border-light-primary);border-radius:6px;padding:0.65rem;"><summary style="cursor:pointer;font-weight:700;">${Bm(e)}</summary><div style="margin-top:0.5rem;">${t}</div></details>`;
}
function Hm(e) {
	return zm(zm(e.flags?.[Rm])?.sensorSystem)?.secondaryPopulationPlan ?? null;
}
function Um(e, t) {
	let n = e.indexOf("<div data-wbh-selected-body>");
	if (n < 0) return e;
	let r = [
		Vm("Secondary World Populations", xp(Hm(t))),
		Vm("Secondary World Governments", Cm(t)),
		Vm("Unusual Cities", Xp(t))
	].join("\n    ");
	return `${e.slice(0, n)}${r}\n    ${e.slice(n)}`;
}
function Wm(e, t) {
	let n = e.querySelector("select[name=\"wbhInspectorBodyId\"]"), r = e.querySelector("[data-wbh-selected-body] > [data-wbh-body-panel]");
	if (!n || !r || r.querySelector("[data-wbh-technology-section]")) return;
	let i = Af(t).find((e) => e.id === n.value);
	if (!i) return;
	let a = document.createElement("div");
	a.dataset.wbhTechnologySection = "true", a.innerHTML = Vm("Technology", Lm(i.social));
	let o = Array.from(r.children).find((e) => (e.querySelector?.(":scope > summary"))?.textContent?.trim() === "Physical");
	r.insertBefore(a, o ?? null);
}
function Gm(e, t) {
	Wm(e, t);
	let n = e.querySelector("select[name=\"wbhInspectorBodyId\"]");
	n && n.addEventListener("change", () => Wm(e, t));
}
async function Km(e, t, n) {
	await np(e, {
		...t,
		prompt: async (n) => t.prompt({
			...n,
			content: Um(n.content, e),
			render: (t, r) => {
				n.render?.(t, r), Gm(r.element, e);
			}
		})
	}, n);
}
//#endregion
//#region src/integrations/foundry/actorContextMenuV14.ts
function qm(e, t) {
	let n = uf(e);
	return t.listGeneratedActors().find((e) => e.id === n);
}
function Jm(e, t, n) {
	e.push({
		label: t.localizer.localize("TSG.Manager.ContextManage"),
		icon: "<i class=\"fa-solid fa-solar-system\"></i>",
		visible: (e) => {
			let n = qm(e, t);
			return !!(t.isGameMaster() && n?.type === "world");
		},
		onClick: (e, r) => {
			let i = qm(r, t);
			i && Cf(t, n, {
				initialActorId: i.id,
				initialAction: Md(i) ? "adopt" : "update"
			});
		}
	});
}
function Ym(e, t, n) {
	e.push({
		label: "Traveller System Generator: Inspect WBH Details",
		icon: "<i class=\"fa-solid fa-magnifying-glass-chart\"></i>",
		visible: (e) => {
			let n = qm(e, t);
			return !!(t.isGameMaster() && n && Of(n));
		},
		onClick: (e, r) => {
			let i = qm(r, t);
			i && Km(i, t, n);
		}
	}), e.push({
		label: "Traveller System Generator: Edit Unusual Cities",
		icon: "<i class=\"fa-solid fa-city\"></i>",
		visible: (e) => {
			let n = qm(e, t);
			return !!(t.isGameMaster() && n && Vp(n));
		},
		onClick: (e, n) => {
			let r = qm(n, t);
			r && Wp(r, t);
		}
	}), e.push({
		label: "Traveller System Generator: Edit Secondary Governments",
		icon: "<i class=\"fa-solid fa-landmark\"></i>",
		visible: (e) => {
			let n = qm(e, t);
			return !!(t.isGameMaster() && n && _m(n));
		},
		onClick: (e, n) => {
			let r = qm(n, t);
			r && bm(r, t);
		}
	}), n && e.push({
		label: "Traveller System Generator: Edit Habitation",
		icon: "<i class=\"fa-solid fa-people-roof\"></i>",
		visible: (e) => {
			let n = qm(e, t);
			return !!(t.isGameMaster() && n && lp(n));
		},
		onClick: (e, r) => {
			let i = qm(r, t);
			i && mp(i, t, n);
		}
	});
}
//#endregion
//#region src/integrations/foundry/settingsControl.ts
var Xm = "traveller-system-generator", Zm = "useDefaultSystemFolder", Qm = "defaultSystemFolderId";
function $m(e, t) {
	return Object.fromEntries([["", t.localize("TSG.Dialog.ActorFolderRoot")], ...vd(e).map((e) => [e.id, e.path])]);
}
function eh(e, t) {
	e.register(Xm, Zm, {
		name: t.localize("TSG.Settings.UseDefaultFolder.Name"),
		hint: t.localize("TSG.Settings.UseDefaultFolder.Hint"),
		scope: "world",
		config: !0,
		type: Boolean,
		default: !1
	}), e.register(Xm, Qm, {
		name: t.localize("TSG.Settings.DefaultFolder.Name"),
		hint: t.localize("TSG.Settings.DefaultFolder.Hint"),
		scope: "world",
		config: !0,
		type: String,
		choices: { "": t.localize("TSG.Dialog.ActorFolderRoot") },
		default: ""
	});
}
async function th(e) {
	let t = $m(e.listActorFolders(), e.localizer), n = e.settings.settings.get(`${Xm}.${Qm}`);
	n && (n.choices = t);
	let r = String(e.settings.get("traveller-system-generator", "defaultSystemFolderId") ?? "");
	r && !(r in t) && (await e.settings.set(Xm, Qm, ""), e.settings.get("traveller-system-generator", "useDefaultSystemFolder") && e.notifyWarning(e.localizer.localize("TSG.Notification.DefaultFolderMissing")));
}
function nh(e, t) {
	if (!e.get("traveller-system-generator", "useDefaultSystemFolder")) return null;
	let n = String(e.get("traveller-system-generator", "defaultSystemFolderId") ?? "");
	return n && t.some((e) => e.id === n) ? n : null;
}
//#endregion
//#region src/integrations/foundry/bootstrap.ts
function rh(e) {
	let t = zu();
	e.Hooks.once("init", () => {
		Bu(e.getModules(), t);
		let n = e.getDefaultFolderSettingsEnvironment();
		eh(n.settings, n.localizer);
	}), e.Hooks.once("ready", () => {
		th(e.getDefaultFolderSettingsEnvironment());
	});
	for (let t of [
		"createFolder",
		"updateFolder",
		"deleteFolder"
	]) e.Hooks.on(t, () => {
		th(e.getDefaultFolderSettingsEnvironment());
	});
	e.Hooks.on("getSceneControlButtons", (n) => {
		wf(n, e.getManagerEnvironment(), t);
	}), e.Hooks.on("getActorContextOptions", (n, r) => {
		let i = e.getManagerEnvironment();
		Jm(r, i, t), Ym(r, i, t);
	});
}
function ih(e) {
	return typeof e == "string" ? e || null : e?.id ?? null;
}
function ah(e) {
	return e.filter((e) => e.type === "Actor").map(({ id: e, name: t, folder: n, parent: r }) => ({
		id: e,
		name: t,
		parentId: ih(n ?? r)
	}));
}
function oh(e, t) {
	let n = new Map(t.map((e) => [e.id, e])), r = [], i = /* @__PURE__ */ new Set(), a = ih(e.folder);
	for (; a && !i.has(a);) {
		i.add(a);
		let e = n.get(a);
		if (!e) break;
		r.unshift(e.name), a = ih(e.folder ?? e.parent);
	}
	return r.join(" / ");
}
if (typeof Hooks < "u") {
	let e = {
		localize: (e) => game.i18n.localize(e),
		format: (e, t) => game.i18n.format(e, t)
	}, t = (e) => foundry.applications.api.DialogV2.input(e), n = () => ah(Array.from(game.folders));
	rh({
		Hooks,
		getModules: () => game.modules,
		getDefaultFolderSettingsEnvironment: () => ({
			settings: game.settings,
			localizer: e,
			listActorFolders: n,
			notifyWarning: (e) => ui.notifications.warn(e)
		}),
		getManagerEnvironment: () => {
			let n = Array.from(game.folders), r = ah(n);
			return {
				isGameMaster: () => game.user.isGM,
				canCreateActor: () => Actor.implementation.canUserCreate(game.user),
				listActorFolders: () => r,
				defaultSystemFolderId: () => nh(game.settings, r),
				listGeneratedActors: () => Array.from(game.actors).map((e) => Object.assign(e, {
					folderId: ih(e.folder),
					folderPath: oh(e, n.filter((e) => e.type === "Actor"))
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
export { rh as registerFoundryBootstrap };
