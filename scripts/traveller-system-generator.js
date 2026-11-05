//#region src/core/ehex.ts
var e = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function t(t) {
	if (!Number.isInteger(t) || t < 0 || t >= 34) throw Error(`Value out of eHex range: ${t}`);
	return e[t];
}
function n(t) {
	let n = t.length === 1 ? e.indexOf(t.toUpperCase()) : -1;
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
//#region src/core/seed.ts
function ee(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
//#endregion
//#region src/core/streams.ts
function C(e, t, n, r = !1) {
	return r ? {
		prefix: e,
		nullish: t,
		rolls: n,
		keyedOnSystemName: !0
	} : {
		prefix: e,
		nullish: t,
		rolls: n
	};
}
var te = {
	physicalDetails: C("wbh-physical-v1", "empty", "Precise diameter, density, gravity and atmosphere taint details"),
	rotation: C("wbh-rotation-v1", "empty", "Sidereal day length and axial tilt"),
	tidalLock: C("wbh-tidal-lock-v1", "empty", "Tidal-lock checks for each lock candidate"),
	climate: C("wbh-climate-v1", "empty", "Mean temperature variation and seasons"),
	atmosphereGasMix: C("wbh-atmosphere-gas-mix-v1", "empty", "Atmosphere gas composition"),
	unusualAtmosphere: C("wbh-unusual-atmosphere-v1", "empty", "Unusual (code F) atmosphere subtype and details"),
	hydrographicsCode: C("wbh-hydrographics-code-v2", "text", "Hydrographics code for Size 2+ worlds with Atmosphere 0-1 (a fork of the shared stream)"),
	hydrographics: C("wbh-hydrographics-v1", "empty", "Hydrographics coverage detail"),
	surfaceFeatures: C("wbh-surface-features-v1", "empty", "Surface feature distribution"),
	hydrographicsLiquids: C("wbh-hydrographics-liquids-v1", "empty", "Exotic surface liquids"),
	seismology: C("wbh-seismology-v2", "text", "Seismic event count roll"),
	surfaceGeology: C("wbh-surface-geology-v1", "text", "Tectonic plates and surface geology features"),
	nativeLife: C("wbh-native-life-v1", "empty", "Native biomass, biodiversity, compatibility and sophont checks"),
	resourceRating: C("wbh-resource-rating-v1", "empty", "Resource rating roll"),
	planetoidBelt: C("wbh-planetoid-belt-prereq-v1", "text", "Planetoid belt composition and bulk"),
	satellites: C("wbh-satellites-v1", "empty", "Significant moons and rings of terrestrial worlds"),
	gasGiantSatellites: C("wbh-gas-giant-satellites-v1", "empty", "Significant moons and rings of gas giants"),
	moonPhysical: C("wbh-moon-physical-v1", "empty", "Physical profile of each significant moon"),
	gasGiantSizing: C("wbh-gas-giant-v1", "empty", "Gas giant category, diameter and mass"),
	gasGiantMoonSmall: C("wbh-gas-giant-moon-small-v1", "empty", "Diameter and mass of a Small gas giant orbiting as a moon"),
	gasGiantMoonMedium: C("wbh-gas-giant-moon-medium-v1", "empty", "Diameter and mass of a Medium gas giant orbiting as a moon"),
	scienceGasGiantAtmosphere: C("science-gas-giant-atmosphere-v1", "empty", "Science-enhanced gas giant atmosphere model"),
	moonSocial: C("wbh-moon-social-v2", "text", "Social profile of an inhabited significant moon"),
	populationConcentration: C("wbh-social-pcr-v1", "text", "Population concentration rating"),
	urbanisation: C("wbh-social-urbanisation-v1", "text", "Urbanisation percentage"),
	majorCities: C("wbh-social-major-cities-v1", "text", "Major city count and populations"),
	balkanisation: C("wbh-social-balkanisation-v1", "text", "Balkanisation check and faction count"),
	governmentFactions: C("wbh-social-government-factions-v1", "text", "Faction governments and strengths"),
	centralisation: C("wbh-social-centralisation-v1", "text", "Government centralisation"),
	continuationPopulation: C("wbh-continuation-population-v1", "text", "Population expansion of an imported continuation UWP"),
	secondaryPopulations: C("wbh-secondary-populations-v1", "text", "Secondary world population plan", !0),
	secondaryGovernmentAffiliation: C("wbh-secondary-government-affiliation-v1", "text", "Government of a Referee-assigned secondary world"),
	secondaryLawLevel: C("wbh-secondary-law-level-v1", "text", "Law level of a Referee-assigned secondary world"),
	lawLevelBalkanisation: C("wbh-social-law-level-balkanisation-v1", "text", "Law level of each faction on a balkanised world", !0),
	judicialSystem: C("wbh-social-judicial-system-v1", "text", "Judicial system", !0),
	lawUniformity: C("wbh-social-law-uniformity-v1", "text", "Law uniformity", !0),
	presumptionOfInnocence: C("wbh-social-presumption-innocence-v1", "text", "Presumption of innocence", !0),
	deathPenalty: C("wbh-social-death-penalty-v1", "text", "Death penalty", !0),
	lawSubclassifications: C("wbh-social-law-subclassifications-v1", "text", "Law subclassification codes", !0),
	commonTechnology: C("wbh-social-common-technology-v1", "text", "Common technology level modifiers", !0),
	balkanisedCommonTechnology: C("wbh-social-balkanised-common-technology-v1", "text", "Common technology of each faction", !0),
	qualityOfLifeTechnology: C("wbh-social-quality-of-life-technology-v1", "text", "Quality-of-life technology categories", !0),
	transportationTechnology: C("wbh-social-transportation-technology-v1", "text", "Transportation technology categories", !0),
	militaryTechnology: C("wbh-social-military-technology-v1", "text", "Military technology categories", !0),
	orbitalState: C("tsg-orbital-state-v1", "text", "Mean anomaly at the system epoch (a hash, no dice)", !0)
};
function ne(e, t) {
	return e == null && t === "empty" ? "" : String(e);
}
function w(e, ...t) {
	let { prefix: n, nullish: r } = te[e];
	return [n, ...t.map((e) => ne(e, r))].join("|");
}
function re(e, ...t) {
	return [e, ...t.map((e) => ne(e, "text"))].join("|");
}
function ie(e) {
	return new S(ee(e));
}
function T(e, ...t) {
	return ie(w(e, ...t));
}
function ae(e, ...t) {
	return ee(w(e, ...t));
}
function oe(e, t, ...n) {
	return e.fork(w(t, ...n));
}
function se(e, t) {
	return new S(e + Math.imul(t, 2654435761) >>> 0);
}
function ce(e, t) {
	return new S(e + Math.imul(t + 101, 2246822507) >>> 0);
}
//#endregion
//#region src/rules/worlds/scienceEnhancedGasGiantAtmosphere.ts
function le(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function ue(e, t = 4) {
	let n = 10 ** t;
	return Math.round(e * n) / n;
}
function de(e, t, n, r) {
	return T("scienceGasGiantAtmosphere", e.id, e.aroundDesignation, e.orbitNumber, e.au, t.designation, t.luminositySolar, n, r);
}
function fe(e, t) {
	let n = Math.max(e.luminositySolar, 1e-6), r = Math.max(t.au, .001);
	return 278.5 * n ** .25 / Math.sqrt(r);
}
function pe(e) {
	return le(75 + 15 * Math.log10(Math.max(e, 10) / 10), 75, 130);
}
function me(e, t, n) {
	let r = fe(e, t), i = pe(n), a = (r ** 4 + i ** 4) ** .25;
	return {
		irradiation: ue(r, 1),
		reference: ue(a * 1.25, 1)
	};
}
function he(e) {
	return e < 250 ? "cold" : e < 500 ? "cool" : e < 1e3 ? "warm" : e < 1600 ? "hot" : "ultra-hot";
}
function ge(e) {
	return 1 / (1 + Math.exp(-e));
}
function _e(e, t) {
	return ue(le(8 * (Math.max(t, 20) / 30) ** -.45 * (.9 + e.die(201) / 1e3), 1.2, 10), 2);
}
function ve(e, t) {
	return le((t === "Small" ? .15 : t === "Medium" ? .11 : .1) + (e.die(31) - 16) / 1e3, .06, .19);
}
function ye(e, t, n, r) {
	let i = e === "Small" ? 2 : e === "Medium" ? 1.3 : 1, a = le(.0012 * n * i, .001, .04), o = le(12e-5 * n, 5e-5, .004), s = le(25e-6 * n, 1e-5, .0015), c = ge((t - 600) / 120), l = le(2e-6 * n + 4e-4 * n * c, 2e-6, .02), u = ge((t - 950) / 150), d = ge((t - 700) / 150), f = a * (1 - u), p = a * u, m = o * (1 - d), h = o * d, g = l, _ = s, v = f + p + m + h + g + _, y = Math.max(0, 1 - v), b = y * ve(r, e), x = [
		{
			name: "Molecular hydrogen",
			code: "H2",
			fraction: y - b
		},
		{
			name: "Helium",
			code: "He",
			fraction: b
		},
		{
			name: "Methane",
			code: "CH4",
			fraction: f
		},
		{
			name: "Ammonia",
			code: "NH3",
			fraction: m
		},
		{
			name: "Water vapour",
			code: "H2O",
			fraction: g
		},
		{
			name: "Carbon monoxide",
			code: "CO",
			fraction: p
		},
		{
			name: "Nitrogen",
			code: "N2",
			fraction: h
		},
		{
			name: "Hydrogen sulfide",
			code: "H2S",
			fraction: _
		}
	].map((e) => ({
		name: e.name,
		code: e.code,
		percentage: ue(e.fraction * 100, 4)
	})), S = x.reduce((e, t) => e + t.percentage, 0);
	return x[0].percentage = ue(x[0].percentage + (100 - S), 4), x;
}
function be(e, t, n, r) {
	let i = de(e, t, n, r), a = me(t, e, r), o = he(a.reference), s = _e(i, r), c = ye(n, a.reference, s, i);
	return {
		method: "TSG science-enhanced gas giant atmosphere",
		model: "science-enhanced-v1",
		compositionBasis: "TSG science-informed estimated mole percent",
		primaryConstituent: "Hydrogen",
		dominantConstituents: ["Hydrogen", "Helium"],
		referencePressureBar: 1,
		referenceRegion: "nominal 1-bar upper-troposphere reference layer",
		irradiationTemperatureK: a.irradiation,
		referenceTemperatureK: a.reference,
		chemistryRegime: o,
		enrichmentFactorSolar: s,
		quantitativeComposition: c,
		hydrogenSkimmable: !0,
		profile: `SCI1-${o.toUpperCase()}-H2He`,
		generationNotes: [
			"Science Enhanced v1 is a TSG science-informed estimate, not a World Builder's Handbook generation rule.",
			"Composition is expressed as estimated mole percent near a nominal 1-bar upper-troposphere reference layer, not as whole-planet bulk composition.",
			"The temperature proxy combines stellar irradiation with a simple mass-dependent intrinsic-heat floor; it is not a radiative-convective atmosphere solution.",
			"A bounded inverse mass/enrichment prior influences separate carbon, nitrogen, sulfur, and water-vapour abundance scales; it is not treated as a measured atmospheric metallicity.",
			"Carbon and nitrogen shift smoothly from CH4/NH3 toward CO/N2 as reference temperature rises, while cold water vapour is suppressed to reflect condensation.",
			"Vertical mixing, chemical quenching, photochemistry, cloud microphysics, and detailed pressure-temperature chemistry are not simulated.",
			"The model uses an isolated deterministic science-gas-giant-atmosphere-v1 seed and does not consume the established system-generation RNG stream."
		]
	};
}
//#endregion
//#region src/rules/orbits/orbitNumbers.ts
var xe = /* @__PURE__ */ new Map([
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
]), Se = 0, Ce = 20;
function we(e) {
	if (!Number.isFinite(e)) throw Error(`Orbit# ${e} is not finite.`);
	if (e < Se) throw Error(`Orbit# ${e} is below supported range.`);
	if (e > Ce) return xe.get(Ce) * 2 ** (e - Ce);
	let t = Math.floor(e), n = Math.ceil(e), r = xe.get(t), i = xe.get(n);
	if (r === void 0 || i === void 0) throw Error(`Orbit# ${e} is outside supported range.`);
	if (t === n) return r;
	let a = e - t;
	return r + (i - r) * a;
}
function Te(e) {
	if (!Number.isFinite(e)) throw Error(`AU ${e} is not finite.`);
	if (e < 0) throw Error(`AU ${e} is below supported range.`);
	let t = [...xe.entries()].sort((e, t) => e[0] - t[0]);
	if (e === 0) return Se;
	for (let n = 0; n < t.length - 1; n += 1) {
		let [r, i] = t[n], [a, o] = t[n + 1];
		if (e >= i && e <= o) return r + (e - i) / (o - i);
	}
	let [n, r] = t.at(-1);
	return n + Math.log2(e / r);
}
function E(e, t = 3) {
	return Number(e.toFixed(t));
}
//#endregion
//#region src/rules/system/wbhStellarEnvironment.ts
function Ee(e, t) {
	return e.filter((e) => e.orbitClass === "Companion" && e.parentId === t);
}
function De(e, t, n) {
	e.some((e) => e.id === t.id) || e.push(t);
	for (let r of Ee(n, t.id)) e.some((e) => e.id === r.id) || e.push(r);
}
function Oe(e, t) {
	let n = t.find((t) => t.id === e.aroundStarId);
	if (!n) return [];
	let r = [];
	if (De(r, n, t), n.orbitClass !== "Primary") return r;
	let i = t.filter((e) => e.orbitClass === "Close" || e.orbitClass === "Near" || e.orbitClass === "Far").filter((t) => typeof t.orbitNumber == "number" && t.orbitNumber <= e.orbitNumber).sort((e, t) => (e.orbitNumber ?? 0) - (t.orbitNumber ?? 0));
	for (let e of i) De(r, e, t);
	return r;
}
function ke(e, t) {
	let n = t.find((t) => t.id === e.aroundStarId);
	if (!n) return null;
	let r = Oe(e, t), i = r.length > 0 ? r : [n];
	return {
		anchorStar: n,
		interiorStars: i,
		interiorStarIds: i.map((e) => e.id),
		totalMassSolar: E(i.reduce((e, t) => e + Math.max(0, t.massSolar), 0), 6),
		totalLuminositySolar: E(i.reduce((e, t) => e + Math.max(0, t.luminositySolar), 0), 6)
	};
}
function Ae(e, t) {
	let n = ke(e, t);
	return n ? {
		...n.anchorStar,
		massSolar: n.totalMassSolar,
		luminositySolar: n.totalLuminositySolar
	} : null;
}
//#endregion
//#region src/rules/system/applyGasGiantAtmosphereModel.ts
function je(e, t, n) {
	if (!e?.details) return e;
	let r = e.details.gasGiant, i = r && {
		...r,
		atmosphere: be(t, n, r.category, r.massTerra)
	}, a = e.details.satellites, o = a && {
		...a,
		moons: a.moons.map((e, r) => {
			if (!e.physical?.details?.gasGiant) return e;
			let i = {
				...t,
				id: e.sourceId ?? `${t.id}.moon-${r + 1}`,
				physical: e.physical,
				eccentricity: e.eccentricity
			};
			return {
				...e,
				physical: je(e.physical, i, n)
			};
		})
	};
	return {
		...e,
		details: {
			...e.details,
			gasGiant: i,
			satellites: o
		}
	};
}
function Me(e) {
	return e.generationSettings?.gasGiantAtmosphereModel === "science-enhanced" ? {
		...e,
		worlds: e.worlds.map((t) => {
			let n = Ae(t, e.stars) ?? e.stars.find((e) => e.id === t.aroundStarId) ?? e.primary;
			return {
				...t,
				physical: je(t.physical, t, n)
			};
		})
	} : e;
}
//#endregion
//#region src/rules/worlds/wbhCommonTechnology.ts
function Ne(e) {
	let t = Math.max(2, Math.min(12, Math.trunc(e)));
	return t === 2 ? -3 : t === 3 ? -2 : t === 4 ? -1 : t <= 9 ? 0 : t === 10 ? 1 : t === 11 ? 2 : 3;
}
function Pe(e) {
	let t = e.roll(2, 6).total;
	return {
		roll: t,
		modifier: Ne(t)
	};
}
function Fe(e) {
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
function Ie(e) {
	return e === null ? null : e === 0 ? 8 : e <= 2 ? 5 : e <= 7 ? 3 : null;
}
function Le(e, t) {
	let n = Fe(e), r = Ie(t), i = Math.max(n ?? 0, r ?? 0), a = ["May 2024 WBH minimum sustainable Tech Level uses the highest applicable Atmosphere and Habitability minimum.", "Atmosphere F uses the published minimum floor of TL8; specific conditions may justify TL10 or higher at Referee discretion."];
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
function Re(e, t, n) {
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
function ze(e, t) {
	let n = Math.max(0, Math.trunc(t.highCommonTechLevel)), r = Pe(e), i = Re(t.populationCode, t.governmentCode, t.pcr), a = i.reduce((e, t) => e + t.dm, 0), o = Math.floor(n / 2), s = n, c = n + r.modifier + a, l = Math.max(o, Math.min(s, c)), u = Le(t.atmosphereCode, t.habitabilityRating);
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
function Be(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Ve(e) {
	let t = Be(e.populationConcentration);
	return typeof t?.rating == "number" ? t.rating : null;
}
function He(e) {
	let t = e.physical?.details?.habitabilityRating?.rating;
	return typeof t == "number" ? t : null;
}
function Ue(e, t, n) {
	if (n.populationCode === 0) return {
		...n,
		commonTechnologyDetails: null
	};
	let r = ze(T("commonTechnology", e, t.id, n.uwp), {
		highCommonTechLevel: n.techLevel,
		populationCode: n.populationCode,
		governmentCode: n.governmentCode,
		pcr: Ve(n),
		atmosphereCode: t.physical?.atmosphereCode ?? null,
		habitabilityRating: He(t)
	});
	return {
		...n,
		commonTechnologyDetails: r
	};
}
function We(e, t, n, r) {
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
		social: Ue(e, a, n.social)
	};
}
function Ge(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.physical?.details?.satellites, r = t.social ? Ue(e.id, t, t.social) : t.social;
			return n ? {
				...t,
				social: r,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...n,
							moons: n.moons.map((n, r) => We(e.id, t, n, r))
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
function Ke(e) {
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
function qe(e, t) {
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
function Je(e, t) {
	let n = Math.max(0, Math.trunc(t.worldHighCommonTechLevel)), r = Math.max(0, Math.min(n, Math.trunc(t.worldLowCommonTechLevel))), i = Math.max(0, Math.trunc(t.faction.governmentCode)), a = Pe(e), o = Ke(i), s = o.reduce((e, t) => e + t.dm, 0), c = n - 2 + a.modifier + s, l = Math.max(r, Math.min(n, c)), u = Ke(i);
	t.factionPcr !== null && t.factionPcr >= 7 && u.push({
		source: `Faction PCR ${t.factionPcr}`,
		dm: 1
	});
	let d = u.reduce((e, t) => e + t.dm, 0), f = t.factionPcr !== null, p = f ? r + d : null, m = p === null ? null : Math.max(r, Math.min(l, p));
	return {
		factionId: t.faction.id,
		governmentCode: i,
		hostOrAdjacentCandidate: qe(n, r),
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
function Ye(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Xe(e, t, n) {
	let r = Ye(n.commonTechnologyDetails), i = Ye(n.balkanisation), a = Array.isArray(i?.factions) ? i.factions : [];
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
			let i = Ye(r);
			return !i || typeof i.id != "string" || typeof i.governmentCode != "number" ? [] : [Je(T("balkanisedCommonTechnology", e, t, i.id, n.uwp), {
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
function Ze(e, t, n, r) {
	if (!n.social) return n;
	let i = n.sourceId ?? `${t.id}.moon-${r + 1}`;
	return {
		...n,
		social: Xe(e, i, n.social)
	};
}
function Qe(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.social ? Xe(e.id, t.id, t.social) : t.social, r = t.physical?.details?.satellites;
			return r ? {
				...t,
				social: n,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...r,
							moons: r.moons.map((n, r) => Ze(e.id, t, n, r))
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
function $e(e, t, n) {
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
function et(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function tt(e, t, n) {
	if (n.populationCode === 0) return {
		method: "WBH death penalty audit",
		world: null,
		balkanisedFactions: [],
		generationNotes: ["Not applicable: Population 0 has no inhabited society or formal criminal penalties."]
	};
	if (n.governmentCode !== 7) return {
		method: "WBH death penalty audit",
		world: $e(T("deathPenalty", e, t, n.uwp), n.governmentCode, n.lawLevelCode),
		balkanisedFactions: [],
		generationNotes: []
	};
	let r = et(n.judicialSystemDetails), i = Array.isArray(r?.balkanisedFactions) ? r.balkanisedFactions : [], a = [];
	for (let r of i) {
		let i = et(r), o = typeof i?.factionId == "string" ? i.factionId : null, s = et(i?.details), c = typeof s?.governmentCode == "number" ? s.governmentCode : null, l = typeof s?.lawLevelCode == "number" ? s.lawLevelCode : null;
		!o || c === null || l === null || a.push({
			factionId: o,
			details: $e(T("deathPenalty", e, t, n.uwp, o), c, l)
		});
	}
	return {
		method: "WBH death penalty audit",
		world: null,
		balkanisedFactions: a,
		generationNotes: ["Government 7 determines death-penalty status separately for each represented sovereign faction."]
	};
}
function nt(e, t) {
	t.social && (t.social.deathPenaltyDetails = tt(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		i.social && (i.social.deathPenaltyDetails = tt(e, i.sourceId ?? `${t.id}.moon-${r + 1}`, i.social));
	}
}
function rt(e) {
	for (let t of e.worlds) nt(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhJusticeProfile.ts
function it(e) {
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
function D(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function at(e) {
	return e === "N" || e === "I" || e === "A" || e === "T" ? e : null;
}
function ot(e) {
	return e === "P" || e === "T" || e === "U" ? e : null;
}
function st(e) {
	return e === "Y" || e === "N" ? e : null;
}
function ct(e) {
	let t = D(D(e.judicialSystemDetails)?.world), n = D(t?.secondarySystem), r = D(D(e.lawUniformityDetails)?.world), i = D(D(e.presumptionOfInnocenceDetails)?.world), a = D(D(e.deathPenaltyDetails)?.world);
	return {
		primaryJudicialSystemCode: at(t?.code),
		secondaryJudicialSystemCode: at(n?.code),
		lawUniformityCode: ot(r?.code),
		presumptionOfInnocenceCode: st(i?.code),
		deathPenaltyCode: st(a?.code)
	};
}
function lt(e, t) {
	let n = D(e), r = Array.isArray(n?.balkanisedFactions) ? n.balkanisedFactions : [];
	for (let e of r) {
		let n = D(e);
		if (n?.factionId === t) return n;
	}
	return null;
}
function ut(e, t) {
	let n = D(lt(e.judicialSystemDetails, t)?.details), r = D(n?.secondarySystem), i = D(lt(e.lawUniformityDetails, t)?.details), a = D(lt(e.presumptionOfInnocenceDetails, t)?.details), o = D(lt(e.deathPenaltyDetails, t)?.details);
	return {
		primaryJudicialSystemCode: at(n?.code),
		secondaryJudicialSystemCode: at(r?.code),
		lawUniformityCode: ot(i?.code),
		presumptionOfInnocenceCode: st(a?.code),
		deathPenaltyCode: st(o?.code)
	};
}
function dt(e) {
	if (e.governmentCode !== 7) {
		let t = it(ct(e));
		return {
			method: "WBH justice profile audit",
			world: t,
			balkanisedFactions: [],
			generationNotes: t.status === "complete" ? [] : ["Justice Profile prerequisites are incomplete."]
		};
	}
	let t = D(e.judicialSystemDetails), n = Array.isArray(t?.balkanisedFactions) ? t.balkanisedFactions : [], r = [];
	for (let t of n) {
		let n = D(t), i = typeof n?.factionId == "string" ? n.factionId : null;
		i && r.push({
			factionId: i,
			details: it(ut(e, i))
		});
	}
	return {
		method: "WBH justice profile audit",
		world: null,
		balkanisedFactions: r,
		generationNotes: ["Government 7 derives a separate Justice Profile for each represented sovereign faction."]
	};
}
function ft(e) {
	e.social && (e.social.justiceProfileDetails = dt(e.social));
	let t = e.physical?.details?.satellites?.moons ?? [];
	for (let e of t) e.social && (e.social.justiceProfileDetails = dt(e.social));
}
function pt(e) {
	for (let t of e.worlds) ft(t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhJudicialSystem.ts
function mt(e) {
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
function ht(e) {
	return e === 1 || e >= 8 && e <= 12 || e === 15 ? -2 : e === 13 || e === 14 ? 4 : 0;
}
function gt(e, t, n) {
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
function _t(e, t) {
	let n = Math.max(0, Math.trunc(t.governmentCode)), r = Math.max(0, Math.trunc(t.lawLevelCode)), i = Math.max(0, Math.trunc(t.techLevel));
	if (n === 0) {
		let a = gt(e, "N", r);
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
	let a = [], o = ht(n);
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
	let s = e.roll(2, 6).total, c = a.reduce((e, t) => e + t.dm, 0), l = s + c, u = mt(l), d = gt(e, u.code, r);
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
function vt(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function yt(e) {
	let t = vt(vt(e)?.authority);
	return typeof t?.code == "string" ? t.code === "J" : null;
}
function bt(e, t, n) {
	if (n.populationCode <= 0) return {
		method: "WBH judicial system audit",
		world: _t(T("judicialSystem", e, t, n.uwp), {
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
		world: _t(T("judicialSystem", e, t, n.uwp), {
			governmentCode: n.governmentCode,
			lawLevelCode: n.lawLevelCode,
			techLevel: n.techLevel,
			judicialAuthoritative: yt(n.governmentCentralisation)
		}),
		balkanisedFactions: [],
		generationNotes: []
	};
	let r = vt(n.lawLevelDetails), i = Array.isArray(r?.balkanisedFactionLawLevels) ? r.balkanisedFactionLawLevels : [], a = vt(n.balkanisation), o = Array.isArray(a?.factions) ? a.factions : [], s = /* @__PURE__ */ new Map();
	for (let e of o) {
		let t = vt(e);
		typeof t?.id == "string" && s.set(t.id, t);
	}
	let c = [];
	for (let r of i) {
		let i = vt(r), a = typeof i?.factionId == "string" ? i.factionId : null, o = typeof i?.governmentCode == "number" ? i.governmentCode : null, l = typeof i?.lawLevelCode == "number" ? i.lawLevelCode : null;
		if (!a || o === null || l === null) continue;
		let u = s.get(a), d = T("judicialSystem", e, t, n.uwp, a);
		c.push({
			factionId: a,
			details: _t(d, {
				governmentCode: o,
				lawLevelCode: l,
				techLevel: n.techLevel,
				judicialAuthoritative: yt(u?.centralisation)
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
function xt(e, t) {
	t.social && (t.social.judicialSystemDetails = bt(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		if (!i.social) continue;
		let a = i.sourceId ?? `${t.id}.moon-${r + 1}`;
		i.social.judicialSystemDetails = bt(e, a, i.social);
	}
}
function St(e) {
	for (let t of e.worlds) xt(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhLawLevel.ts
function Ct(e) {
	return Math.max(0, Math.min(18, Math.trunc(e)));
}
function wt(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Tt(e) {
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
function Et(e, t, n) {
	if (n.populationCode <= 0 || n.governmentCode !== 7) return [];
	let r = wt(n.balkanisation);
	return (Array.isArray(r?.factions) ? r.factions : []).flatMap((r) => {
		let i = wt(r), a = typeof i?.id == "string" ? i.id : null, o = typeof i?.governmentCode == "number" && Number.isFinite(i.governmentCode) ? Math.max(0, Math.trunc(i.governmentCode)) : null;
		if (!a || o === null) return [];
		let s = T("lawLevelBalkanisation", e, t, n.uwp, a).roll(2, 6).total, c = o - 7, l = s + c;
		return [{
			factionId: a,
			governmentCode: o,
			roll: s,
			modifier: c,
			unclampedTotal: l,
			lawLevelCode: Ct(l)
		}];
	});
}
function Dt(e, t, n, r) {
	let i = r === "generated" ? Tt(n) : {
		roll: null,
		modifier: null,
		unclampedTotal: null,
		clampingMayHaveOccurred: !1
	}, a = Et(e, t, n);
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
function Ot(e, t) {
	return e.generationMethod === "continuation" && t ? "imported-uwp" : "generated";
}
function kt(e, t) {
	t.social && (t.social.lawLevelDetails = Dt(e.id, t.id, t.social, Ot(e, t.isMainworld === !0)));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		if (!i.social) continue;
		let a = i.sourceId ?? `${t.id}.moon-${r + 1}`;
		i.social.lawLevelDetails = Dt(e.id, a, i.social, Ot(e, i.isMainworld === !0));
	}
}
function At(e) {
	for (let t of e.worlds) kt(e, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhLawSubclassifications.ts
var jt = {
	W: "Weapons and Armour",
	E: "Economic",
	C: "Criminal",
	P: "Private",
	R: "Personal Rights"
};
function Mt(e) {
	return Math.max(0, Math.min(18, Math.trunc(e)));
}
function Nt(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[e] ?? String(e);
}
function Pt(e) {
	return e === 0 ? -2 : e === 1 ? 2 : e === 2 ? -1 : +(e === 9);
}
function Ft(e) {
	return e === 3 || e === 5 || e === 12 ? -1 : 0;
}
function It(e) {
	return e === 0 || e === 2 ? -1 : e === 1 ? 2 : 0;
}
function Lt(e, t) {
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
		let e = Pt(t.governmentCode);
		e !== 0 && n.push({
			source: `Government ${Nt(t.governmentCode)}`,
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
		let e = Ft(t.governmentCode);
		e !== 0 && n.push({
			source: `Government ${Nt(t.governmentCode)}`,
			dm: e
		});
	} else {
		let e = It(t.governmentCode);
		e !== 0 && n.push({
			source: `Government ${Nt(t.governmentCode)}`,
			dm: e
		});
	}
	return {
		incompleteReason: null,
		dms: n
	};
}
function Rt(e, t, n) {
	let r = Mt(n.overallLawLevel), { incompleteReason: i, dms: a } = Lt(t, n);
	if (i) return {
		method: "WBH Law Level subclassification",
		categoryCode: t,
		categoryName: jt[t],
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
	let o = e.roll(2, 3).total, s = o - 4, c = a.reduce((e, t) => e + t.dm, 0), l = r + s + c, u = Mt(l);
	return {
		method: "WBH Law Level subclassification",
		categoryCode: t,
		categoryName: jt[t],
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
function zt(e, t) {
	return ie(re(e, t));
}
function Bt(e, t) {
	let n = {
		overallLawLevel: Mt(t.overallLawLevel),
		governmentCode: Math.max(0, Math.trunc(t.governmentCode)),
		pcr: t.pcr === null ? null : Math.max(0, Math.min(9, Math.trunc(t.pcr))),
		primaryJudicialSystemCode: t.primaryJudicialSystemCode
	}, r = Rt(zt(e, "W"), "W", n), i = Rt(zt(e, "E"), "E", n), a = Rt(zt(e, "C"), "C", n), o = Rt(zt(e, "P"), "P", n), s = Rt(zt(e, "R"), "R", n), c = [
		r,
		i,
		a,
		o,
		s
	], l = c.every((e) => e.status === "generated" && e.lawLevel !== null), u = l ? `${Nt(n.overallLawLevel)}-${c.map((e) => Nt(e.lawLevel)).join("")}` : null;
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
function Vt(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Ht(e) {
	return e === "N" || e === "I" || e === "A" || e === "T" ? e : null;
}
function Ut(e) {
	let t = Vt(e.populationConcentration);
	return typeof t?.rating == "number" ? t.rating : null;
}
function Wt(e, t) {
	let n = Vt(e), r = Array.isArray(n?.balkanisedFactions) ? n.balkanisedFactions : [];
	for (let e of r) {
		let n = Vt(e);
		if (n?.factionId === t) return n;
	}
	return null;
}
function Gt(e, t, n) {
	if (n.populationCode <= 0) return {
		method: "WBH Law Level subclassifications audit",
		world: null,
		balkanisedFactions: [],
		generationNotes: ["Population 0 has no inhabited society for which Law Level subclassifications are generated."]
	};
	if (n.governmentCode !== 7) {
		let r = Vt(Vt(n.judicialSystemDetails)?.world);
		return {
			method: "WBH Law Level subclassifications audit",
			world: Bt(w("lawSubclassifications", e, t, n.uwp), {
				overallLawLevel: n.lawLevelCode,
				governmentCode: n.governmentCode,
				pcr: Ut(n),
				primaryJudicialSystemCode: Ht(r?.code)
			}),
			balkanisedFactions: [],
			generationNotes: []
		};
	}
	let r = Vt(n.lawLevelDetails), i = Array.isArray(r?.balkanisedFactionLawLevels) ? r.balkanisedFactionLawLevels : [], a = [];
	for (let r of i) {
		let i = Vt(r), o = typeof i?.factionId == "string" ? i.factionId : null, s = typeof i?.governmentCode == "number" ? i.governmentCode : null, c = typeof i?.lawLevelCode == "number" ? i.lawLevelCode : null;
		if (!o || s === null || c === null) continue;
		let l = Vt(Wt(n.judicialSystemDetails, o)?.details);
		a.push({
			factionId: o,
			details: Bt(w("lawSubclassifications", e, t, n.uwp, o), {
				overallLawLevel: c,
				governmentCode: s,
				pcr: null,
				primaryJudicialSystemCode: Ht(l?.code)
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
function Kt(e, t) {
	t.social && (t.social.lawSubclassificationsDetails = Gt(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		if (!i.social) continue;
		let a = i.sourceId ?? `${t.id}.moon-${r + 1}`;
		i.social.lawSubclassificationsDetails = Gt(e, a, i.social);
	}
}
function qt(e) {
	for (let t of e.worlds) Kt(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhLawUniformity.ts
function Jt(e) {
	return e === "P" ? "Personal" : e === "T" ? "Territorial" : "Universal";
}
function Yt(e) {
	return e === 2 ? 1 : e === 3 || e === 5 || e >= 10 ? -1 : 0;
}
function Xt(e, t, n) {
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
			uniformity: Jt(i),
			generationNotes: ["Federal governments are Territorial on 1-5 and Personal on 6."]
		};
	}
	let r = e.die(6), i = Yt(t), a = r + i, o = a <= 2 ? "P" : a === 3 ? "T" : "U";
	return {
		method: "WBH law uniformity",
		governmentCode: t,
		centralisationCode: n,
		roll: r,
		dm: i,
		total: a,
		code: o,
		uniformity: Jt(o),
		generationNotes: ["Unitary governments use the WBH 1D+DM Law Uniformity table: 2- Personal, 3 Territorial, 4+ Universal."]
	};
}
function Zt(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Qt(e) {
	let t = Zt(e);
	return t?.code === "C" || t?.code === "F" || t?.code === "U" ? t.code : null;
}
function $t(e, t, n) {
	if (n.populationCode <= 0 || n.governmentCode === 0) return {
		method: "WBH law uniformity audit",
		world: null,
		balkanisedFactions: [],
		generationNotes: ["No established government means no formal overall law-uniformity result is generated."]
	};
	if (n.governmentCode !== 7) {
		let r = Qt(n.governmentCentralisation), i = r ? Xt(T("lawUniformity", e, t, n.uwp), n.governmentCode, r) : null;
		return {
			method: "WBH law uniformity audit",
			world: i,
			balkanisedFactions: [],
			generationNotes: i ? [] : ["Government centralisation is required before Law Uniformity can be determined."]
		};
	}
	let r = Zt(n.balkanisation), i = Array.isArray(r?.factions) ? r.factions : [], a = [];
	for (let r of i) {
		let i = Zt(r), o = typeof i?.id == "string" ? i.id : null, s = typeof i?.governmentCode == "number" ? i.governmentCode : null, c = Qt(i?.centralisation);
		!o || s === null || a.push({
			factionId: o,
			details: c ? Xt(T("lawUniformity", e, t, n.uwp, o), s, c) : null
		});
	}
	return {
		method: "WBH law uniformity audit",
		world: null,
		balkanisedFactions: a,
		generationNotes: ["Government 7 determines Law Uniformity separately for each represented sovereign faction."]
	};
}
function en(e, t) {
	t.social && (t.social.lawUniformityDetails = $t(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		i.social && (i.social.lawUniformityDetails = $t(e, i.sourceId ?? `${t.id}.moon-${r + 1}`, i.social));
	}
}
function tn(e) {
	for (let t of e.worlds) en(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhMilitaryTechnology.ts
function nn(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(e);
}
function rn(e, t) {
	return ie(re(e, t));
}
function an(e, t, n) {
	let r = Math.max(0, Math.floor(t));
	return Math.max(r, Math.min(Math.max(r, Math.floor(n)), Math.trunc(e)));
}
function on(e, t, n, r, i, a, o, s) {
	let c = Pe(rn(e, t)), l = a.reduce((e, t) => e + t.dm, 0), u = Math.trunc(n) + c.modifier + l;
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
		techLevel: an(u, r, i),
		generationNotes: s
	};
}
function sn(e) {
	return e === 0 || e >= 13 ? 2 : +(e >= 1 && e <= 4 || e >= 9 && e <= 12);
}
function cn(e, t) {
	let n = Math.max(0, Math.trunc(t.manufacturingTechLevel)), r = Math.max(0, Math.trunc(t.electronicsTechLevel)), i = Math.max(0, Math.trunc(t.governmentCode)), a = t.worldGovernmentSeven === !0, o = [];
	(i === 0 || a || i === 7) && o.push({
		source: a && i !== 7 ? "Government 7 world" : `Government ${nn(i)}`,
		dm: 2
	});
	let s = "complete", c = 0, l = ["Personal Military TL = Manufacturing TL + TLM + DMs; upper bound is Electronics TL."];
	if (t.weaponsAndArmourLawLevel === null) s = "provisional", l.push("Weapons and Armour Law Level is unavailable, so its DM and the special Law 0 lower bound cannot be applied; this candidate is provisional.");
	else {
		let e = Math.max(0, Math.trunc(t.weaponsAndArmourLawLevel)), r = sn(e);
		r !== 0 && o.push({
			source: `Weapons/Armour Law ${nn(e)}`,
			dm: r
		}), e === 0 && (c = n);
	}
	let u = on(e, "personal", n, c, r, o, s, l), d = [], f = "complete", p = ["Heavy Military TL = Manufacturing TL + TLM + DMs; upper bound is Manufacturing TL and lower bound is 0."];
	if (t.populationCode === null) f = "provisional", p.push("Nation-specific Population code is unavailable, so the Population DM is not applied.");
	else {
		let e = Math.max(0, Math.trunc(t.populationCode));
		e >= 1 && e <= 6 ? d.push({
			source: `Population ${nn(e)}`,
			dm: -1
		}) : e >= 8 && d.push({
			source: `Population ${nn(e)}`,
			dm: 1
		});
	}
	(a || i === 7) && d.push({
		source: "Government 7 world",
		dm: 2
	}), (i === 10 || i === 11 || i === 15) && d.push({
		source: `Government ${nn(i)}`,
		dm: 2
	}), t.overallLawLevel === null ? (f = "provisional", p.push("Nation-specific overall Law Level is unavailable, so the Law D+ DM is not applied.")) : t.overallLawLevel >= 13 && d.push({
		source: `Law ${nn(t.overallLawLevel)}`,
		dm: 2
	}), t.industrial === null ? (f = "provisional", p.push("Nation-specific Industrial status is unavailable, so the Industrial DM is not applied.")) : t.industrial && d.push({
		source: "Industrial",
		dm: 1
	});
	let m = on(e, "heavy", n, 0, n, d, f, p);
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
function O(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function ln(e) {
	return e.tradeCodes.some((e) => e.trim().toUpperCase() === "IN" || e.trim().toUpperCase() === "INDUSTRIAL");
}
function un(e) {
	let t = O(e), n = O(t?.manufacturing)?.techLevel, r = O(t?.electronics)?.techLevel;
	return typeof n != "number" || typeof r != "number" ? null : {
		manufacturingTechLevel: n,
		electronicsTechLevel: r
	};
}
function dn(e) {
	let t = O(O(O(e.lawSubclassificationsDetails)?.world)?.weaponsAndArmour);
	return typeof t?.lawLevel == "number" ? t.lawLevel : null;
}
function fn(e, t) {
	let n = O(e.lawLevelDetails), r = Array.isArray(n?.balkanisedFactionLawLevels) ? n.balkanisedFactionLawLevels : [];
	for (let e of r) {
		let n = O(e);
		if (n?.factionId === t) return typeof n.governmentCode != "number" || typeof n.lawLevelCode != "number" ? null : {
			governmentCode: n.governmentCode,
			lawLevelCode: n.lawLevelCode
		};
	}
	return null;
}
function pn(e, t) {
	let n = O(e.lawSubclassificationsDetails), r = Array.isArray(n?.balkanisedFactions) ? n.balkanisedFactions : [];
	for (let e of r) {
		let n = O(e);
		if (n?.factionId !== t) continue;
		let r = O(O(n.details)?.weaponsAndArmour);
		return typeof r?.lawLevel == "number" ? r.lawLevel : null;
	}
	return null;
}
function mn(e, t, n) {
	if (n.populationCode === 0) return {
		...n,
		militaryTechnologyDetails: null
	};
	let r = O(n.qualityOfLifeTechnologyDetails);
	if (!r) return {
		...n,
		militaryTechnologyDetails: null
	};
	let i = un(r.world);
	if (i) {
		let r = cn(w("militaryTechnology", e, t.id, "world", n.uwp), {
			...i,
			populationCode: n.populationCode,
			governmentCode: n.governmentCode,
			overallLawLevel: n.lawLevelCode,
			weaponsAndArmourLawLevel: dn(n),
			industrial: ln(n)
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
		let i = O(r);
		if (!i) return [];
		let a = typeof i.factionId == "string" ? i.factionId : null;
		if (!a) return [];
		let o = fn(n, a), s = un(i.hostOrAdjacent), c = un(i.nonHost);
		if (!o || !s || !c) return [];
		let l = {
			populationCode: null,
			governmentCode: o.governmentCode,
			overallLawLevel: o.lawLevelCode,
			weaponsAndArmourLawLevel: pn(n, a),
			industrial: null,
			worldGovernmentSeven: !0
		};
		return [{
			factionId: a,
			hostOrAdjacent: cn(w("militaryTechnology", e, t.id, a, "host", n.uwp), {
				...s,
				...l
			}),
			nonHost: cn(w("militaryTechnology", e, t.id, a, "non-host", n.uwp), {
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
function hn(e, t, n, r) {
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
		social: mn(e, a, n.social)
	};
}
function gn(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.social ? mn(e.id, t, t.social) : t.social, r = t.physical?.details?.satellites;
			return r ? {
				...t,
				social: n,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...r,
							moons: r.moons.map((n, r) => hn(e.id, t, n, r))
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
function _n(e) {
	return Math.max(0, Math.trunc(e));
}
function vn(e) {
	let t = _n(e.highCommonTechLevel), n = _n(e.minimumSustainableTechLevel), r = _n(e.environmentalTechLevel), i = e.subcategoryTechLevels.filter((e) => Number.isFinite(e)).map(_n), a = i.length ? Math.max(...i) : 0, o = Math.max(t, r) < n ? Math.max(0, n - 2) : null, s = [{
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
		techLevel: _n(l),
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
		techLevel: _n(u),
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
		nearbyRichIndustrialClassATechLevel: l == null ? null : _n(l),
		previousCultureTechLevel: u == null ? null : _n(u),
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
function k(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function yn(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function bn(e, t) {
	let n = k(e);
	if (!n) return null;
	let r = [];
	for (let e of t) {
		let t = yn(k(n[e])?.techLevel);
		if (t === null) return null;
		r.push(t);
	}
	return r;
}
function xn(e, t) {
	let n = k(e), r = Array.isArray(n?.factions) ? n.factions : [];
	for (let e of r) {
		let n = k(e);
		if (n?.factionId === t) return n;
	}
	return null;
}
function Sn(e, t) {
	return xn(e.balkanisedCommonTechnologyDetails, t);
}
function Cn(e) {
	return yn(k(k(e.commonTechnologyDetails)?.minimumSustainable)?.minimumTechLevel);
}
function wn(e, t, n, r, i) {
	let a = bn(t, [
		"energy",
		"electronics",
		"manufacturing",
		"medical",
		"environmental"
	]), o = bn(n, [
		"land",
		"water",
		"air",
		"space"
	]), s = bn(r, ["personal", "heavy"]), c = Cn(e), l = a?.[4] ?? null;
	return !a || !o || !s || c === null || l === null ? null : vn({
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
function Tn(e) {
	if (e.populationCode === 0) return {
		...e,
		noveltyTechnologyDetails: null
	};
	let t = k(e.qualityOfLifeTechnologyDetails), n = k(e.transportationTechnologyDetails), r = k(e.militaryTechnologyDetails), i = k(e.commonTechnologyDetails);
	if (!t || !n || !r || !i) return {
		...e,
		noveltyTechnologyDetails: null
	};
	let a = k(t.world), o = k(n.world), s = k(r.world), c = yn(i.highCommonTechLevel);
	if (a && o && s && c !== null) return {
		...e,
		noveltyTechnologyDetails: {
			method: "WBH novelty technology audit",
			world: wn(e, a, o, s, c),
			factions: [],
			generationNotes: ["World Novelty TL retains unresolved regional and previous-culture factors rather than inventing them."]
		}
	};
	let l = (Array.isArray(t.factions) ? t.factions : []).flatMap((e) => {
		let t = k(e);
		return typeof t?.factionId == "string" ? [t.factionId] : [];
	}).flatMap((i) => {
		let a = xn(t, i), o = xn(n, i), s = xn(r, i), c = Sn(e, i);
		if (!a || !o || !s || !c) return [];
		let l = yn(k(c.hostOrAdjacentCandidate)?.highCommonTechLevel), u = yn(k(c.nonHostCandidate)?.highCommonTechLevel);
		if (l === null || u === null) return [];
		let d = wn(e, a.hostOrAdjacent, o.hostOrAdjacent, s.hostOrAdjacent, l), f = wn(e, a.nonHost, o.nonHost, s.nonHost, u);
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
function En(e, t, n) {
	return t.social ? (t.sourceId ?? `${e.id}${n + 1}`, {
		...t,
		social: Tn(t.social)
	}) : t;
}
function Dn(e) {
	return {
		...e,
		worlds: e.worlds.map((e) => {
			let t = e.social ? Tn(e.social) : e.social, n = e.physical?.details?.satellites;
			return n ? {
				...e,
				social: t,
				physical: {
					...e.physical,
					details: {
						...e.physical.details,
						satellites: {
							...n,
							moons: n.moons.map((t, n) => En(e, t, n))
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
function On(e, t, n) {
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
function kn(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function An(e) {
	return e === "N" || e === "I" || e === "A" || e === "T" ? e : null;
}
function jn(e, t, n) {
	if (n.populationCode === 0) return {
		method: "WBH presumption of innocence audit",
		world: null,
		balkanisedFactions: [],
		generationNotes: ["Not applicable: Population 0 has no inhabited society or formal criminal judicial practice."]
	};
	let r = kn(n.judicialSystemDetails);
	if (n.governmentCode !== 7) {
		let i = kn(r?.world), a = An(i?.code), o = typeof i?.lawLevelCode == "number" ? i.lawLevelCode : n.lawLevelCode, s = On(T("presumptionOfInnocence", e, t, n.uwp), o, a);
		return {
			method: "WBH presumption of innocence audit",
			world: s,
			balkanisedFactions: [],
			generationNotes: s.status === "incomplete" ? ["Primary judicial-system details are incomplete, so no presumption result is fabricated."] : []
		};
	}
	let i = Array.isArray(r?.balkanisedFactions) ? r.balkanisedFactions : [], a = [];
	for (let r of i) {
		let i = kn(r), o = typeof i?.factionId == "string" ? i.factionId : null, s = kn(i?.details), c = typeof s?.lawLevelCode == "number" ? s.lawLevelCode : null;
		!o || c === null || a.push({
			factionId: o,
			details: On(T("presumptionOfInnocence", e, t, n.uwp, o), c, An(s?.code))
		});
	}
	return {
		method: "WBH presumption of innocence audit",
		world: null,
		balkanisedFactions: a,
		generationNotes: ["Government 7 determines presumption of innocence separately for each represented sovereign faction."]
	};
}
function Mn(e, t) {
	t.social && (t.social.presumptionOfInnocenceDetails = jn(e, t.id, t.social));
	let n = t.physical?.details?.satellites?.moons ?? [];
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r];
		i.social && (i.social.presumptionOfInnocenceDetails = jn(e, i.sourceId ?? `${t.id}.moon-${r + 1}`, i.social));
	}
}
function Nn(e) {
	for (let t of e.worlds) Mn(e.id, t);
	return e;
}
//#endregion
//#region src/rules/worlds/wbhQualityOfLifeTechnology.ts
function Pn(e, ...t) {
	let n = new Set(e.map((e) => e.trim().toUpperCase()));
	return t.some((e) => n.has(e.toUpperCase()));
}
function Fn(e, t, n) {
	let r = Math.max(0, Math.floor(t));
	return Math.max(r, Math.min(Math.max(r, Math.floor(n)), Math.trunc(e)));
}
function In(e, t, n, r, i, a, o = []) {
	let s = Pe(e), c = a.reduce((e, t) => e + t.dm, 0), l = Math.trunc(n) + s.modifier + c, u = Math.max(0, Math.floor(r)), d = Math.max(u, Math.floor(i));
	return {
		category: t,
		baseTechLevel: Math.trunc(n),
		tlm: s,
		dmBreakdown: a,
		dmTotal: c,
		unboundedTechLevel: l,
		lowerBound: u,
		upperBound: d,
		techLevel: Fn(l, u, d),
		generationNotes: o
	};
}
function Ln(e, t) {
	return ie(re(e, t));
}
function Rn(e, t) {
	let n = Math.max(0, Math.trunc(t.highCommonTechLevel)), r = Math.max(0, Math.trunc(t.populationCode)), i = Pn(t.tradeCodes, "In", "Industrial"), a = Pn(t.tradeCodes, "Ri", "Rich"), o = Pn(t.tradeCodes, "Po", "Poor"), s = [];
	r >= 9 && s.push({
		source: `Population ${r}`,
		dm: 1
	}), i && s.push({
		source: "Industrial",
		dm: 1
	});
	let c = In(Ln(e, "energy"), "energy", n, n / 2, n * 1.2, s, ["Energy TL = High Common TL + TLM + DMs. All WBH Tech Level bounds are rounded down."]), l = [];
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
	let u = In(Ln(e, "electronics"), "electronics", n, c.techLevel - 3, c.techLevel + 1, l, ["Electronics TL = High Common TL + TLM + DMs."]), d = [];
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
	let f = In(Ln(e, "manufacturing"), "manufacturing", n, u.techLevel - 2, Math.max(c.techLevel, u.techLevel), d, ["Manufacturing TL = High Common TL + TLM + DMs."]), p = [];
	a && p.push({
		source: "Rich",
		dm: 1
	}), o && p.push({
		source: "Poor",
		dm: -1
	});
	let m = t.starport.toUpperCase() === "A" ? 6 : t.starport.toUpperCase() === "B" ? 4 : t.starport.toUpperCase() === "C" ? 2 : 0, h = In(Ln(e, "medical"), "medical", u.techLevel, m, u.techLevel, p, ["Medical TL = Electronics TL + TLM + DMs; the lower bound is the starport-class Tech Level DM (A=6, B=4, C=2, otherwise 0)."]), g = [];
	t.habitabilityRating !== null && t.habitabilityRating < 8 && g.push({
		source: `Habitability ${t.habitabilityRating}`,
		dm: 8 - t.habitabilityRating
	});
	let _ = In(Ln(e, "environmental"), "environmental", f.techLevel, c.techLevel - 5, c.techLevel, g, ["Environmental TL = Manufacturing TL + TLM + DMs.", t.habitabilityRating === null ? "Habitability is unavailable; no Habitability DM was invented." : "Habitability below 8 contributes DM = 8 - Habitability Rating."]);
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
function zn(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Bn(e) {
	let t = e.physical?.details?.habitabilityRating?.rating;
	return typeof t == "number" ? t : null;
}
function Vn(e, t, n) {
	let r = zn(zn(e.commonTechnologyDetails)?.minimumSustainable);
	return {
		highCommonTechLevel: n,
		populationCode: e.populationCode,
		starport: e.starport,
		tradeCodes: e.tradeCodes,
		habitabilityRating: Bn(t),
		minimumSustainableTechLevel: typeof r?.minimumTechLevel == "number" ? r.minimumTechLevel : 0
	};
}
function Hn(e, t, n) {
	if (n.populationCode === 0 || !n.commonTechnologyDetails) return {
		...n,
		qualityOfLifeTechnologyDetails: null
	};
	let r = n.commonTechnologyDetails;
	if (n.governmentCode !== 7) {
		let i = Rn(w("qualityOfLifeTechnology", e, t.id, "world", n.uwp), Vn(n, t, r.highCommonTechLevel));
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
	let i = zn(n.balkanisedCommonTechnologyDetails), a = (Array.isArray(i?.factions) ? i.factions : []).flatMap((r) => {
		let i = zn(r), a = typeof i?.factionId == "string" ? i.factionId : null, o = zn(i?.hostOrAdjacentCandidate), s = zn(i?.nonHostCandidate), c = typeof o?.highCommonTechLevel == "number" ? o.highCommonTechLevel : null, l = typeof s?.highCommonTechLevel == "number" ? s.highCommonTechLevel : null;
		return !a || c === null || l === null ? [] : [{
			factionId: a,
			hostOrAdjacent: Rn(w("qualityOfLifeTechnology", e, t.id, a, "host", n.uwp), Vn(n, t, c)),
			nonHost: Rn(w("qualityOfLifeTechnology", e, t.id, a, "non-host", n.uwp), Vn(n, t, l))
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
function Un(e, t, n, r) {
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
		social: Hn(e, a, n.social)
	};
}
function Wn(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.social ? Hn(e.id, t, t.social) : t.social, r = t.physical?.details?.satellites;
			return r ? {
				...t,
				social: n,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...r,
							moons: r.moons.map((n, r) => Un(e.id, t, n, r))
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
var Gn = 33;
function A(e) {
	return e === null ? "?" : t(Math.min(Gn, Math.max(0, Math.trunc(e))));
}
function Kn(e) {
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
	}, n = Object.entries(t).filter(([, e]) => e === null).map(([e]) => `Missing ${e} Tech Level`), r = Object.entries(t).filter(([, e]) => e !== null && e > Gn).map(([e, t]) => `${e} Tech Level ${t} exceeds eHex Z and is shown as Z`), i = [.../* @__PURE__ */ new Set([
		...e.provisionalReasons ?? [],
		...n,
		...r
	])], a = [
		`${A(t.highCommon)}-${A(t.lowCommon)}`,
		`${A(t.energy)}${A(t.electronics)}${A(t.manufacturing)}${A(t.medical)}${A(t.environmental)}`,
		`${A(t.land)}${A(t.water)}${A(t.air)}${A(t.space)}`,
		`${A(t.personalMilitary)}${A(t.heavyMilitary)}`,
		A(t.novelty)
	].join("-");
	return {
		method: "WBH Technology Profile",
		status: i.length ? "provisional" : "complete",
		profile: a,
		components: t,
		provisionalReasons: i,
		generationNotes: [
			"WBH Technology Profile order is H-L-QQQQQ-TTTT-MM-N.",
			"Q = Energy, Electronics, Manufacturing, Medical, Environmental; T = Land, Water, Air, Space; M = Personal, Heavy.",
			...i.length ? ["Question marks identify component TLs that are not yet available; known provisional components retain their displayed eHex value."] : []
		]
	};
}
function j(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function qn(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function Jn(e, t) {
	return j(t)?.status === "provisional" ? [`${e} is provisional`] : [];
}
function Yn(e, t) {
	let n = j(e), r = Array.isArray(n?.factions) ? n.factions : [];
	for (let e of r) {
		let n = j(e);
		if (n?.factionId === t) return n;
	}
	return null;
}
function Xn(e, t) {
	return qn(j(j(e)?.[t])?.techLevel);
}
function Zn(e, t, n, r, i) {
	let a = j(e), o = j(i), s = [
		...Jn("Novelty Technology", i),
		...[
			"energy",
			"electronics",
			"manufacturing",
			"medical",
			"environmental"
		].flatMap((e) => Jn(`Quality of Life ${e}`, j(t)?.[e])),
		...[
			"land",
			"water",
			"air",
			"space"
		].flatMap((e) => Jn(`Transportation ${e}`, j(n)?.[e])),
		...["personal", "heavy"].flatMap((e) => Jn(`Military ${e}`, j(r)?.[e]))
	];
	return {
		highCommon: qn(a?.highCommonTechLevel),
		lowCommon: qn(a?.lowCommonTechLevel),
		energy: Xn(t, "energy"),
		electronics: Xn(t, "electronics"),
		manufacturing: Xn(t, "manufacturing"),
		medical: Xn(t, "medical"),
		environmental: Xn(t, "environmental"),
		land: Xn(n, "land"),
		water: Xn(n, "water"),
		air: Xn(n, "air"),
		space: Xn(n, "space"),
		personalMilitary: Xn(r, "personal"),
		heavyMilitary: Xn(r, "heavy"),
		novelty: qn(o?.techLevel),
		provisionalReasons: s
	};
}
function Qn(e) {
	if (e.populationCode === 0) return {
		...e,
		technologyProfileDetails: null
	};
	let t = j(e.commonTechnologyDetails), n = j(e.qualityOfLifeTechnologyDetails), r = j(e.transportationTechnologyDetails), i = j(e.militaryTechnologyDetails), a = j(e.noveltyTechnologyDetails);
	if (!t || !n || !r || !i || !a) return {
		...e,
		technologyProfileDetails: null
	};
	let o = j(n.world), s = j(r.world), c = j(i.world), l = j(a.world);
	if (o && s && c && l) return {
		...e,
		technologyProfileDetails: {
			method: "WBH technology profile audit",
			world: Kn(Zn(t, o, s, c, l)),
			factions: [],
			generationNotes: ["Non-balkanised world profile assembled directly from its generated WBH technology components."]
		}
	};
	let u = j(e.balkanisedCommonTechnologyDetails), d = (Array.isArray(n.factions) ? n.factions : []).flatMap((e) => {
		let t = j(e);
		return typeof t?.factionId == "string" ? [t.factionId] : [];
	}).flatMap((e) => {
		let t = Yn(u, e), o = Yn(n, e), s = Yn(r, e), c = Yn(i, e), l = Yn(a, e);
		if (!t || !o || !s || !c || !l) return [];
		let d = j(t.hostOrAdjacentCandidate), f = j(t.nonHostCandidate);
		return !d || !f ? [] : [{
			factionId: e,
			hostOrAdjacent: Kn(Zn(d, o.hostOrAdjacent, s.hostOrAdjacent, c.hostOrAdjacent, l.hostOrAdjacent)),
			nonHost: Kn(Zn(f, o.nonHost, s.nonHost, c.nonHost, l.nonHost))
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
function $n(e, t, n) {
	return t.social ? {
		...t,
		social: Qn(t.social)
	} : t;
}
function er(e) {
	return {
		...e,
		worlds: e.worlds.map((e) => {
			let t = e.social ? Qn(e.social) : e.social, n = e.physical?.details?.satellites;
			return n ? {
				...e,
				social: t,
				physical: {
					...e.physical,
					details: {
						...e.physical.details,
						satellites: {
							...n,
							moons: n.moons.map((t, n) => $n(e, t, n))
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
function tr(e, t) {
	return ie(re(e, t));
}
function nr(e, t, n) {
	let r = Math.max(0, Math.floor(t));
	return Math.max(r, Math.min(Math.max(r, Math.floor(n)), Math.trunc(e)));
}
function rr(e, t, n, r, i, a, o, s) {
	let c = Pe(tr(e, t)), l = a.reduce((e, t) => e + t.dm, 0), u = Math.trunc(n) + c.modifier + l;
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
		techLevel: nr(u, r, i),
		generationNotes: s
	};
}
function ir(e, t) {
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
function ar(e, t) {
	let n = Math.max(0, Math.trunc(t.energyTechLevel)), r = Math.max(0, Math.trunc(t.electronicsTechLevel)), i = Math.max(0, Math.trunc(t.manufacturingTechLevel)), a = t.pcr !== null, o = a && t.pcr <= 2, s = a ? "complete" : "provisional", c = [];
	t.hydrographicsCode === 10 && c.push({
		source: "Hydrographics A",
		dm: -1
	}), o && c.push({
		source: `PCR ${t.pcr}`,
		dm: 1
	});
	let l = rr(e, "land", n, r - 5, n, c, s, a ? ["Land Transport TL = Energy TL + TLM + DMs."] : ["Faction PCR is unavailable; PCR 0–2 DM+1 is not applied, so this candidate is provisional."]), u = [];
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
	let d = rr(e, "water", n, t.hydrographicsCode === 0 ? 0 : r - 5, n, u, s, a ? ["Water Transport TL = Energy TL + TLM + DMs."] : ["Faction PCR is unavailable; PCR 0–2 DM+1 is not applied, so this candidate is provisional."]), f;
	if (t.atmosphereCode === 0 && n <= 5) f = ir("air", "WBH: Air Transport TL is automatically 0 for Atmosphere 0 at TL0–5.");
	else {
		let i = [];
		(t.atmosphereCode >= 0 && t.atmosphereCode <= 3 || t.atmosphereCode === 14) && n <= 7 ? i.push({
			source: `Atmosphere ${t.atmosphereCode}, TL0–7`,
			dm: -2
		}) : (t.atmosphereCode === 4 || t.atmosphereCode === 5) && n <= 7 && i.push({
			source: `Atmosphere ${t.atmosphereCode}, TL0–7`,
			dm: -1
		}), f = rr(e, "air", n, r - 5, n, i, "complete", [
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
	let h = rr(e, "space", i, Math.min(n - 3, i - 3), Math.min(n, i), p, "complete", ["Space Transport TL = Manufacturing TL + TLM + DMs.", "Referee options concerning jump-drive access and isolated-region minimums are recorded as policy choices and are not imposed automatically."]);
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
function or(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function sr(e) {
	let t = or(e), n = or(t?.energy)?.techLevel, r = or(t?.electronics)?.techLevel, i = or(t?.manufacturing)?.techLevel;
	return typeof n != "number" || typeof r != "number" || typeof i != "number" ? null : {
		energyTechLevel: n,
		electronicsTechLevel: r,
		manufacturingTechLevel: i
	};
}
function cr(e, t, n) {
	return {
		atmosphereCode: e.physical?.atmosphereCode ?? 0,
		hydrographicsCode: e.physical?.hydrographicsCode ?? 0,
		sizeCode: e.physical?.sizeCode ?? 0,
		populationCode: t.populationCode,
		pcr: n,
		starport: t.starport
	};
}
function lr(e, t, n) {
	let r = or(n.qualityOfLifeTechnologyDetails);
	if (n.populationCode === 0 || !r) return {
		...n,
		transportationTechnologyDetails: null
	};
	let i = cr(t, n, typeof n.populationConcentration?.rating == "number" ? n.populationConcentration.rating : null), a = sr(r.world);
	if (a) return {
		...n,
		transportationTechnologyDetails: {
			method: "WBH transportation technology audit",
			world: ar(w("transportationTechnology", e, t.id, "world", n.uwp), {
				...i,
				...a
			}),
			factions: [],
			generationNotes: ["Non-balkanised world uses its world PCR and Quality of Life Tech Levels."]
		}
	};
	let o = (Array.isArray(r.factions) ? r.factions : []).flatMap((r) => {
		let i = or(r), a = typeof i?.factionId == "string" ? i.factionId : null, o = sr(i?.hostOrAdjacent), s = sr(i?.nonHost);
		if (!a || !o || !s) return [];
		let c = cr(t, n, null);
		return [{
			factionId: a,
			hostOrAdjacent: ar(w("transportationTechnology", e, t.id, a, "host", n.uwp), {
				...c,
				...o
			}),
			nonHost: ar(w("transportationTechnology", e, t.id, a, "non-host", n.uwp), {
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
function ur(e, t, n, r) {
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
		social: lr(e, a, n.social)
	};
}
function dr(e) {
	return {
		...e,
		worlds: e.worlds.map((t) => {
			let n = t.social ? lr(e.id, t, t.social) : t.social, r = t.physical?.details?.satellites;
			return r ? {
				...t,
				social: n,
				physical: {
					...t.physical,
					details: {
						...t.physical.details,
						satellites: {
							...r,
							moons: r.moons.map((n, r) => ur(e.id, t, n, r))
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
//#region src/rules/system/applySocialDetailPasses.ts
var fr = [
	At,
	St,
	tn,
	Nn,
	rt,
	pt,
	qt,
	Ge,
	Qe,
	Wn,
	dr,
	gn,
	Dn,
	er
];
function pr(e) {
	return fr.reduce((e, t) => t(e), e);
}
//#endregion
//#region src/rules/orbits/eccentricity.ts
function mr(e, t = 0) {
	let n = e.roll(2, 6, t).total, r;
	return r = n <= 5 ? Math.max(0, -.001 + e.d6() / 1e3) : n <= 7 ? e.d6() / 200 : n <= 9 ? .03 + e.d6() / 100 : n === 10 ? .05 + e.d6() / 20 : n === 11 ? .05 + e.roll(2, 6).total / 20 : .3 + e.roll(2, 6).total / 20, E(Math.max(0, Math.min(.999, r)), 3);
}
//#endregion
//#region src/rules/stars/starTables.ts
function hr(e, t = "classic") {
	return t === "realistic" ? e <= 2 ? "Special" : e <= 8 ? "M" : e === 9 ? "K" : e === 10 ? "G" : e === 11 ? "F" : "Hot" : e <= 2 ? "Special" : e <= 6 ? "M" : e <= 8 ? "K" : e <= 10 ? "G" : e === 11 ? "F" : "Hot";
}
function gr(e, t) {
	return t ? e <= 3 ? "VI" : e <= 5 ? "BD" : e <= 8 ? "D" : e <= 10 ? "III" : e === 11 ? "II" : "Peculiar" : e <= 5 ? "VI" : e <= 8 ? "IV" : "III";
}
function _r(e) {
	return e <= 8 ? "III" : e <= 10 ? "II" : e === 11 ? "Ib" : "Ia";
}
function vr(e) {
	return e <= 9 ? "A" : e <= 11 ? "B" : "O";
}
function yr(e, t, n) {
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
var br = [
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
], xr = {
	starDistribution: "classic",
	allowUnusualPrimaries: !0,
	detailLevel: "standard"
};
function Sr(e) {
	return {
		...xr,
		...e
	};
}
function Cr(e, t, n) {
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
function wr(e, t, n, r) {
	let i = br.filter((t) => t.spectralType === e);
	if (i.length === 0) throw Error(`No rows for spectral type ${e}`);
	let a = i.filter((e) => e.subtype <= t).at(-1) ?? i[0], o = i.find((e) => e.subtype >= t) ?? i.at(-1), s = o.subtype - a.subtype || 1, c = (t - a.subtype) / s, l = (e) => {
		if (r === "temperatureK") return e.temperatureK;
		let t = e[r][n];
		return t === void 0 ? e[r].V ?? e[r].III ?? 1 : t;
	};
	return l(a) + (l(o) - l(a)) * c;
}
function Tr(e, t) {
	return e ** 2 * (t / 5772) ** 4;
}
function Er(e, t, n, r, i, a, o) {
	let s = Cr(n, r, i), c = s.spectralType, l = s.subtype, u = wr(c, l, i, "mass"), d = wr(c, l, i, "diameter"), f = wr(c, l, i, "temperatureK"), p = Tr(d, f);
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
function Dr(e, t) {
	let n = 10 / Math.max(t, .08) ** 2.5;
	if (t < .9) return e.d6() * 2 + Math.ceil(e.d6() / 2) - 1;
	let r = Math.max(.01, e.d10ZeroToNine() / 10);
	return Math.max(.01, Math.min(n, n * r));
}
function Or(e, t, n, r, i) {
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
			luminositySolar: Number(Tr(s, o).toFixed(6)),
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
			luminositySolar: Number(Tr(o, r).toFixed(6)),
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
function kr(e, t, n) {
	let r = hr(e.roll(2, 6, t ? 0 : -1).total, n);
	return r === "Hot" ? vr(e.roll(2, 6).total) : r;
}
function Ar(e, t, n, r, i) {
	let a = Sr(i), o = kr(e, r, a.starDistribution), s = "V", c = "";
	if (o === "Special") {
		let i = gr(e.roll(2, 6).total, a.allowUnusualPrimaries);
		if (i === "BD" || i === "D" || i === "Peculiar") return Or(e, t, n, i, r);
		s = i === "III" ? _r(e.roll(2, 6).total) : i, c = `Special-system result resolved as luminosity class ${s}.`;
	}
	let l;
	if (o === "Special") {
		let t = hr(e.roll(2, 6, 1).total, a.starDistribution);
		l = t === "Hot" ? vr(e.roll(2, 6).total) : t === "Special" ? "M" : t;
	} else l = o;
	let u = yr(e.roll(2, 6).total, l, r), d = Er(t, n, l, u, s, 0, c || void 0), f = s === "V" || s === "VI" ? Dr(e, d.massSolar) : Math.max(Dr(e, Math.max(.9, Math.min(d.massSolar, 3))), 1), p = Er(t, n, l, u, s, f, c || void 0);
	return p.orbitClass = r ? "Primary" : "Far", p;
}
function jr(e, t, n, r, i) {
	return Ar(e, t, n, r, i);
}
//#endregion
//#region src/rules/stars/wbhNonPrimaryStars.ts
var Mr = [
	"O",
	"B",
	"A",
	"F",
	"G",
	"K",
	"M"
], Nr = [
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
function Pr(e, t) {
	return t === "other" ? e <= 7 ? "D" : "BD" : t === "secondary" ? e <= 3 ? "Other" : e <= 6 ? "Random" : e <= 8 ? "Lesser" : e <= 10 ? "Sibling" : "Twin" : t === "companion" ? e <= 3 ? "Other" : e <= 5 ? "Random" : e <= 7 ? "Lesser" : e <= 9 ? "Sibling" : "Twin" : e <= 3 ? "Other" : e <= 8 ? "Random" : e <= 10 ? "Lesser" : "Twin";
}
function Fr(e) {
	return e.luminosityClass === "III" || e.luminosityClass === "IV" ? -1 : 0;
}
function Ir(e, t) {
	return e.spectralType === "D" ? "post-stellar" : t;
}
function Lr(e) {
	let t = Mr.indexOf(e);
	return t < 0 || t === Mr.length - 1 ? "M" : Mr[t + 1];
}
function Rr(e, t, n) {
	let r = Mr.indexOf(e), i = Mr.indexOf(n.spectralType);
	return r < 0 || i < 0 ? !1 : r === i ? (t ?? 0) < (n.subtype ?? 0) : r < i;
}
function zr(e, t) {
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
	let n = Lr(e.spectralType);
	return {
		spectralType: n,
		subtype: t,
		luminosityClass: e.luminosityClass === "IV" && n === "M" ? "V" : e.luminosityClass
	};
}
function Br(e, t) {
	let n = t.spectralType === "D" || t.spectralType === "BD" ? t.spectralType : t.spectralType === "M" ? "M" : Lr(t.spectralType);
	return zr(t, n === "D" ? 0 : yr(e.roll(2, 6).total, n, !1));
}
function Vr(e, t) {
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
		n = Lr(n);
	}
	let i = e.luminosityClass === "IV" && n === "M" ? "V" : e.luminosityClass;
	return {
		spectralType: n,
		subtype: r,
		luminosityClass: i
	};
}
function Hr(e, t) {
	return Vr(t, e.d6());
}
function Ur(e, t, n) {
	let r = hr(e.roll(2, 6).total, n.starDistribution);
	r === "Hot" && (r = vr(e.roll(2, 6).total));
	let i = "V";
	if (r === "Special") {
		let t = gr(e.roll(2, 6).total, n.allowUnusualPrimaries);
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
		let a = hr(e.roll(2, 6, 1).total, n.starDistribution);
		a === "Hot" && (a = vr(e.roll(2, 6).total)), r = a === "Special" ? "M" : a;
	}
	let a = yr(e.roll(2, 6).total, r, !1);
	return Rr(r, a, t) ? Br(e, t) : {
		spectralType: r,
		subtype: a,
		luminosityClass: i
	};
}
function Wr(e, t) {
	let n = Math.max(0, Math.min(13, e)), r = Nr[0], i = Nr.at(-1);
	for (let e = 1; e < Nr.length; e += 1) if (n <= Nr[e].ageGyr) {
		r = Nr[e - 1], i = Nr[e];
		break;
	}
	let a = i.ageGyr - r.ageGyr || 1, o = (n - r.ageGyr) / a, s = r.temperatureK + (i.temperatureK - r.temperatureK) * o;
	return Math.max(3e3, Math.round(s * t / .6));
}
function Gr(e, t) {
	let n = Math.max(.08, e * t);
	return 10 / n ** 2.5 * (1 + 1 / (4 + n) + 1 / (10 * n ** 3));
}
function Kr(e, t, n, r) {
	let i = Number(((e.roll(2, 6).total - 1) / 10 + e.d10ZeroToNine() / 100).toFixed(3)), a = 2 + e.die(3), o = Gr(i, a);
	for (; o > 13.8 && a < 5;) a += 1, o = Gr(i, a);
	let s = o <= r ? r - o : e.d6() * 2 + e.die(3) - 1, c = Math.min(13.8, Math.max(r, o + s)), l = Math.max(0, c - o), u = Number((1 / Math.max(i, .01) * .01).toFixed(3)), d = Wr(l, i), f = Number(Tr(u, d).toFixed(6));
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
function qr(e, t, n, r, i) {
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
			luminositySolar: Number(Tr(c, s).toFixed(6)),
			ageGyr: Number(i.toFixed(3)),
			stellarNature: "Brown dwarf",
			generationNote: "WBH non-primary brown dwarf; detailed brown-dwarf aging remains a later special-object refinement."
		}
	};
}
function Jr(e, t, n, r, i) {
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
			luminositySolar: Number(Tr(c, l).toFixed(6)),
			ageGyr: Number(i.toFixed(3)),
			stellarNature: "Brown dwarf",
			generationNote: "WBH brown-dwarf sibling of its direct parent."
		}
	};
}
function Yr(e, t, n, r) {
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
function Xr(e, t, n, r, i, a, o) {
	if (t.spectralType === "BD") return Jr(e, t, r, i, o);
	let s = Ir(t, n), c = Pr(e.roll(2, 6, Fr(t)).total, s);
	if (c === "Other" && (c = Pr(e.roll(2, 6).total, "other")), c === "D") return Kr(e, r, i, o);
	if (c === "BD") return qr(e, r, i, null, o);
	if (c === "Twin" && t.spectralType === "D") return Yr(t, r, i, o);
	let l = c === "Lesser" ? Br(e, t) : c === "Sibling" ? Hr(e, t) : c === "Twin" ? {
		spectralType: t.spectralType,
		subtype: t.subtype,
		luminosityClass: t.luminosityClass
	} : Ur(e, t, a);
	return l.spectralType === "D" ? Kr(e, r, i, o) : l.spectralType === "BD" ? qr(e, r, i, l.subtype, o) : {
		requiredSystemAgeGyr: o,
		star: Er(r, i, l.spectralType, l.subtype ?? 0, l.luminosityClass, o, `WBH non-primary ${n} determination: ${c}.`)
	};
}
function Zr(e, t, n = /* @__PURE__ */ new Map()) {
	let r = Number(Math.min(13.8, Math.max(.001, t)).toFixed(3));
	return e.map((e) => {
		let t = n.get(e.id);
		if (e.spectralType !== "D" || t === void 0) return {
			...e,
			ageGyr: r
		};
		let i = Math.max(0, r - t), a = Wr(i, e.massSolar), o = Number(Tr(e.diameterSolar, a).toFixed(6));
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
function Qr(e) {
	return e.find((e) => e.orbitClass === "Primary") ?? e[0] ?? null;
}
function $r(e) {
	return e.spectralType === "D" || e.luminosityClass === "D";
}
function ei(e) {
	return e.spectralType === "BD" || e.luminosityClass === "BD";
}
function ti(e) {
	return e <= 4 ? 1 : e <= 6 ? 2 : e <= 8 ? 3 : e <= 11 ? 4 : e === 12 ? 5 : 6;
}
function ni(e) {
	return e <= 6 ? 1 : e <= 11 ? 2 : 3;
}
function ri(e) {
	let t = Qr(e), n = e.filter($r).length;
	if (!t) return {
		postStellarObjects: 0,
		gasGiantQuantityDm: 0,
		planetoidBeltQuantityDmWithoutGasGiant: 0,
		terrestrialPlanetDm: 0
	};
	let r = 0;
	e.length === 1 && t.luminosityClass === "V" && (r += 1), ei(t) && (r -= 2), $r(t) && (r -= 2), r -= n, e.length >= 4 && --r;
	let i = 0;
	return $r(t) && (i += 1), i += n, e.length >= 2 && (i += 1), {
		postStellarObjects: n,
		gasGiantQuantityDm: r,
		planetoidBeltQuantityDmWithoutGasGiant: i,
		terrestrialPlanetDm: n === 0 ? 0 : -n
	};
}
function ii(e, t, n) {
	if (!Number.isInteger(e) || e < 2 || e > 12) throw RangeError("Terrestrial planet raw 2D total must be 2-12.");
	if (!Number.isInteger(t) || t < 0) throw RangeError("Post-stellar object count must be a non-negative integer.");
	if (!Number.isInteger(n) || n < 1 || n > 3) throw RangeError("Terrestrial planet adjustment D3 must be 1-3.");
	let r = e - 2 - t;
	return r < 3 ? n + 2 : r + n - 1;
}
function ai(e, t) {
	let n = e.roll(2, 6).total;
	return oi(t) ? n <= 7 : n <= 9;
}
function oi(e) {
	return e !== null && ei(e);
}
function si(e, t) {
	let n = Qr(t), r = ri(t), i = ai(e, n) ? ti(e.roll(2, 6, r.gasGiantQuantityDm).total) : 0, a = r.planetoidBeltQuantityDmWithoutGasGiant + +(i > 0), o = e.roll(2, 6).total >= 8 ? ni(e.roll(2, 6, a).total) : 0, s = ii(e.roll(2, 6).total, r.postStellarObjects, e.die(3));
	return {
		gasGiants: i,
		planetoidBelts: o,
		terrestrialPlanets: s,
		totalWorlds: i + o + s
	};
}
//#endregion
//#region src/rules/worlds/wbhTidalLock.ts
var ci = 8766;
function li(e, t) {
	return T("tidalLock", e.id, t.case, t.targetId, t.dm, e.orbitNumber, e.au, e.eccentricity);
}
function di(e, t) {
	let n = e.roll(2, 6, t).total, r;
	return r = n <= 5 ? -.001 + e.d6() / 1e3 : n <= 7 ? e.d6() / 200 : n <= 9 ? .03 + e.d6() / 100 : n === 10 ? .05 + e.d6() / 20 : n === 11 ? .05 + e.roll(2, 6).total / 20 : .3 + e.roll(2, 6).total / 20, E(Math.max(0, Math.min(.999, r)), 3);
}
function fi(e, t, n, r, i) {
	let a = 0;
	return e !== null && e >= 1 && (a += Math.ceil(e / 3)), t > .1 && (a -= Math.floor(t * 10)), n > 30 && (a -= 2), n >= 60 && n <= 120 && (a -= 4), n >= 80 && n <= 100 && (a -= 4), r !== null && r > 2.5 && (a -= 2), i < 1 ? a -= 2 : i > 10 ? a += 4 : i >= 5 && (a += 2), a;
}
function pi(e) {
	return e < .5 ? -2 : e < 1 ? -1 : e <= 2 ? 0 : e <= 5 ? 1 : 2;
}
function mi(e, t, n) {
	let r = -4;
	e.orbitNumber < 1 ? r += 4 + Math.floor(10 * (1 - e.orbitNumber)) : e.orbitNumber < 2 ? r += 4 : e.orbitNumber <= 3 ? r += 1 : r -= Math.floor(e.orbitNumber) * 2;
	let i = Math.max(1, t.starCount ?? 1), a = t.totalStarMassSolar ?? n.massSolar;
	r += pi(a), i > 1 && (r -= i);
	let o = (t.satellites ?? []).reduce((e, t) => e + (typeof t.sizeCode == "number" && t.sizeCode >= 1 ? t.sizeCode : 0), 0);
	return r -= o, r;
}
function hi(e) {
	let t = 6;
	return e.orbitPd > 20 && (t -= Math.floor(e.orbitPd / 20)), e.direction === "Retrograde" && (t -= 2), e.parentMassTerra > 1e3 ? t += 8 : e.parentMassTerra > 100 ? t += 6 : e.parentMassTerra > 10 ? t += 4 : e.parentMassTerra >= 1 && (t += 2), t;
}
function gi(e, t) {
	let n = -10;
	typeof e.sizeCode == "number" && e.sizeCode >= 1 && (n += e.sizeCode);
	let r = e.orbitPd;
	return r < 5 ? n += 5 + Math.ceil((5 - r) * 5) : r < 10 ? n += 4 : r < 20 ? n += 2 : r < 40 ? n += 1 : r > 60 && (n -= 6), n -= Math.max(0, t - 1) * 2, n;
}
function _i(e, t, n) {
	let r = e / (n ? -t : t) - 1;
	return Math.abs(r) < 1e-9 ? {
		solarDaysPerYear: 0,
		solarDayHours: null,
		infinite: !0
	} : {
		solarDaysPerYear: E(r, 6),
		solarDayHours: E(Math.abs(e / r), 6),
		infinite: !1
	};
}
function vi(e, t) {
	return t <= 3 ? t : E(e.roll(2, 6, -2).total / 10, 3);
}
function yi(e, t, n, r, i) {
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
	else if (a === 11) s = r.targetPeriodHours * 2 / 3, l = vi(e, l), d = "3:2";
	else if (d = "1:1", s = r.targetPeriodHours, l = vi(e, l), u > .1 && (u = Math.min(u, di(e, -2))), e.roll(2, 6).total === 12) {
		let t = e.roll(2, 6).total, a = yi(e, t, n, r, i);
		if (r.case === "moon-planet" && a.siderealHours > r.targetPeriodHours) o.push("WBH broken-lock reroll would exceed the moon orbital period; the moon remains in a 1:1 lock.");
		else return a.notes.push("WBH natural-12 broken-lock check replaced the initial 1:1 result with a no-DM Tidal Lock Status roll."), a;
	}
	return {
		status: d,
		siderealHours: E(s, 6),
		direction: c,
		axialTiltDegrees: E(l, 4),
		adjustedEccentricity: E(u, 3),
		result: a,
		notes: o
	};
}
function bi(e, t, n, r) {
	let i = fi(r.sizeCode, r.moon?.eccentricity ?? e.eccentricity, n.axialTiltDegrees, r.atmospherePressureBar, t.ageGyr);
	if (r.moon) return [{
		case: "moon-planet",
		dm: i + hi(r.moon),
		targetId: r.moon.parentId,
		targetPeriodHours: r.moon.orbitalPeriodHours
	}];
	let a = [{
		case: "planet-star",
		dm: i + mi(e, r, t),
		targetId: t.id,
		targetPeriodHours: r.orbitalPeriodYears * ci
	}];
	if (r.sizeCode !== null && r.sizeCode >= 1 && r.satellites?.length) {
		let e = r.satellites.filter((e) => e.physical?.details?.rotation?.tidalLockStatus === "1:1" && e.physical.details.rotation.tidalLockCase === "moon-planet");
		for (let t of e) a.push({
			case: "planet-moon",
			dm: i + gi(t, r.satellites.length),
			targetId: t.sourceId ?? t.designation,
			targetPeriodHours: t.periodHours,
			moon: t
		});
	}
	return a;
}
function xi(e, t, n, r) {
	if (n.tidalLockStatus !== "unresolved") return n;
	let i = bi(e, t, n, r);
	if (!i.length) return n;
	let a = Math.max(...i.map((e) => e.dm)), o = i.filter((e) => e.dm === a).sort((e, t) => e.case === t.case && e.case === "planet-moon" ? (e.moon?.orbitPd ?? 0) - (t.moon?.orbitPd ?? 0) : e.case === "planet-moon" ? -1 : +(t.case === "planet-moon")), s = o[0], c = null, l = -Infinity;
	for (let t of o) {
		let i = li(e, t), a;
		a = t.dm <= -10 ? 2 : t.dm >= 10 ? 12 : i.roll(2, 6, t.dm).total;
		let o = yi(i, a, n, t, r.moon?.eccentricity ?? e.eccentricity);
		if (a > l && (c = o, l = a, s = t), o.status === "3:2" || o.status === "1:1") {
			c = o, s = t;
			break;
		}
	}
	if (!c) return n;
	let u = r.orbitalPeriodYears * ci, d = s.case === "planet-star" && c.status === "1:1" ? {
		solarDaysPerYear: 0,
		solarDayHours: null,
		infinite: !0
	} : _i(u, c.siderealHours, c.direction === "Retrograde");
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
var Si = 3, Ci = 1e-9;
function wi(e, t) {
	let n = 10 ** t;
	return Math.floor((e + Ci) * n) / n;
}
function Ti(e, t, n) {
	if (e < t || e > n || e <= 0) return null;
	let r = 1 - t / e, i = n / e - 1, a = Math.min(.999, r, i);
	return a < 0 ? null : Math.max(0, wi(a, Si));
}
function Ei(e) {
	let t = e.physical?.details?.gasGiant?.profile;
	return `${e.designation}:${t ?? e.sizeCode}@${e.orbitPd}PD`;
}
function Di(e, t) {
	let n = e.rings.length ? `R${String(e.rings.length).padStart(2, "0")}:${e.rings.map((e) => `${e.centrePd}-${e.spanPd}`).join(",")}` : "R00", r = t.map(Ei).join(",");
	return `${n}${r ? ` ${r}` : ""}`;
}
function Oi(e, t) {
	let n = t.generationNotes.filter((e) => !e.startsWith("WBH moon-orbit boundary stabilization constrained ") && !e.startsWith("WBH moon-orbit boundary stabilization removed ")), r = [];
	for (let i of t.moons) {
		let a = i.sourceId ?? `${e}.${i.designation}`, o = Ti(i.orbitPd, t.rocheLimitPd, t.hillSphereMoonLimitPd);
		if (o === null) {
			n.push(`WBH moon-orbit boundary stabilization removed ${a}: nominal orbit ${E(i.orbitPd, 3)} PD lies outside the persistent significant-moon interval bounded by Roche ${E(t.rocheLimitPd, 3)} PD and Hill Sphere Moon Limit ${E(t.hillSphereMoonLimitPd, 3)} PD.`);
			continue;
		}
		let s = Math.min(i.eccentricity, o);
		if (s < i.eccentricity) {
			let e = i.orbitPd * (1 - i.eccentricity), r = i.orbitPd * (1 + i.eccentricity), o = i.orbitPd * (1 - s), c = i.orbitPd * (1 + s);
			n.push(`WBH moon-orbit boundary stabilization constrained ${a} pre-tidal-lock eccentricity ${i.eccentricity} -> ${s}: periapsis/apoapsis ${E(e, 3)}/${E(r, 3)} PD -> ${E(o, 3)}/${E(c, 3)} PD, preserving the generated semi-major-axis location between Roche ${E(t.rocheLimitPd, 3)} PD and Hill Sphere Moon Limit ${E(t.hillSphereMoonLimitPd, 3)} PD. This boundary value precedes later WBH tidal-lock reconciliation.`);
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
		profile: Di(t, r),
		generationNotes: n
	};
}
function ki(e) {
	return e.map((e) => {
		let t = e.physical, n = t?.details, r = n?.satellites;
		return !t || !n || !r ? e : {
			...e,
			physical: {
				...t,
				details: {
					...n,
					satellites: Oi(e.id, r)
				}
			}
		};
	});
}
//#endregion
//#region src/rules/worlds/wbhSurfaceTides.ts
var Ai = 1e6;
function ji(e, t, n) {
	return t <= 0 || n <= 0 ? 0 : e * t / (32 * n ** 3);
}
function Mi(e, t, n) {
	if (e <= 0 || t <= 0 || n <= 0) return 0;
	let r = n / Ai;
	return e * t / (3.2 * r ** 3);
}
function Ni(e) {
	return E(e, 6);
}
function Pi(e) {
	let t = [], n = e.rotationLockStatus === "1:1" && e.rotationLockCase === "planet-star", r = n ? 0 : ji(e.star.massSolar, e.sizeCode, e.distanceAu);
	t.push({
		sourceType: "star",
		sourceId: e.star.id,
		sourceDesignation: e.star.designation,
		amplitudeMetres: Ni(r),
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
		let o = e.rotationLockStatus === "1:1" && e.rotationLockCase === "planet-moon" && e.rotationLockTargetId === (n.sourceId ?? n.designation), s = o ? 0 : Mi(r, e.sizeCode, n.orbitKm);
		i += s, t.push({
			sourceType: "moon",
			sourceId: n.sourceId ?? n.designation,
			sourceDesignation: n.designation,
			amplitudeMetres: Ni(s),
			suppressedByOneToOneLock: o,
			distance: Ni(n.orbitKm / Ai),
			distanceUnit: "Mkm"
		});
	}
	return {
		method: "WBH surface tidal effects",
		totalAmplitudeMetres: Ni(r + i),
		stellarAmplitudeMetres: Ni(r),
		directSatelliteAmplitudeMetres: Ni(i),
		directParentAmplitudeMetres: 0,
		contributions: t,
		optionalMoonPairEffectsIncluded: !1,
		generationNotes: a
	};
}
function Fi(e) {
	let t = [], n = ji(e.star.massSolar, e.sizeCode, e.stellarDistanceAu);
	t.push({
		sourceType: "star",
		sourceId: e.star.id,
		sourceDesignation: e.star.designation,
		amplitudeMetres: Ni(n),
		suppressedByOneToOneLock: !1,
		distance: e.stellarDistanceAu,
		distanceUnit: "AU"
	});
	let r = e.rotationLockStatus === "1:1" && e.rotationLockCase === "moon-planet", i = r ? 0 : Mi(e.parentMassTerra, e.sizeCode, e.parentDistanceKm);
	return t.push({
		sourceType: "planet",
		sourceId: e.parentId,
		sourceDesignation: e.parentDesignation,
		amplitudeMetres: Ni(i),
		suppressedByOneToOneLock: r,
		distance: Ni(e.parentDistanceKm / Ai),
		distanceUnit: "Mkm"
	}), {
		method: "WBH surface tidal effects",
		totalAmplitudeMetres: Ni(n + i),
		stellarAmplitudeMetres: Ni(n),
		directSatelliteAmplitudeMetres: 0,
		directParentAmplitudeMetres: Ni(i),
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
function Ii(e) {
	return e.details?.size?.massTerra ?? e.details?.gasGiant?.massTerra ?? null;
}
function Li(e, t, n, r) {
	let i = r.physical, a = Ii(t);
	if (!i?.details || a === null || typeof r.sizeCode != "number" || r.sizeCode <= 0 || i.details.gasGiant) return r;
	let o = i.details.rotation, s = Fi({
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
function Ri(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = Ae(e, t);
	if (!r) return e;
	let i = n.details.satellites, a = i && {
		...i,
		moons: i.moons.map((t) => Li(e, n, r, t))
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
	let o = n.details.rotation, s = Pi({
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
function zi(e, t) {
	return e.map((e) => Ri(e, t));
}
//#endregion
//#region src/rules/worlds/wbhTemperatureExtremes.ts
function Bi(e) {
	return Math.max(0, Math.min(1, e));
}
function Vi(e, t) {
	let n = Math.sin(Math.max(0, Math.min(180, e)) * Math.PI / 180);
	return t < .1 ? n /= 2 : t > 2 && (n += Math.min(.25, .01 * t)), Bi(n);
}
function Hi(e) {
	if (e.tidalLockStatus === "1:1" && e.tidalLockCase === "planet-star" || e.solarDayInfinite) return 1;
	let t = Math.abs(e.solarDayHours ?? 0);
	return t >= 2500 ? 1 : Bi(Math.sqrt(t) / 50);
}
function Ui(e) {
	return e ? e.code >= 9 ? .1 : e.code <= 1 ? -.1 : 0 : 0;
}
function Wi(e, t) {
	return (10 - e) / 20 + (e >= 2 && e <= 8 ? Ui(t?.distribution) : 0);
}
function Gi(e, t) {
	return t === null ? e.initialGreenhouseFactor === 0 ? 1 : null : Math.max(1, 1 + t);
}
function Ki(e, t, n, r) {
	let i = e * (1 - t) * (1 + n) / Math.max(r, 1e-6) ** 2;
	return Math.max(3, Math.round(279 * Math.max(0, i) ** .25));
}
function qi(e) {
	let t = Vi(e.rotation.axialTiltDegrees, e.seasonalPeriodYears), n = Hi(e.rotation), r = Wi(e.hydrographicsCode, e.hydrographics), i = Bi(t + n + r), a = Gi(e.climate, e.pressureBar), o = a === null ? null : Bi(i / a), s = Math.max(0, Math.min(.999999, e.eccentricity)), c = Math.max(1e-6, e.distanceAu * (1 - s)), l = Math.max(1e-6, e.distanceAu * (1 + s)), u = null, d = null, f = null, p = null;
	o !== null && e.climate.greenhouseFactor !== null && (u = e.luminositySolar * (1 + o), d = e.luminositySolar * (1 - o), f = Ki(u, e.climate.albedo, e.climate.greenhouseFactor, c), p = Ki(d, e.climate.albedo, e.climate.greenhouseFactor, l));
	let m = [
		"WBH high/low temperatures are baseline planetwide values at mean baseline altitude, not absolute local extremes.",
		"Variance combines axial tilt, rotation and hydrographic geography, then clamps the result to the WBH 0-1 range.",
		e.isMoon ? "For this significant moon, near/far stellar AU uses the parent planet orbital eccentricity; optional moon-orbit distance correction is not included." : "Near/far stellar AU uses the world's final post-lock orbital eccentricity."
	];
	return a === null && m.push("Temperature extremes remain unresolved because no mean atmospheric pressure is available for the WBH atmospheric factor."), e.rotation.tidalLockStatus === "1:1" && e.rotation.tidalLockCase === "planet-star" && m.push("WBH rotation factor is forced to 1.0 for a world in a 1:1 stellar tidal lock."), {
		method: "WBH high and low temperatures",
		axialTiltFactor: E(t, 6),
		rotationFactor: E(n, 6),
		geographicFactor: E(r, 6),
		varianceFactor: E(i, 6),
		atmosphericFactor: a === null ? null : E(a, 6),
		luminosityModifier: o === null ? null : E(o, 6),
		highLuminositySolar: u === null ? null : E(u, 6),
		lowLuminositySolar: d === null ? null : E(d, 6),
		nearAu: E(c, 6),
		farAu: E(l, 6),
		highTemperatureK: f,
		highTemperatureC: f === null ? null : f - 273,
		lowTemperatureK: p,
		lowTemperatureC: p === null ? null : p - 273,
		generationNotes: m
	};
}
//#endregion
//#region src/rules/system/wbhSystemTemperatureExtremes.ts
var Ji = 8766;
function Yi(e) {
	return e.details?.atmosphere?.meanBaselinePressureBar ?? null;
}
function Xi(e, t, n) {
	let r = n.physical, i = r?.details, a = i?.climate, o = i?.rotation;
	if (!r || !i || !a || !o || typeof n.sizeCode != "number" || n.sizeCode <= 0 || i.gasGiant || r.hydrographicsCode === null) return n;
	let s = qi({
		climate: a,
		rotation: o,
		hydrographics: i.hydrographics,
		hydrographicsCode: r.hydrographicsCode,
		pressureBar: Yi(r),
		luminositySolar: t.luminositySolar,
		distanceAu: e.au,
		eccentricity: e.eccentricity,
		seasonalPeriodYears: n.periodHours / Ji,
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
function Zi(e, t) {
	let n = e.physical, r = n?.details;
	if (!n || !r) return e;
	let i = Ae(e, t);
	if (!i) return e;
	let a = r.satellites ? {
		...r.satellites,
		moons: r.satellites.moons.map((t) => Xi(e, i, t))
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
	let o = qi({
		climate: r.climate,
		rotation: r.rotation,
		hydrographics: r.hydrographics,
		hydrographicsCode: n.hydrographicsCode,
		pressureBar: Yi(n),
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
function Qi(e, t) {
	return e.map((e) => Zi(e, t));
}
//#endregion
//#region src/rules/worlds/wbhSeismology.ts
var $i = 332971, ea = 1e6, ta = 24, na = 365.25;
function ra(e, t) {
	let n = t.details?.size;
	return w("seismology", e, n?.diameterKm ?? "none", n?.densityTerra ?? "none");
}
function ia(e, t, n, r, i = []) {
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
function aa(e) {
	return Math.max(0, Math.floor(e / 10));
}
function oa(e, t, n, r, i, a) {
	if (e <= 0 || t <= 0 || n <= 0 || r <= 0 || i <= 0 || a <= 0) return 0;
	let o = e ** 2 * t ** 5 * n ** 2 / (3e3 * r ** 5 * i * a);
	return o < 1 ? 0 : Math.floor(o);
}
function sa(e, t) {
	return e === null ? null : E((e ** 4 + Math.max(0, t) ** 4) ** .25, 6);
}
function ca(e, t, n, r, i) {
	if (!(r && n >= 1 && i > 0)) return {
		count: 0,
		roll: null,
		dm: 0,
		eligible: !1
	};
	let a = i > 100 ? 2 : +(i >= 10), o = ie(e).roll(2, 6).total, s = t + n - o + a;
	return {
		count: s <= 1 ? 0 : s,
		roll: o,
		dm: a,
		eligible: !0
	};
}
function la(e) {
	let t = e.profile.details, n = t?.size, r = e.profile.sizeCode;
	if (!t || !n || r === null || r <= 0) return null;
	let i = t.satellites?.moons ?? [], a = ia(r, e.star.ageGyr, n.densityTerra, !1, i), o = aa(t.surfaceTides?.totalAmplitudeMetres ?? 0), s = oa(e.star.massSolar * $i, r, e.eccentricity, e.profile.details?.climate?.distanceAuUsed ? e.profile.details.climate.distanceAuUsed * 149.5978709 : 0, e.profile.orbitalPeriodYears * na, n.massTerra), c = a.stress + o + s, l = t.hydrographics?.composition === "H2O", u = ca(ra(e.id, e.profile), r, e.profile.hydrographicsCode ?? 0, l, c);
	return {
		method: "WBH seismology",
		residualSeismicStress: a.stress,
		residualStressDm: a.dm,
		tidalStressFactor: o,
		tidalHeatingFactor: s,
		totalSeismicStress: c,
		seismicAdjustedMeanTemperatureK: sa(t.climate?.meanTemperatureK ?? null, c),
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
function ua(e) {
	let t = e.profile.details, n = t?.size;
	if (!t || !n || e.sizeCode <= 0) return null;
	let r = ia(e.sizeCode, e.starAgeGyr, n.densityTerra, !0), i = aa(t.surfaceTides?.totalAmplitudeMetres ?? 0), a = oa(e.parentMassTerra, e.sizeCode, e.eccentricity, e.orbitKm / ea, e.periodHours / ta, n.massTerra), o = r.stress + i + a, s = t.hydrographics?.composition === "H2O", c = ca(ra(e.id, e.profile), e.sizeCode, e.profile.hydrographicsCode ?? 0, s, o);
	return {
		method: "WBH seismology",
		residualSeismicStress: r.stress,
		residualStressDm: r.dm,
		tidalStressFactor: i,
		tidalHeatingFactor: a,
		totalSeismicStress: o,
		seismicAdjustedMeanTemperatureK: sa(t.climate?.meanTemperatureK ?? null, o),
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
function da(e) {
	return e.details?.size?.massTerra ?? e.details?.gasGiant?.massTerra ?? null;
}
function fa(e, t, n, r) {
	let i = r.physical, a = da(t);
	if (!i?.details || a === null || typeof r.sizeCode != "number" || r.sizeCode <= 0 || i.details.gasGiant) return r;
	let o = ua({
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
function pa(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = Ae(e, t);
	if (!r) return e;
	let i = n.details.satellites, a = i && {
		...i,
		moons: i.moons.map((t) => fa(e, n, r, t))
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
	}, s = la({
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
function ma(e, t) {
	return e.map((e) => pa(e, t));
}
//#endregion
//#region src/rules/worlds/wbhAtmosphereGasMix.ts
var ha = {
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
}, ga = {
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
}, _a = {
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
}, va = {
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
}, ya = {
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
}, ba = {
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
}, xa = {
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
}, Sa = {
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
function Ca(e, t, n, r) {
	return T("atmosphereGasMix", e.id, e.aroundDesignation, e.orbitNumber, e.au, t.designation, n, r);
}
function wa(e) {
	return e >= 453 ? {
		table: ga,
		label: "Boiling 453K+",
		minimum: -2,
		maximum: 13
	} : e >= 353 ? {
		table: _a,
		label: "Boiling 353-453K",
		minimum: 1,
		maximum: 13
	} : e >= 303 ? {
		table: va,
		label: "Hot 303-353K",
		minimum: 1,
		maximum: 13
	} : e >= 273 ? {
		table: ya,
		label: "Temperate 273-303K",
		minimum: 1,
		maximum: 13
	} : e >= 223 ? {
		table: ba,
		label: "Cold 223-273K",
		minimum: 1,
		maximum: 13
	} : e >= 123 ? {
		table: xa,
		label: "Frozen 123-223K",
		minimum: 1,
		maximum: 13
	} : {
		table: Sa,
		label: "Frozen below 123K",
		minimum: 1,
		maximum: 13
	};
}
function Ta(e, t) {
	let n = 0;
	return t >= 453 ? (t > 2e3 ? n -= 5 : t >= 700 && (n -= 2), e >= 1 && e <= 7 && --n) : t >= 223 ? e >= 1 && e <= 7 && --n : t >= 123 ? e >= 1 && e <= 7 && (n -= 2) : (t < 70 ? n += 5 : t <= 100 && (n += 3), e >= 1 && e <= 7 && (n -= 3)), e >= 10 && (n += 1), n;
}
function Ea(e) {
	return e?.composition === "H2O";
}
function Da(e, t, n) {
	return e !== "CO" || n > 900 ? e : Ea(t) ? "CO2" : e;
}
function Oa(e, t) {
	if (!e || e.diameterKm <= 0 || e.massTerra <= 0 || t <= 0) return null;
	let n = e.diameterKm / 12742;
	return E(1e3 * e.massTerra / (n * t), 3);
}
function ka(e, t, n) {
	let r = ha[e] ?? {
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
function Aa(e, t) {
	let n = e.find((e) => e.code === t.code);
	n ? n.percentage = E(n.percentage + t.percentage, 1) : e.push(t);
}
function ja(e) {
	let t = [...e].sort((e, t) => t.percentage - e.percentage).slice(0, 3);
	return t.length ? t.map((e) => `${e.code}-${Math.round(e.percentage).toString().padStart(2, "0")}`).join(":") : null;
}
function Ma(e, t, n, r, i, a, o) {
	if (![
		10,
		11,
		12
	].includes(r) || o === null) return null;
	let s = Ca(e, t, r, o), c = r, l = wa(o), u = Ta(n, o), d = Oa(i, o), f = [], p = 0;
	for (let e = 0; e < 6 && p < 95; e += 1) {
		let e = s.roll(2, 6, u).total, t = Math.max(l.minimum, Math.min(l.maximum, e)), n = l.table[t][c], r = Da(n, a, o), i = 100 - p, m = (s.d6() + 3) / 10;
		Aa(f, ka(r, E(Math.min(i, i * m), 1), d)), p = E(f.reduce((e, t) => e + t.percentage, 0), 1);
	}
	let m = E(Math.max(0, 100 - p), 1), h = ["Gas identities use the WBH temperature/type quick-reference tables; percentages use the Handbook (1D+3)×10% alternative applied successively to the remaining atmosphere.", "WBH quick gas tables are intentionally inspirational and do not guarantee chemically stable combinations; generated values remain Referee-editable source truth."];
	return d !== null && h.push(`Long-term gas-retention threshold is ${d}; a component passes when its WBH escape value is lower than this threshold.`), f.some((e) => e.retainedLongTerm === !1) && h.push("One or more generated gases fail the >1 Gyr WBH retention test and therefore imply replenishment, artificial support, unusual youth, or Referee revision. They are not silently rerolled."), m > 0 && h.push(`${m}% remains unallocated as trace/other gases.`), t.ageGyr < 1 && h.push("World or system is younger than 1 Gyr; WBH permits the Referee to reduce gas escape values for young worlds, but this optional adjustment is not applied automatically."), {
		method: "WBH temperature/type quick table",
		temperatureBand: l.label,
		retentionThreshold: d,
		components: f.sort((e, t) => t.percentage - e.percentage),
		unallocatedPercent: m,
		profile: ja(f),
		generationNotes: h
	};
}
//#endregion
//#region src/rules/worlds/wbhHydrographicsDetails.ts
var Na = {
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
}, Pa = {
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
}, Fa = [
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
function Ia(e, t, n) {
	return T("hydrographics", e.id, e.aroundDesignation, e.orbitNumber, e.au, t.designation, n);
}
function La(e, t, n) {
	return T("surfaceFeatures", e.id, e.aroundDesignation, e.orbitNumber, e.au, t.designation, n);
}
function Ra(e, t, n, r) {
	return T("hydrographicsLiquids", e.id, e.aroundDesignation, e.orbitNumber, e.au, t.designation, n, r);
}
function za(e, t, n) {
	return n <= 0 ? Math.max(0, -4 + e.d10ZeroToNine()) : n >= 10 ? t > 9 ? 100 : Math.min(100, 96 + e.d10ZeroToNine()) : n * 10 - 4 + e.d10ZeroToNine();
}
function Ba(e, t) {
	return t >= 6 ? "ocean" : t <= 4 ? "land" : e.d6() <= 3 ? "ocean" : "land";
}
function Va(e) {
	let t = Math.max(0, Math.min(10, e.roll(2, 6, -2).total)), n = Na[t];
	return {
		code: t,
		description: n.description,
		effect: n.effect
	};
}
function Ha(e, t) {
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
function Ua(e) {
	return Number(e.toFixed(2));
}
function Wa(e) {
	return (e.die(1e4) - 1) / 9999;
}
function Ga(e, t, n, r, i) {
	if (t <= 0 || e <= 0) return [];
	let a = [], o = e;
	for (let e = 0; e < t; e += 1) {
		let s = t - e - 1;
		if (s === 0) {
			a.push(o);
			break;
		}
		let c = Math.max(n, r === null ? n : o - r * s), l = Math.min(r ?? o, o - n * s), u = l <= c ? c : c + (l - c) * Wa(i);
		a.push(u), o -= u;
	}
	let s = a.map(Ua), c = Ua(e - s.reduce((e, t) => e + t, 0));
	return s.length && c !== 0 && (s[s.length - 1] = Ua(s[s.length - 1] + c)), s;
}
function Ka(e, t) {
	return e === "liquid-body" ? t === 1 ? "liquid body" : "liquid bodies" : t === 1 ? e : e === "sea" ? "seas" : `${e}s`;
}
function qa(e, t, n, r, i, a) {
	let o = La(e, t, n), s = i === "ocean" ? Math.max(0, 100 - r) : Math.max(0, r), c = i === "ocean" ? "land" : "liquid", [l, u] = Pa[a], d = s * (l === u ? l : l + (u - l) * Wa(o));
	d > 0 && d < 5 && (d = 0);
	let f = Math.max(0, s - d), p = f * (f === 0 ? 0 : .15 + .2 * Wa(o)), m = f - p;
	m > 0 && m < 1 && (p += m, m = 0);
	let h = Math.floor(d / 5), g = Math.min(h, 4), _ = h > 0 && a < 9 ? o.die(Math.max(2, g)) : 0, v = h <= 0 ? 0 : a >= 9 || g === 1 ? 1 : _, y = Math.min(4.5, 1.5 + a * .25), b = m > 0 ? Math.ceil(m / 4.99) : 0, x = m > 0 ? Math.ceil(m / y) : 0, S = m >= 1 ? Math.max(1, b, x) : 0, ee = p > 0 ? Math.max(1, Math.ceil(p / .8)) : 0, C = i === "ocean" ? "continent" : "liquid-body", te = C, ne = i === "ocean" ? "island" : "liquid-body", w = Ga(d, v, 5, null, o), re = Ga(m, S, 1, 4.99, o), ie = Ga(p, ee, .01, .99, o), T = [
		...w.map((e, t) => ({
			id: `${C}-major-${t + 1}`,
			classification: "major",
			kind: C,
			surfacePercent: e
		})),
		...re.map((e, t) => ({
			id: `${te}-minor-${t + 1}`,
			classification: "minor",
			kind: te,
			surfacePercent: e
		})),
		...ie.map((e, t) => ({
			id: `${ne}-small-${t + 1}`,
			classification: "small",
			kind: ne,
			surfacePercent: e
		}))
	];
	return {
		method: "WBH surface feature distribution",
		discreteFeatureCoveragePercent: Ua(s),
		discreteFeatureType: c,
		majorCoveragePercent: Ua(w.reduce((e, t) => e + t, 0)),
		minorCoveragePercent: Ua(re.reduce((e, t) => e + t, 0)),
		smallCoveragePercent: Ua(ie.reduce((e, t) => e + t, 0)),
		majorBodyCount: v,
		minorBodyCount: S,
		smallBodyCount: ee,
		bodies: T,
		generationPolicy: `WBH supplies the 2D-2 distribution class and map thresholds (major >=5%, minor >=1%, small <1%) but not an exact count formula. Traveller System Generator deterministically allocates the discrete ${c} coverage into ${v} major ${Ka(C, v)}, ${S} minor ${Ka(te, S)}, and ${ee} small ${Ka(ne, ee)} while preserving those thresholds and the table's major-body coverage band.`
	};
}
function Ja(e, t) {
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
function Ya(e, t) {
	if (t.length === 1) return t[0];
	let n = t.reduce((e, t) => e + t.relativeAbundance, 0), r = e.die(n);
	for (let e of t) if (r -= e.relativeAbundance, r <= 0) return e;
	return t[t.length - 1];
}
function Xa(e, t, n, r, i) {
	let a = Ia(e, t, i), o = za(a, n, i), s = Ba(a, i), c = Va(a), l = qa(e, t, i, o, s, c.code), u = [l.generationPolicy], d = null;
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
	].includes(r) ? d = "H2O" : u.push("Hydrographic liquid composition awaits the WBH mean-temperature result before selecting a viable exotic liquid."), l = Ja(l, d), {
		coveragePercent: o,
		foundation: s,
		...Ha(s, d),
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
function Za(e, t, n, r, i) {
	if (e.composition === "None" || e.composition === "H2O" || i === null) return e;
	let a = e.generationNotes.filter((e) => !e.includes("awaits the WBH mean-temperature result")), o;
	if (i > 1e3) a.push("WBH notes that above 1000K the surface liquid may be magma (liquid rock)."), o = "Magma";
	else {
		let e = Fa.filter((e) => i >= e.meltingPointK && i <= e.boilingPointK);
		e.length === 0 ? (a.push(`No WBH Possible Exotic Liquid spans the generated mean surface temperature of ${i}K at standard-pressure reference points; Referee determination required.`), o = null) : (o = Ya(Ra(t, n, r, i), e).code, a.push(`WBH temperature-qualified liquid candidates at ${i}K: ${e.map((e) => e.code).join(", ")}. Selection is weighted by the Handbook relative-abundance values.`), a.push("Melting/boiling reference points assume approximately standard atmospheric pressure; pressure-dependent phase chemistry remains outside the Handbook procedure."));
	}
	let s = e.surfaceFeatures ? Ja(e.surfaceFeatures, o) : e.surfaceFeatures;
	return {
		...e,
		...Ha(e.foundation, o),
		composition: o,
		surfaceFeatures: s,
		generationNotes: a
	};
}
//#endregion
//#region src/rules/system/wbhSystemFinalTemperature.ts
var Qa = 8.5, $a = 288, eo = /* @__PURE__ */ new Set([
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
]), to = /* @__PURE__ */ new Set([
	10,
	11,
	12,
	15
]);
function no(e) {
	return e < 222 ? "Frozen" : e < 273 ? "Cold" : e <= 303 ? "Temperate" : e <= 353 ? "Hot" : "Boiling";
}
function ro(e, t, n) {
	return !t || t.gravityG <= 0 || n === 0 ? null : E(Qa * e / (t.gravityG * $a), 3);
}
function io(e, t, n, r) {
	if (e !== 13 || t === null || n === null || r === null) return null;
	let i = Math.max(n / 2, r / .5);
	return i <= 1 ? 0 : E(Math.log(i) * t, 3);
}
function ao(e, t, n, r) {
	if (e !== 14 || t === null || n === null || r === null || r <= 0) return null;
	if (r >= .1) return 0;
	let i = .1 / r;
	return n * i > 2 ? null : E(Math.log(i) * t, 3);
}
function oo(e, t, n, r) {
	if (!t || !eo.has(e) || !n || n.gravityG <= 0) return t ?? null;
	let i = ro(r, n, e), a = t.generationNotes.filter((e) => !e.startsWith("Scale height currently uses the WBH temperate baseline") && !e.startsWith("Scale height uses the WBH 288K Terra baseline corrected to the final reconciled mean temperature"));
	return a.push(`Scale height uses the WBH 288K Terra baseline corrected to the final reconciled mean temperature ${E(r, 6)}K.`), {
		...t,
		scaleHeightKm: i,
		minimumSafeAltitudeKm: io(e, i, t.nitrogenPartialPressureBar, t.oxygenPartialPressureBar),
		safeAltitudeBelowMeanKm: ao(e, i, t.nitrogenPartialPressureBar, t.oxygenPartialPressureBar),
		generationNotes: a
	};
}
function so(e) {
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
function co(e) {
	return {
		...e,
		generationNotes: e.generationNotes.filter((e) => !e.includes("awaits the WBH mean-temperature result") && !e.startsWith("WBH temperature-qualified liquid candidates at ") && !e.startsWith("No WBH Possible Exotic Liquid spans the generated mean surface temperature") && !e.startsWith("WBH notes that above 1000K the surface liquid may be magma") && !e.startsWith("Melting/boiling reference points assume approximately standard atmospheric pressure"))
	};
}
function lo(e, t, n, r) {
	let i = n.details?.hydrographics, a = n.atmosphereCode;
	return !i || a === null || i.coveragePercent <= 0 || !to.has(a) ? i : Za(so(co({
		...i,
		composition: null
	})), e, t, a, r);
}
function uo(e, t, n, r, i) {
	let a = e.meanTemperatureK, o = e.temperatureExtremes, s = o?.highTemperatureK ?? null, c = o?.lowTemperatureK ?? null, l = o ? sa(s, t) : null, u = o ? sa(c, t) : null, d = o && {
		...o,
		highTemperatureK: l,
		highTemperatureC: l === null ? null : E(l - 273, 6),
		lowTemperatureK: u,
		lowTemperatureC: u === null ? null : E(u - 273, 6),
		generationNotes: [...o.generationNotes.filter((e) => !e.startsWith("WBH seismic heating reconciled into high/low temperatures:")), `WBH seismic heating reconciled into high/low temperatures: ${s ?? "unresolved"}K/${c ?? "unresolved"}K -> ${l ?? "unresolved"}K/${u ?? "unresolved"}K.`]
	}, f = e.generationNotes.filter((e) => !e.startsWith("Final-temperature reconciliation applies WBH seismic heating:"));
	return f.push(`Final-temperature reconciliation applies WBH seismic heating: mean ${a ?? "unresolved"}K -> ${E(n, 6)}K. Reconciled mean and high/low temperatures are authoritative for downstream physical and biological consumers.`), {
		...e,
		meanTemperatureK: n,
		meanTemperatureC: E(n - 273, 6),
		temperatureClass: no(n),
		temperatureCorrectedScaleHeightKm: ro(n, r, i),
		runawayGreenhouseEligible: n > 303 && i >= 2 && i <= 15,
		temperatureExtremes: d,
		generationNotes: f
	};
}
function fo(e, t, n) {
	let r = n.details, i = r?.climate, a = r?.seismology, o = n.atmosphereCode, s = n.hydrographicsCode, c = n.sizeCode, l = a?.seismicAdjustedMeanTemperatureK;
	if (!r || !i || !a || o === null || typeof l != "number" || !Number.isFinite(l)) return n;
	let u = uo(i, a.totalSeismicStress, l, r.size, o), d = lo(e, t, n, l), f = oo(o, r.atmosphere, r.size, l), p = c === null ? null : Ma(e, t, c, o, r.size, d ?? null, l);
	if (f && p) {
		let e = f.generationNotes.filter((e) => !e.includes("detailed gas composition is deferred") && !e.includes("detailed gas composition remains deferred") && !e.startsWith("Detailed A/B/C gas composition and retention use the final reconciled mean temperature"));
		e.push(`Detailed A/B/C gas composition and retention use the final reconciled mean temperature ${E(l, 6)}K.`), f = {
			...f,
			gasMix: p,
			generationNotes: e
		};
	}
	let m = a;
	if (c !== null && c > 0 && s !== null) {
		let t = d?.composition === "H2O", r = ca(ra(e.id, n), c, s, t, a.totalSeismicStress);
		m = {
			...a,
			majorTectonicPlates: r.count,
			tectonicPlateRoll: r.roll,
			tectonicPlateDm: r.dm,
			waterBasedTectonicsEligible: r.eligible,
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
function po(e, t) {
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
function mo(e, t, n) {
	let r = n.physical;
	return !r?.details || r.details.gasGiant || typeof n.sizeCode != "number" || n.sizeCode <= 0 ? n : {
		...n,
		physical: fo(po(e, n), t, r)
	};
}
function ho(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = t.find((t) => t.id === e.aroundStarId);
	if (!r) return e;
	let i = n.details.satellites ? {
		...n.details.satellites,
		moons: n.details.satellites.moons.map((t) => mo(e, r, t))
	} : n.details.satellites, a = {
		...n,
		details: {
			...n.details,
			satellites: i
		}
	};
	return e.worldKind === "Terrestrial Planet" ? {
		...e,
		physical: fo(e, r, a)
	} : {
		...e,
		physical: a
	};
}
function go(e, t) {
	return e.map((e) => ho(e, t));
}
//#endregion
//#region src/rules/worlds/wbhSurfaceGeology.ts
function _o(e, t) {
	return e <= 1 || t <= 1 ? e > 1 ? "limited" : "inactive" : e > 100 ? "extreme" : e >= 10 ? "active" : "limited";
}
function vo(e) {
	let t = e.die(100);
	return t <= 35 ? "convergent" : t <= 60 ? "divergent" : t <= 85 ? "transform" : "stable";
}
function yo(e) {
	return (e?.surfaceFeatures?.bodies ?? []).map((e) => e.id);
}
function bo(e, t) {
	if (!t.length) return [];
	let n = t[e.die(t.length) - 1];
	if (t.length === 1 || e.d6() <= 3) return [n];
	let r = n;
	for (let i = 0; i < 4 && r === n; i += 1) r = t[e.die(t.length) - 1];
	return r === n ? [n] : [n, r];
}
function xo(e) {
	return e > 100 ? "severe" : e >= 10 ? "major" : "minor";
}
function So(e, t, n) {
	if (e === "convergent") {
		let e = ["mountain-chain"];
		return (t?.coveragePercent ?? 0) >= 40 && n % 2 == 0 && e.push("ocean-trench"), e;
	}
	return e === "divergent" ? n % 2 == 0 ? ["rift-system", "volcanic-belt"] : ["rift-system"] : e === "transform" ? ["fault-zone"] : [];
}
function Co(e, t, n) {
	if (!t) return null;
	let r = t.totalSeismicStress, i = t.majorTectonicPlates, a = _o(r, i), o = yo(n), s = T("surfaceGeology", e, r, i, o.join(",")), c = i > 1 ? Math.max(3, Math.round(i * 1.5)) : 0, l = {
		convergent: 0,
		divergent: 0,
		transform: 0,
		stable: 0
	}, u = [], d = xo(r);
	for (let e = 0; e < c; e += 1) {
		let t = vo(s);
		l[t] += 1;
		for (let r of So(t, n, e)) u.push({
			id: `geology-${u.length + 1}`,
			kind: r,
			intensity: d,
			relatedSurfaceBodyIds: bo(s, o),
			sourceBoundary: t
		});
	}
	return i <= 1 && r > 1 && u.push({
		id: "geology-1",
		kind: s.d6() <= 3 ? "isolated-volcanic-region" : "uplift-highland",
		intensity: d,
		relatedSurfaceBodyIds: bo(s, o),
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
function wo(e, t) {
	let n = t.physical;
	if (!n?.details || n.details.gasGiant) return t;
	let r = Co(t.sourceId ?? `${e.id}.${t.designation}`, n.details.seismology, n.details.hydrographics);
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
function To(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites, r = n && {
		...n,
		moons: n.moons.map((t) => wo(e, t))
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
	}, a = Co(e.id, i.details?.seismology, i.details?.hydrographics);
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
function Eo(e) {
	return e.map(To);
}
//#endregion
//#region src/rules/worlds/wbhSurfaceClimate.ts
function Do(e) {
	return e < 253 ? "frigid" : e < 273 ? "cold" : e < 303 ? "temperate" : e < 323 ? "warm" : "hot";
}
function Oo(e, t, n) {
	return n <= 273 ? "pervasive" : t <= 273 ? "substantial" : e <= 273 ? "localized" : "none";
}
function ko(e) {
	let t = e.details?.climate, n = t?.temperatureExtremes;
	if (!t || !n || t.meanTemperatureK === null || n.highTemperatureK === null || n.lowTemperatureK === null) return null;
	let r = t.meanTemperatureK, i = n.highTemperatureK, a = n.lowTemperatureK, o = Oo(a, r, i), s = i > 278 && r > 273, c = s && (i < 323 || r < 318), l = [];
	return o === "pervasive" ? l.push("Permanent ice or glaciation can dominate nearly all mapped latitude bands.") : o === "substantial" ? l.push("Large permanent polar or high-altitude ice regions are expected.") : o === "localized" ? l.push("Permanent ice is plausible in polar or high-altitude regions.") : l.push("The baseline temperature range does not imply permanent surface ice."), s ? l.push("At least some regions satisfy the WBH thermal threshold for agriculture.") : l.push("The global baseline temperatures do not satisfy the WBH thermal threshold for agriculture."), c ? l.push("At least some regions satisfy the WBH thermal threshold for unprotected human settlement.") : l.push("The global baseline temperatures do not satisfy the WBH thermal threshold for unprotected human settlement."), e.details?.rotation?.tidalLockStatus === "1:1" && e.details.rotation.tidalLockCase === "planet-star" && l.push("For mapping a stellar 1:1 tidal lock, treat the terminator/twilight zone as the principal surface-climate axis rather than ordinary latitude."), {
		method: "WBH surface climate phase 1",
		meanTemperatureK: r,
		highTemperatureK: i,
		lowTemperatureK: a,
		thermalRegime: Do(r),
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
function Ao(e) {
	let t = e.physical;
	if (!t?.details || t.details.gasGiant || typeof e.sizeCode != "number" || e.sizeCode <= 0) return e;
	let n = ko(t);
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
function jo(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites ? {
		...t.details.satellites,
		moons: t.details.satellites.moons.map(Ao)
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
	}, i = ko(r);
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
function Mo(e) {
	return e.map(jo);
}
//#endregion
//#region src/rules/worlds/wbhNativeLife.ts
function No(e, t, n, r) {
	return T("nativeLife", e, t, n.uwpPhysical, n.atmosphereCode ?? "none", n.hydrographicsCode ?? "none", n.details?.climate?.meanTemperatureK ?? "none", n.details?.climate?.temperatureExtremes?.highTemperatureK ?? "none", r).roll(2, 6).total;
}
function Po(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(Math.max(0, Math.trunc(e)));
}
function Fo(e) {
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
function Io(e) {
	return e === 0 ? -4 : e >= 1 && e <= 3 ? -2 : e >= 6 && e <= 8 ? 1 : e >= 9 ? 2 : 0;
}
function Lo(e) {
	return e < .2 ? -6 : e < 1 ? -2 : +(e > 4);
}
function Ro(e) {
	let t = e.details?.climate, n = t?.temperatureExtremes?.highTemperatureK ?? null, r = t?.meanTemperatureK ?? null, i = 0;
	return n !== null && (n > 353 ? i -= 2 : n < 273 && (i -= 4)), r === null ? e.temperatureBand === "Temperate" ? i + 2 : e.temperatureBand === "Cold" ? i - 2 : e.temperatureBand === "Frozen" || e.temperatureBand === "Boiling" ? i - 6 : i : (r > 353 ? i -= 4 : r < 273 ? i -= 2 : r >= 279 && r <= 303 && (i += 2), i);
}
function zo(e) {
	return e ? e.taints.some((e) => e.type.toLowerCase().includes("biologic")) || e.hazards.some((e) => e.type === "Biologic") : !1;
}
function Bo(e) {
	return e === 0 || e === 1 || e === 10 || e === 11 || e === 12 || e >= 15;
}
function Vo(e, t) {
	let n = 0, r = e.atmosphereCode ?? 0;
	return (r < 4 || r > 9) && (n -= 2), e.details?.atmosphere?.oxygenSafety === "low" && (n -= 2), t <= 1 ? n -= 10 : t <= 2 ? n -= 8 : t <= 3 ? n -= 4 : t <= 4 && (n -= 2), n;
}
function Ho(e, t) {
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
function Uo(e, t, n) {
	return t <= 0 ? 0 : Math.max(1, Math.ceil(e - 7 + (t + n) / 2));
}
function Wo(e, t, n) {
	return Math.max(0, Math.floor(e + 3 - t / 2 + n));
}
function Go(e) {
	let { id: t, profile: n, ageGyr: r } = e, i = n.atmosphereCode, a = n.hydrographicsCode;
	if (i === null || a === null || !n.details) return null;
	let o = Fo(i), s = Io(a), c = Lo(r), l = Ro(n), u = o + s + c + l, d = Math.max(-12, Math.min(4, u)), f = No(t, "biomass", n, r), p = Math.max(0, f + d), m = "none", h = [`WBH biomass DM ${u >= 0 ? "+" : ""}${u} is clamped to ${d >= 0 ? "+" : ""}${d} within the -12/+4 limits.`];
	if (p === 0 && zo(n.details.atmosphere)) p = 1, m = "biologic-taint-floor", h.push("Biologic atmospheric taint forces Biomass 1 and Biocomplexity 1 under the WBH special case.");
	else if (p >= 1 && Bo(i)) {
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
	m === "biologic-taint-floor" ? (g = 1, _ = null) : (v = Vo(n, r), _ = No(t, "biocomplexity", n, r), g = Math.max(1, _ - 7 + Math.min(9, p) + v));
	let y = null, b = null, x = null, S = null;
	if (g >= 8) {
		let e = Math.min(9, g);
		b = No(t, "current-sophont", n, r), y = b + e - 7 >= 13, S = No(t, "extinct-sophont", n, r), x = S + e - 7 + +(r > 5) >= 13;
	}
	let ee = No(t, "biodiversity", n, r), C = Uo(ee, p, g), te = Ho(n, r), ne = No(t, "compatibility", n, r), w = Wo(ne, g, te), re = `${Po(p)}${Po(g)}${Po(C)}${Po(w)}`;
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
		compatibilityRating: w,
		compatibilityRoll: ne,
		compatibilityDm: te,
		currentNativeSophont: y,
		currentNativeSophontRoll: b,
		extinctNativeSophontEvidence: x,
		extinctNativeSophontRoll: S,
		profile: re,
		generationNotes: h
	};
}
//#endregion
//#region src/rules/system/wbhSystemNativeLife.ts
function Ko(e, t, n) {
	let r = n.physical;
	if (!r?.details || typeof n.sizeCode != "number" || r.details.gasGiant) return n;
	let i = Go({
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
function qo(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = t.find((t) => t.id === e.aroundStarId);
	if (!r) return e;
	let i = n.details.satellites, a = i && {
		...i,
		moons: i.moons.map((t) => Ko(e, r, t))
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
	let s = Go({
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
function Jo(e, t) {
	return e.map((e) => qo(e, t));
}
//#endregion
//#region src/rules/worlds/wbhResourceRating.ts
function Yo(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(Math.max(0, Math.trunc(e)));
}
function Xo(e) {
	return e === null ? 0 : e > 1.12 ? 2 : e < .5 ? -2 : 0;
}
function Zo(e) {
	return e >= 11 ? 2 : +(e >= 8);
}
function Qo(e, t) {
	return e < 1 ? 0 : t <= 3 ? -1 : t >= 8 ? 2 : 0;
}
function $o(e) {
	let { id: t, profile: n } = e;
	if (typeof n.sizeCode != "number" || n.sizeCode <= 0 || n.details?.gasGiant) return null;
	let r = n.details?.nativeLife ?? null, i = n.details?.size?.densityTerra ?? null, a = r?.biomassRating ?? 0, o = r?.biodiversityRating ?? 0, s = r?.compatibilityRating ?? 0, c = Xo(i), l = a >= 3 ? 2 : 0, u = Zo(o), d = Qo(a, s), f = c + l + u + d, p = T("resourceRating", t, n.uwpPhysical, n.sizeCode, i ?? "none", a, o, s).roll(2, 6).total, m = p - 7 + n.sizeCode + f, h = Math.max(2, Math.min(12, m)), g = [];
	return i === null && g.push("No precise density was available; density DM treated as 0."), g.push("May 2024 Resource Rating table used: Biomass 3+ gives DM+2."), g.push("WBH Zed Prime prose conflicts with that table by describing Biomass A as DM+1."), {
		method: "WBH resource rating",
		rating: h,
		code: Yo(h),
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
function es(e, t) {
	let n = t.physical;
	if (!n?.details || typeof t.sizeCode != "number" || t.sizeCode <= 0 || n.details.gasGiant) return t;
	let r = $o({
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
function ts(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites, r = n && {
		...n,
		moons: n.moons.map((t) => es(e, t))
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
	let a = $o({
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
function ns(e, t) {
	return e.map(ts);
}
//#endregion
//#region src/rules/worlds/wbhHabitabilityRating.ts
function rs(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(Math.max(0, Math.trunc(e)));
}
function is(e) {
	return e <= 4 ? -1 : +(e >= 9);
}
function as(e) {
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
function os(e) {
	return e === 0 ? -4 : e >= 1 && e <= 3 ? -2 : e === 9 ? -1 : e >= 10 ? -2 : 0;
}
function ss(e) {
	return e < .2 ? -4 : e <= .4 ? -2 : e <= .7 ? -1 : e < .9 ? 1 : e < 1.1 ? 0 : e < 1.4 ? -1 : e < 2 ? -3 : -6;
}
function cs(e) {
	return 1 - Math.abs(6 - e);
}
function ls(e) {
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
function us(e) {
	return e <= 0 ? "Actively hostile world: not survivable without specialised equipment" : e <= 2 ? "Barely habitable world: full protective equipment often needed" : e <= 5 ? "Marginally survivable world with proper equipment" : e <= 7 ? "Regionally habitable world: may require acclimation" : e <= 9 ? "Suitable for human habitation with minimal equipment or acclimation" : "Terra-equivalent garden world";
}
function ds(e) {
	let { profile: t } = e, n = t.sizeCode, r = t.atmosphereCode, i = t.hydrographicsCode;
	if (n === null || r === null || i === null) return null;
	let a = t.details?.atmosphere, o = t.details?.size?.gravityG ?? null, s = ls(t), c = Math.trunc(e.miscellaneousAdjustment ?? 0), l = a?.taints.some((e) => e.code === "L") ? -2 : 0, u = t.details?.rotation?.tidalLockStatus === "1:1" && t.details.rotation.tidalLockCase === "planet-star" ? -2 : 0, d = {
		size: is(n),
		atmosphere: as(r),
		lowOxygenTaint: l,
		hydrographics: os(i),
		solarTidalLock: u,
		highTemperature: s.high,
		meanTemperature: s.mean,
		lowTemperature: s.low,
		temperatureFallback: s.fallback,
		gravity: o === null ? cs(n) : ss(o),
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
		code: rs(p),
		baseRating: 10,
		dm: d,
		unclampedTotal: f,
		remarks: us(p),
		usedDetailedTemperature: s.detailed,
		usedComputedGravity: o !== null,
		generationNotes: m
	};
}
//#endregion
//#region src/rules/system/wbhSystemHabitabilityRating.ts
function fs(e, t) {
	let n = t.physical;
	if (!n?.details || typeof t.sizeCode != "number" || t.sizeCode <= 0 || n.details.gasGiant) return t;
	let r = ds({ profile: n });
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
function ps(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites, r = n && {
		...n,
		moons: n.moons.map((t) => fs(e, t))
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
	let a = ds({ profile: i });
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
function ms(e, t) {
	return e.map(ps);
}
//#endregion
//#region src/rules/system/wbhSystemTidalLocks.ts
function hs(e) {
	return e ? e.meanBaselinePressureBar === null ? e.pressureRangeBar?.minimumBar !== void 0 && e.pressureRangeBar.minimumBar > 2.5 ? e.pressureRangeBar.minimumBar : e.specialSubtype?.minimumPressureBar !== null && e.specialSubtype?.minimumPressureBar !== void 0 && e.specialSubtype.minimumPressureBar > 2.5 ? e.specialSubtype.minimumPressureBar : null : e.meanBaselinePressureBar : null;
}
function gs(e) {
	return e.details?.size?.massTerra ?? e.details?.gasGiant?.massTerra ?? null;
}
function _s(e, t) {
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
function vs(e, t, n, r) {
	let i = r.physical, a = i?.details?.rotation, o = gs(t);
	if (!i || !a || o === null) return r;
	let s = i.details?.gasGiant ? null : typeof r.sizeCode == "number" ? r.sizeCode : 0, c = xi(_s(e, r), n, a, {
		sizeCode: s,
		atmospherePressureBar: hs(i.details?.atmosphere),
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
function ys(e, t) {
	let n = e.physical, r = n?.details?.rotation;
	if (!n || !r) return e;
	let i = Ae(e, t), a = ke(e, t);
	if (!i || !a) return e;
	let o = n.details?.satellites, s = o && {
		...o,
		moons: o.moons.map((t) => vs(e, n, i, t))
	}, c = xi(e, i, r, {
		sizeCode: n.sizeCode,
		atmospherePressureBar: hs(n.details?.atmosphere),
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
function bs(e, t) {
	return ms(ns(Jo(Mo(Eo(go(ma(Qi(zi(ki(e).map((e) => ys(e, t)), t), t), t), t))), t), t), t);
}
//#endregion
//#region src/rules/worlds/wbhClimateDetails.ts
function xs(e, t, n, r) {
	return T("climate", e.id, e.aroundDesignation, e.orbitNumber, e.au, t.designation, t.luminositySolar, n, r);
}
function Ss(e) {
	return E(Math.max(.02, Math.min(.98, e)), 3);
}
function Cs(e, t, n, r, i) {
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
	].includes(r) || r >= 16 ? a += (e.roll(2, 6).total - 2) * .05 : r === 13 && (a += e.roll(2, 6).total * .03), i >= 2 && i <= 5 ? a += (e.roll(2, 6).total - 2) * .02 : i >= 6 && (a += (e.roll(2, 6).total - 4) * .03), Ss(a);
}
function ws(e, t, n) {
	if (t === 0) return {
		initial: 0,
		effective: 0
	};
	let r = n?.meanBaselinePressureBar ?? null;
	if (r === null) return {
		initial: null,
		effective: null
	};
	let i = E(.5 * Math.sqrt(Math.max(0, r)), 3), a = i;
	if (t >= 1 && t <= 9 || t === 13 || t === 14) a += e.roll(3, 6).total * .01;
	else if (t === 10 || t === 15) a *= Math.max(.5, e.d6() - 1);
	else if ([11, 12].includes(t) || t >= 16) {
		let t = e.d6();
		a *= t <= 5 ? t : e.roll(3, 6).total;
	}
	return {
		initial: i,
		effective: E(a, 3)
	};
}
function Ts(e) {
	return e < 222 ? "Frozen" : e < 273 ? "Cold" : e <= 303 ? "Temperate" : e <= 353 ? "Hot" : "Boiling";
}
function Es(e, t, n, r, i, a, o) {
	let s = xs(e, t, n, r), c = Cs(s, e, i, n, r), l = ws(s, n, a), u = Math.max(e.au, 1e-6), d = Math.max(t.luminositySolar, 0), f = null, p = null, m = null;
	if (l.effective !== null) {
		let e = d * (1 - c) * (1 + l.effective) / u ** 2;
		f = Math.max(3, Math.round(279 * Math.max(0, e) ** .25)), p = f - 273, m = Ts(f);
	}
	let h = i?.gravityG ?? 0, g = f !== null && h > 0 && n !== 0 ? E(8.5 * f / (h * 288), 3) : null, _ = f !== null && f > 303 && n >= 2 && n <= 15, v = [];
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
//#region src/rules/worlds/wbhGasGiantAtmosphere.ts
function Ds() {
	return {
		method: "WBH gas giant bulk atmosphere",
		model: "wbh",
		compositionBasis: "WBH qualitative",
		primaryConstituent: "Hydrogen",
		dominantConstituents: ["Hydrogen", "Helium"],
		quantitativeComposition: null,
		hydrogenSkimmable: !0,
		profile: "H2-He",
		generationNotes: [
			"WBH defines gas giants as retaining thick atmospheres primarily consisting of hydrogen.",
			"WBH distinguishes gas giants by their ability to retain thick hydrogen-helium envelopes.",
			"WBH supplies no procedure for quantitative hydrogen/helium ratios or trace-gas percentages; no percentages are invented.",
			"This qualitative atmosphere model consumes no random numbers and does not alter established gas-giant sizing or system generation."
		]
	};
}
//#endregion
//#region src/rules/worlds/wbhGasGiantDetails.ts
var Os = 12742;
function ks(e, t) {
	return t.primaryStar ? t.primaryStar : e.orbitClass === "Primary" ? e : void 0;
}
function As(e, t, n, r = "gasGiantSizing") {
	let i = ks(t, n);
	return T(r, e.id, e.aroundDesignation, e.orbitNumber, e.au, t.designation, i?.designation ?? "primary-unknown", i?.spectralType ?? "unknown", i?.luminosityClass ?? "unknown", n.systemSpread ?? "unknown");
}
function js(e, t) {
	let n = 0, r = [];
	return e ? (e.spectralType === "BD" || e.spectralType === "M" && e.luminosityClass === "V" || e.luminosityClass === "VI") && (--n, r.push("WBH gas-giant category DM-1 applied for a brown dwarf, M-class V, or Class VI primary star.")) : r.push("System primary-star context was unavailable; the WBH primary-star gas-giant category DM was not inferred from the secondary star being orbited."), t !== void 0 && t < .1 ? (--n, r.push("WBH gas-giant category DM-1 applied because system spread is below 0.1.")) : t === void 0 && r.push("System spread was unavailable to the gas-giant sizing procedure; the WBH spread <0.1 DM could not be evaluated."), {
		dm: n,
		notes: r
	};
}
function Ms(e, t) {
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
function Ns(e) {
	return e === "Small" ? "S" : e === "Medium" ? "M" : "L";
}
function Ps(e) {
	return {
		diameterTerra: e.die(3) + e.die(3),
		massTerra: 5 * (e.d6() + 1),
		adjusted: !1,
		notes: []
	};
}
function Fs(e) {
	return {
		diameterTerra: e.d6() + 6,
		massTerra: 20 * e.roll(3, 6, -1).total,
		adjusted: !1,
		notes: ["WBH Medium row prints a 6–12 Terra-diameter range but specifies 1D+6; TSG follows the explicit formula, producing 7–12."]
	};
}
function Is(e) {
	let t = e.roll(2, 6, 6).total, n = e.die(3), r = e.roll(3, 6).total, i = n * 50 * (r + 4), a = i, o = !1, s = [];
	return i >= 3e3 && (a = 4e3 - e.roll(2, 6, -2).total * 200, o = !0, s.push(`WBH high-mass Large gas-giant rule replaced initial ${i} Terra masses with ${a}.`)), s.push("The WBH high-mass footnote is keyed to an initial mass of at least 3,000 Terra masses; TSG tests the computed initial mass rather than inferring the trigger only from the parenthetical 3D example."), {
		diameterTerra: t,
		massTerra: a,
		adjusted: o,
		notes: s
	};
}
function Ls(e, t) {
	return t === "Small" ? Ps(e) : t === "Medium" ? Fs(e) : Is(e);
}
function Rs(e, n, r, i, a) {
	let o = Ns(e);
	return {
		method: "WBH Gas Giant Sizing",
		category: e,
		categoryCode: o,
		categoryRoll: n,
		categoryDm: r,
		diameterTerra: i.diameterTerra,
		diameterKm: i.diameterTerra * Os,
		massTerra: i.massTerra,
		massAdjustedByHighMassRule: i.adjusted,
		atmosphere: Ds(),
		profile: `G${o}${t(i.diameterTerra)}`,
		generationNotes: a
	};
}
function zs(e, t, n = {}) {
	let r = ks(t, n), i = As(e, t, n), a = js(r, n.systemSpread), o = Ms(i, a.dm), s = Ls(i, o.category);
	return Rs(o.category, o.roll, a.dm, s, [
		...a.notes,
		...s.notes,
		"Gas-giant mass variance is optional in WBH and is not applied automatically."
	]);
}
function Bs(e, t, n, r, i = {}) {
	let a = As(e, t, i, n === "Small" ? "gasGiantMoonSmall" : "gasGiantMoonMedium"), o = Ls(a, n), s = 1;
	for (; o.diameterTerra >= r && s < 64;) o = Ls(a, n), s += 1;
	if (o.diameterTerra >= r) throw Error(`Unable to generate a ${n} gas-giant moon smaller than parent diameter ${r} Terra.`);
	return Rs(n, 0, 0, o, [
		...o.notes,
		`Gas-giant moon category ${n} was fixed by the WBH Gas Giant Special Moon Sizing table rather than a gas-giant category roll.`,
		`Moon diameter was constrained to be smaller than its parent gas giant (${r} Terra diameters); resolved after ${s} sizing attempt${s === 1 ? "" : "s"}.`,
		"Gas-giant mass variance is optional in WBH and is not applied automatically."
	]);
}
//#endregion
//#region src/rules/worlds/wbhUnusualAtmosphereDetails.ts
var Vs = {
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
function Hs(e, t, n) {
	return T("unusualAtmosphere", e.id, e.aroundDesignation, e.orbitNumber, e.au, t.designation, n);
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
	let r = Vs[e], i = [];
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
			meanBaselinePressureBar: E(t + i * a, 3)
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
//#region src/rules/worlds/wbhHydrographicsCode.ts
function Qs(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function $s(e) {
	return e >= 1.1 ? 2 : e >= 1 ? 3 : e >= .5 ? 4 : e >= .2 ? 5 : e >= .1 ? 6 : e >= 0 ? 7 : e >= -.1 ? 8 : e >= -.2 ? 9 : e >= -.5 ? 10 : e >= -1 ? 11 : 12;
}
function ec(e) {
	return e <= 1 ? 0 : e <= 3 ? -2 : e === 4 || e === 5 || e === 14 ? -1 : e === 6 || e === 7 ? 0 : e === 8 || e === 9 ? 1 : e === 10 || e === 13 || e === 15 ? 2 : e === 11 || e === 12 ? 6 : 0;
}
function tc(e) {
	return e <= 2 ? "Frozen" : e <= 4 ? "Cold" : e <= 9 ? "Temperate" : e <= 11 ? "Hot" : "Boiling";
}
function nc(e) {
	return e <= 1 || e >= 10 ? -4 : 0;
}
function rc(e) {
	return e === "Hot" ? -2 : e === "Boiling" ? -6 : 0;
}
function ic(e, t, n, r) {
	return r === 10 && Zs(e, t, n, r).detail.subtypes.some((e) => e.code === "7");
}
function ac(e, t) {
	let { world: n, star: r, sizeCode: i, atmosphereCode: a, sizeDetails: o = null } = t, s = $s(n.hzDeviation), c = ec(a), l = s + c, u = tc(l), d = nc(a), f = rc(u);
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
	let p = e.roll(2, 6).total, m = Qs(p - 7 + a + d, 0, 10), h = f, g = null;
	a === 13 && h !== 0 ? (h = 0, g = "WBH ignores Hot/Boiling Hydrographics temperature DMs for very dense Atmosphere D.") : a === 15 && h !== 0 && ic(n, r, o, m) && (h = 0, g = "WBH ignores Hot/Boiling Hydrographics temperature DMs for panthalassic subtype 7 of Atmosphere F.");
	let _ = p - 7 + a + d + h, v = Qs(_, 0, 10), y = [
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
var oc = /* @__PURE__ */ new Set([
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
function sc(e, t, n) {
	return {
		name: e,
		code: t,
		percentage: E(n, 1),
		escapeValue: null,
		retainedLongTerm: null,
		taint: !1
	};
}
function cc(e, t) {
	if (!t || !oc.has(e) || t.oxygenFraction === null) return null;
	let n = E(t.oxygenFraction * 100, 1), r = E(Math.max(0, 100 - n), 1), i = [];
	return r > 0 && i.push(sc("Nitrogen", "N2", r)), n > 0 && i.push(sc("Oxygen", "O2", n)), {
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
var lc = 12742, uc = 11186, dc = 8.5, fc = {
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
}, pc = {
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
}, mc = [
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
function hc(e, t, n, r, i) {
	return T("physicalDetails", e.id, e.aroundDesignation, e.orbitNumber, e.au, t.designation, t.ageGyr, n, r, i);
}
function gc(e, t) {
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
function _c(e, t, n) {
	let r = n <= 4 ? -1 : n >= 10 ? 3 : +(n >= 6);
	return e.hzDeviation <= 0 ? r += 1 : r -= 1 + Math.floor(e.hzDeviation), t.ageGyr > 10 && --r, r;
}
function vc(e, t, n, r) {
	let i = e.roll(2, 6, _c(t, n, r)).total;
	return i <= -4 ? "Exotic Ice" : i <= 2 ? "Mostly Ice" : i <= 6 ? "Mostly Rock" : i <= 11 ? "Rock and Metal" : i <= 14 ? "Mostly Metal" : "Compressed Metal";
}
function yc(e, t) {
	return pc[t][e.roll(2, 6).total - 2];
}
function bc(e, t, n, r) {
	if (r <= 0) return null;
	let i = gc(e, r), a = vc(e, t, n, r), o = yc(e, a), s = i / lc, c = o * s, l = o * s ** 3;
	return {
		diameterKm: i,
		composition: a,
		densityTerra: o,
		gravityG: E(c, 3),
		massTerra: E(l, 3),
		escapeVelocityKps: E(Math.sqrt(l / s) * uc / 1e3, 3)
	};
}
function xc(e) {
	return ((e.d6() - 1) * 5 + (e.d6() - 1)) / 30;
}
function Sc(e) {
	return e >= 2 && e <= 9 || e === 13 || e === 14;
}
function Cc(e, t) {
	let n = +(t.ageGyr > 4), r = (e.d6() + n) / 20 + e.roll(2, 6, -7).total / 100;
	return r <= 0 && (r = e.d6() * .01), E(Math.max(0, Math.min(.4, r)), 3);
}
function wc(e) {
	return e === null ? "not-applicable" : e < .1 ? "low" : e > .5 ? "high" : "within-human-range";
}
function Tc(e, t) {
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
function Ec(e, t, n) {
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
function Dc(e, t) {
	let n = t === 4 ? -2 : t === 9 ? 2 : 0, r = e.roll(2, 6, n).total, i = mc.find((e) => r <= e.max);
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
	let a = Tc(e, i.code), o = Ec(e, i.code, a.code);
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
function Oc(e, t) {
	let n = t === "low" ? "L" : "H", r = Tc(e, n), i = Ec(e, n, r.code);
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
function kc(e, t, n) {
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
		r.push(Oc(e, n));
		let i = Dc(e, t);
		return i.extra && (r.push(i.detail), Dc(e, t).extra && r.push(Dc(e, t).detail)), r.slice(0, 3);
	}
	let i = Dc(e, t);
	if (r.push(i.detail), i.extra && r.length < 3) {
		let n = Dc(e, t);
		r.push(n.detail), n.extra && r.length < 3 && r.push(Dc(e, t).detail);
	}
	return r.slice(0, 3);
}
function M(e, t, n, r, i, a) {
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
function Ac(e, t, n = !1) {
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
function jc(e, t, n) {
	let r = n >= 2 && n <= 4 ? -2 : 0;
	t.hzDeviation < -1 && (r -= 2), t.hzDeviation > 2 && (r += 2);
	let i = e.roll(2, 6, r).total;
	return i <= 2 ? M("2", "Very Thin, Irritant", !0, .1, .42, .32) : i === 3 ? M("3", "Very Thin", !1, .1, .42, .32) : i === 4 ? M("4", "Thin, Irritant", !0, .43, .7, .27) : i === 5 ? M("5", "Thin", !1, .43, .7, .27) : i === 6 ? M("6", "Standard", !1, .7, 1.49, .79) : i === 7 ? M("7", "Standard, Irritant", !0, .7, 1.49, .79) : i === 8 ? M("8", "Dense", !1, 1.5, 2.49, .99) : i === 9 ? M("9", "Dense, Irritant", !0, 1.5, 2.49, .99) : i === 10 || i === 13 ? M("A", "Very Dense", !1, 2.5, 10, 7.5) : i === 11 || i >= 14 ? M("B", "Very Dense, Irritant", !0, 2.5, 10, 7.5) : M("C", "Very Dense, Occasionally Corrosive", !1, 2.5, 10, 7.5);
}
function Mc(e, t, n, r) {
	let i = 0;
	n >= 2 && n <= 4 && (i -= 3), n >= 8 && (i += 2), t.hzDeviation < -1 && (i += 4), t.hzDeviation > 2 && (i -= 2), r === 12 && (i += 2);
	let a = e.roll(2, 6, i).total;
	return a <= 1 ? M("1", "Very Thin, Temperature 50K or less", !1, .1, .42, .32) : a === 2 ? M("2", "Very Thin, Irritant", !0, .1, .42, .32) : a === 3 ? M("3", "Very Thin", !1, .1, .42, .32) : a === 4 ? M("4", "Thin, Irritant", !0, .43, .7, .27) : a === 5 ? M("5", "Thin", !1, .43, .7, .27) : a === 6 ? M("6", "Standard", !1, .7, 1.49, .79) : a === 7 ? M("7", "Standard, Irritant", !0, .7, 1.49, .79) : a === 8 ? M("8", "Dense", !1, 1.5, 2.49, .99) : a === 9 ? M("9", "Dense, Irritant", !0, 1.5, 2.49, .99) : a === 10 ? M("A", "Very Dense", !1, 2.5, 10, 7.5) : a === 11 ? M("B", "Very Dense, Irritant", !0, 2.5, 10, 7.5) : a === 12 ? Ac("C", "Extremely Dense") : a === 13 ? Ac("D", "Extremely Dense, Temperature 500K+") : Ac("E", "Extremely Dense, Temperature 500K+, Irritant", !0);
}
function Nc(e, t) {
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
function Pc(e, t, n) {
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
	}, Nc(e, !0)] : [Nc(e, r)];
}
function Fc(e, t, n, r, i, a) {
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
function Ic(e, t, n, r) {
	if (e !== 13 || t === null || n === null || r === null) return null;
	let i = Math.max(n / 2, r / .5);
	return i <= 1 ? 0 : E(Math.log(i) * t, 3);
}
function Lc(e, t, n, r) {
	if (e !== 14 || t === null || n === null || r === null || r <= 0) return null;
	if (r >= .1) return 0;
	let i = .1 / r;
	return n * i > 2 ? null : E(Math.log(i) * t, 3);
}
function Rc(e, t, n, r, i, a) {
	let o = fc[r] ?? { classification: `Atmosphere ${r}` }, s = null;
	r === 10 ? s = jc(e, t, i) : (r === 11 || r === 12) && (s = Mc(e, t, i, r));
	let c = s ? {
		minimumBar: s.pressureRangeBar?.minimumBar,
		maximumBar: s.pressureRangeBar?.maximumBar,
		spanBar: s.pressureSpanBar
	} : o, l = c.minimumBar !== void 0 && c.maximumBar !== void 0 ? {
		minimumBar: c.minimumBar,
		maximumBar: c.maximumBar
	} : null, u = null;
	r === 0 ? u = 0 : c.minimumBar !== void 0 && c.spanBar !== void 0 && c.spanBar !== null && (u = E(c.minimumBar + c.spanBar * xc(e), 3));
	let d = null, f = null, p = null, m = null;
	Sc(r) && u !== null && (d = Cc(e, n), f = E(u * d, 3), p = E(u - f, 3), a && a.gravityG > 0 && (m = E(dc / a.gravityG, 3)));
	let h = wc(f), g = kc(e, r, h);
	s?.irritant && g.push(Dc(e, r).detail);
	let _ = Pc(e, r, s), v = [];
	return [
		5,
		6,
		8
	].includes(r) && h !== "within-human-range" && v.push("WBH Referee choice required: this established breathable Atmosphere code has an oxygen partial pressure outside 0.1–0.5 bar. Generated worlds are recorded as the tainted equivalent instead; for an imported mainworld the Handbook suggests adjusting pressure or oxygen so the code still fits."), Sc(r) && v.push("Scale height currently uses the WBH temperate baseline 8.5 km / gravity; apply Kelvin temperature refinement when detailed mean temperature is implemented."), r === 10 && v.push("Exotic subtype and pressure are generated; detailed gas composition is deferred until gas-retention/temperature-aware composition is implemented."), (r === 11 || r === 12) && (v.push("Corrosive/Insidious subtype and applicable hazard are generated; detailed gas composition remains deferred until WBH temperature-aware gas-mix procedures are implemented."), v.push("WBH runaway-greenhouse subtype DM is not applied until runaway-greenhouse status is represented as structured source data."), s?.pressureUnbounded && v.push("WBH defines this subtype as 10+ bar with no upper bound; no mean pressure is invented before a bounded pressure procedure is available."), _.some((e) => e.code === "B") && v.push("Insidious biologic hazard implies Biomass Rating at least 1; enforce that constraint when WBH native-life generation is implemented."), _.some((e) => e.code === "R") && v.push("Insidious radioactivity hazard source is recorded; detailed radiation exposure values remain a later hazard-effect integration.")), r === 15 && v.push("Unusual atmosphere subtype remains deferred: WBH outcomes depend on prerequisite-specific conditions such as Panthalassic hydrographics and other world state; no subtype is invented here."), {
		classification: o.classification,
		pressureRangeBar: l,
		pressureSpanBar: c.spanBar ?? null,
		meanBaselinePressureBar: u,
		oxygenFraction: d,
		oxygenPartialPressureBar: f,
		nitrogenPartialPressureBar: p,
		scaleHeightKm: m,
		oxygenSafety: h,
		minimumSafeAltitudeKm: Ic(r, m, p, f),
		safeAltitudeBelowMeanKm: Lc(r, m, p, f),
		taints: g,
		hazards: _,
		specialSubtype: s,
		profile: Fc(r, u, f, g, _, s),
		generationNotes: v
	};
}
var zc = {
	5: 4,
	6: 7,
	8: 9
};
function Bc(e, t) {
	return t !== "low" && t !== "high" ? null : zc[e] ?? null;
}
function Vc(e, t, n, r, i, a = {}) {
	let o = hc(e, t, n, a.detailSeedAtmosphereCode ?? r, i), s = bc(o, e, t, n);
	return {
		size: s,
		atmosphere: Rc(o, e, t, r, n, s)
	};
}
//#endregion
//#region src/rules/worlds/wbhPlanetoidBeltDetails.ts
function Hc(e, t) {
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
function Uc(e, t, n) {
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
function Wc(e, n) {
	let r = T("planetoidBelt", e.id, e.orbitNumber, e.hzco, n.ageGyr), i = e.orbitNumber < e.hzco ? -4 : e.orbitNumber > e.hzco + 2 ? 4 : 0, a = r.roll(2, 6).total + i, o = Uc(Hc(r, a), a, i), s = r.roll(2, 6).total + 2, c = -Math.floor(n.ageGyr / 2), l = Math.floor(o.carbonaceousPercent / 10), u = c + l, d = Math.max(1, s + u), f = r.roll(2, 6).total, p = Math.floor(o.metallicPercent / 10), m = -Math.ceil(o.carbonaceousPercent / 10), h = d + p + m, g = f - 7 + h, _ = Math.max(1, g);
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
var Gc = 8766;
function Kc(e, t, n, r) {
	return T("rotation", e.id, e.aroundDesignation, e.orbitNumber, e.au, t.designation, t.ageGyr, n ? "gas-giant" : "ordinary", r ?? "none");
}
function qc(e) {
	return (e.d6() - 1) * 10 + e.d10ZeroToNine();
}
function Jc(e, t, n) {
	let r = Math.floor(Math.max(0, t) / 2), i = n ? 2 : 4, a = () => e.roll(2, 6, -2).total * i + 2 + e.d6() + r, o = a(), s = 0, c = 0;
	for (; o >= 40 && c < 16 && (c += 1, !(e.d6() < 5));) o += a(), s += 1;
	return {
		hours: o,
		additions: s
	};
}
function Yc(e) {
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
		let a = qc(e), o = qc(e);
		n += a / 60 + o / 3600, i.push("WBH linear minute/second variance applied to an Extreme Axial Tilt result.");
	}
	for (; n > 180;) n = 360 - n;
	return {
		degrees: E(Math.max(0, Math.min(180, n)), 4),
		extreme: r,
		notes: i
	};
}
function Xc(e, t, n) {
	let r = e / (n ? -t : t) - 1;
	return Math.abs(r) < 1e-9 ? {
		solarDaysPerYear: 0,
		solarDayHours: null,
		infinite: !0
	} : {
		solarDaysPerYear: E(r, 6),
		solarDayHours: E(Math.abs(e / r), 6),
		infinite: !1
	};
}
function Zc(e, t, n) {
	let r = Kc(e, t, n.isGasGiant ?? !1, n.sizeCode ?? null), i = (n.isGasGiant ?? !1) || n.sizeCode === 0, a = Jc(r, t.ageGyr, i), o = qc(r), s = qc(r), c = E(a.hours + o / 60 + s / 3600, 6), l = Yc(r), u = l.degrees > 90 ? "Retrograde" : "Prograde", d = Xc(Math.max(0, n.orbitalPeriodYears) * Gc, c, u === "Retrograde"), f = [
		`WBH basic rotation uses ${i ? "×2" : "×4"} because this ${i ? "is a gas giant or Size 0/S body" : "is not a gas giant or Size 0/S body"}.`,
		`System age ${E(t.ageGyr, 3)} Gyr contributes DM+${Math.floor(Math.max(0, t.ageGyr) / 2)}.`,
		...a.additions > 0 ? [`WBH 40+ hour extension added ${a.additions} additional basic rotation determination(s).`] : [],
		...l.notes,
		"WBH solar-day convention: solarDaysPerYear stores the signed equation result; retrograde rotation uses a negative sidereal period. The sign describes the relative solar-cycle direction, not a negative physical day count, while solarDayHours is stored as a positive duration.",
		"Axial tilt is provisional until WBH tidal-lock effects are evaluated."
	];
	return e.id.includes(".") && f.push("For this subordinate moon, the solar-day calculation uses the inherited parent-planet stellar year, following the WBH approximation."), d.infinite && f.push("Sidereal period equals the local year closely enough that the solar day is undefined/infinite."), {
		method: "WBH basic rotation and axial tilt",
		baseSiderealHours: E(a.hours, 6),
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
var Qc = 149597870.9, $c = 3e-6, el = 1.5;
function tl(e, t, n, r) {
	return r ? T("gasGiantSatellites", e.id, e.aroundDesignation, e.orbitNumber, e.au, e.eccentricity, t.designation, t.massSolar, r.categoryCode, r.diameterTerra, r.massTerra) : T("satellites", e.id, e.aroundDesignation, e.orbitNumber, e.au, e.eccentricity, t.designation, t.massSolar, n);
}
function nl(e, t, n, r) {
	return T("moonPhysical", e.id, n, e.aroundDesignation, e.orbitNumber, e.au, t.designation, t.ageGyr, r);
}
function rl(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function il(e, t, n, r) {
	let i, a;
	r ? r.category === "Small" ? (i = 3, a = -7) : (i = 4, a = -6) : t <= 2 ? (i = 1, a = -5) : t <= 9 ? (i = 2, a = -8) : (i = 2, a = -6);
	let o = n < 1 ? -i : 0;
	return e.roll(i, 6, a + o).total;
}
function al(e, t) {
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
function ol(e, t) {
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
function sl(e, t) {
	let n = e.d6();
	if (n <= 3) return { sizeCode: "S" };
	if (n <= 5) {
		let t = e.die(3) - 1;
		return t === 0 ? "R" : { sizeCode: t };
	}
	return ol(e, t);
}
function cl(e, t) {
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
	let r = rl(e.roll(2, 6, -7 + n).total, 0, 15), i = 0;
	return (r <= 1 || r >= 10) && (i -= 4), {
		numericSizeCode: n,
		atmosphereCode: r,
		hydrographicsCode: rl(e.roll(2, 6, -7 + r + i).total, 0, 10)
	};
}
function ll(e, t, n) {
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
function ul(e, t, n) {
	let r = n.massTerra * $c, i = Math.max(t.massSolar, 1e-6), a = e.au * (1 - e.eccentricity) * Math.cbrt(r / (3 * i)), o = a * Qc / n.diameterKm;
	return {
		au: E(a, 6),
		pd: E(o, 3),
		moonLimitPd: E(o / 2, 3)
	};
}
function dl(e, t) {
	let n = Math.max(0, Math.floor(e) - 2);
	return n <= 200 ? n : Math.min(n, 200 + t);
}
function fl(e, t) {
	return t ? 6 : e === "Inner" ? -1 : e === "Middle" ? 1 : 4;
}
function pl(e, t) {
	let n = e.d6() + +(t < 60), r, i;
	return n <= 3 ? (r = "Inner", i = e.roll(2, 6, -2).total * t / 60 + 2) : n <= 5 ? (r = "Middle", i = e.roll(2, 6, -2).total * t / 30 + t / 6 + 3) : (r = "Outer", i = e.roll(2, 6, -2).total * t / 20 + t / 2 + 4), {
		range: r,
		pd: E(Math.max(2, i), 2)
	};
}
function ml(e, t) {
	let n = e.roll(2, 6, t).total, r;
	return r = n <= 5 ? -.001 + e.d6() / 1e3 : n <= 7 ? e.d6() / 200 : n <= 9 ? .03 + e.d6() / 100 : n === 10 ? .05 + e.d6() / 20 : n === 11 ? .05 + e.roll(2, 6).total / 20 : .3 + e.roll(2, 6).total / 20, E(Math.max(0, Math.min(.999, r)), 3);
}
function hl(e, t) {
	let n = [];
	for (let r = 0; r < t; r += 1) {
		let t = E(.4 + e.roll(2, 6).total / 8, 3), i = E(e.roll(3, 6).total / 100 + .07, 3);
		t - i / 2 < .55 && (i = E(Math.max(0, 2 * (t - .55)), 3));
		let a = n[n.length - 1];
		if (a) {
			let e = a.centrePd + a.spanPd / 2;
			t - i / 2 < e && (t = E(e + i / 2, 3));
		}
		n.push({
			designation: `R${String(r + 1).padStart(2, "0")}`,
			centrePd: t,
			spanPd: i
		});
	}
	return n;
}
function gl(e, t) {
	return t <= 0 ? 0 : E(Math.sqrt(e ** 3 / t) / 361730, 3);
}
function _l(e, t) {
	return t ? {
		diameterKm: t.diameterKm,
		massTerra: t.massTerra
	} : e ? {
		diameterKm: e.diameterKm,
		massTerra: e.massTerra
	} : null;
}
function vl(e, t, n, r, i, a, o) {
	let s = _l(r, a);
	if (!s || !a && n <= 0) return null;
	let c = tl(e, t, n, a), l = il(c, n, e.orbitNumber, a), u = +(l === 0), d = Math.max(0, l), f = ul(e, t, s), p = ["WBH Hill sphere uses the stellar mass supplied by system generation; hierarchy-aware generation aggregates all stellar components interior to the world orbit when required by WBH.", "WBH companion/unavailability adjacency DMs for significant-moon quantity require broader system-slot context and are not yet applied in this per-world phase."];
	a && (p.push(`Gas-giant significant-moon quantity uses the WBH ${a.category === "Small" ? "3D-7" : "4D-6"} row for ${a.category} gas giants.`), p.push("Gas-giant moon sizing uses the WBH Gas Giant Special Moon Sizing table, including rare smaller gas-giant moons."));
	let m = d;
	f.moonLimitPd < el && (d > 0 && f.moonLimitPd >= .55 && (u += 1), m = 0, p.push("Hill Sphere Moon Limit is below the Roche limit; significant moons are removed per WBH.")), f.moonLimitPd < .55 && (u = 0, p.push("Hill Sphere Moon Limit is below 0.55 PD; significant rings are also precluded."));
	let h = [];
	for (let e = 0; e < m; e += 1) if (a) {
		let e = sl(c, a);
		e === "R" ? u += 1 : h.push(e);
	} else {
		let e = al(c, n);
		e === "R" ? u += 1 : h.push({ sizeCode: e });
	}
	let g = dl(f.moonLimitPd, h.length), _ = h.map(() => pl(c, g)).sort((e, t) => e.pd - t.pd);
	for (let e = 1; e < _.length; e += 1) _[e].pd <= _[e - 1].pd && (_[e].pd = E(_[e - 1].pd + 1, 2));
	let v = h.map((n, r) => {
		let l = String.fromCharCode(97 + r), u = _[r], d = u.pd > g, p = u.pd > f.moonLimitPd, m = fl(u.range, d), h = ml(c, m), v = m + (p ? 2 : 0), y = c.roll(2, 6, v).total >= 10, b = E(u.pd * s.diameterKm, 0), x = `${e.id}.${l}`, S, ee = ll(e, l, h);
		if (n.gasGiantCategory && o && a) S = o(ee, n.gasGiantCategory, a.diameterTerra);
		else if (i) {
			let r = cl(nl(e, t, l, n.sizeCode), n.sizeCode);
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
			periodHours: gl(b, s.massTerra),
			beyondHillMoonLimit: p,
			sourceId: x,
			physical: S
		};
	}), y = hl(c, u);
	y.some((e) => e.centrePd + e.spanPd / 2 > el) && p.push("At least one significant ring extends beyond the nominal 1.5 PD Roche limit; WBH permits the span to remain and later moon-gap handling can refine overlaps."), (i || o) && v.length > 0 && p.push("Significant moons include additive WBH physical profiles generated from dedicated moon sub-seeds; adding moon detail does not perturb established satellite geometry.");
	let b = v.map((e) => {
		let t = e.physical?.details?.gasGiant?.profile;
		return `${e.designation}:${t ?? e.sizeCode}@${e.orbitPd}PD`;
	}).join(","), x = y.length ? `R${String(y.length).padStart(2, "0")}:${y.map((e) => `${e.centrePd}-${e.spanPd}`).join(",")}` : "R00";
	return {
		method: "WBH significant moons and rings",
		hillSphereAu: f.au,
		hillSpherePd: f.pd,
		hillSphereMoonLimitPd: f.moonLimitPd,
		rocheLimitPd: el,
		moonOrbitRangePd: g,
		moons: v,
		rings: y,
		profile: `${x}${b ? ` ${b}` : ""}`,
		generationNotes: p
	};
}
//#endregion
//#region src/rules/worlds/physicalWorld.ts
function yl(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function bl(e) {
	return e <= -3 ? "Inner" : e < -.75 ? "Inferno" : e <= .75 ? "Habitable Zone" : e <= 3 ? "Outer" : "Frozen";
}
function xl(e, t, n) {
	let r = t >= 10 ? 1 : t >= 4 ? 0 : -1, i = n >= 6 ? -1 : 0, a = {
		Inner: 4,
		Inferno: 3,
		"Habitable Zone": 1,
		Outer: -1,
		Frozen: -3
	}[e] + r + i;
	return a >= 4 ? "Inferno" : a >= 2 ? "Hot" : a >= 0 ? "Temperate" : a >= -2 ? "Cold" : "Frozen";
}
function Sl(e) {
	return e === "Inner" || e === "Inferno" ? "Hot" : e === "Frozen" ? "Frozen" : "Cold";
}
function Cl(e, t) {
	return E(Math.sqrt(e ** 3 / Math.max(t, .01)), 3);
}
function wl(e, t) {
	let n = e.roll(2, 6, -2).total;
	return (t === "Inner" || t === "Frozen") && --n, t === "Habitable Zone" && (n += 1), yl(n, 0, 15);
}
function Tl(e, t, n) {
	if (t === 0) return 0;
	let r = e.roll(2, 6, -7 + t).total;
	return (n === "Inner" || n === "Inferno") && (r += 1), n === "Frozen" && (r -= 2), yl(r, 0, 15);
}
function El(e, t, n, r, i) {
	return Bc(r, Vc(e, t, n, r, i).atmosphere?.oxygenSafety) ?? r;
}
function Dl(e, n, r, i, a, o = !0, s, c = i) {
	let l = Vc(e, n, r, i, a, { detailSeedAtmosphereCode: c }), u = c !== i && l.atmosphere ? {
		...l,
		atmosphere: {
			...l.atmosphere,
			generationNotes: [`WBH extended method: rolled Atmosphere ${t(c)} has an oxygen partial pressure of ${l.atmosphere.oxygenPartialPressureBar} bar, outside 0.1–0.5 bar, so it is recorded as tainted Atmosphere ${t(i)} with a ${l.atmosphere.oxygenSafety === "low" ? "Low" : "High"} Oxygen taint.`, ...l.atmosphere.generationNotes]
		}
	} : l, d = Xa(e, n, r, i, a), f = s ? {
		...d,
		generationNotes: [...s.generationNotes, ...d.generationNotes]
	} : d, p = u.atmosphere;
	if (i === 15 && u.atmosphere) {
		let t = Zs(e, n, u.size, a);
		p = {
			...u.atmosphere,
			pressureRangeBar: t.pressureRangeBar,
			pressureSpanBar: t.pressureSpanBar,
			meanBaselinePressureBar: t.meanBaselinePressureBar,
			unusual: t.detail,
			generationNotes: [...u.atmosphere.generationNotes.filter((e) => !e.startsWith("Unusual atmosphere subtype remains deferred")), ...t.detail.generationNotes]
		};
	}
	let m = Es(e, n, i, a, u.size, p, f), h = Za(f, e, n, i, m.meanTemperatureK), g = Ma(e, n, r, i, u.size, h, m.meanTemperatureK) ?? cc(i, p), _ = p && {
		...p,
		gasMix: g
	}, v = Zc(e, n, {
		sizeCode: r,
		orbitalPeriodYears: Cl(e.au, n.massSolar)
	}), y = o ? vl(e, n, r, u.size, (e, t, r, i) => Nl(e, n, t, r, i, !1, "Physical profile generated for a WBH significant moon.", !0)) : null;
	return {
		...u,
		atmosphere: _,
		hydrographics: h,
		climate: m,
		rotation: v,
		satellites: y
	};
}
function Ol(e, t, n, r, i) {
	let a = bl(e.hzDeviation), o = Cl(e.au, t.massSolar), s = Bs(e, t, n, r, i), c = Zc(e, t, {
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
		temperatureBand: Sl(a),
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
function kl(e, t, n, r, i) {
	e.roll(2, 6), e.roll(2, 6);
	let a = Cl(t.au, n.massSolar), o = zs(t, n, i), s = Zc(t, n, {
		isGasGiant: !0,
		sizeCode: null,
		orbitalPeriodYears: a
	}), c = vl(t, n, 0, null, (e, t, r, i) => Nl(e, n, t, r, i, !1, "Physical profile generated for a WBH significant gas-giant moon.", !0), o, (e, t, r) => Ol(e, n, t, r, i));
	return {
		zone: r,
		sizeCode: null,
		atmosphereCode: null,
		hydrographicsCode: null,
		uwpPhysical: o.profile,
		temperatureBand: Sl(r),
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
function Al(e, t, n) {
	return {
		zone: n,
		sizeCode: 0,
		atmosphereCode: 0,
		hydrographicsCode: 0,
		uwpPhysical: "000",
		temperatureBand: n === "Habitable Zone" ? "Temperate" : n,
		notes: "Planetoid belt; WBH composition, bulk and natural Resource Rating generated for system comparison.",
		orbitalPeriodYears: Cl(e.au, t.massSolar),
		details: {
			size: null,
			atmosphere: null,
			planetoidBelt: Wc(e, t)
		}
	};
}
function jl(e) {
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
function Ml(e, n, r, i) {
	let a = wl(e, i), o = Tl(e, a, i), s = ac(a > 1 && o <= 1 ? oe(e, "hydrographicsCode", n.id) : e, {
		world: n,
		star: r,
		sizeCode: a,
		atmosphereCode: o
	}), c = s.hydrographicsCode, l = El(n, r, a, o, c);
	return {
		zone: i,
		sizeCode: a,
		atmosphereCode: l,
		hydrographicsCode: c,
		uwpPhysical: `${t(a)}${t(l)}${t(c)}`,
		temperatureBand: xl(i, l, c),
		notes: n.hzDeviation > 3 ? "Distant ice/rock world." : n.hzDeviation < -2 ? "Inner rocky world." : "Terrestrial world candidate.",
		orbitalPeriodYears: Cl(n.au, r.massSolar),
		details: Dl(n, r, a, l, c, !0, s, o)
	};
}
function Nl(e, n, r, i, a, o, s, c) {
	let l = bl(e.hzDeviation), u = c ? El(e, n, r, i, a) : i;
	return {
		zone: l,
		sizeCode: r,
		atmosphereCode: u,
		hydrographicsCode: a,
		uwpPhysical: `${t(r)}${t(u)}${t(a)}`,
		temperatureBand: xl(l, u, a),
		notes: s,
		orbitalPeriodYears: Cl(e.au, n.massSolar),
		details: Dl(e, n, r, u, a, o, void 0, i)
	};
}
function Pl(e, t, n, r = {}) {
	let i = bl(t.hzDeviation), a, o = t.worldKind;
	return a = o === "Gas Giant" ? kl(e, t, n, i, r) : o === "Planetoid Belt" ? Al(t, n, i) : o === "Empty Orbit" ? jl(i) : Ml(e, t, n, i), {
		...a,
		orbitalPeriodYears: Cl(t.au, n.massSolar)
	};
}
function Fl(e, t, n, r, i) {
	return Nl(e, t, n, r, i, !0, "Physical profile imported from source UWP.", !1);
}
//#endregion
//#region src/rules/worlds/wbhGovernmentType.ts
var Il = [
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
function Ll(e) {
	return Math.max(0, Math.min(15, Math.trunc(e)));
}
function Rl(e) {
	return Il[Ll(e)] ?? "Unknown";
}
function zl(e, t) {
	if (t <= 0) return {
		method: "WBH government type",
		source: "generated",
		populationCode: 0,
		roll: null,
		modifier: null,
		unclampedTotal: 0,
		governmentCode: 0,
		governmentType: Rl(0),
		generationNotes: ["Population 0 has Government 0."]
	};
	let n = t - 7, r = e.roll(2, 6).total, i = r + n, a = Ll(i);
	return {
		method: "WBH government type",
		source: "generated",
		populationCode: t,
		roll: r,
		modifier: n,
		unclampedTotal: i,
		governmentCode: a,
		governmentType: Rl(a),
		generationNotes: ["Government code = 2D - 7 + Population code, bounded to 0-F."]
	};
}
function Bl(e, t) {
	let n = e <= 0 ? 0 : Ll(t);
	return {
		method: "WBH government type",
		source: "imported",
		populationCode: e,
		roll: null,
		modifier: null,
		unclampedTotal: n,
		governmentCode: n,
		governmentType: Rl(n),
		generationNotes: [e <= 0 ? "Population 0 forces Government 0." : "Government code preserved from the source UWP."]
	};
}
//#endregion
//#region src/rules/worlds/wbhBalkanisation.ts
function Vl(e, t, n) {
	if (t <= 0 || n !== 7) return null;
	let r = e.die(3), i = r + 1, a = [];
	for (let n = 0; n < i; n += 1) {
		let r = zl(e, t);
		if (r.roll === null || r.modifier === null) throw Error("Balkanised inhabited factions require a Government roll.");
		a.push({
			id: `F${n + 1}`,
			governmentCode: r.governmentCode,
			governmentType: Rl(r.governmentCode),
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
var Hl = [
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
function Ul(e) {
	return e === "D" ? "Demos" : e === "S" ? "Single Council" : e === "R" ? "Ruler" : "Multiple Councils";
}
function Wl(e, t, n, r, i, a = 0, o = i, s = null) {
	return {
		functionCode: e,
		functionName: t,
		code: n,
		structure: Ul(n),
		method: r,
		roll: i,
		dm: a,
		total: o,
		sharedFromFunction: s
	};
}
function Gl(e) {
	return e <= 3 ? "D" : e === 4 ? "S" : e === 5 || e === 6 ? "M" : e === 7 || e === 8 ? "R" : e === 9 ? "M" : e === 10 ? "S" : e === 11 ? "M" : "S";
}
function Kl(e, t, n, r = 0) {
	let i = e.roll(2, 6).total, a = i + r;
	return Wl(t, n, Gl(a), "2D functional structure table", i, r, a);
}
function ql(e, t, n, r, i) {
	let a = n !== "B" && n === r;
	if (t === 2 && (a || n === "B" && r === "L")) return Wl(r, i, "D", "fixed", null, 0, null);
	if (t === 8 || t === 9) return Wl(r, i, "M", "fixed", null, 0, null);
	if ([
		3,
		12,
		15
	].includes(t)) {
		let t = e.die(6);
		return Wl(r, i, t <= 4 ? "S" : "M", "1D council split", t);
	}
	if ([
		10,
		11,
		13,
		14
	].includes(t) && a) {
		let t = e.die(6);
		return Wl(r, i, t <= 5 ? "R" : "S", "1D authoritative ruler split", t);
	}
	if (n === "L" && r === "L") {
		let t = e.roll(2, 6).total;
		return Wl(r, i, t <= 3 ? "D" : t <= 8 ? "M" : "S", "2D legislative-authority table", t);
	}
	return Kl(e, r, i, [
		10,
		11,
		13,
		14
	].includes(t) ? 2 : 0);
}
function Jl(e, t, n, r) {
	let i = /* @__PURE__ */ new Map();
	if (r !== "B") {
		let a = Hl.find((e) => e.code === r);
		if (a) {
			let o = ql(e, t, r, a.code, a.name);
			if (i.set(o.functionCode, o), n === "U" && (o.code === "R" || o.code === "S")) {
				for (let e of Hl) e.code !== o.functionCode && i.set(e.code, Wl(e.code, e.name, o.code, "unitary shared leadership", null, 0, null, o.functionCode));
				return {
					method: "WBH government functional structure",
					governmentCode: t,
					centralisationCode: n,
					authorityCode: r,
					functions: Hl.map((e) => i.get(e.code))
				};
			}
		}
	}
	for (let n of Hl) i.has(n.code) || i.set(n.code, ql(e, t, r, n.code, n.name));
	return {
		method: "WBH government functional structure",
		governmentCode: t,
		centralisationCode: n,
		authorityCode: r,
		functions: Hl.map((e) => i.get(e.code))
	};
}
//#endregion
//#region src/rules/worlds/wbhGovernmentProfile.ts
var Yl = [
	"L",
	"E",
	"J"
];
function Xl(e, t) {
	let n = e.functions.find((e) => e.functionCode === t);
	if (!n) throw Error(`WBH government profile requires a ${t} functional structure.`);
	return n.code;
}
function Zl(e, n, r, i) {
	let a = t(e);
	if (r === "B") {
		let t = `${a}-${n}BB-${Yl.map((e) => `${e}${Xl(i, e)}`).join("-")}`;
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
	let o = r, s = Xl(i, o), c = `${a}-${n}${r}${s}`;
	return {
		method: "WBH government profile",
		governmentCode: e,
		centralisationCode: n,
		authorityCode: r,
		primaryStructureCode: s,
		profile: c,
		basicProfile: c,
		fullProfile: [c, ...Yl.filter((e) => e !== o).map((e) => `${e}${Xl(i, e)}`)].join("-")
	};
}
//#endregion
//#region src/rules/worlds/wbhGovernmentAuthority.ts
function Ql(e) {
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
function $l(e) {
	return e === "C" ? -2 : e === "U" ? 2 : 0;
}
function eu(e) {
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
function tu(e, t, n) {
	let r = [], i = Ql(t);
	i !== 0 && r.push({
		source: `Government ${t}`,
		dm: i
	});
	let a = $l(n);
	a !== 0 && r.push({
		source: `${n} centralisation`,
		dm: a
	});
	let o = e.roll(2, 6).total, s = r.reduce((e, t) => e + t.dm, 0), c = o + s, l = eu(c), u = Jl(e, t, n, l.code), d = Zl(t, n, l.code, u);
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
function nu(e) {
	return e >= 2 && e <= 5 ? -1 : e === 6 || e >= 8 && e <= 11 ? 1 : e >= 12 ? 2 : 0;
}
function ru(e) {
	return e >= 0 && e <= 3 ? -1 : e >= 7 && e <= 8 ? 1 : e === 9 ? 3 : 0;
}
function iu(e) {
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
function au(e, t, n, r = !1) {
	let i = [], a = nu(t);
	a !== 0 && i.push({
		source: `Government ${t}`,
		dm: a
	}), r && i.push({
		source: "Government 7 balkanised faction",
		dm: 1
	});
	let o = ru(n);
	o !== 0 && i.push({
		source: `PCR ${n}`,
		dm: o
	});
	let s = e.roll(2, 6).total, c = i.reduce((e, t) => e + t.dm, 0), l = s + c, u = iu(l), d = tu(e, t, u.code);
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
var ou = 4, su = 64;
function cu(e) {
	return e === 0 || e === 7 ? 1 : e >= 10 ? -1 : 0;
}
function lu(e) {
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
function uu(e) {
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
function du(e) {
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
function fu(e, n, r) {
	return `${e}-${t(n)}-${r}`;
}
function pu(e, t, n) {
	return `${e}+${t}=${n}`;
}
function mu(e, t, n) {
	if (t <= 0) return null;
	let r = e.die(3), i = cu(n), a = r + i, o = Math.max(1, a);
	Math.max(0, o - 1);
	let s = [], c = !1, l = (e, t, n, r, i, a, o, l, u, d, f, p) => {
		if (s.length >= su) {
			c = !0;
			return;
		}
		s.push({
			id: e,
			parentId: t,
			depth: n,
			ruling: r,
			governmentCode: i,
			governmentType: Rl(i),
			governmentRoll: a,
			governmentModifier: o,
			governmentUnclampedTotal: l,
			strengthRoll: u,
			strengthCode: d,
			strengthDescription: f,
			profile: fu(e, i, d),
			spawnedByBalkanisation: p
		});
	};
	l("I", null, 0, !0, n, null, null, n, null, "G", "Official government", !1);
	let u = (n, r, i, a) => {
		if (s.length >= su) {
			c = !0;
			return;
		}
		let o = zl(e, t);
		if (o.roll === null || o.modifier === null) throw Error("WBH outside faction on an inhabited world requires a Government roll.");
		let d = e.roll(2, 6).total, f = lu(d);
		if (l(n, r, i, !1, o.governmentCode, o.roll, o.modifier, o.unclampedTotal, d, f.code, f.description, a), o.governmentCode !== 7) return;
		if (i >= ou) {
			c = !0;
			return;
		}
		let p = e.die(3) + 1;
		for (let e = 1; e <= p; e += 1) u(`${n}.${du(e)}`, n, i + 1, !0);
	};
	for (let e = 2; e <= o; e += 1) u(du(e), null, 0, !1);
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
		let o = a.reduce((e, t) => e + t.dm, 0), c = e.die(6), l = c + o, u = uu(l);
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
			profile: pu(r.id, i.id, u.code)
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
			`Recursion is capped at depth ${ou} and ${su} total factions to prevent pathological infinite Government-7 chains.`,
			"Faction relationships roll 1D for every pair, with DM+1 for the ruling faction and DM-1 for matching Government codes."
		]
	};
}
//#endregion
//#region src/rules/worlds/wbhMajorCities.ts
function hu(e) {
	return Math.max(0, Math.ceil(e));
}
function gu(e, t, n, r) {
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
function _u(e, t, n, r, i) {
	if (n === 0) {
		let t = e.d6(), n = Math.min(i / 100, (t + 2) * 1e4);
		return n < 100 && (n = Math.max(i / 10, t + 1)), {
			populationAllocationCase: 1,
			largestNonMajorCityPopulation: hu(n),
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
		cities: gu(r, [100], [[]], [null])
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
			cities: gu(r, t, i, Array(n).fill(null))
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
		cities: gu(r, h, d, u)
	};
}
function vu(e, t) {
	let n = t.populationConcentration, r = t.urbanisation;
	if (t.populationCode <= 0 || !n || !r) return null;
	let i = t.populationCode, a = n.rating, o = r.totalUrbanPopulation, s = r.urbanisationPercent, c = [];
	if (a === 0) {
		c.push("WBH Major Cities Case 1: PCR 0 has no major cities.");
		let t = _u(e, a, 0, 0, o);
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
		let t = _u(e, a, 1, o, o);
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
		let n = _u(e, a, t, o, o);
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
		let r = _u(e, a, n, o, o);
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
	let f = e.d6(), p = hu(a / (f + 7) * o), m = o > 0 ? p / o * 100 : 0, h = _u(e, a, d, p, o);
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
var yu = [
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
function bu(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function xu(e) {
	let t = e.physical?.details?.rotation;
	return t?.tidalLockStatus === "1:1" && t.tidalLockCase === "planet-star";
}
function Su(e) {
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
function Cu(e, t) {
	let n = [], r = e.physical?.sizeCode ?? 0, i = t.populationCode, a = t.governmentCode, o = t.techLevel, s = Su(e), c = new Set(t.tradeCodes), l = (e, t) => {
		n.push({
			source: e,
			dm: t
		});
	};
	return r === 1 ? l("Size 1", 2) : (r === 2 || r === 3) && l(`Size ${r}`, 1), xu(e) && l("Twilight zone world", 2), s >= 8 ? l(`Minimum sustainable TL ${s}`, 3) : s >= 3 && l(`Minimum sustainable TL ${s}`, 1), i === 8 ? l("Population 8", -1) : i >= 9 && l(`Population ${i}`, -2), a === 7 && l("Government 7", -2), o <= 1 ? l(`Tech Level ${o}`, -2) : o <= 3 ? l(`Tech Level ${o}`, -1) : o <= 9 && l(`Tech Level ${o}`, 1), c.has("Ag") && l("Agricultural", -2), c.has("In") && l("Industrial", 1), c.has("Na") && l("Non-Agricultural", -1), c.has("Ri") && l("Rich", 1), n;
}
function wu(e, t, n) {
	if (n.populationCode <= 0) return null;
	let r = n.populationCode, i = +(r >= 9), a = [], o = null;
	if (r < 6) {
		if (o = e.d6(), o > r) return a.push("Population below 6 and the preliminary 1D roll exceeded the Population code: the entire population occupies one settlement area, so PCR is 9."), {
			method: "WBH population concentration rating",
			rating: 9,
			description: yu[9],
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
	let s = e.d6(), c = Cu(t, n), l = c.reduce((e, t) => e + t.dm, 0), u = s + l, d = bu(u, i, 9);
	return a.push(r >= 9 ? "Population 9+ sets the WBH minimum PCR to 1." : "WBH minimum PCR is 0 for Population below 9."), a.push("PCR is bounded to a maximum of 9."), {
		method: "WBH population concentration rating",
		rating: d,
		description: yu[d],
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
function Tu(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Eu(e) {
	return e.die(2);
}
function Du(e, t) {
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
		percentage: 22 + e.d6() * 2 + Eu(e),
		range: "25–36%"
	} : t === 6 ? {
		percentage: 34 + e.d6() * 2 + Eu(e),
		range: "37–48%"
	} : t === 7 ? {
		percentage: 46 + e.d6() * 2 + Eu(e),
		range: "49–60%"
	} : t === 8 ? {
		percentage: 58 + e.d6() * 2 + Eu(e),
		range: "61–72%"
	} : t === 9 ? {
		percentage: 70 + e.d6() * 2 + Eu(e),
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
function Ou(e, t, n) {
	let r = [], i = (e, t) => {
		r.push({
			source: e,
			dm: t
		});
	}, a = Su(e), o = e.physical?.sizeCode ?? 0, s = t.populationCode, c = t.governmentCode, l = t.lawLevelCode, u = t.techLevel, d = new Set(t.tradeCodes);
	return n <= 2 ? i(`PCR ${n}`, -3 + n) : n >= 7 && i(`PCR ${n}`, -6 + n), a <= 3 && i(`Minimum sustainable TL ${a}`, -1), o === 0 && i("Size 0", 2), s === 8 ? i("Population 8", 1) : s === 9 ? i("Population 9", 2) : s >= 10 && i(`Population ${s}`, 4), c === 0 && i("Government 0", -2), l >= 9 && i(`Law Level ${l}`, 1), u <= 2 ? i(`Tech Level ${u}`, -2) : u === 3 ? i("Tech Level 3", -1) : u === 4 ? i("Tech Level 4", 1) : u <= 9 ? i(`Tech Level ${u}`, 2) : i(`Tech Level ${u}`, 1), d.has("Ag") && i("Agricultural", -2), d.has("Na") && i("Non-Agricultural", 2), r;
}
function ku(e, t) {
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
function Au(e, t, n) {
	if (n.populationCode <= 0 || !n.populationConcentration) return null;
	let r = n.populationConcentration.rating, i = Ou(t, n, r), a = i.reduce((e, t) => e + t.dm, 0), o = e.roll(2, 6).total, s = o + a, c = Du(e, s), l = ku(e, n), u = l.minimums.length ? l.minimums.reduce((e, t) => t.percentage > e.percentage ? t : e) : null, d = l.maximums.length ? l.maximums.reduce((e, t) => t.percentage < e.percentage ? t : e) : null, f = c.percentage, p = null, m = null;
	u && f < u.percentage && (f = u.percentage, p = u), d && f > d.percentage && (!u || u.percentage <= d.percentage) && (f = d.percentage, m = d), f = Tu(f, 0, 100);
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
function ju(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function N(e) {
	return t(ju(e, 0, 33));
}
function Mu(e) {
	return e >= 11 ? "A" : e >= 9 ? "B" : e >= 7 ? "C" : e >= 5 ? "D" : e >= 3 ? "E" : "X";
}
function Nu(e) {
	let t = e.physical, n = 0;
	return t?.zone === "Habitable Zone" && (n += 1), t?.temperatureBand === "Temperate" && (n += 1), e.worldKind === "Planetoid Belt" && --n, e.worldKind === "Gas Giant" && (n -= 3), n;
}
function Pu(e) {
	return e.physical?.details?.nativeLife?.currentNativeSophont === !0;
}
function Fu(e, t) {
	return Pu(e) ? {
		status: "native-sophont",
		basis: "Current native Sophonts establish an inhabited world."
	} : t?.origin === "transplanted" ? {
		status: "transplanted",
		basis: t.populationCode === null ? "Referee established a transplanted population; Population is generated with the ordinary WBH procedure." : `Referee established a transplanted population with Population code ${N(t.populationCode)}.`
	} : {
		status: "uninhabited",
		basis: e.isMainworld ? "Mainworld designation identifies the system reference world; it does not itself establish inhabitants." : "No native Sophonts or explicit transplanted population has been established for this body."
	};
}
function Iu(e, t) {
	return e.isMainworld === !0 || Pu(e) || t?.origin === "transplanted";
}
function Lu(e) {
	for (let t = 0; t < 32; t += 1) {
		let t = ju(e.roll(2, 6, -2).total, 0, 10);
		if (t > 0) return t;
	}
	return 1;
}
function Ru(e, t, n) {
	return t === "native-sophont" ? e.die(3) + e.die(3) + 4 : t === "transplanted" ? typeof n?.populationCode == "number" ? ju(Math.trunc(n.populationCode), 1, 10) : Lu(e) : 0;
}
function zu(e, t) {
	if (t === 0) return 0;
	let n = e.die(3), r = e.die(3);
	return (n - 1) * 3 + r;
}
function Bu(e, t, n = null) {
	if (e === 0 || t === 0) return 0;
	let r = t + (n === null ? 0 : n / 10);
	return Math.round(r * 10 ** e);
}
function Vu(e, t, n, r, i) {
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
	let a = e.d10ZeroToNine(), o = Bu(t, n, a), s = `${n}.${a}`, c = ["P value uses the WBH two-D3 procedure; one d10 supplies an additional significant digit."];
	return r === "native-sophont" && c.push("Population code uses the WBH native-sophont 2D3+4 option."), r === "transplanted" && c.push(typeof i?.populationCode == "number" ? "Population code was set explicitly by the Referee for this transplanted population." : "Population code uses ordinary WBH 2D-2 conditioned on an established non-zero transplanted population."), {
		method: "WBH population phase 1",
		populationCode: t,
		pValue: n,
		additionalSignificantDigit: a,
		estimatedPopulation: o,
		profilePrefix: `${N(t)}-${s}`,
		nativeSophontPopulationProcedure: r === "native-sophont" ? "2D3+4" : "none",
		generationNotes: c
	};
}
function Hu(e, t, n) {
	return n === 0 ? 0 : ju(e.roll(2, 6, -7 + t).total, 0, 18);
}
function Uu(e, t, n, r, i, a) {
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
function Wu(e) {
	let t = e.physical?.sizeCode ?? 0, n = e.physical?.atmosphereCode ?? 0, r = e.physical?.hydrographicsCode ?? 0, i = e.physical?.details?.habitabilityRating?.rating, a = 0, o = [], s = (e, t) => {
		e > a && (a = e), o.push(`${t}: TL${e}`);
	};
	return [
		0,
		1,
		10
	].includes(n) ? s(8, `WBH Atmosphere ${N(n)}`) : [
		2,
		3,
		13,
		14
	].includes(n) ? s(5, `WBH Atmosphere ${N(n)}`) : [
		4,
		7,
		9
	].includes(n) ? s(3, `WBH Atmosphere ${N(n)}`) : n === 11 ? s(9, "WBH Atmosphere B") : n === 12 ? s(10, "WBH Atmosphere C") : n === 15 ? s(8, "WBH Atmosphere F conservative floor") : (n === 16 || n === 17) && s(14, `WBH Atmosphere ${N(n)}`), typeof i == "number" && (i === 0 ? s(8, "WBH Habitability 0") : i <= 2 ? s(5, `WBH Habitability ${i}`) : i <= 7 && s(3, `WBH Habitability ${i}`)), r === 0 && n >= 4 && s(4, "Existing dry-world survival floor"), t === 0 && s(8, "Existing Size 0 survival floor"), {
		minimum: a,
		basis: o
	};
}
function Gu(e, t, n, r, i, a) {
	if (r === 0) return 0;
	let o = n.physical, s = o?.sizeCode ?? 0, c = o?.atmosphereCode ?? 0, l = o?.hydrographicsCode ?? 0, u = e.die(6) + Uu(t, s, c, l, r, i);
	return ju(Math.max(u, a), 0, 15);
}
function P(e, t, n) {
	return e >= t && e <= n;
}
function Ku(e, t, n, r) {
	let i = e.populationCode, a = e.governmentCode, o = e.lawLevelCode, s = e.techLevel, c = [];
	return P(t, 4, 9) && P(n, 4, 8) && P(r, 5, 7) && c.push("Ag"), t === 0 && n === 0 && r === 0 && c.push("As"), i === 0 && a === 0 && o === 0 && c.push("Ba"), P(t, 2, 9) && r === 0 && c.push("De"), (P(n, 10, 12) || n >= 15) && r >= 1 && c.push("Fl"), P(t, 6, 8) && [
		5,
		6,
		8
	].includes(n) && P(r, 5, 7) && c.push("Ga"), i >= 9 && c.push("Hi"), s >= 12 && c.push("Ht"), (n === 0 || n === 1) && r >= 1 && c.push("Ic"), [
		0,
		1,
		2,
		4,
		7,
		9,
		10,
		11,
		12
	].includes(n) && i >= 9 && c.push("In"), i >= 1 && i <= 3 && c.push("Lo"), i >= 1 && s <= 5 && c.push("Lt"), P(n, 0, 3) && P(r, 0, 3) && i >= 6 && c.push("Na"), P(i, 4, 6) && c.push("Ni"), P(n, 2, 5) && P(r, 0, 3) && c.push("Po"), (n === 6 || n === 8) && P(i, 6, 8) && P(a, 4, 9) && c.push("Ri"), n === 0 && c.push("Va"), P(t, 2, 9) && r === 10 && c.push("Wa"), c;
}
function qu(e) {
	let t = 0;
	return (e.starport === "A" || e.starport === "B") && (t += 1), (e.starport === "D" || e.starport === "E" || e.starport === "X") && --t, e.populationCode <= 6 && --t, e.populationCode >= 9 && (t += 1), e.techLevel <= 8 && --t, e.techLevel >= 10 && e.techLevel <= 15 && (t += 1), e.techLevel >= 16 && (t += 2), e.tradeCodes.includes("Ag") && (t += 1), e.tradeCodes.includes("In") && (t += 1), e.tradeCodes.includes("Ri") && (t += 1), t;
}
function Ju(e, t, n) {
	if (!t.physical || t.worldKind === "Empty Orbit" || t.worldKind === "Gas Giant" || !Iu(t, n)) return;
	let r = Fu(t, n), i = Ru(e, r.status, n), a = zu(e, i), o = Vu(e, i, a, r.status, n), s = o.estimatedPopulation, c = zl(e, i), l = c.governmentCode, u = Hu(e, l, i), d = i === 0 ? "X" : Mu(e.roll(2, 6, Nu(t)).total), f = i === 0 ? {
		minimum: 0,
		basis: []
	} : Wu(t), p = Gu(e, d, t, i, l, f.minimum), m = t.physical.sizeCode ?? 0, h = t.physical.atmosphereCode ?? 0, g = t.physical.hydrographicsCode ?? 0, _ = {
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
	if (_.tradeCodes = Ku(_, m, h, g), _.importance = qu(_), _.uwp = `${d}${t.physical.uwpPhysical}${N(i)}${N(l)}${N(u)}-${N(p)}`, _.populationConcentration = wu(T("populationConcentration", t.id, t.au, t.eccentricity, _.uwp), t, _), _.urbanisation = Au(T("urbanisation", t.id, t.au, t.eccentricity, _.uwp), t, _), _.majorCities = vu(T("majorCities", t.id, t.au, t.eccentricity, _.uwp), _), _.balkanisation = Vl(T("balkanisation", t.id, t.au, t.eccentricity, _.uwp), i, l), i > 0) if (l === 7 && _.balkanisation) for (let e of _.balkanisation.factions) e.internalFactions = mu(T("governmentFactions", t.id, t.au, t.eccentricity, _.uwp, e.id), i, e.governmentCode);
	else _.governmentFactions = mu(T("governmentFactions", t.id, t.au, t.eccentricity, _.uwp), i, l);
	let v = _.populationConcentration?.rating;
	if (i > 0 && typeof v == "number") if (l === 7 && _.balkanisation) for (let e of _.balkanisation.factions) e.centralisation = au(T("centralisation", t.id, t.au, t.eccentricity, _.uwp, e.id), e.governmentCode, v, !0);
	else l !== 0 && (_.governmentCentralisation = au(T("centralisation", t.id, t.au, t.eccentricity, _.uwp), l, v, !1));
	return _;
}
function Yu(e, t, n, r, i, a, o, s, c, l = "imported") {
	let u = Bl(t, r), d = {
		starport: e,
		populationCode: t,
		populationMultiplier: n,
		populationTotal: Bu(t, n),
		populationDetails: null,
		populationConcentration: null,
		urbanisation: null,
		majorCities: null,
		governmentDetails: u,
		balkanisation: null,
		governmentCentralisation: null,
		governmentFactions: null,
		habitationStatus: t === 0 ? "uninhabited" : void 0,
		habitationBasis: t === 0 ? "Imported UWP has Population 0." : "Imported source UWP establishes an inhabited population.",
		minimumSustainableTechLevel: null,
		minimumSustainableTechLevelBasis: [],
		governmentCode: u.governmentCode,
		lawLevelCode: i,
		techLevel: a,
		uwp: "",
		tradeCodes: [],
		importance: 0,
		notes: "Social profile imported from source UWP."
	};
	if (d.tradeCodes = Ku(d, o, s, c), d.importance = qu(d), d.uwp = `${e}${N(o)}${N(s)}${N(c)}${N(t)}${N(d.governmentCode)}${N(i)}-${N(a)}`, d.balkanisation = Vl(T("balkanisation", l, d.uwp), t, d.governmentCode), t > 0) if (d.governmentCode === 7 && d.balkanisation) for (let e of d.balkanisation.factions) e.internalFactions = mu(T("governmentFactions", l, d.uwp, e.id), t, e.governmentCode);
	else d.governmentFactions = mu(T("governmentFactions", l, d.uwp), t, d.governmentCode);
	return d;
}
//#endregion
//#region src/rules/validation/systemValidation.ts
var Xu = /* @__PURE__ */ new Set([
	"Frozen",
	"Cold",
	"Temperate",
	"Hot",
	"Boiling"
]), Zu = /* @__PURE__ */ new Set([
	5,
	6,
	8
]);
function F(e, t, n, r, i) {
	e.push({
		severity: t,
		scope: n,
		message: r,
		recommendation: i
	});
}
function Qu(e, t = 2) {
	let n = 10 ** t;
	return Math.round(e * n) / n;
}
function $u(e, t) {
	return Math.abs(t - e) >= Math.max(5, Math.abs(e) * .01);
}
function ed(e, t, n) {
	let r = n.details?.atmosphere, i = n.atmosphereCode;
	if (!(!r || i === null) && Zu.has(i) && (r.oxygenSafety === "low" || r.oxygenSafety === "high")) {
		let n = r.oxygenPartialPressureBar, a = r.oxygenSafety === "low" ? "low" : "high";
		F(e, "warning", t, `Nominally breathable Atmosphere ${i.toString(16).toUpperCase()} has ${a} oxygen${typeof n == "number" ? ` (ppo ${n} bar)` : ""} outside the WBH 0.1-0.5 bar safer range.`, "Referee review required: preserve the established Atmosphere code unless choosing to adjust pressure/oxygen values or convert it to the corresponding tainted atmosphere.");
	}
}
function td(e, t, n) {
	let r = n.details?.hydrographics;
	r && (r.coveragePercent > 0 && r.composition === "None" && F(e, "error", t, `Hydrographics records ${r.coveragePercent}% surface coverage but composition is None.`, "Resolve the hydrographic liquid composition or set precise coverage to 0."), r.surfaceFeatures?.discreteFeatureType === "water" && r.composition !== "H2O" && F(e, "warning", t, `Surface features are labelled as water but hydrographic composition is ${r.composition ?? "unresolved"}.`, "Keep unresolved or exotic fluids labelled as generic liquid until H2O composition is confirmed."));
}
function nd(e, t, n) {
	let r = n.details?.climate, i = r?.temperatureClass;
	i && Xu.has(n.temperatureBand) && n.temperatureBand !== i && F(e, "info", t, `Provisional temperature band ${n.temperatureBand} differs from detailed WBH climate class ${i}.`, "Use the detailed climate class for presentation and retain the provisional band only as generation provenance.");
	let a = r?.meanTemperatureK, o = n.details?.seismology?.seismicAdjustedMeanTemperatureK;
	typeof a == "number" && Number.isFinite(a) && typeof o == "number" && Number.isFinite(o) && $u(a, o) && F(e, "warning", t, `Seismic-adjusted mean temperature ${Qu(o)}K materially differs from detailed climate mean ${Qu(a)}K but has not been reconciled downstream.`, "Reconcile the final mean temperature before treating climate, native life, habitability, or other temperature consumers as final.");
}
function rd(e, t, n, r, i) {
	let a = n.sourceId ?? `${t}.${n.designation}`, o = n.orbitPd * (1 - n.eccentricity), s = n.orbitPd * (1 + n.eccentricity);
	(n.orbitPd > r || n.beyondHillMoonLimit) && F(e, "warning", a, `Persistent significant moon orbit ${Qu(n.orbitPd)} PD lies beyond the WBH Hill Sphere Moon Limit ${Qu(r)} PD.`, "Remove or relocate the significant moon; WBH system generation uses the Hill Sphere Moon Limit as the practical outer persistence boundary."), o < i && F(e, "warning", a, `Eccentric moon periapsis ${Qu(o)} PD crosses inside the nominal Roche limit ${Qu(i)} PD.`, "Review the orbit for disruption/ring formation or apply a referee-approved orbital correction."), s > r && F(e, "warning", a, `Eccentric moon apoapsis ${Qu(s)} PD crosses beyond the WBH Hill Sphere Moon Limit ${Qu(r)} PD.`, "Reduce eccentricity, relocate, or remove the significant moon so its complete persistent orbit remains inside the WBH Moon Limit."), n.physical && ad(e, a, n.physical);
}
function id(e, t, n) {
	let r = n.details?.satellites;
	if (r) for (let n of r.moons) rd(e, t, n, r.hillSphereMoonLimitPd, r.rocheLimitPd);
}
function ad(e, t, n) {
	ed(e, t, n), td(e, t, n), nd(e, t, n), id(e, t, n);
}
function od(e, t) {
	if (t.worldKind === "Empty Orbit") return;
	let n = t.physical;
	if (!n) {
		F(e, "warning", t.id, "World has no physical profile.", "Regenerate the system or check the physical world generation step.");
		return;
	}
	let r = n.sizeCode ?? 0, i = n.atmosphereCode ?? 0, a = n.hydrographicsCode ?? 0, o = t.social;
	ad(e, t.id, n), r === 0 && (i !== 0 || a !== 0) && F(e, "error", t.id, "Size 0 world has non-zero atmosphere or hydrographics.", "Set atmosphere and hydrographics to 0 for asteroid-size bodies."), i === 0 && a > 0 && n.temperatureBand !== "Frozen" && F(e, "warning", t.id, "Vacuum world has surface hydrographics outside a frozen environment.", "Treat water as ice, subsurface reservoirs, or reroll hydrographics."), a === 10 && ["Inferno", "Inner"].includes(n.zone) && F(e, "warning", t.id, "Very high hydrographics on a hot inner-zone world.", "Consider revising temperature, hydrographics, or atmosphere."), t.worldKind === "Gas Giant" && n.uwpPhysical !== "---" && F(e, "info", t.id, "Gas giant is excluded from UWP-style physical coding.", "This is expected for the current generator."), o && (o.populationCode === 0 && (o.governmentCode !== 0 || o.lawLevelCode !== 0 || o.starport !== "X") && F(e, "error", t.id, "Uninhabited world has government, law, or starport values that imply habitation.", "Set starport X and social codes 000."), o.populationCode > 0 && o.techLevel === 0 && F(e, "warning", t.id, "Inhabited world has TL 0.", "Confirm this is intentional for a primitive or collapsed society."), o.techLevel < 5 && (i <= 3 || i >= 10) && o.populationCode >= 6 && F(e, "warning", t.id, "Large population on a hostile-atmosphere world with low TL.", "Raise TL, reduce population, or explain outside support."), o.starport === "A" && o.populationCode <= 3 && F(e, "info", t.id, "Excellent starport with very low population.", "This may indicate a depot, research station, or external installation."), o.tradeCodes.includes("Ba") && o.populationCode !== 0 && F(e, "error", t.id, "Barren trade code conflicts with non-zero population.", "Recalculate trade codes."));
}
function sd(e) {
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
function cd(e) {
	let t = [], n = sd(e), r = n[0];
	r ? r.topLevelWorld && !r.topLevelWorld.social?.uwp && F(t, "warning", "system", "Selected mainworld does not have a complete UWP.", "Generate or manually assign social characteristics.") : F(t, "error", "system", "No mainworld was selected.", "Choose the most habitable terrestrial world, significant moon, or belt as the mainworld."), n.length > 1 && F(t, "error", "system", "More than one body is marked as the mainworld.", "Keep exactly one mainworld flag across worlds and significant moons."), r && e.summary.mainworldId && e.summary.mainworldId !== r.id && F(t, "error", "system", `Summary mainworld ${e.summary.mainworldId} does not match the body marked as mainworld ${r.id}.`, "Reconcile mainworld selection metadata before export."), e.stars.length === 0 && F(t, "error", "system", "System has no stars.", "Regenerate primary star data."), e.summary.totalWorlds !== e.worlds.filter((e) => e.worldKind !== "Empty Orbit").length && F(t, "warning", "system", "Summary world count does not match generated non-empty world rows.", "Check world placement and empty-orbit accounting.");
	for (let n of e.worlds) od(t, n);
	return t.length === 0 && F(t, "info", "system", "No validation issues found."), t;
}
//#endregion
//#region src/rules/system/wbhMainworldDetermination.ts
function ld(e) {
	return (e.physical?.details?.satellites?.moons ?? []).flatMap((t, n) => !t.physical || t.physical.details?.gasGiant ? [] : [{
		id: t.sourceId ?? `${e.id}.moon-${n + 1}`,
		parentId: e.id,
		kind: "Significant Moon",
		physical: t.physical,
		parentWorldKind: e.worldKind
	}]);
}
function ud(e) {
	return e.flatMap((e) => {
		let t = ld(e);
		return e.worldKind === "Empty Orbit" || e.worldKind === "Gas Giant" ? t : [{
			id: e.id,
			parentId: null,
			kind: e.worldKind,
			physical: e.physical,
			parentWorldKind: null
		}, ...t];
	});
}
function dd(e) {
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
function fd(e) {
	let t = e.physical?.details;
	return {
		id: e.id,
		parentId: e.parentId,
		kind: e.kind,
		habitabilityRating: t?.habitabilityRating?.rating ?? null,
		nativeSophontsPresent: t?.nativeLife?.currentNativeSophont === !0,
		resourceRating: t?.resourceRating?.rating ?? t?.planetoidBelt?.resourceRating.rating ?? null,
		refuelling: dd(e)
	};
}
function pd(e) {
	let t = e.filter((e) => e !== null && Number.isFinite(e));
	return t.length ? Math.max(...t) : null;
}
function md(e, t) {
	return e.totalCriterionWins === t.totalCriterionWins ? (e.habitabilityRating ?? -1) === (t.habitabilityRating ?? -1) ? e.nativeSophontsPresent === t.nativeSophontsPresent ? (e.resourceRating ?? -1) === (t.resourceRating ?? -1) ? e.refuelling.rank === t.refuelling.rank ? e.id.localeCompare(t.id) : t.refuelling.rank - e.refuelling.rank : (t.resourceRating ?? -1) - (e.resourceRating ?? -1) : Number(t.nativeSophontsPresent) - Number(e.nativeSophontsPresent) : (t.habitabilityRating ?? -1) - (e.habitabilityRating ?? -1) : t.totalCriterionWins - e.totalCriterionWins;
}
function hd(e) {
	let t = ud(e).map(fd), n = pd(t.map((e) => e.habitabilityRating)), r = pd(t.map((e) => e.resourceRating)), i = Math.max(0, ...t.map((e) => e.refuelling.rank)), a = t.map((e) => {
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
	}).sort(md), o = a[0]?.id ?? null;
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
function gd(e, t) {
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
function _d(e, t) {
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
var vd = /* @__PURE__ */ new Set([
	"Ia",
	"Ib",
	"II",
	"III"
]), yd = /* @__PURE__ */ new Set([
	"Ia",
	"Ib",
	"II",
	"III",
	"IV"
]), bd = /* @__PURE__ */ new Set([
	"O",
	"B",
	"A",
	"F"
]);
function xd(e) {
	if (yd.has(e.luminosityClass)) return 1;
	if (e.luminosityClass === "V" || e.luminosityClass === "VI") {
		if (bd.has(e.spectralType)) return 1;
		if (e.spectralType === "M") return -1;
	}
	return e.spectralType === "BD" || e.spectralType === "D" ? -1 : 0;
}
function Sd(e) {
	return !vd.has(e.luminosityClass);
}
function Cd(e) {
	return vd.has(e.luminosityClass);
}
function wd(e, t) {
	if (!Number.isInteger(e) || e < 1 || e > 6) throw RangeError(`${t} must be an integer from 1 to 6.`);
}
function Td(e) {
	if (!Number.isInteger(e) || e < 2 || e > 12) throw RangeError("2D total must be an integer from 2 to 12.");
}
function Ed(e, t, n) {
	wd(t, "Orbit roll"), wd(n, "Fractional-variance roll");
	let r = (n - 1) / 10;
	if (e === "Close") {
		let e = t - 1;
		return (e === 0 ? .5 : e) + r;
	}
	return e === "Near" ? t + 5 + r : t + 11 + r;
}
function Dd(e, t) {
	return wd(e, "Companion orbit roll"), Td(t), e / 10 + (t - 7) / 100;
}
function Od(e, t) {
	if (wd(e, "Giant companion orbit roll"), !Number.isFinite(t) || t < 0) throw RangeError("Parent minimum allowable orbit must be a finite non-negative Orbit#.");
	return e * t;
}
//#endregion
//#region src/rules/system/wbhAllowableOrbits.ts
function kd(e) {
	return e.filter((e) => e.orbitClass !== "Primary" && e.orbitClass !== "Companion" && Number.isFinite(e.orbitNumber)).sort((e, t) => Number(e.orbitNumber) - Number(t.orbitNumber));
}
function Ad(e, t) {
	return e.find((e) => e.orbitClass === "Companion" && e.parentId === t.id) ?? null;
}
function jd(e) {
	if (e.spectralType === "BD" || e.luminosityClass === "BD") return .005;
	if (e.spectralType === "D" || e.luminosityClass === "D") return .001;
	let t = Math.max(0, .01 * Number(e.diameterSolar || 0));
	return E(Math.max(.01, Te(t)), 2);
}
function Md(e, t) {
	let n = jd(e);
	if (!t) return n;
	let r = Math.max(0, Number(t.eccentricity || 0)), i = Math.max(n, jd(t)), a = i > .2 ? i : 0;
	return E(Math.max(n, .5 + r + a), 2);
}
function Nd(e) {
	if (e.orbitClass === "Primary" || e.orbitClass === "Companion" || !Number.isFinite(e.orbitNumber)) throw Error("Primary exclusion requires a Close, Near, or Far secondary with an Orbit#.");
	let t = 1, n = jd(e);
	n > .2 && (t += n);
	let r = Math.max(0, Number(e.eccentricity || 0));
	r > .2 && (t += 1), (e.orbitClass === "Close" || e.orbitClass === "Near") && r > .5 && (t += 1);
	let i = Number(e.orbitNumber);
	return {
		sourceStarId: e.id,
		sourceDesignation: e.designation,
		inner: E(Math.max(0, i - t), 2),
		outer: E(i + t, 2),
		reason: `WBH exclusion around ${e.orbitClass} secondary ${e.designation}.`
	};
}
function Pd(e, t) {
	let n = [];
	for (let r of e) {
		if (t.outer <= r.inner || t.inner >= r.outer) {
			n.push(r);
			continue;
		}
		t.inner > r.inner && n.push({
			inner: r.inner,
			outer: E(t.inner, 2)
		}), t.outer < r.outer && n.push({
			inner: E(t.outer, 2),
			outer: r.outer
		});
	}
	return n.filter((e) => e.outer - e.inner >= .01);
}
function Fd(e) {
	return E(e.reduce((e, t) => e + Math.max(0, t.outer - t.inner), 0), 2);
}
function Id(e, t) {
	let n = /* @__PURE__ */ new Map([
		["Close", 0],
		["Near", 1],
		["Far", 2]
	]), r = n.get(e.orbitClass), i = n.get(t.orbitClass);
	return r !== void 0 && i !== void 0 && Math.abs(r - i) === 1;
}
function Ld(e, t) {
	let n = Number(e.orbitNumber);
	if (!Number.isFinite(n)) return null;
	let r = n - 3, i = t.filter((t) => t.id !== e.id && Id(e, t));
	return i.length > 0 && --r, [e, ...i].some((e) => Number(e.eccentricity || 0) > .2) && --r, E(r, 2);
}
function Rd(e) {
	let t = e.find((e) => e.orbitClass === "Primary") ?? e[0];
	if (!t) return {
		zones: [],
		primaryExclusions: []
	};
	let n = kd(e), r = n.map(Nd), i = [], a = Ad(e, t), o = Md(t, a), s = o < 20 ? [{
		inner: o,
		outer: 20
	}] : [];
	for (let e of r) s = Pd(s, e);
	i.push({
		starId: t.id,
		starDesignation: t.designation,
		parentStarIds: a ? [t.id, a.id] : [t.id],
		parentDesignations: a ? [t.designation, a.designation] : [t.designation],
		minimumAllowableOrbit: o,
		ranges: s,
		availableOrbitSpan: Fd(s),
		outerLimit: s.length ? s.at(-1).outer : null
	});
	for (let t of n) {
		let r = Ad(e, t), a = Md(t, r), o = Ld(t, n), s = o !== null && o - a >= .01 ? [{
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
			availableOrbitSpan: Fd(s),
			outerLimit: s.length ? s.at(-1).outer : null
		});
	}
	return {
		zones: i,
		primaryExclusions: r
	};
}
function zd(e, t) {
	return e.ranges.some((e) => t >= e.inner && t <= e.outer);
}
//#endregion
//#region src/rules/system/wbhHillStability.ts
function Bd(e) {
	return e.orbitAu === void 0 ? e.orbitNumber === void 0 ? 0 : we(e.orbitNumber) : e.orbitAu;
}
function Vd(e, t) {
	let n = t.filter((t) => t.orbitClass === "Companion" && t.parentId === e.id), r = n.reduce((e, t) => {
		let n = Bd(t);
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
function Hd(e) {
	if (e.anchor.orbitAu !== void 0) return e.anchor.orbitAu;
	if (e.anchor.orbitNumber !== void 0) return we(e.anchor.orbitNumber);
	throw Error(`Secondary star ${e.anchor.id} has no stellar orbit.`);
}
function Ud(e, t, n) {
	return e <= 0 || t <= 0 || n <= 0 ? 0 : e * Math.cbrt(t / (3 * n));
}
function Wd(e, t) {
	let n = Hd(t), r = t.anchor.eccentricity ?? 0;
	return Math.max(0, n * (1 - r) - e.companionApoapsisAu - t.companionApoapsisAu);
}
function Gd(e, t) {
	let n = Hd(e), r = Hd(t), i = e.anchor.eccentricity ?? 0, a = t.anchor.eccentricity ?? 0;
	return Math.max(0, r * (1 - a) - n * (1 + i) - e.companionApoapsisAu - t.companionApoapsisAu);
}
function Kd(e, t, n, r) {
	return {
		otherStarId: t.anchor.id,
		separationAu: E(n, 6),
		hillSphereAu: E(Ud(n, e.massSolar, t.massSolar), 6),
		basis: r
	};
}
function qd(e) {
	let t = e.find((e) => e.orbitClass === "Primary");
	if (!t) throw Error("WBH Hill/stability calculation requires one primary star.");
	let n = Vd(t, e), r = e.filter((e) => e.orbitClass === "Close" || e.orbitClass === "Near" || e.orbitClass === "Far").map((t) => Vd(t, e)).sort((e, t) => Hd(e) - Hd(t)), i = [n, ...r], a = new Map(i.map((e) => [e.anchor.id, []])), o = r[0];
	if (o) {
		let e = Wd(n, o);
		a.get(n.anchor.id).push(Kd(n, o, e, "primary-secondary"));
	}
	for (let e of r) {
		let t = Wd(n, e);
		a.get(e.anchor.id).push(Kd(e, n, t, "secondary-primary"));
	}
	for (let e = 0; e < r.length; e += 1) for (let t = e + 1; t < r.length; t += 1) {
		let n = r[e], i = r[t], o = Gd(n, i);
		a.get(n.anchor.id).push(Kd(n, i, o, "secondary-secondary")), a.get(i.anchor.id).push(Kd(i, n, o, "secondary-secondary"));
	}
	return {
		method: "WBH alternate multi-star Hill/stability spheres",
		zones: i.map((e) => {
			let t = a.get(e.anchor.id) ?? [], n = t.length > 0 ? Math.min(...t.map((e) => e.hillSphereAu)) : null, r = n === null ? null : n / 3, i = n === null ? null : n / 2;
			return {
				starId: e.anchor.id,
				designation: e.anchor.designation,
				groupedStarIds: e.starIds,
				groupedMassSolar: E(e.massSolar, 6),
				hillSphereAu: n === null ? null : E(n, 6),
				stabilitySphereAu: r === null ? null : E(r, 6),
				stabilitySphereOrbitNumber: r === null ? null : E(Te(r), 6),
				absoluteMaximumAu: i === null ? null : E(i, 6),
				absoluteMaximumOrbitNumber: i === null ? null : E(Te(i), 6),
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
var Jd = 20;
function Yd(e, t) {
	return e.find((e) => e.orbitClass === "Companion" && e.parentId === t.id) ?? null;
}
function Xd(e) {
	if (e.orbitAu !== void 0) return e.orbitAu;
	if (e.orbitNumber !== void 0) return we(e.orbitNumber);
	throw Error(`Secondary star ${e.id} has no stellar orbit.`);
}
function Zd(e) {
	return E(e.reduce((e, t) => e + Math.max(0, t.outer - t.inner), 0), 2);
}
function Qd(e, t) {
	let n = E(Math.max(0, e), 2), r = E(Math.min(Jd, t), 2);
	return r - n >= .01 ? {
		inner: n,
		outer: r
	} : null;
}
function $d(e, t, n, r) {
	let i = [...r].sort((e, t) => e.inner - t.inner);
	return {
		starId: e.id,
		starDesignation: e.designation,
		parentStarIds: t ? [e.id, t.id] : [e.id],
		parentDesignations: t ? [e.designation, t.designation] : [e.designation],
		minimumAllowableOrbit: n,
		ranges: i,
		availableOrbitSpan: Zd(i),
		outerLimit: i.length ? i.at(-1).outer : null
	};
}
function ef(e) {
	let t = e.find((e) => e.orbitClass === "Primary") ?? e[0];
	if (!t) return {
		zones: [],
		primaryExclusions: [],
		method: "WBH alternate Hill/stability orbit zones",
		generationNotes: []
	};
	let n = e.filter((e) => e.orbitClass === "Close" || e.orbitClass === "Near" || e.orbitClass === "Far").sort((e, t) => Xd(e) - Xd(t)), r = qd(e), i = new Map(r.zones.map((e) => [e.starId, e])), a = Yd(e, t), o = Md(t, a), s = [], c = i.get(t.id);
	if (n.length === 0 || c?.stabilitySphereOrbitNumber === null) {
		let e = Qd(o, Jd);
		e && s.push(e);
	} else if (c?.stabilitySphereOrbitNumber !== void 0) {
		let e = Qd(o, c.stabilitySphereOrbitNumber);
		e && s.push(e);
	}
	for (let e = 0; e < n.length; e += 1) {
		let t = n[e], r = i.get(t.id);
		if (r?.hillSphereAu === null || r?.hillSphereAu === void 0) continue;
		let a = Xd(t) * (1 + Math.max(0, t.eccentricity ?? 0)), o = Te(a + 2 * r.hillSphereAu), c = n[e + 1], l = Jd;
		if (c) {
			let e = i.get(c.id);
			if (e?.hillSphereAu === null || e?.hillSphereAu === void 0) continue;
			let t = Xd(c) * (1 - Math.max(0, c.eccentricity ?? 0));
			l = Te(Math.max(0, t - a - e.hillSphereAu));
		}
		let u = Qd(o, l);
		u && s.push(u);
	}
	let l = [$d(t, a, o, s)];
	for (let t of n) {
		let n = Yd(e, t), r = Md(t, n), a = i.get(t.id)?.stabilitySphereOrbitNumber ?? null, o = a === null ? null : Qd(r, a);
		l.push($d(t, n, r, o ? [o] : []));
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
function tf(e) {
	return e.multiStarOrbitMethod === "hill-stability" ? "hill-stability" : "simplified";
}
//#endregion
//#region src/rules/system/wbhWorldPlacement.ts
var nf = .01, rf = 20, af = 13, of = /* @__PURE__ */ new Map([
	["Primary", 0],
	["Close", 1],
	["Near", 2],
	["Far", 3],
	["Companion", 4]
]);
function sf(e, t) {
	return t <= 1 ? 0 : e.die(t) - 1;
}
function cf(e) {
	return e.find((e) => e.orbitClass === "Primary") ?? e[0] ?? null;
}
function lf(e, t) {
	return e.find((e) => e.orbitClass === "Companion" && e.parentId === t.id) ?? null;
}
function uf(e) {
	return e.spectralType === "D" || e.luminosityClass === "D";
}
function df(e) {
	return [...e].sort((e, t) => {
		let n = (of.get(e.star.orbitClass) ?? 99) - (of.get(t.star.orbitClass) ?? 99);
		return n === 0 ? Number(e.star.orbitNumber ?? 0) - Number(t.star.orbitNumber ?? 0) : n;
	});
}
function ff(e, t) {
	return t >= e.inner && t <= e.outer;
}
function pf(e, t) {
	return e.ranges.some((e) => ff(e, t));
}
function mf(e, t, n) {
	return n <= t ? 0 : e.ranges.reduce((e, r) => {
		let i = Math.max(t, r.inner), a = Math.min(n, r.outer);
		return e + Math.max(0, a - i);
	}, 0);
}
function hf(e, t) {
	return !Number.isFinite(e) || e <= 0 ? 0 : Math.max(0, Math.floor(e + +!t));
}
function gf(e, t) {
	let n = (e.allowable.parentStarIds.length > 0 ? e.allowable.parentStarIds : [e.star.id]).reduce((e, n) => e + Math.max(0, t.find((e) => e.id === n)?.luminositySolar ?? 0), 0);
	return E(Te(Math.sqrt(Math.max(n, 1e-6))), 2);
}
function _f(e, t, n) {
	let r = df(e).map((e) => ({
		...e,
		hzco: gf(e, t),
		totalStarOrbits: hf(e.allowable.availableOrbitSpan, e.allowable.parentStarIds.length > 1),
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
function vf(e, t) {
	let n = cf(e);
	if (!n) return 0;
	let r = 0;
	return lf(e, n) && (r -= 2), [
		"Ia",
		"Ib",
		"II"
	].includes(n.luminosityClass) ? r += 3 : n.luminosityClass === "III" ? r += 2 : n.luminosityClass === "IV" ? r += 1 : n.luminosityClass === "VI" && --r, uf(n) && (r -= 2), t < 6 ? r -= 4 : t <= 9 ? r -= 3 : t <= 12 ? r -= 2 : t <= 15 ? --r : t <= 17 ? r += 0 : t <= 20 ? r += 1 : r += 2, r -= e.filter((e) => [
		"Close",
		"Near",
		"Far"
	].includes(e.orbitClass)).length, r;
}
function yf(e, t, n, r) {
	let i = t.find((e) => e.star.orbitClass === "Primary") ?? t[0];
	if (!i) return {
		number: 0,
		mode: "cold",
		innerSplitCount: 0
	};
	if (n.some((e) => e.orbitClass === "Close") && !pf(i.allowable, i.hzco)) {
		let t = mf(i.allowable, i.allowable.minimumAllowableOrbit, i.hzco), n = Math.floor(t / nf), r = Math.min(i.allocatedWorlds, n);
		if (r <= 0) return {
			number: 0,
			mode: "cold",
			innerSplitCount: 0
		};
		let a = sf(e, r + 1);
		return {
			number: a + 1,
			mode: "split",
			innerSplitCount: a
		};
	}
	let a = e.roll(2, 6, vf(n, r)).total;
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
function bf(e, t, n) {
	if (pf(e, t)) return E(t, 2);
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
	return r ? E(r.value, 2) : null;
}
function xf(e, t, n, r) {
	let i = t.hzco, a = t.allowable.minimumAllowableOrbit, o = i >= 1 ? 10 : 100, s = e.roll(2, 6, -7).total / o;
	if (r.mode === "split") {
		let e = t.allowable.ranges.find((e) => e.inner > i);
		return e ? E(Math.min(e.outer, e.inner + Math.abs(s)), 2) : bf(t.allowable, i, s) ?? a;
	}
	if (r.mode === "cold") {
		let e = i >= 1 ? Math.abs(r.number) : Math.abs(r.number) / 10, n = Math.max(i, a) + e + s, o = t.allowable.ranges.find((e) => e.outer >= Math.max(i, n));
		return o ? E(Math.max(o.inner, Math.min(o.outer, Math.max(i, n))), 2) : t.allowable.ranges.at(-1)?.outer ?? a;
	}
	if (r.mode === "hot") {
		let o = i - r.number + n, c = i >= 1 && o >= 1 ? o + s : i - r.number / 10 + n / 10 + e.roll(2, 6, -7).total / 100;
		return c < 0 && (c = Math.max(i - .1, a + t.allocatedWorlds * .01)), bf(t.allowable, Math.min(i, c), s) ?? a;
	}
	return bf(t.allowable, i + s, s) ?? a;
}
function Sf(e) {
	return e <= 9 ? 0 : e === 10 ? 1 : e === 11 ? 2 : 3;
}
function Cf(e, t) {
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
function wf(e, t, n) {
	return n < 0 || t <= e ? 0 : (t - e) / (n + 1);
}
function Tf(e, t, n, r) {
	let i = e.find((e) => e.star.orbitClass === "Primary") ?? e[0];
	if (!i) return nf;
	let a = Math.max(nf, (r - i.allowable.minimumAllowableOrbit) / Math.max(1, n)), o = i.allocatedWorlds + i.emptySlots, s = o > 0 ? i.allowable.availableOrbitSpan / Math.max(1, o + t.length) : a, c = E(Math.max(nf, Math.min(a, s > 0 ? s : a)), 2);
	for (let t of e) {
		if (t.star.orbitClass === "Primary") {
			t.spread = c;
			continue;
		}
		let e = t.allocatedWorlds + t.emptySlots, n = wf(t.allowable.minimumAllowableOrbit, t.allowable.outerLimit ?? t.allowable.minimumAllowableOrbit, e);
		t.spread = E(Math.max(nf, n > 0 ? Math.min(c, n) : c), 2);
	}
	return c;
}
function Ef(e, t, n) {
	if (n < 0 || e.ranges.length === 0) return null;
	let r = e.ranges.findIndex((e) => ff(e, t)), i = t;
	if (r < 0) {
		if (r = e.ranges.findIndex((e) => e.inner >= t), r < 0) return null;
		i = e.ranges[r].inner;
	}
	let a = n;
	for (; r < e.ranges.length;) {
		let t = e.ranges[r], n = Math.max(0, t.outer - i);
		if (a <= n) return E(i + a, 2);
		if (a -= n, r += 1, r >= e.ranges.length) return null;
		i = e.ranges[r].inner;
	}
	return null;
}
function Df(e, t, n, r, i) {
	let a = [], o = r;
	for (let r = 0; r < n; r += 1) {
		let n = e.roll(2, 6, -7).total * t.spread / 10, s = Math.max(nf, t.spread + n), c = Ef(t.allowable, o, s);
		if (c === null) break;
		a.push({
			key: `regular-${i + r}`,
			zone: t,
			orbitNumber: c,
			insertionOrder: i + r,
			orbitalDirection: "Prograde",
			eccentricity: 0,
			generationNotes: c - (o + s) >= nf ? ["WBH placement translated this slot across an unavailable stellar exclusion range."] : []
		}), o = c;
	}
	return a;
}
function Of(e, t, n, r, i) {
	let a = [], o = r;
	for (let r = 0; r < n; r += 1) {
		let n = e.roll(2, 6, -7).total * t.spread / 10, s = Math.max(nf, t.spread + n), c = null;
		for (let e of [...t.allowable.ranges].reverse()) {
			if (o < e.inner) continue;
			let n = Math.min(o, e.outer);
			if (n - s >= e.inner) {
				c = E(n - s, 2);
				break;
			}
			let r = s - Math.max(0, n - e.inner), i = t.allowable.ranges.indexOf(e) - 1;
			if (i >= 0) {
				let e = t.allowable.ranges[i];
				e.outer - r >= e.inner && (c = E(e.outer - r, 2));
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
function kf(e, t, n, r) {
	let i = [], a = 0, o = 0;
	for (let s of t) {
		let t = s.allocatedWorlds + s.emptySlots;
		if (t <= 0) continue;
		if (s.allowable.ranges.length === 0) {
			o += t;
			continue;
		}
		let c;
		if (s.star.orbitClass !== "Primary") c = Df(e, s, t, s.allowable.minimumAllowableOrbit, a);
		else if (n.mode === "cold") c = Df(e, s, t, Math.max(r - s.spread, s.allowable.minimumAllowableOrbit), a);
		else if (n.mode === "hot") c = Of(e, s, t, r + s.spread, a);
		else if (n.mode === "split") {
			let i = Df(e, s, Math.min(t, n.innerSplitCount), s.allowable.minimumAllowableOrbit, a), o = t - i.length, l = o > 0 ? Df(e, s, o, Math.max(r - s.spread, s.allowable.minimumAllowableOrbit), a + i.length) : [];
			c = [...i, ...l];
		} else c = Df(e, s, t, s.allowable.minimumAllowableOrbit, a);
		i.push(...c), a += c.length, o += t - c.length;
	}
	return {
		slots: i,
		unplaced: o
	};
}
function Af(e) {
	return e <= 9 ? 0 : e === 10 ? 1 : e === 11 ? 2 : 3;
}
function jf(e) {
	return e <= 7 ? "Random" : e === 8 ? "Eccentric" : e === 9 ? "Inclined" : e <= 11 ? "Retrograde" : "Trojan";
}
function Mf(e) {
	return {
		gasGiants: e.filter((e) => e.worldKind === "Gas Giant").length,
		planetoidBelts: e.filter((e) => e.worldKind === "Planetoid Belt").length,
		terrestrialPlanets: e.filter((e) => e.worldKind === "Terrestrial Planet").length,
		totalWorlds: e.filter((e) => e.worldKind !== "Empty Orbit").length
	};
}
function Nf(e, t, n) {
	let r = Math.max(e.allowable.minimumAllowableOrbit, Math.min(rf, t)), i = (t) => n.some((n) => n.zone.star.id === e.star.id && Math.abs(n.orbitNumber - t) < nf / 2), a = bf(e.allowable, r, nf);
	if (a !== null && !i(a)) return a;
	for (let t = 1; t <= 600; t += 1) for (let n of [E(r + t * nf, 2), E(r - t * nf, 2)]) if (n >= e.allowable.minimumAllowableOrbit && n <= rf && pf(e.allowable, n) && !i(n)) return n;
	return null;
}
function Pf(e, t, n, r, i) {
	let a = n.filter((e) => e.allowable.availableOrbitSpan > 0 && e.allowable.ranges.length > 0), o = 0, s = 0, c = t.reduce((e, t) => Math.max(e, t.insertionOrder + 1), 0);
	for (let n = 0; n < i; n += 1) {
		if (a.length === 0) return o + i - n;
		let l = jf(e.roll(2, 6).total), u = r.terrestrialPlanets + s < af ? "Terrestrial Planet" : "Planetoid Belt";
		if (u === "Terrestrial Planet" && (s += 1), l === "Trojan") {
			let n = t.filter((e) => !e.anomaly && e.worldKind === void 0);
			if (n.length > 0) {
				let r = n[sf(e, n.length)];
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
		let d = a[sf(e, a.length)], f = Nf(d, e.roll(2, 6, -2).total + e.d10ZeroToNine() / 10, t);
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
function Ff(e) {
	return [...e].sort((e, t) => {
		let n = (of.get(e.zone.star.orbitClass) ?? 99) - (of.get(t.zone.star.orbitClass) ?? 99);
		if (n !== 0) return n;
		let r = Number(e.zone.star.orbitNumber ?? 0) - Number(t.zone.star.orbitNumber ?? 0);
		return r === 0 ? e.orbitNumber - t.orbitNumber || e.insertionOrder - t.insertionOrder : r;
	});
}
function If(e, t, n, r, i = () => !0) {
	let a = 0;
	for (let o = 0; o < r && t.length !== 0; o += 1) {
		let r = sf(e, t.length), o;
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
function Lf(e, t, n, r) {
	let i = Ff(t), a = 0, o = If(e, i, "Empty Orbit", r, (e) => !e.anomaly && !e.protectedFromEmpty);
	a += r - o;
	let s = If(e, i, "Gas Giant", n.gasGiants);
	a += n.gasGiants - s;
	let c = If(e, i, "Planetoid Belt", n.planetoidBelts);
	a += n.planetoidBelts - c;
	for (let e of i) e.worldKind === void 0 && (e.worldKind = "Terrestrial Planet");
	return a;
}
function Rf(e) {
	return e === "Eccentric" ? 5 : e === "Random" || e === "Inclined" || e === "Retrograde" ? 2 : 0;
}
function zf(e, t, n) {
	for (let r of t) {
		if (r.worldKind === "Empty Orbit" || r.worldKind === void 0) continue;
		let t = Rf(r.anomaly);
		r.orbitNumber < 1 && n > 1 && --t, r.worldKind === "Planetoid Belt" && (t += 1);
		assign: r.eccentricity = mr(e, t);
	}
}
function Bf(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.filter((e) => e.worldKind !== void 0)) {
		let e = t.get(n.zone.star.id) ?? [];
		e.push(n), t.set(n.zone.star.id, e);
	}
	let n = /* @__PURE__ */ new Map();
	for (let e of t.values()) e.sort((e, t) => e.orbitNumber - t.orbitNumber || e.insertionOrder - t.insertionOrder), e.forEach((e, t) => n.set(e.key, `${e.zone.star.designation}-${t + 1}`));
	return [...t.values()].flatMap((e) => e.map((e, t) => {
		let r = E(e.orbitNumber - e.zone.hzco, 2), i = [...e.generationNotes];
		return e.inclinationDegrees !== void 0 && i.push(`Inclined ${e.inclinationDegrees} degrees.`), e.orbitalDirection === "Retrograde" && i.push("Retrograde orbital direction."), {
			id: n.get(e.key),
			aroundStarId: e.zone.star.id,
			aroundDesignation: e.zone.star.designation,
			sequence: t + 1,
			orbitNumber: e.orbitNumber,
			au: E(we(e.orbitNumber), 6),
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
function Vf(e, t, n, r, i) {
	let a = _f(t, n, r.totalWorlds), o = yf(e, a, n, r.totalWorlds), s = a.find((e) => e.star.orbitClass === "Primary") ?? a[0], c = s ? xf(e, s, r.totalWorlds, o) : 0, l = Sf(e.roll(2, 6).total), u = Cf(a, l), d = Tf(a, n, o.number, c), f = kf(e, a, o, c), p = Af(e.roll(2, 6).total), m = Pf(e, f.slots, a, r, p), h = Lf(e, f.slots, r, l - u);
	zf(e, f.slots, i);
	let g = Bf(f.slots);
	return {
		worlds: g,
		counts: Mf(g),
		emptyOrbits: l - u,
		anomalousOrbits: g.filter((e) => e.orbitAnomaly !== void 0).length,
		baselineNumber: o.number,
		baselineOrbitNumber: c,
		spread: d,
		unplacedSlots: f.unplaced + u + m + h
	};
}
//#endregion
//#region src/rules/system/generateExpandedSystem.ts
function Hf(e) {
	return {
		...xr,
		...e,
		populationMode: e?.populationMode ?? "established"
	};
}
function Uf(e, t, n, r) {
	let i = xd(n), a = [
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
	].filter((t) => t.orbitClass === "Close" && !Sd(n) ? !1 : e.roll(2, 6, i).total >= 10), o = /* @__PURE__ */ new Set(), s = [n.id, ...a.map((e) => e.designation)];
	for (let t of s) e.roll(2, 6, i).total >= 10 && o.add(t);
	let c = n.ageGyr, l = /* @__PURE__ */ new Map(), u = [n];
	for (let i of a) {
		let a = Xr(e, n, "secondary", `${t} ${i.designation}`, i.designation, r, c);
		c = Math.max(c, a.requiredSystemAgeGyr), a.postStellarFinalAgeGyr !== void 0 && l.set(i.designation, a.postStellarFinalAgeGyr);
		let o = a.star;
		o.orbitClass = i.orbitClass, o.orbitNumber = E(Ed(i.orbitClass, e.d6(), e.d6()), 2), o.orbitAu = E(we(o.orbitNumber), 3), o.eccentricity = mr(e, 2), u.push(o);
	}
	let d = [...u];
	for (let n of d) {
		if (!o.has(n.id)) continue;
		let i = `${n.designation}b`, a = Xr(e, n, "companion", `${t} ${i}`, i, r, c);
		c = Math.max(c, a.requiredSystemAgeGyr), a.postStellarFinalAgeGyr === void 0 ? a.star.spectralType === "D" && l.has(n.id) && l.set(i, l.get(n.id)) : l.set(i, a.postStellarFinalAgeGyr);
		let s = a.star;
		s.orbitClass = "Companion", s.parentId = n.id, s.orbitNumber = E(Cd(n) ? Od(e.d6(), jd(n)) : Dd(e.d6(), e.roll(2, 6).total), 2), s.orbitAu = E(we(s.orbitNumber), 3), s.eccentricity = mr(e, 2), u.push(s);
	}
	return c = Math.min(13.8, c), {
		stars: Zr(u, c, l),
		systemAgeGyr: Number(c.toFixed(3))
	};
}
function Wf(e, t, n) {
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
function Gf(e, t, n, r = {}) {
	return t.map((t) => {
		let i = Ju(e, t, r[t.id]), a = t.physical?.details?.satellites, o = a && {
			...a,
			moons: a.moons.map((e, i) => {
				if (!e.physical || e.physical.details?.gasGiant) return e;
				let a = e.sourceId ?? `${t.id}.moon-${i + 1}`, o = T("moonSocial", n, t.id, e.sourceId ?? i);
				return {
					...e,
					social: Ju(o, Wf(t, e, i), r[a])
				};
			})
		};
		return {
			...t,
			social: i,
			physical: t.physical?.details ? {
				...t.physical,
				details: {
					...t.physical.details,
					satellites: o
				}
			} : t.physical
		};
	});
}
function Kf(e, t, n, r) {
	let i = { ...r ?? {} };
	if (n.populationMode === "survey" || r !== void 0 || !t) return i;
	let a = _d(e, t);
	return (a?.moon?.physical ?? a?.world?.physical)?.details?.nativeLife?.currentNativeSophont === !0 || (i[t] = {
		origin: "transplanted",
		populationCode: null
	}), i;
}
function qf(e) {
	return `${e.sourceDesignation}: orbit ${e.inner}-${e.outer}`;
}
function Jf(e = {}) {
	let t = Hf(e.settings), n = e.seed ?? Date.now(), r = se(n, e.rerollIndex ?? 0), i = e.name ?? "Uncharted System", a = jr(r, `${i} A`, "A", !0, t), o = Uf(r, i, a, t), s = o.stars.sort((e, t) => (e.orbitAu ?? 0) - (t.orbitAu ?? 0)), c = s.find((e) => e.id === a.id) ?? a, l = si(r, s), u = tf(t) === "hill-stability" ? ef(s) : Rd(s), d = Vf(r, s.filter((e) => e.orbitClass !== "Companion").map((e) => ({
		star: e,
		allowable: u.zones.find((t) => t.starId === e.id) ?? {
			starId: e.id,
			starDesignation: e.designation,
			parentStarIds: [e.id],
			parentDesignations: [e.designation],
			minimumAllowableOrbit: jd(e),
			ranges: [],
			availableOrbitSpan: 0,
			outerLimit: null
		}
	})), s, l, o.systemAgeGyr), f = bs(d.worlds.map((e) => {
		let t = Ae(e, s) ?? s.find((t) => t.id === e.aroundStarId) ?? c;
		return {
			...e,
			physical: Pl(r, e, t)
		};
	}), s), p = hd(f), m = e.mainworldOverrideId, h = m && p.candidates.some((e) => e.id === m) ? {
		...p,
		selectedMainworldId: m,
		selectionSource: "referee-override",
		explanation: [...p.explanation, `Referee override selected ${m}.`]
	} : p, g = h.selectedMainworldId ?? void 0, _ = gd(f, h.selectedMainworldId), v = Kf(_, g, t, e.habitationOverrides), y = Gf(r, _, `${n}|${e.rerollIndex ?? 0}`, v), b = _d(y, h.selectedMainworldId), x = b?.moon ? Wf(b.world, b.moon, b.world.physical?.details?.satellites?.moons.indexOf(b.moon) ?? 0) : b?.world, S = x?.social?.uwp ?? (x?.physical?.uwpPhysical ? `X${x.physical.uwpPhysical}000-0` : void 0), ee = {
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
			preliminaryUwp: S,
			tradeCodes: x?.social?.tradeCodes,
			importance: x?.social?.importance,
			forbiddenZones: u.primaryExclusions.map(qf),
			generationNotes: d.unplacedSlots > 0 ? [`${d.unplacedSlots} generated orbital slot(s) could not be placed without violating WBH allowable-orbit constraints.`] : void 0
		},
		refereeNotes: "",
		imageUrl: "",
		mapUrl: ""
	};
	return {
		...ee,
		validation: cd(ee)
	};
}
//#endregion
//#region src/rules/system/continuationUwp.ts
var Yf = /^([ABCDEX])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])-([0-9A-HJ-NP-Z])$/i, Xf = 15, Zf = [
	{
		index: 0,
		name: "Starport"
	},
	{
		index: 1,
		name: "Size"
	},
	{
		index: 2,
		name: "Atmosphere"
	},
	{
		index: 3,
		name: "Hydrographics"
	},
	{
		index: 4,
		name: "Population"
	},
	{
		index: 5,
		name: "Government"
	},
	{
		index: 6,
		name: "Law Level"
	},
	{
		index: 8,
		name: "Tech Level"
	}
];
function Qf(e) {
	let t = e.trim().toUpperCase().replace(/\s+/g, ""), r = t.match(Yf);
	if (!r) throw Error("Enter a UWP like A867A74-C.");
	let [, i, a, o, s, c, l, u, d] = r, f = n(l);
	if (f > Xf) throw Error(`Government ${l} in ${t} is out of range: government codes run 0–F.`);
	return {
		normalized: `${i}${a}${o}${s}${c}${l}${u}-${d}`,
		starport: i,
		size: n(a),
		atmosphere: n(o),
		hydrographics: n(s),
		population: n(c),
		government: f,
		law: n(u),
		techLevel: n(d)
	};
}
function $f(e, t) {
	return e === t ? [] : Zf.filter(({ index: n }) => e[n] !== t[n]).map(({ index: n, name: r }) => {
		let i = r === "Government" && e[4] === "0" ? " (Population 0 forces Government 0)" : "";
		return `${r} ${e[n] ?? "?"} → ${t[n] ?? "?"}${i}`;
	});
}
//#endregion
//#region src/rules/worlds/wbhImportedPopulationExpansion.ts
function ep(e, t, n) {
	if (e <= 0 || t <= 0) return 0;
	let r = t + (n === null ? 0 : n / 10);
	return Math.round(r * 10 ** e);
}
function tp(e, t) {
	if (t <= 0) return 0;
	let n = e.die(3), r = e.die(3);
	return (n - 1) * 3 + r;
}
function np(e, t) {
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
	let n = tp(e, t), r = e.d10ZeroToNine();
	return {
		method: "WBH population phase 1",
		populationCode: t,
		pValue: n,
		additionalSignificantDigit: r,
		estimatedPopulation: ep(t, n, r),
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
var rp = .01, ip = 600;
function ap(e) {
	return (tf(e.generationSettings ?? xr) === "hill-stability" ? ef(e.stars) : Rd(e.stars)).zones.find((t) => t.starId === e.primary.id) ?? null;
}
function op(e, t, n) {
	let r = e.worlds.find((t) => t.aroundStarId === e.primary.id)?.hzco;
	if (typeof r == "number" && Number.isFinite(r)) return Math.round(r * 100) / 100;
	let i = t ?? {
		starId: e.primary.id,
		starDesignation: e.primary.designation,
		parentStarIds: [e.primary.id],
		parentDesignations: [e.primary.designation],
		minimumAllowableOrbit: jd(e.primary),
		ranges: [],
		availableOrbitSpan: 0,
		outerLimit: null
	};
	return gf({
		star: e.primary,
		allowable: i
	}, n);
}
function sp(e, t, n, r) {
	let i = (e) => e >= t && (!n || n.ranges.length === 0 || zd(n, e)) && r.every((t) => Math.abs(t - e) >= rp - 1e-9), a = E(Math.max(t, e), 2);
	if (i(a)) return a;
	for (let e = 1; e <= ip; e += 1) for (let t of [E(a + e * rp, 2), E(a - e * rp, 2)]) if (i(t)) return t;
	return a;
}
function cp(e, t, n) {
	let r = e.primary, i = ap(e), a = op(e, i, e.stars), o = sp(a + t.roll(2, 6, -7).total * .04, i?.minimumAllowableOrbit ?? jd(r), i, n), s = E(we(o), 3);
	return {
		id: "A-MW",
		aroundStarId: r.id,
		aroundDesignation: r.designation,
		sequence: 0,
		orbitNumber: o,
		au: s,
		eccentricity: mr(t, 0),
		hzco: a,
		hzDeviation: E(o - a, 2),
		worldKind: "Terrestrial Planet",
		isMainworld: !0
	};
}
function lp(e) {
	return e.physical?.details?.nativeLife?.currentNativeSophont === !0;
}
function up(e) {
	return e.map((e) => {
		let t = e.physical?.details?.satellites;
		return t?.moons.some((e) => e.isMainworld) ? {
			...e,
			isMainworld: !1,
			physical: {
				...e.physical,
				details: {
					...e.physical.details,
					satellites: {
						...t,
						moons: t.moons.map((e) => e.isMainworld ? {
							...e,
							isMainworld: !1,
							social: lp(e) ? e.social : void 0
						} : e)
					}
				}
			}
		} : {
			...e,
			isMainworld: !1
		};
	});
}
function dp(e) {
	return {
		gasGiants: e.filter((e) => e.worldKind === "Gas Giant").length,
		planetoidBelts: e.filter((e) => e.worldKind === "Planetoid Belt").length,
		terrestrialPlanets: e.filter((e) => e.worldKind === "Terrestrial Planet").length,
		totalWorlds: e.filter((e) => e.worldKind !== "Empty Orbit").length
	};
}
function fp(e, t) {
	return e.isMainworld ? e : {
		...e,
		id: `${e.aroundDesignation}-${t + 1}`,
		sequence: t + 1
	};
}
function pp(e) {
	let t = Qf(e.sourceUwp), n = Jf(e), r = e.seed ?? Date.now(), i = ce(r, e.rerollIndex ?? 0), a = up(n.worlds.filter((e) => !e.isMainworld)).sort((e, t) => e.au - t.au).map(fp), o = cp(n, i, a.filter((e) => e.aroundStarId === n.primary.id).map((e) => e.orbitNumber)), s = Fl(o, n.primary, t.size, t.atmosphere, t.hydrographics), c = np(T("continuationPopulation", r, e.rerollIndex ?? 0, t.normalized), t.population), l = {
		...Yu(t.starport, t.population, c.pValue, t.government, t.law, t.techLevel, t.size, t.atmosphere, t.hydrographics, `imported|${r}|${e.rerollIndex ?? 0}`),
		populationMultiplier: c.pValue,
		populationTotal: c.estimatedPopulation,
		populationDetails: c
	}, u = bs([{
		...o,
		physical: s,
		social: l
	}, ...a].sort((e, t) => e.au - t.au || (e.isMainworld ? -1 : 1)), n.stars).map((t) => {
		if (!t.isMainworld || !t.social) return t;
		let n = wu(T("populationConcentration", r, e.rerollIndex ?? 0, t.id, t.social.uwp), t, t.social), i = {
			...t.social,
			populationConcentration: n
		}, a = Au(T("urbanisation", r, e.rerollIndex ?? 0, t.id, t.social.uwp), t, i), o = {
			...i,
			urbanisation: a
		}, s = T("majorCities", r, e.rerollIndex ?? 0, t.id, t.social.uwp);
		return {
			...t,
			social: {
				...o,
				majorCities: vu(s, o)
			}
		};
	}), d = (u.find((e) => e.isMainworld) ?? u[0])?.social ?? l, f = hd(u), p = {
		...f,
		selectedMainworldId: o.id,
		selectionSource: "source-uwp",
		explanation: [...f.explanation, `Continuation generation preserves the imported source UWP as mainworld ${o.id}; the WBH recommendation remains visible for audit only.`]
	}, m = {
		...n,
		schemaVersion: "traveller-system-generator/v9",
		generationMethod: "continuation",
		sourceUwp: t.normalized,
		habitationOverrides: {},
		worlds: u,
		summary: {
			...n.summary,
			...dp(u),
			mainworldId: o.id,
			mainworldDetermination: p,
			preliminaryUwp: d.uwp,
			tradeCodes: d.tradeCodes,
			importance: d.importance
		}
	};
	return {
		...m,
		id: `system-${e.seed ?? "date"}-${e.rerollIndex ?? 0}-${t.normalized.toLowerCase()}`,
		validation: cd(m)
	};
}
//#endregion
//#region src/rules/system/generateContinuationSystemWithLawLevels.ts
function mp(e) {
	return Me(pr(pp(e)));
}
//#endregion
//#region src/rules/worlds/wbhSecondaryWorldPopulations.ts
function hp(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.min(33, Math.trunc(e)))] ?? String(e);
}
function gp(e) {
	let t = e.physical?.sizeCode ?? 0, n = e.physical?.atmosphereCode ?? 0, r = e.physical?.hydrographicsCode ?? 0, i = e.physical?.details?.habitabilityRating?.rating, a = 0, o = [], s = (e, t) => {
		e > a && (a = e), o.push(`${t}: TL${e}`);
	};
	return [
		0,
		1,
		10
	].includes(n) ? s(8, `WBH Atmosphere ${hp(n)}`) : [
		2,
		3,
		13,
		14
	].includes(n) ? s(5, `WBH Atmosphere ${hp(n)}`) : [
		4,
		7,
		9
	].includes(n) ? s(3, `WBH Atmosphere ${hp(n)}`) : n === 11 ? s(9, "WBH Atmosphere B") : n === 12 ? s(10, "WBH Atmosphere C") : n === 15 ? s(8, "WBH Atmosphere F conservative floor") : (n === 16 || n === 17) && s(14, `WBH Atmosphere ${hp(n)}`), typeof i == "number" && (i === 0 ? s(8, "WBH Habitability 0") : i <= 2 ? s(5, `WBH Habitability ${i}`) : i <= 7 && s(3, `WBH Habitability ${i}`)), r === 0 && n >= 4 && s(4, "Existing dry-world survival floor"), t === 0 && s(8, "Existing Size 0 survival floor"), {
		minimum: a,
		basis: o
	};
}
function _p(e, t, n) {
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
function vp(e, t, n) {
	return e !== null && e > 0 ? "existing-inhabited" : n <= 0 ? "population-ceiling-zero" : t ? "eligible" : "tech-infeasible";
}
function yp(e, t, n, r, i, a, o) {
	if (!e.physical || e.worldKind === "Empty Orbit" || e.worldKind === "Gas Giant" || e.isMainworld) return null;
	let s = gp(e), c = typeof e.social?.populationCode == "number" ? e.social.populationCode : null, l = e.physical.details?.nativeLife?.currentNativeSophont === !0, u = r >= s.minimum;
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
		status: vp(c, u, o)
	};
}
function bp(e, t, n) {
	let r = n?.social?.populationCode ?? 0;
	if (!n || r <= 0) return null;
	let i = n.social?.techLevel ?? 0, a = Math.max(0, r - 1), o = e.d6(), s = Math.max(0, r - o), c = Math.min(a, s), l = [];
	for (let e of t) {
		let t = yp(e, null, !1, i, a, s, c);
		t && l.push(t), (e.physical?.details?.satellites?.moons ?? []).forEach((t, n) => {
			if (!t.physical || t.physical.details?.gasGiant) return;
			let r = yp(_p(e, t, n), e.id, !0, i, a, s, c);
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
function xp(e, t, n) {
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
function Sp(e) {
	let t = e.summary.mainworldId;
	if (t) for (let n of e.worlds) {
		if (n.id === t) return n;
		let e = n.physical?.details?.satellites?.moons ?? [], r = e.findIndex((e, r) => (e.sourceId ?? `${n.id}.moon-${r + 1}`) === t);
		if (r >= 0) return xp(n, e[r], r);
	}
}
function Cp(e = {}) {
	let t = pr(Jf(e)), n = Sp(t), r = t.summary.mainworldId ?? "none", i = n?.social?.uwp ?? "none", a = bp(T("secondaryPopulations", t.id, r, i), t.worlds, n);
	return Me({
		...t,
		secondaryPopulationPlan: a
	});
}
//#endregion
//#region src/integrations/foundry/updateOperators.ts
var wp = "__$OPERATOR$__";
function Tp(e) {
	let t = globalThis.foundry?.data?.operators?.ForcedReplacement;
	return t ? new t(e) : {
		[wp]: "ForcedReplacement",
		value: e
	};
}
//#endregion
//#region src/integrations/foundry/overrideFlags.ts
var Ep = "traveller-system-generator";
function Dp(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Op(e) {
	return e.replace(/%/g, "%25").replace(/\./g, "%2E");
}
function kp(e) {
	return e.replace(/%2E/gi, ".").replace(/%25/g, "%");
}
function Ap(e) {
	let t = {};
	for (let [n, r] of Object.entries(e ?? {})) t[Op(n)] = r;
	return t;
}
function jp(e, t) {
	let n = {}, r = (e, i, a) => {
		let o = Dp(e);
		if (!(!o || a > 8)) {
			if (i.length > 0 && t(o)) {
				n[kp(i.join("."))] = o;
				return;
			}
			for (let [e, t] of Object.entries(o)) r(t, [...i, e], a + 1);
		}
	};
	return r(e, [], 0), n;
}
var Mp = (e) => e.origin === "transplanted", Np = (e) => typeof e.cityRank == "number" || typeof e.code == "string", Pp = (e) => e.affiliation === "dependent" || e.affiliation === "independent" || typeof e.bodyId == "string";
function Fp(e) {
	let t = Dp(e)?.habitationOverrides, n = jp(t, Mp), r = {};
	for (let [e, t] of Object.entries(n)) r[e] = {
		origin: "transplanted",
		populationCode: typeof t.populationCode == "number" && Number.isInteger(t.populationCode) ? t.populationCode : null
	};
	return r;
}
function Ip(e, t) {
	let n = Dp(e)?.[t];
	return jp(n, t === "habitationOverrides" ? Mp : t === "cityOverrides" ? Np : Pp);
}
function Lp(e, t) {
	return { [`flags.${Ep}.${e}`]: Tp(Ap(t)) };
}
//#endregion
//#region src/integrations/foundry/generationProvenance.ts
var Rp = "tsg-request-v1";
function zp(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Bp(e) {
	return zp(e.flags?.[Ep]);
}
function Vp(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function Hp(e) {
	let t = zp(e?.generationRequest);
	if (!t || t.schema !== "tsg-request-v1") return null;
	let n = t.method === "continuation" ? "continuation" : t.method === "expanded" ? "expanded" : null, r = Vp(t.seed);
	return !n || r === null || typeof t.name != "string" ? null : {
		schema: Rp,
		method: n,
		seed: r,
		rerollIndex: Vp(t.rerollIndex) ?? 0,
		name: t.name,
		sourceUwp: typeof t.sourceUwp == "string" && t.sourceUwp ? t.sourceUwp : null,
		settings: Jp(zp(t.settings)),
		mainworldOverrideId: typeof t.mainworldOverrideId == "string" && t.mainworldOverrideId ? t.mainworldOverrideId : null
	};
}
function Up(e) {
	let t = Hp(e);
	return t ? t.seed : Vp(e?.generationSeedProvenance?.inputSeed ?? e?.generationSeed);
}
function Wp(e) {
	let t = Hp(e)?.rerollIndex ?? 0;
	return t ? { rerollIndex: t } : {};
}
function Gp(e) {
	return (Hp(e)?.method ?? e?.generationMethod) === "continuation" ? "continuation" : "expanded";
}
function Kp(e) {
	let t = Hp(e);
	return t ? t.sourceUwp : typeof e?.sourceUwp == "string" && e.sourceUwp ? e.sourceUwp : null;
}
function qp(e) {
	return Hp(e)?.settings ?? Jp(e?.generationSettings);
}
function Jp(e) {
	return {
		starDistribution: e?.starDistribution === "realistic" ? "realistic" : "classic",
		detailLevel: e?.detailLevel === "basic" || e?.detailLevel === "deep" ? e.detailLevel : "standard",
		allowUnusualPrimaries: e?.allowUnusualPrimaries ?? !0,
		populationMode: e?.populationMode === "survey" ? "survey" : "established",
		multiStarOrbitMethod: e?.multiStarOrbitMethod === "hill-stability" ? "hill-stability" : "simplified",
		gasGiantAtmosphereModel: e?.gasGiantAtmosphereModel === "science-enhanced" ? "science-enhanced" : "wbh"
	};
}
function Yp(e) {
	let t = Hp(e);
	if (t) return t.mainworldOverrideId ?? void 0;
	let n = zp(zp(e?.sensorSystem)?.mainworldDetermination);
	if (n?.selectionSource !== "referee-override") return;
	let r = n.selectedMainworldId;
	return typeof r == "string" && r.length ? r : void 0;
}
function Xp(e) {
	let t = Hp(Bp(e));
	return t ? t.name : String(e.system.name ?? e.name.replace(/ System$/, ""));
}
function Zp(e, t, n) {
	let r = t.summary.mainworldDetermination;
	return {
		schema: Rp,
		method: t.generationMethod === "continuation" ? "continuation" : "expanded",
		seed: n,
		rerollIndex: e.rerollIndex ?? 0,
		name: t.name,
		sourceUwp: t.generationMethod === "continuation" ? t.sourceUwp ?? null : null,
		settings: Jp(t.generationSettings),
		mainworldOverrideId: r?.selectionSource === "referee-override" ? r.selectedMainworldId ?? null : null
	};
}
function Qp(e) {
	return {
		moduleVersion: e,
		rulesVersion: 1
	};
}
function $p(e, t, n) {
	let r = Bp(e), i = Up(r);
	return !r || Gp(r) === "continuation" || i === null ? null : {
		method: "expanded",
		name: Xp(e),
		seed: i,
		...Wp(r),
		settings: qp(r),
		habitationOverrides: t,
		...n ? { mainworldOverrideId: n } : {}
	};
}
function em(e) {
	let t = Bp(e);
	if (Gp(t) !== "continuation") return $p(e, Fp(t), Yp(t));
	let n = Up(t), r = Kp(t);
	return n === null || !r ? null : {
		method: "continuation",
		name: Xp(e),
		seed: n,
		...Wp(t),
		sourceUwp: r,
		settings: qp(t)
	};
}
function tm(e, t) {
	if (!t) return !1;
	let n = Gp(t);
	if ((e.method ?? "expanded") !== n || e.seed !== Up(t) || n === "continuation" && (("sourceUwp" in e ? e.sourceUwp : null) ?? "").toUpperCase() !== (Kp(t) ?? "").toUpperCase()) return !1;
	let r = qp(t), i = Jp(e.settings);
	return r.starDistribution === i.starDistribution && r.detailLevel === i.detailLevel && r.allowUnusualPrimaries === i.allowUnusualPrimaries && r.populationMode === i.populationMode && r.multiStarOrbitMethod === i.multiStarOrbitMethod;
}
function nm(e, t) {
	let n = (e) => (typeof e == "string" ? e.trim() : "") || "Uncharted System";
	return n(t) !== n(Xp(e));
}
function rm(e) {
	if (!e) return !1;
	let t = (e) => Object.keys(zp(e) ?? {}).length > 0, n = zp(zp(e.sensorSystem)?.mainworldDetermination)?.selectedMainworldId;
	return Object.entries(Fp(e)).filter(([e, t]) => !(e === n && t.populationCode === null)).length > 0 || t(e.cityOverrides) || t(e.secondaryGovernmentOverrides) || Yp(e) !== void 0;
}
//#endregion
//#region src/rules/orbits/orbitalState.ts
var im = "traveller-system-generator/orbital-state-v1", am = "tsg-system-epoch-v1", om = 149597870.7, sm = 365.25 * 86400;
function cm(e, t) {
	return ae("orbitalState", e, t) / 4294967296 * 360;
}
function lm(e) {
	return (e % 360 + 360) % 360;
}
function um(e) {
	let t = e.worlds.filter((e) => e.worldKind !== "Empty Orbit" && e.physical), n = new Map(t.map((e) => [e.id, e])), r = /* @__PURE__ */ new Map(), i = (t, a = /* @__PURE__ */ new Set()) => {
		let o = r.get(t);
		if (o !== void 0) return o;
		let s = n.get(t);
		if (!s || a.has(t)) return cm(e.id, t);
		a.add(t);
		let c = s.trojanReferenceId && n.has(s.trojanReferenceId) ? i(s.trojanReferenceId, a) + (s.trojanOffsetDegrees ?? 0) : cm(e.id, s.id);
		a.delete(t);
		let l = lm(c);
		return r.set(t, l), l;
	};
	return t.map((e) => ({
		sourceId: e.id,
		objectKind: "world",
		parentSourceId: e.aroundStarId,
		parentKind: "star",
		semiMajorAxisAu: e.au,
		semiMajorAxisKm: e.au * om,
		eccentricity: e.eccentricity,
		periodSeconds: e.physical.orbitalPeriodYears * sm,
		meanAnomalyAtEpochDegrees: i(e.id),
		direction: e.orbitalDirection ?? "Prograde"
	}));
}
function dm(e, t, n) {
	return t.sourceId ?? `${e}.moon-${n + 1}`;
}
function fm(e) {
	let t = [];
	for (let n of e.worlds) (n.physical?.details?.satellites?.moons ?? []).forEach((r, i) => {
		let a = dm(n.id, r, i);
		t.push({
			sourceId: a,
			objectKind: "significant-moon",
			parentSourceId: n.id,
			parentKind: "world",
			semiMajorAxisAu: null,
			semiMajorAxisKm: r.orbitKm,
			eccentricity: r.eccentricity,
			periodSeconds: r.periodHours * 3600,
			meanAnomalyAtEpochDegrees: cm(e.id, a),
			direction: r.direction
		});
	});
	return t;
}
function pm(e) {
	return {
		schemaVersion: im,
		sourceSystemId: e.id,
		epoch: {
			convention: am,
			epochSeconds: 0
		},
		objects: [...um(e), ...fm(e)]
	};
}
//#endregion
//#region src/integrations/foundry/sensorSystemPayload.ts
function mm(e) {
	let t = new Map(e.stars.map((e) => [e.id, e.designation]));
	return {
		schemaVersion: "traveller-system-generator/sensors-v2",
		sourceSystemId: e.id,
		mainworldDetermination: e.summary.mainworldDetermination,
		secondaryPopulationPlan: e.secondaryPopulationPlan ?? null,
		orbitalState: pm(e),
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
//#region src/integrations/foundry/sensorPayloadProse.ts
var hm = /* @__PURE__ */ new Set(["generationNotes", "generationPolicy"]);
function gm(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function _m(e) {
	if (Array.isArray(e)) return e.map(_m);
	let t = gm(e);
	if (!t) return e;
	let n = {};
	for (let [e, r] of Object.entries(t)) hm.has(e) || (n[e] = _m(r));
	return n;
}
function vm(e) {
	let t = _m(e);
	return {
		...t,
		proseOmitted: !0,
		bodies: t.bodies.map((e) => ({
			...e,
			generationNotes: []
		}))
	};
}
function ym(e) {
	return JSON.stringify(e, (e, t) => {
		let n = gm(t);
		return n ? Object.fromEntries(Object.keys(n).sort().map((e) => [e, n[e]])) : t;
	});
}
function bm(e, t) {
	let n = gm(gm(e.flags?.[Ep])?.sensorSystem);
	if (!n) return null;
	if (n.proseOmitted !== !0) return {
		payload: n,
		notes: "stored"
	};
	let r = t ? em(e) : null;
	if (!t || !r) return {
		payload: n,
		notes: "unavailable"
	};
	try {
		let e = mm(t.generateSystem(r));
		if (ym(vm(e)) === ym(n)) return {
			payload: {
				...e,
				proseOmitted: !0
			},
			notes: "rebuilt"
		};
	} catch {}
	return {
		payload: n,
		notes: "unavailable"
	};
}
function xm(e, t) {
	let n = gm(e.flags?.["traveller-system-generator"]) ?? {};
	return {
		id: e.id,
		name: e.name,
		type: e.type,
		system: e.system,
		flags: {
			...e.flags,
			[Ep]: {
				...n,
				sensorSystem: t
			}
		},
		update: () => Promise.reject(/* @__PURE__ */ Error("The WBH Inspector view of an Actor is read-only."))
	};
}
//#endregion
//#region src/integrations/foundry/api.ts
var Sm = "traveller-system-generator", Cm = /* @__PURE__ */ new WeakMap();
function wm(e = {}) {
	return {
		moduleId: Sm,
		generateSystem(e = {}) {
			let t = e.seed ?? Date.now(), n = {
				...e,
				seed: t
			}, r = n.method === "continuation" ? mp(n) : Cp(n);
			return Cm.set(r, Zp(n, r, t)), r;
		},
		createTwodsixWorldActor(t) {
			let n = x(t), r = n.flags[Sm], i = Cm.get(t);
			return n.flags[Sm] = {
				...r && typeof r == "object" ? r : {},
				...i ? {
					generationRequest: i,
					generatedBy: Qp(e.moduleVersion?.() ?? null)
				} : {},
				habitationOverrides: Ap(t.habitationOverrides),
				sensorSystem: vm(mm(t))
			}, n;
		}
	};
}
function Tm(e, t = wm()) {
	let n = e.get(Sm);
	if (!n) throw Error(`Foundry module ${Sm} is not registered.`);
	return n.api = t, t;
}
//#endregion
//#region src/integrations/foundry/formNodes.ts
var Em = (e) => ({
	hidden: e.hidden ?? !1,
	hint: e.hint ?? null
});
function I(e, t, n, r = !1) {
	return {
		value: e,
		label: t,
		selected: e === String(n ?? ""),
		disabled: r
	};
}
function Dm(e, t, n, r = {}) {
	return {
		kind: "text",
		name: e,
		label: t,
		value: String(n ?? ""),
		maxLength: r.maxLength ?? null,
		placeholder: r.placeholder ?? null,
		autofocus: r.autofocus ?? !1,
		...Em(r)
	};
}
function Om(e, t, n, r = {}) {
	return {
		kind: "number",
		name: e,
		label: t,
		value: String(n ?? ""),
		min: r.min === void 0 ? null : String(r.min),
		max: r.max === void 0 ? null : String(r.max),
		step: r.step ?? 1,
		...Em(r)
	};
}
function L(e, t, n, r = {}) {
	return {
		kind: "select",
		name: e,
		label: t,
		options: n,
		disabled: r.disabled ?? !1,
		...Em(r)
	};
}
function km(e, t, n, r = {}) {
	return {
		kind: "checkbox",
		name: e,
		label: t,
		checked: n,
		...Em(r)
	};
}
function Am(e, t) {
	return {
		kind: "hidden",
		name: e,
		value: String(t ?? "")
	};
}
function jm(e, t, n = {}) {
	return {
		kind: "static",
		label: e,
		value: t,
		...Em(n)
	};
}
function Mm(e, t, n, r, i, a = !1) {
	return {
		kind: "radio-card",
		name: e,
		value: t,
		label: n,
		description: r,
		checked: i,
		disabled: a
	};
}
function Nm(e, t) {
	return t ? {
		kind: "hint",
		text: e,
		tone: t
	} : {
		kind: "hint",
		text: e
	};
}
function Pm(e, t = null) {
	return {
		kind: "heading",
		text: e,
		hint: t
	};
}
function Fm() {
	return { kind: "divider" };
}
function Im(e, t = {}) {
	return {
		kind: "box",
		title: e,
		rows: t.rows ?? [],
		lines: t.lines ?? [],
		hints: t.hints ?? []
	};
}
function Lm(e, t) {
	return {
		kind: "fieldset",
		legend: e,
		children: t
	};
}
function R(e, t) {
	let n = e?.[t];
	if (n == null) return null;
	let r = String(n);
	return r.length ? r : null;
}
function Rm(e, t = !1) {
	return typeof e == "boolean" ? e : typeof e == "number" ? e === 1 : typeof e == "string" ? e === "true" || e === "on" : t;
}
//#endregion
//#region src/integrations/foundry/inspectorNodes.ts
function z(...e) {
	let t = [], n = (e) => {
		Array.isArray(e) ? e.forEach(n) : e && t.push(e);
	};
	return e.forEach(n), t;
}
function B(e, t) {
	return {
		kind: "row",
		label: e,
		value: t == null ? "—" : String(t)
	};
}
function V(e, t, n = !1) {
	return {
		kind: "section",
		variant: "panel",
		title: e,
		open: n,
		children: z(t)
	};
}
function H(e, t, n = !1) {
	return {
		kind: "section",
		variant: "calculation",
		title: e,
		open: n,
		children: z(t)
	};
}
function zm(e, t, n) {
	return {
		kind: "block",
		variant: e,
		title: t,
		children: z(n)
	};
}
function U(e, t, n = {}) {
	let r = Array.isArray(t) ? t : [];
	return r.length ? {
		kind: "list",
		label: e,
		items: r.map(n.format ?? ((e) => String(e))),
		muted: n.muted ?? !1
	} : null;
}
function Bm(e, t) {
	return {
		kind: "lines",
		label: e,
		lines: t
	};
}
function W(e) {
	return {
		kind: "hint",
		text: e
	};
}
function Vm(e, t) {
	return {
		kind: "banner",
		caption: e,
		value: t
	};
}
function Hm(e, t) {
	return {
		kind: "table",
		headers: e,
		rows: t.map((e) => e.map((e) => typeof e == "string" ? {
			text: e,
			title: null
		} : e))
	};
}
function Um(e) {
	return {
		kind: "pre",
		text: e
	};
}
//#endregion
//#region src/integrations/foundry/inspectorValues.ts
function G(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function K(e) {
	return Array.isArray(e) ? e : [];
}
function q(e) {
	return K(e).map(G).filter((e) => !!e);
}
function Wm(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function J(e) {
	return typeof e == "string" && e.length ? e : null;
}
function Y(e) {
	let n = Wm(e);
	if (n === null) return "—";
	try {
		return t(Math.trunc(n));
	} catch {
		return String(n);
	}
}
function X(e, t = 3, n = "") {
	let r = Wm(e);
	return r === null ? "—" : `${Number(r.toFixed(t))}${n}`;
}
function Z(e) {
	let t = Wm(e);
	return t === null ? "—" : `${t >= 0 ? "+" : ""}${t}`;
}
function Gm(e) {
	let t = Wm(e);
	return t === null ? "" : `${t >= 0 ? "+" : ""}${t}`;
}
function Km(e, t) {
	return e === !0 ? t.localize("TSG.Inspector.Value.Yes") : e === !1 ? t.localize("TSG.Inspector.Value.No") : "—";
}
function qm(e) {
	let t = G(e);
	return t ? `${String(t.source ?? "Unknown")}: DM${Z(Wm(t.dm) ?? 0)}` : String(e ?? "—");
}
//#endregion
//#region src/integrations/foundry/localization.ts
var Jm = {
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
	"TSG.Dialog.RenameRerollsHint": "The name is part of the generation inputs: a new name re-rolls law, technology, secondary populations and orbital positions, though stars, worlds and the mainworld UWP stay the same.",
	"TSG.Dialog.RenameWithOverridesWarning": "This system has Referee overrides. They are kept if you rename it, but the re-rolled law, technology and secondary populations may no longer fit them. Keep the name to keep every generated result.",
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
	"TSG.Notification.OverridesCleared": "The seed or generation settings changed, so the Referee overrides on {name} (habitation, mainworld, unusual cities, secondary governments) were cleared: they referred to bodies in the previous layout.",
	"TSG.Notification.RenamedWithOverrides": "{name} was renamed, so its law, technology, secondary populations and orbital positions were re-rolled. Its Referee overrides were kept; check that they still fit.",
	"TSG.Notification.UwpNormalized": "The source UWP {source} was imported as {imported}: {changes}.",
	"TSG.Notification.DefaultFolderMissing": "The configured default system Actor folder no longer exists. Traveller System Generator will use the Actors directory root until another default folder is selected.",
	"TSG.Notification.Failed": "Traveller system generation failed: {message}",
	"TSG.Inspector.Title": "WBH Detail Inspector — {name}",
	"TSG.Inspector.Close": "Close",
	"TSG.Inspector.NoData": "This World Actor does not contain Traveller System Generator detail data.",
	"TSG.Inspector.MainworldChanged": "Mainworld changed to {id}. The WBH generated recommendation remains recorded.",
	"TSG.Inspector.MainworldUnavailable": "Mainworld override is only available for generator-managed expanded systems.",
	"TSG.Inspector.MainworldFailed": "Unable to change mainworld: {message}",
	"TSG.Inspector.NotesUnavailable": "Generation notes are not stored on this Actor to save space, and they could not be rebuilt because its stored data no longer matches what the current module generates from its seed (it was probably generated by an earlier version). The data shown is complete; Update System with the same seed restores the notes, but also applies any rule changes since it was generated.",
	"TSG.Editor.Apply": "Apply",
	"TSG.Habitation.Title": "Edit Habitation — {name}",
	"TSG.Habitation.Unavailable": "Habitation editing is only available for generator-managed expanded systems.",
	"TSG.Habitation.BodyNotFound": "Unable to find body {id}.",
	"TSG.Habitation.NativeSophonts": "This body has current native Sophonts. Its native habitation cannot be changed with the transplanted-population editor.",
	"TSG.Habitation.PopulationRange": "Population code must be an integer from 1 through 10.",
	"TSG.Habitation.Cleared": "Cleared the Referee transplanted population from {id}.",
	"TSG.Habitation.Established": "Established a transplanted population on {id}.",
	"TSG.Habitation.Failed": "Unable to update habitation: {message}",
	"TSG.UnusualCity.Title": "Edit Unusual Cities — {name}",
	"TSG.UnusualCity.Unavailable": "Unusual-city editing requires an inhabited TSG world with generated major cities.",
	"TSG.UnusualCity.SelectCity": "Select a valid generated major city.",
	"TSG.UnusualCity.CustomInvalid": "Custom unusual-city types require a 1–4 character alphanumeric code and a description.",
	"TSG.UnusualCity.SelectType": "Select a WBH unusual-city type.",
	"TSG.UnusualCity.TechLevelTooLow": "{code} requires TL{required}; this world is TL{techLevel}.",
	"TSG.UnusualCity.Cleared": "Cleared the unusual-city designation from Major City {rank}.",
	"TSG.UnusualCity.Updated": "Updated the unusual-city designation for Major City {rank}.",
	"TSG.UnusualCity.Failed": "Unable to update unusual-city designation: {message}",
	"TSG.SecondaryGovernment.Title": "Edit Secondary Governments — {name}",
	"TSG.SecondaryGovernment.Unavailable": "Secondary-government editing requires at least one inhabited secondary world and an inhabited mainworld authority.",
	"TSG.SecondaryGovernment.SelectWorld": "Select an inhabited secondary world.",
	"TSG.SecondaryGovernment.SelectOwner": "Select a valid owning authority for this dependency.",
	"TSG.SecondaryGovernment.SelectStatus": "Select a valid secondary-world political status.",
	"TSG.SecondaryGovernment.Cleared": "Cleared the Referee secondary-government assignment for {id}.",
	"TSG.SecondaryGovernment.Updated": "Updated the secondary-government and Law assignment for {id}.",
	"TSG.SecondaryGovernment.Failed": "Unable to update secondary government: {message}",
	"TSG.Manager.SelectWorldActor": "Select a World Actor.",
	"TSG.Dialog.ExpandedSystemPopulation": "Expanded System Population",
	"TSG.Dialog.GasGiantAtmospheres": "Gas Giant Atmospheres",
	"TSG.Dialog.MultiStarOrbitMethod": "Multi-Star Orbit Method",
	"TSG.Dialog.SurveyUnexplored": "Survey / Unexplored",
	"TSG.Dialog.ScienceEnhanced": "Science Enhanced",
	"TSG.Dialog.WBHHillStabilitySpheres": "WBH Hill / Stability Spheres",
	"TSG.Dialog.PopulationModeHint": "Established generates an ordinary WBH population for the selected mainworld. Survey leaves worlds uninhabited unless native Sophonts or Referee habitation are present.",
	"TSG.Dialog.GasGiantAtmospheresHint": "WBH preserves the Handbook qualitative hydrogen/helium model. Science Enhanced adds a deterministic TSG estimate of 1-bar atmospheric composition without changing WBH system generation.",
	"TSG.Dialog.MultiStarOrbitMethodHint": "Simplified preserves the standard WBH generation path. Hill / Stability Spheres uses the optional physics-based alternate method for multi-star allowable orbits.",
	"TSG.Dialog.EstablishedSettled": "Established / Settled",
	"TSG.Dialog.WBHSimplified": "WBH Simplified",
	"TSG.Dialog.WBHQualitative": "WBH Qualitative",
	"TSG.Dialog.GasGiantAtmospheresUpdateHint": "WBH preserves the rules-faithful qualitative model. Science Enhanced adds deterministic estimated composition without changing the generated system architecture.",
	"TSG.Editor.Habitation.Body": "Body",
	"TSG.Editor.Habitation.Habitation": "Habitation",
	"TSG.Editor.Habitation.Population": "Population",
	"TSG.Editor.Habitation.PopulationCode": "Population code",
	"TSG.Editor.Habitation.InhabitedTransplantedColonialPopulation": "Inhabited — Transplanted / Colonial Population",
	"TSG.Editor.Habitation.UninhabitedClearRefereeTransplantedPopulation": "Uninhabited — Clear Referee Transplanted Population",
	"TSG.Editor.Habitation.GenerateFromWBH": "Generate from WBH",
	"TSG.Editor.Habitation.SetPopulationCodeManually": "Set Population code manually",
	"TSG.Editor.Habitation.Intro": "Establish or clear a Referee-defined transplanted population. Native Sophonts are authoritative physical-generation results and cannot be removed here.",
	"TSG.Editor.Habitation.PopulationCodeHint": "1–10 (A). P value and additional significant digit are still generated by WBH procedures.",
	"TSG.Editor.Habitation.GenerateHint": "Generate from WBH uses the ordinary 2D-2 Population procedure conditioned on a known inhabited result, so Population 0 is rerolled. Environmental minimum Tech Level rules remain enforced.",
	"TSG.Editor.Habitation.NoBodies": "No eligible physical bodies are available for habitation editing.",
	"TSG.Editor.SecondaryGovernment.SecondaryWorld": "Secondary world",
	"TSG.Editor.SecondaryGovernment.OwnerOption": "{owner} — Government {government}, Law {law}",
	"TSG.Editor.SecondaryGovernment.PoliticalStatus": "Political status",
	"TSG.Editor.SecondaryGovernment.OwningAuthority": "Owning authority",
	"TSG.Editor.SecondaryGovernment.SecondaryWorldLawModifiers": "Secondary-world Law modifiers",
	"TSG.Editor.SecondaryGovernment.DependentOnMainworldAuthority": "Dependent on mainworld authority",
	"TSG.Editor.SecondaryGovernment.Independent": "Independent",
	"TSG.Editor.SecondaryGovernment.ClearRefereeGovernmentAssignment": "Clear Referee government assignment",
	"TSG.Editor.SecondaryGovernment.Intro": "WBH requires the Referee to decide whether each inhabited secondary world is dependent on a mainworld authority or politically independent. TSG generates Government and overall Law Level after that choice.",
	"TSG.Editor.SecondaryGovernment.LawHint": "Government 6 dependencies use the WBH captive-world table; Penal Colony or Military Base applies DM+1. Government 1–3 dependencies use the owner-authority comparison. Other worlds roll Law normally; Freeport applies the optional Referee DM-1. These flags record the Referee decision until the full secondary-world classification workflow is implemented.",
	"TSG.Editor.SecondaryGovernment.PenalColony": "Penal colony",
	"TSG.Editor.SecondaryGovernment.MilitaryBase": "Military base",
	"TSG.Editor.SecondaryGovernment.Freeport": "Freeport",
	"TSG.Editor.SecondaryGovernment.WorldOption": "{body} — Population {population}",
	"TSG.Editor.SecondaryGovernment.WorldOptionAssigned": "{body} — Population {population} — {affiliation}, Government {government}",
	"TSG.Editor.SecondaryGovernment.WorldOptionAssignedLaw": "{body} — Population {population} — {affiliation}, Government {government}, Law {law}",
	"TSG.Editor.UnusualCity.WorldGuidance": "World guidance",
	"TSG.Editor.UnusualCity.MajorCity": "Major city",
	"TSG.Editor.UnusualCity.Action": "Action",
	"TSG.Editor.UnusualCity.UnusualCityType": "Unusual city type",
	"TSG.Editor.UnusualCity.CustomCode": "Custom code",
	"TSG.Editor.UnusualCity.Description": "Description",
	"TSG.Editor.UnusualCity.AssignWBHUnusualCityType": "Assign WBH unusual-city type",
	"TSG.Editor.UnusualCity.AssignCustomRefereeType": "Assign custom Referee type",
	"TSG.Editor.UnusualCity.ClearUnusualCityDesignation": "Clear unusual-city designation",
	"TSG.Editor.UnusualCity.Intro": "WBH unusual cities are optional Referee choices. This editor never assigns one automatically. The Handbook's optional random check is 2D 12+ with the displayed world DM; city type still remains a Referee choice.",
	"TSG.Editor.UnusualCity.HighportHint": "Highport DM is not applied because TSG has not yet established a highport for this world.",
	"TSG.Editor.UnusualCity.CustomTypeHint": "Custom types are deliberately not given automatic TL validation; the Referee is responsible for their technological plausibility.",
	"TSG.Editor.UnusualCity.Guidance": "TL {techLevel}; optional unusual-city occurrence DM {dm}; natural 2D roll required {roll}+.",
	"TSG.Editor.UnusualCity.CityOption": "Major City {rank} — {population}",
	"TSG.Editor.UnusualCity.CityOptionCurrent": "Major City {rank} — {population} — currently {code}",
	"TSG.Editor.UnusualCity.TypeOption": "{code} — {name} — minimum TL{minimumTechLevel}",
	"TSG.Editor.UnusualCity.TypeOptionUnavailable": "{code} — {name} — minimum TL{minimumTechLevel} — unavailable at current TL",
	"TSG.Editor.UnusualCity.DescriptionPlaceholder": "Referee-defined unusual city",
	"TSG.Habitation.ContextMenu": "Traveller System Generator: Edit Habitation",
	"TSG.Manager.AllFolders": "All Actor folders",
	"TSG.Manager.NoActorsInFolder": "No World Actors found in this folder",
	"TSG.Manager.NoActorsInSelectedFolder": "No World Actors found in the selected folder.",
	"TSG.Manager.Status": "Generator status",
	"TSG.Manager.StatusManaged": "Generator-managed",
	"TSG.Manager.StatusUnmanaged": "Not generator-managed",
	"TSG.Manager.ManageHint": "Choose an Actor folder, then select any World Actor. Generator-managed Actors can be updated; unmanaged World Actors can be explicitly adopted.",
	"TSG.Manager.ActorFolder": "Actor Folder",
	"TSG.Manager.LegacySeed": "Legacy default (1105)",
	"TSG.SecondaryGovernment.ContextMenu": "Traveller System Generator: Edit Secondary Governments",
	"TSG.UnusualCity.ContextMenu": "Traveller System Generator: Edit Unusual Cities",
	"TSG.Inspector.Section.Air": "Air",
	"TSG.Inspector.Section.Atmosphere": "Atmosphere",
	"TSG.Inspector.Section.Balkanisation": "Balkanisation",
	"TSG.Inspector.Section.CentralisationAuthorityStructureProfile": "Centralisation, Authority, Structure & Profile",
	"TSG.Inspector.Section.CommonTechnology": "Common Technology",
	"TSG.Inspector.Section.Criminal": "Criminal",
	"TSG.Inspector.Section.CurrentUWPSocialValues": "Current UWP Social Values",
	"TSG.Inspector.Section.DeathPenaltyCalculation": "Death Penalty Calculation",
	"TSG.Inspector.Section.Economic": "Economic",
	"TSG.Inspector.Section.Electronics": "Electronics",
	"TSG.Inspector.Section.Energy": "Energy",
	"TSG.Inspector.Section.Environmental": "Environmental",
	"TSG.Inspector.Section.FinalMainworldDetermination": "Final Mainworld Determination",
	"TSG.Inspector.Section.Government": "Government",
	"TSG.Inspector.Section.Government7CommonTLCandidates": "Government-7 Common TL candidates",
	"TSG.Inspector.Section.GovernmentFactions": "Government Factions",
	"TSG.Inspector.Section.HabitabilityRating": "Habitability Rating",
	"TSG.Inspector.Section.Habitation": "Habitation",
	"TSG.Inspector.Section.HeavyMilitary": "Heavy Military",
	"TSG.Inspector.Section.HydrographicsClimate": "Hydrographics / Climate",
	"TSG.Inspector.Section.JudicialSystemCalculation": "Judicial System Calculation",
	"TSG.Inspector.Section.Justice": "Justice",
	"TSG.Inspector.Section.JusticeProfileSystems": "Justice Profile & Systems",
	"TSG.Inspector.Section.Land": "Land",
	"TSG.Inspector.Section.LawLevelProfileSubclassifications": "Law Level Profile & Subclassifications",
	"TSG.Inspector.Section.LawUniformityCalculation": "Law Uniformity Calculation",
	"TSG.Inspector.Section.MajorCities": "Major Cities",
	"TSG.Inspector.Section.Manufacturing": "Manufacturing",
	"TSG.Inspector.Section.Medical": "Medical",
	"TSG.Inspector.Section.MilitaryTechnology": "Military Technology",
	"TSG.Inspector.Section.NativeLife": "Native Life",
	"TSG.Inspector.Section.NonHost": "Non-host",
	"TSG.Inspector.Section.NoveltyFactors": "Novelty factors",
	"TSG.Inspector.Section.NoveltyTechnology": "Novelty Technology",
	"TSG.Inspector.Section.PersonalMilitary": "Personal Military",
	"TSG.Inspector.Section.PersonalRights": "Personal Rights",
	"TSG.Inspector.Section.Physical": "Physical",
	"TSG.Inspector.Section.Population": "Population",
	"TSG.Inspector.Section.PopulationConcentration": "Population Concentration",
	"TSG.Inspector.Section.PopulationProfile": "Population Profile",
	"TSG.Inspector.Section.PresumptionCalculation": "Presumption Calculation",
	"TSG.Inspector.Section.Private": "Private",
	"TSG.Inspector.Section.QualityOfLifeTechnology": "Quality of Life Technology",
	"TSG.Inspector.Section.RawStoredBodyData": "Raw Stored Body Data",
	"TSG.Inspector.Section.ResourceRating": "Resource Rating",
	"TSG.Inspector.Section.RotationTides": "Rotation / Tides",
	"TSG.Inspector.Section.Satellites": "Satellites",
	"TSG.Inspector.Section.SecondarySystemCalculation": "Secondary System Calculation",
	"TSG.Inspector.Section.SecondaryWorldGovernments": "Secondary World Governments",
	"TSG.Inspector.Section.SecondaryWorldPopulations": "Secondary World Populations",
	"TSG.Inspector.Section.Seismology": "Seismology",
	"TSG.Inspector.Section.SocialCharacteristics": "Social Characteristics",
	"TSG.Inspector.Section.Space": "Space",
	"TSG.Inspector.Section.StarportHostAdjacent": "Starport host / adjacent",
	"TSG.Inspector.Section.Subclassifications": "Subclassifications",
	"TSG.Inspector.Section.SurfaceClimate": "Surface Climate",
	"TSG.Inspector.Section.SurfaceGeology": "Surface Geology",
	"TSG.Inspector.Section.Technology": "Technology",
	"TSG.Inspector.Section.TechnologyProfile": "Technology Profile",
	"TSG.Inspector.Section.TemperatureExtremes": "Temperature Extremes",
	"TSG.Inspector.Section.TransportationTechnology": "Transportation Technology",
	"TSG.Inspector.Section.UWPDetailedConsistency": "UWP / Detailed Consistency",
	"TSG.Inspector.Section.UnusualCities": "Unusual Cities",
	"TSG.Inspector.Section.Urbanisation": "Urbanisation",
	"TSG.Inspector.Section.Water": "Water",
	"TSG.Inspector.Section.WeaponsArmour": "Weapons & Armour",
	"TSG.Inspector.Label.AdditionalSignificantDigit": "Additional significant digit",
	"TSG.Inspector.Label.AdjustedEccentricity": "Adjusted eccentricity",
	"TSG.Inspector.Label.AdversarialDM": "Adversarial DM",
	"TSG.Inspector.Label.AgricultureThermallyEligible": "Agriculture thermally eligible",
	"TSG.Inspector.Label.Albedo": "Albedo",
	"TSG.Inspector.Label.AllocationChunkSize": "Allocation chunk size",
	"TSG.Inspector.Label.AllocationRemainder": "Allocation remainder",
	"TSG.Inspector.Label.AllowedRange": "Allowed range",
	"TSG.Inspector.Label.AppliedMaximum": "Applied maximum",
	"TSG.Inspector.Label.AppliedMinimum": "Applied minimum",
	"TSG.Inspector.Label.AtmosphereCode": "Atmosphere code",
	"TSG.Inspector.Label.AtmosphereDM": "Atmosphere DM",
	"TSG.Inspector.Label.AtmosphereMinimumTL": "Atmosphere minimum TL",
	"TSG.Inspector.Label.AtmosphereModel": "Atmosphere model",
	"TSG.Inspector.Label.AtmosphereProfile": "Atmosphere profile",
	"TSG.Inspector.Label.AtmosphericFactor": "Atmospheric factor",
	"TSG.Inspector.Label.Authority": "Authority",
	"TSG.Inspector.Label.Authority2DRoll": "Authority 2D roll",
	"TSG.Inspector.Label.AuthorityDMTotal": "Authority DM total",
	"TSG.Inspector.Label.AuthorityFinalTotal": "Authority final total",
	"TSG.Inspector.Label.AuthorityModifiers": "Authority modifiers",
	"TSG.Inspector.Label.AutomaticAssignment": "Automatic assignment",
	"TSG.Inspector.Label.AxialTilt": "Axial tilt",
	"TSG.Inspector.Label.AxialTiltFactor": "Axial tilt factor",
	"TSG.Inspector.Label.BalkanisationNotes": "Balkanisation notes",
	"TSG.Inspector.Label.BaseRating": "Base rating",
	"TSG.Inspector.Label.BaseTL": "Base TL",
	"TSG.Inspector.Label.Basis": "Basis",
	"TSG.Inspector.Label.Biocomplexity": "Biocomplexity",
	"TSG.Inspector.Label.BiocomplexityDM": "Biocomplexity DM",
	"TSG.Inspector.Label.BiocomplexityRoll": "Biocomplexity roll",
	"TSG.Inspector.Label.Biodiversity": "Biodiversity",
	"TSG.Inspector.Label.BiodiversityDM": "Biodiversity DM",
	"TSG.Inspector.Label.BiodiversityRoll": "Biodiversity roll",
	"TSG.Inspector.Label.Biomass": "Biomass",
	"TSG.Inspector.Label.BiomassAgeDM": "Biomass age DM",
	"TSG.Inspector.Label.BiomassAtmosphereDM": "Biomass atmosphere DM",
	"TSG.Inspector.Label.BiomassDM": "Biomass DM",
	"TSG.Inspector.Label.BiomassDMApplied": "Biomass DM applied",
	"TSG.Inspector.Label.BiomassDMBeforeClamp": "Biomass DM before clamp",
	"TSG.Inspector.Label.BiomassHydrographicsDM": "Biomass hydrographics DM",
	"TSG.Inspector.Label.BiomassRoll": "Biomass roll",
	"TSG.Inspector.Label.BiomassSpecialCase": "Biomass special case",
	"TSG.Inspector.Label.BiomassTemperatureDM": "Biomass temperature DM",
	"TSG.Inspector.Label.Body": "Body",
	"TSG.Inspector.Label.Bounds": "Bounds",
	"TSG.Inspector.Label.BroadRegionGuidance": "Broad region guidance",
	"TSG.Inspector.Label.CalculationDetails": "Calculation Details",
	"TSG.Inspector.Label.Centralisation": "Centralisation",
	"TSG.Inspector.Label.CentralisationModifiers": "Centralisation modifiers",
	"TSG.Inspector.Label.ChangedFromPrimary": "Changed from primary",
	"TSG.Inspector.Label.ChemistryRegime": "Chemistry regime",
	"TSG.Inspector.Label.Classification": "Classification",
	"TSG.Inspector.Label.CombinedMajorCityPopulation": "Combined major-city population",
	"TSG.Inspector.Label.Compatibility": "Compatibility",
	"TSG.Inspector.Label.CompatibilityDM": "Compatibility DM",
	"TSG.Inspector.Label.CompatibilityRoll": "Compatibility roll",
	"TSG.Inspector.Label.Composition": "Composition",
	"TSG.Inspector.Label.CompositionBasis": "Composition basis",
	"TSG.Inspector.Label.ComputedGravityUsed": "Computed gravity used",
	"TSG.Inspector.Label.Concentration": "Concentration",
	"TSG.Inspector.Label.ConvergentBoundaries": "Convergent boundaries",
	"TSG.Inspector.Label.Criminal": "Criminal",
	"TSG.Inspector.Label.CurrentNativeSophont": "Current native sophont",
	"TSG.Inspector.Label.CurrentSophontRoll": "Current sophont roll",
	"TSG.Inspector.Label.D3FactionCountRoll": "D3 faction-count roll",
	"TSG.Inspector.Label.DM": "DM",
	"TSG.Inspector.Label.DMTotal": "DM total",
	"TSG.Inspector.Label.DMs": "DMs",
	"TSG.Inspector.Label.DeathPenalty": "Death Penalty",
	"TSG.Inspector.Label.Density": "Density",
	"TSG.Inspector.Label.DensityDM": "Density DM",
	"TSG.Inspector.Label.DetailedTemperaturesUsed": "Detailed temperatures used",
	"TSG.Inspector.Label.Diameter": "Diameter",
	"TSG.Inspector.Label.Direction": "Direction",
	"TSG.Inspector.Label.DiscreteFeatureCoverage": "Discrete feature coverage",
	"TSG.Inspector.Label.Distribution": "Distribution",
	"TSG.Inspector.Label.DivergentBoundaries": "Divergent boundaries",
	"TSG.Inspector.Label.DominantConstituents": "Dominant constituents",
	"TSG.Inspector.Label.Economic": "Economic",
	"TSG.Inspector.Label.EffectiveMaximum": "Effective maximum",
	"TSG.Inspector.Label.ElectronicsTLInput": "Electronics TL input",
	"TSG.Inspector.Label.EnergyTLInput": "Energy TL input",
	"TSG.Inspector.Label.EnrichmentEstimate": "Enrichment estimate",
	"TSG.Inspector.Label.EnvironmentalMeetsSustainableMinimum": "Environmental meets sustainable minimum",
	"TSG.Inspector.Label.EscapeVelocity": "Escape velocity",
	"TSG.Inspector.Label.EstimatedPopulation": "Estimated population",
	"TSG.Inspector.Label.ExistingPop": "Existing Pop.",
	"TSG.Inspector.Label.ExpandedGovernmentProfile": "Expanded Government Profile",
	"TSG.Inspector.Label.ExtinctNativeSophontEvidence": "Extinct native sophont evidence",
	"TSG.Inspector.Label.ExtinctSophontRoll": "Extinct sophont roll",
	"TSG.Inspector.Label.FactionCountDM": "Faction-count DM",
	"TSG.Inspector.Label.FactionGovernments": "Faction governments",
	"TSG.Inspector.Label.FactionNotes": "Faction notes",
	"TSG.Inspector.Label.FactionProfiles": "Faction profiles",
	"TSG.Inspector.Label.FactionRelationships": "Faction relationships",
	"TSG.Inspector.Label.FarStellarDistance": "Far stellar distance",
	"TSG.Inspector.Label.FinalLawLevel": "Final Law Level",
	"TSG.Inspector.Label.FinalTotal": "Final total",
	"TSG.Inspector.Label.Format": "Format",
	"TSG.Inspector.Label.Foundation": "Foundation",
	"TSG.Inspector.Label.FunctionalStructure": "Functional Structure",
	"TSG.Inspector.Label.GMMainworldSelection": "GM Mainworld Selection",
	"TSG.Inspector.Label.GasMix": "Gas mix",
	"TSG.Inspector.Label.GeneratedMajorFeatures": "Generated major features",
	"TSG.Inspector.Label.GeneratedSurfaceBodies": "Generated surface bodies",
	"TSG.Inspector.Label.GenerationNotes": "Generation notes",
	"TSG.Inspector.Label.GenerationPolicy": "Generation policy",
	"TSG.Inspector.Label.GeographicFactor": "Geographic factor",
	"TSG.Inspector.Label.GeologicRegime": "Geologic regime",
	"TSG.Inspector.Label.Government": "Government",
	"TSG.Inspector.Label.Government7WorldRule": "Government-7 world rule",
	"TSG.Inspector.Label.GovernmentCode": "Government code",
	"TSG.Inspector.Label.GovernmentDM": "Government DM",
	"TSG.Inspector.Label.GovernmentNotes": "Government notes",
	"TSG.Inspector.Label.GovernmentProfile": "Government Profile",
	"TSG.Inspector.Label.GovernmentType": "Government type",
	"TSG.Inspector.Label.GravityDM": "Gravity DM",
	"TSG.Inspector.Label.GreenhouseFactor": "Greenhouse factor",
	"TSG.Inspector.Label.Hab": "Hab.",
	"TSG.Inspector.Label.HabitabilityMinimumTL": "Habitability minimum TL",
	"TSG.Inspector.Label.HabitabilityRating": "Habitability Rating",
	"TSG.Inspector.Label.Habitation": "Habitation",
	"TSG.Inspector.Label.Hazards": "Hazards",
	"TSG.Inspector.Label.HighCommonSustainable": "High Common sustainable",
	"TSG.Inspector.Label.HighCommonTLInput": "High Common TL input",
	"TSG.Inspector.Label.HighLowCommon": "High / Low Common",
	"TSG.Inspector.Label.HighLuminosity": "High luminosity",
	"TSG.Inspector.Label.HighTemperature": "High temperature",
	"TSG.Inspector.Label.HighTemperatureDM": "High-temperature DM",
	"TSG.Inspector.Label.HighTemperatureUsed": "High temperature used",
	"TSG.Inspector.Label.HighestSubcategoryTL": "Highest subcategory TL",
	"TSG.Inspector.Label.HighportModifier": "Highport modifier",
	"TSG.Inspector.Label.HillSphere": "Hill sphere",
	"TSG.Inspector.Label.HostAdjacentHighLow": "Host/adjacent High / Low",
	"TSG.Inspector.Label.HostFactionEstablished": "Host faction established",
	"TSG.Inspector.Label.HydrogenSkimmable": "Hydrogen skimmable",
	"TSG.Inspector.Label.HydrographicsCode": "Hydrographics code",
	"TSG.Inspector.Label.HydrographicsDM": "Hydrographics DM",
	"TSG.Inspector.Label.HydrographicsProfile": "Hydrographics profile",
	"TSG.Inspector.Label.Importance": "Importance",
	"TSG.Inspector.Label.IndividualCityAllocations": "Individual city allocations",
	"TSG.Inspector.Label.IndustrialStatus": "Industrial status",
	"TSG.Inspector.Label.IrradiationTemperature": "Irradiation temperature",
	"TSG.Inspector.Label.JudicialFunctionAuthoritative": "Judicial function authoritative",
	"TSG.Inspector.Label.JusticeProfilePSUID": "Justice Profile (PSU-I-D)",
	"TSG.Inspector.Label.Kind": "Kind",
	"TSG.Inspector.Label.LargestNonMajorCity": "Largest non-major city",
	"TSG.Inspector.Label.LargestNonMajorCity1DRoll": "Largest non-major city 1D roll",
	"TSG.Inspector.Label.LawLevel": "Law Level",
	"TSG.Inspector.Label.LawLevelDM": "Law Level DM",
	"TSG.Inspector.Label.LawLevelProfileOWECPR": "Law Level Profile (O-WECPR)",
	"TSG.Inspector.Label.LawUniformity": "Law Uniformity",
	"TSG.Inspector.Label.LiquidComposition": "Liquid composition",
	"TSG.Inspector.Label.LowCommonBounds": "Low Common bounds",
	"TSG.Inspector.Label.LowCommonDMs": "Low Common DMs",
	"TSG.Inspector.Label.LowCommonProsperous": "Low Common prosperous",
	"TSG.Inspector.Label.LowCommonTL": "Low Common TL",
	"TSG.Inspector.Label.LowCommonTLM": "Low Common TLM",
	"TSG.Inspector.Label.LowCommonUnboundedTL": "Low Common unbounded TL",
	"TSG.Inspector.Label.LowLuminosity": "Low luminosity",
	"TSG.Inspector.Label.LowOxygenTaintDM": "Low-oxygen taint DM",
	"TSG.Inspector.Label.LowPopulationSettlementRoll": "Low-population settlement roll",
	"TSG.Inspector.Label.LowTemperature": "Low temperature",
	"TSG.Inspector.Label.LowTemperatureDM": "Low-temperature DM",
	"TSG.Inspector.Label.LowTemperatureUsed": "Low temperature used",
	"TSG.Inspector.Label.LuminosityModifier": "Luminosity modifier",
	"TSG.Inspector.Label.MOR": "MOR",
	"TSG.Inspector.Label.Mainworld": "Mainworld",
	"TSG.Inspector.Label.MainworldPopulation": "Mainworld Population",
	"TSG.Inspector.Label.MainworldTLSupports": "Mainworld TL supports",
	"TSG.Inspector.Label.MainworldTechLevel": "Mainworld Tech Level",
	"TSG.Inspector.Label.MajorBodies": "Major bodies",
	"TSG.Inspector.Label.MajorCities": "Major cities",
	"TSG.Inspector.Label.MajorCityDesignations": "Major city designations",
	"TSG.Inspector.Label.MajorCityNotes": "Major-city notes",
	"TSG.Inspector.Label.MajorCityPopulation1DRoll": "Major-city population 1D roll",
	"TSG.Inspector.Label.MajorFeatureCoverage": "Major feature coverage",
	"TSG.Inspector.Label.MajorTectonicPlates": "Major tectonic plates",
	"TSG.Inspector.Label.ManufacturingTLInput": "Manufacturing TL input",
	"TSG.Inspector.Label.Mass": "Mass",
	"TSG.Inspector.Label.MaxPop": "Max Pop.",
	"TSG.Inspector.Label.MaximumRestrictions": "Maximum restrictions",
	"TSG.Inspector.Label.MeanPressure": "Mean pressure",
	"TSG.Inspector.Label.MeanTemperature": "Mean temperature",
	"TSG.Inspector.Label.MeanTemperatureDM": "Mean-temperature DM",
	"TSG.Inspector.Label.MeanTemperatureUsed": "Mean temperature used",
	"TSG.Inspector.Label.Method": "Method",
	"TSG.Inspector.Label.MethodNotes": "Method notes",
	"TSG.Inspector.Label.Military": "Military",
	"TSG.Inspector.Label.MinTL": "Min TL",
	"TSG.Inspector.Label.MinimumRestrictions": "Minimum restrictions",
	"TSG.Inspector.Label.MinimumSustainableTL": "Minimum sustainable TL",
	"TSG.Inspector.Label.MinimumTLBasis": "Minimum TL basis",
	"TSG.Inspector.Label.MinorBodies": "Minor bodies",
	"TSG.Inspector.Label.MinorFeatureCoverage": "Minor feature coverage",
	"TSG.Inspector.Label.MiscellaneousRefereeDM": "Miscellaneous Referee DM",
	"TSG.Inspector.Label.Modifiers": "Modifiers",
	"TSG.Inspector.Label.MoonLimit": "Moon limit",
	"TSG.Inspector.Label.Moons": "Moons",
	"TSG.Inspector.Label.NPartialPressure": "N₂ partial pressure",
	"TSG.Inspector.Label.NativeSophontPopulationProcedure": "Native Sophont population procedure",
	"TSG.Inspector.Label.NativeSophonts": "Native Sophonts",
	"TSG.Inspector.Label.NearStellarDistance": "Near stellar distance",
	"TSG.Inspector.Label.NearbyRichIndustrialClassATL": "Nearby rich/industrial Class A TL",
	"TSG.Inspector.Label.NonHostHighCommonTL": "Non-host High Common TL",
	"TSG.Inspector.Label.NonHostHighDMs": "Non-host High DMs",
	"TSG.Inspector.Label.NonHostHighTLM": "Non-host High TLM",
	"TSG.Inspector.Label.NonHostLowCommonTL": "Non-host Low Common TL",
	"TSG.Inspector.Label.NonHostLowDMs": "Non-host Low DMs",
	"TSG.Inspector.Label.NonHostStatus": "Non-host status",
	"TSG.Inspector.Label.NormalIndividualMaximum": "Normal individual maximum",
	"TSG.Inspector.Label.Notes": "Notes",
	"TSG.Inspector.Label.Novelty": "Novelty",
	"TSG.Inspector.Label.NoveltyTL": "Novelty TL",
	"TSG.Inspector.Label.OFraction": "O₂ fraction",
	"TSG.Inspector.Label.OPartialPressure": "O₂ partial pressure",
	"TSG.Inspector.Label.OptionalOccurrenceCheck": "Optional occurrence check",
	"TSG.Inspector.Label.OptionalOccurrenceModifiers": "Optional occurrence modifiers",
	"TSG.Inspector.Label.OptionalOffworld1DRoll": "Optional offworld 1D roll",
	"TSG.Inspector.Label.OptionalSystemMaximum": "Optional system maximum",
	"TSG.Inspector.Label.OrbitalPeriod": "Orbital period",
	"TSG.Inspector.Label.OutsideFactions": "Outside factions",
	"TSG.Inspector.Label.OverallLawLevel": "Overall Law Level",
	"TSG.Inspector.Label.OxygenSafety": "Oxygen safety",
	"TSG.Inspector.Label.PCR": "PCR",
	"TSG.Inspector.Label.PCRModifiers": "PCR modifiers",
	"TSG.Inspector.Label.PCRNotes": "PCR notes",
	"TSG.Inspector.Label.PCRRoll": "PCR roll",
	"TSG.Inspector.Label.PCRUsed": "PCR used",
	"TSG.Inspector.Label.PValue": "P value",
	"TSG.Inspector.Label.ParentBody": "Parent body",
	"TSG.Inspector.Label.ParentTide": "Parent tide",
	"TSG.Inspector.Label.PermanentIceExtent": "Permanent ice extent",
	"TSG.Inspector.Label.PersonalRights": "Personal Rights",
	"TSG.Inspector.Label.PhysicalProfile": "Physical profile",
	"TSG.Inspector.Label.Population": "Population",
	"TSG.Inspector.Label.PopulationAllocationCase": "Population allocation case",
	"TSG.Inspector.Label.PopulationCode": "Population code",
	"TSG.Inspector.Label.PopulationModifier": "Population modifier",
	"TSG.Inspector.Label.PopulationNotes": "Population notes",
	"TSG.Inspector.Label.PopulationPhase1Prefix": "Population phase-1 prefix",
	"TSG.Inspector.Label.PreciseCoverage": "Precise coverage",
	"TSG.Inspector.Label.PresumptionOfInnocence": "Presumption of Innocence",
	"TSG.Inspector.Label.PreviousCultureTL": "Previous culture TL",
	"TSG.Inspector.Label.PrimaryConstituent": "Primary constituent",
	"TSG.Inspector.Label.PrimaryJudicialSystem": "Primary Judicial System",
	"TSG.Inspector.Label.Private": "Private",
	"TSG.Inspector.Label.Profile": "Profile",
	"TSG.Inspector.Label.ProfileStatus": "Profile status",
	"TSG.Inspector.Label.ProsperousLowCommonMinimum": "Prosperous Low Common minimum",
	"TSG.Inspector.Label.ProvisionalReasons": "Provisional reasons",
	"TSG.Inspector.Label.QualityOfLife": "Quality of Life",
	"TSG.Inspector.Label.QuantitativeComposition": "Quantitative composition",
	"TSG.Inspector.Label.QuantitativeCompositionMole": "Quantitative composition (mole %)",
	"TSG.Inspector.Label.RawFactionCountResult": "Raw faction-count result",
	"TSG.Inspector.Label.RecommendedBody": "Recommended body",
	"TSG.Inspector.Label.RecursionSafetyCeiling": "Recursion safety ceiling",
	"TSG.Inspector.Label.ReferencePressure": "Reference pressure",
	"TSG.Inspector.Label.ReferenceRegion": "Reference region",
	"TSG.Inspector.Label.ReferenceTemperature": "Reference temperature",
	"TSG.Inspector.Label.Refuelling": "Refuelling",
	"TSG.Inspector.Label.Remarks": "Remarks",
	"TSG.Inspector.Label.Representation": "Representation",
	"TSG.Inspector.Label.Res": "Res.",
	"TSG.Inspector.Label.ResidualSeismicStress": "Residual seismic stress",
	"TSG.Inspector.Label.ResidualStressDM": "Residual stress DM",
	"TSG.Inspector.Label.ResourceRating": "Resource Rating",
	"TSG.Inspector.Label.Rings": "Rings",
	"TSG.Inspector.Label.RocheLimit": "Roche limit",
	"TSG.Inspector.Label.Roll": "Roll",
	"TSG.Inspector.Label.RolledPercentage": "Rolled percentage",
	"TSG.Inspector.Label.RotationFactor": "Rotation factor",
	"TSG.Inspector.Label.RunawayGreenhouseEligible": "Runaway greenhouse eligible",
	"TSG.Inspector.Label.SafeAltitude": "Safe altitude",
	"TSG.Inspector.Label.SafeDepthBelowMean": "Safe depth below mean",
	"TSG.Inspector.Label.SatelliteTideSubtotal": "Satellite tide subtotal",
	"TSG.Inspector.Label.ScaleHeight": "Scale height",
	"TSG.Inspector.Label.Scope": "Scope",
	"TSG.Inspector.Label.SecondaryJudicialSystem": "Secondary Judicial System",
	"TSG.Inspector.Label.SecondaryPopulationsPossible": "Secondary populations possible",
	"TSG.Inspector.Label.SeismicAdjustedMeanTemperature": "Seismic-adjusted mean temperature",
	"TSG.Inspector.Label.SelectedBody": "Selected body",
	"TSG.Inspector.Label.SelectionSource": "Selection source",
	"TSG.Inspector.Label.ShareOfUrbanPopulation": "Share of urban population",
	"TSG.Inspector.Label.SiderealDay": "Sidereal day",
	"TSG.Inspector.Label.SingleSettlementArea": "Single settlement area",
	"TSG.Inspector.Label.SizeCode": "Size code",
	"TSG.Inspector.Label.SizeDM": "Size DM",
	"TSG.Inspector.Label.SmallBodies": "Small bodies",
	"TSG.Inspector.Label.SmallFeatureCoverage": "Small feature coverage",
	"TSG.Inspector.Label.Solar11TidalLockDM": "Solar 1:1 tidal-lock DM",
	"TSG.Inspector.Label.SolarDay": "Solar day",
	"TSG.Inspector.Label.SolarDaysYear": "Solar days/year",
	"TSG.Inspector.Label.Sophonts": "Sophonts",
	"TSG.Inspector.Label.Source": "Source",
	"TSG.Inspector.Label.SovereignFactions": "Sovereign factions",
	"TSG.Inspector.Label.StableBoundaries": "Stable boundaries",
	"TSG.Inspector.Label.Starport": "Starport",
	"TSG.Inspector.Label.Status": "Status",
	"TSG.Inspector.Label.StellarTide": "Stellar tide",
	"TSG.Inspector.Label.StoredFactions": "Stored factions",
	"TSG.Inspector.Label.SurfaceGravity": "Surface gravity",
	"TSG.Inspector.Label.SurfaceTideTotal": "Surface tide total",
	"TSG.Inspector.Label.SurvivablePrototypeTL": "Survivable prototype TL",
	"TSG.Inspector.Label.TLM": "TLM",
	"TSG.Inspector.Label.TableRange": "Table range",
	"TSG.Inspector.Label.TableResult": "Table result",
	"TSG.Inspector.Label.Taints": "Taints",
	"TSG.Inspector.Label.TechLevel": "Tech Level",
	"TSG.Inspector.Label.TechnologyProfile": "Technology Profile",
	"TSG.Inspector.Label.TectonicPlateDM": "Tectonic plate DM",
	"TSG.Inspector.Label.TectonicPlateRoll": "Tectonic plate roll",
	"TSG.Inspector.Label.TectonicPlatesUsed": "Tectonic plates used",
	"TSG.Inspector.Label.TemperatureClass": "Temperature class",
	"TSG.Inspector.Label.TemperatureFallbackDM": "Temperature fallback DM",
	"TSG.Inspector.Label.ThermalRegime": "Thermal regime",
	"TSG.Inspector.Label.TidalHeatingFactor": "Tidal heating factor",
	"TSG.Inspector.Label.TidalLockCase": "Tidal-lock case",
	"TSG.Inspector.Label.TidalLockDM": "Tidal-lock DM",
	"TSG.Inspector.Label.TidalLockStatus": "Tidal-lock status",
	"TSG.Inspector.Label.TidalLockTarget": "Tidal-lock target",
	"TSG.Inspector.Label.TidalStressFactor": "Tidal stress factor",
	"TSG.Inspector.Label.TotalDM": "Total DM",
	"TSG.Inspector.Label.TotalSeismicStress": "Total seismic stress",
	"TSG.Inspector.Label.TotalSeismicStressUsed": "Total seismic stress used",
	"TSG.Inspector.Label.TotalUrbanPopulation": "Total urban population",
	"TSG.Inspector.Label.TradeCodes": "Trade codes",
	"TSG.Inspector.Label.TransformBoundaries": "Transform boundaries",
	"TSG.Inspector.Label.Transportation": "Transportation",
	"TSG.Inspector.Label.UWP": "UWP",
	"TSG.Inspector.Label.UWPHighCommonTL": "UWP / High Common TL",
	"TSG.Inspector.Label.UWPPhysicalProfile": "UWP / physical profile",
	"TSG.Inspector.Label.UnboundedTL": "Unbounded TL",
	"TSG.Inspector.Label.UnclampedResult": "Unclamped result",
	"TSG.Inspector.Label.UnclampedTotal": "Unclamped total",
	"TSG.Inspector.Label.UnprotectedSettlementThermallyEligible": "Unprotected settlement thermally eligible",
	"TSG.Inspector.Label.UnresolvedFactors": "Unresolved factors",
	"TSG.Inspector.Label.UnroundedCityCountResult": "Unrounded city-count result",
	"TSG.Inspector.Label.Urbanisation": "Urbanisation",
	"TSG.Inspector.Label.UrbanisationModifiers": "Urbanisation modifiers",
	"TSG.Inspector.Label.UrbanisationNotes": "Urbanisation notes",
	"TSG.Inspector.Label.VarianceFactor": "Variance factor",
	"TSG.Inspector.Label.WBHCase": "WBH case",
	"TSG.Inspector.Label.WBHMethod": "WBH method",
	"TSG.Inspector.Label.WBHMethodNotes": "WBH method notes",
	"TSG.Inspector.Label.WBHPolicy": "WBH policy",
	"TSG.Inspector.Label.WaterBasedTectonicsEligible": "Water-based tectonics eligible",
	"TSG.Inspector.Label.WeaponsArmour": "Weapons & Armour",
	"TSG.Inspector.Label.WeaponsArmourLawLevel": "Weapons/Armour Law Level",
	"TSG.Inspector.Label.WinningCriteria": "Winning criteria",
	"TSG.Inspector.Label.Wins": "Wins",
	"TSG.Inspector.Label.WorldHighCommonTL": "World High Common TL",
	"TSG.Inspector.Label.WorldLowCommonTL": "World Low Common TL",
	"TSG.Inspector.Label.WorldTechLevel": "World Tech Level",
	"TSG.Inspector.Label.Zone": "Zone",
	"TSG.Inspector.Value.GasGiantMoon": "Gas Giant Moon",
	"TSG.Inspector.Value.Incomplete": "Incomplete",
	"TSG.Inspector.Value.Moon": "Moon",
	"TSG.Inspector.Value.No": "No",
	"TSG.Inspector.Value.None": "None",
	"TSG.Inspector.Value.NotRequired": "Not required",
	"TSG.Inspector.Value.Recommended": "(recommended)",
	"TSG.Inspector.Value.Unavailable": "Unavailable",
	"TSG.Inspector.Value.Yes": "Yes",
	"TSG.Inspector.Hint.ACompleteWBHPopulationProfileRequiresPopulationPValuePCRUrba": "A complete WBH Population Profile requires Population/P value, PCR, Urbanisation and Major Cities detail.",
	"TSG.Inspector.Hint.Government7HasNoSingleWorldLevelJusticeProfileEachRepresente": "Government 7 has no single world-level Justice Profile. Each represented sovereign faction is shown separately.",
	"TSG.Inspector.Hint.Government7HasNoSingleWorldLevelLawLevelProfileEachRepresent": "Government 7 has no single world-level Law Level Profile. Each represented sovereign faction is shown separately. Weapons & Armour may remain incomplete until faction-specific PCR is available.",
	"TSG.Inspector.Hint.Government7UsesFactionSpecificJusticeResultsButNoRepresented": "Government 7 uses faction-specific Justice results, but no represented sovereign-faction results are stored.",
	"TSG.Inspector.Hint.Government7UsesFactionSpecificLawLevelSubclassificationsButN": "Government 7 uses faction-specific Law Level subclassifications, but no represented sovereign-faction results are stored.",
	"TSG.Inspector.Hint.Government7UsesTheSovereignBalkanisationLayerBelowInternalFa": "Government 7 uses the sovereign Balkanisation layer below; internal factions are shown inside each sovereign government.",
	"TSG.Inspector.Hint.MainworldDesignationAndHabitationAreIndependentUninhabitedMa": "Mainworld designation and habitation are independent. Uninhabited mainworlds retain a Population-0 UWP. Referee-established transplanted populations generate their own social values without changing the physical world.",
	"TSG.Inspector.Hint.MainworldOverride": "The generated recommendation remains recorded. Choosing another body applies a Referee override when this inspector is closed.",
	"TSG.Inspector.Hint.NoAdditionalBroadRegionGuidance": "No additional broad-region guidance.",
	"TSG.Inspector.Hint.NoBodies": "No stored TSG body data is available on this Actor.",
	"TSG.Inspector.Hint.NoEligiblePhysicalSecondaryWorldCandidatesWereFoundAfterExcl": "No eligible physical secondary-world candidates were found after excluding the mainworld, gas giants, and empty orbits.",
	"TSG.Inspector.Hint.NoFinalWBHTechnologyProfileIsStored": "No final WBH Technology Profile is stored.",
	"TSG.Inspector.Hint.NoGeneratedMajorCitiesAreAvailableForUnusualCityDesignation": "No generated major cities are available for unusual-city designation.",
	"TSG.Inspector.Hint.NoGeneratedSocialProfileIsAvailableForThisBody": "No generated social profile is available for this body.",
	"TSG.Inspector.Hint.NoInhabitedSecondaryWorldsAreCurrentlyPresent": "No inhabited secondary worlds are currently present.",
	"TSG.Inspector.Hint.NoInhabitedSocialProfileIsStoredForThisBody": "No inhabited social profile is stored for this body.",
	"TSG.Inspector.Hint.NoOptionalUnusualCityOccurrenceDMsApply": "No optional unusual-city occurrence DMs apply.",
	"TSG.Inspector.Hint.NoPairwiseFactionRelationshipsApplyBecauseThereIsOnlyOneStor": "No pairwise faction relationships apply because there is only one stored faction.",
	"TSG.Inspector.Hint.NoPrimaryJudicialSystemResultIsStored": "No primary judicial-system result is stored.",
	"TSG.Inspector.Hint.NoSAHConsistencyDataAvailableForThisBody": "No SAH consistency data available for this body.",
	"TSG.Inspector.Hint.NoWBHAuthorityDetailIsStored": "No WBH authority detail is stored.",
	"TSG.Inspector.Hint.NoWBHCommonTechnologyDetailsAreStoredForThisBody": "No WBH Common Technology details are stored for this body.",
	"TSG.Inspector.Hint.NoWBHDerivedSurfaceClimateGuidanceIsAvailableForThisBody": "No WBH-derived surface climate guidance is available for this body.",
	"TSG.Inspector.Hint.NoWBHDerivedSurfaceGeologyRecordIsAvailableForThisBody": "No WBH-derived surface geology record is available for this body.",
	"TSG.Inspector.Hint.NoWBHFinalMainworldDeterminationIsStoredForThisSystem": "No WBH Final Mainworld Determination is stored for this system.",
	"TSG.Inspector.Hint.NoWBHFunctionalStructureBranchRecordsAreStored": "No WBH functional-structure branch records are stored.",
	"TSG.Inspector.Hint.NoWBHFunctionalStructureDetailIsStored": "No WBH functional-structure detail is stored.",
	"TSG.Inspector.Hint.NoWBHGovernmentTypeDetailIsStoredForThisBody": "No WBH government-type detail is stored for this body.",
	"TSG.Inspector.Hint.NoWBHHighLowTemperatureRecordIsAvailableForThisBody": "No WBH high/low temperature record is available for this body.",
	"TSG.Inspector.Hint.NoWBHInternalFactionDetailIsStoredForThisEffectiveGovernment": "No WBH internal-faction detail is stored for this effective government.",
	"TSG.Inspector.Hint.NoWBHLawLevelSubclassificationDetailIsStoredForThisBody": "No WBH Law Level subclassification detail is stored for this body.",
	"TSG.Inspector.Hint.NoWBHLawLevelSubclassificationResultIsStored": "No WBH Law Level subclassification result is stored.",
	"TSG.Inspector.Hint.NoWBHLawOrJusticeDetailIsStoredForThisBody": "No WBH Law or Justice detail is stored for this body.",
	"TSG.Inspector.Hint.NoWBHMajorCitySummaryIsStoredForThisBody": "No WBH major-city summary is stored for this body.",
	"TSG.Inspector.Hint.NoWBHMilitaryTechnologyDetailsAreStored": "No WBH Military Technology details are stored.",
	"TSG.Inspector.Hint.NoWBHNoveltyTechnologyDetailsAreStored": "No WBH Novelty Technology details are stored.",
	"TSG.Inspector.Hint.NoWBHPopulationConcentrationRatingDetailIsStoredForThisBody": "No WBH Population Concentration Rating detail is stored for this body.",
	"TSG.Inspector.Hint.NoWBHPopulationPhase1DetailIsStoredForThisBody": "No WBH Population phase-1 detail is stored for this body.",
	"TSG.Inspector.Hint.NoWBHQualityOfLifeTechnologyDetailsAreStored": "No WBH Quality of Life Technology details are stored.",
	"TSG.Inspector.Hint.NoWBHSecondaryWorldPopulationPlanAppliesThisNormallyMeansThe": "No WBH Secondary World Population plan applies. This normally means the selected mainworld has Population 0 or the stored Actor predates this generation phase.",
	"TSG.Inspector.Hint.NoWBHTerragenHabitabilityRatingIsAvailableForThisBody": "No WBH Terragen Habitability Rating is available for this body.",
	"TSG.Inspector.Hint.NoWBHTerrestrialNativeLifeRecordIsAvailableForThisBody": "No WBH terrestrial native-life record is available for this body.",
	"TSG.Inspector.Hint.NoWBHTerrestrialResourceRatingIsAvailableForThisBody": "No WBH terrestrial Resource Rating is available for this body.",
	"TSG.Inspector.Hint.NoWBHTerrestrialSeismologyRecordIsAvailableForThisBody": "No WBH terrestrial seismology record is available for this body.",
	"TSG.Inspector.Hint.NoWBHTransportationTechnologyDetailsAreStored": "No WBH Transportation Technology details are stored.",
	"TSG.Inspector.Hint.NoWBHUrbanisationDetailIsStoredForThisBody": "No WBH urbanisation detail is stored for this body.",
	"TSG.Inspector.Hint.NoWorldLevelWBHCentralisationAppliesOrHasBeenGenerated": "No world-level WBH centralisation applies or has been generated.",
	"TSG.Inspector.Hint.None": "None",
	"TSG.Inspector.Hint.Population0NoInhabitedWorldTechnologyProfileIsGenerated": "Population 0: no inhabited-world Technology profile is generated.",
	"TSG.Inspector.Hint.Population0NoMajorCityProcedureApplies": "Population 0: no major-city procedure applies.",
	"TSG.Inspector.Hint.Population0NoPopulationConcentrationRatingApplies": "Population 0: no Population Concentration Rating applies.",
	"TSG.Inspector.Hint.Population0NoUrbanisationPercentageApplies": "Population 0: no urbanisation percentage applies.",
	"TSG.Inspector.Hint.Population0NoWBHPopulationProfileApplies": "Population 0: no WBH Population Profile applies.",
	"TSG.Inspector.Hint.ReadOnly": "Read-only view of authoritative generated data stored on this World Actor. The GM mainworld selection is the only editable value here. It does not represent what characters have discovered through Sensors.",
	"TSG.Inspector.Hint.SecondaryTechnology": "Secondary-world Technology remains follow-on work.",
	"TSG.Inspector.Hint.ThisWorldIsNotRepresentedAsAWBHBalkanisedGovernment7World": "This world is not represented as a WBH balkanised Government-7 world.",
	"TSG.Inspector.Consistency.Atmosphere": "Atmosphere {code} → {classification}",
	"TSG.Inspector.Consistency.Hydrographics": "Hydrographics {code} → {coverage} coverage",
	"TSG.Inspector.Consistency.HydrographicsMissing": "Hydrographics {code} → no precise coverage",
	"TSG.Inspector.Consistency.NoClassification": "no detailed classification",
	"TSG.Inspector.Consistency.Review": "review",
	"TSG.Inspector.Consistency.Size": "Size {code} → {diameter} precise diameter",
	"TSG.Inspector.Consistency.SizeMissing": "Size {code} → no precise diameter",
	"TSG.Inspector.Satellite.Moon": "{name}: Size {size}, {orbitPd}, {orbitKm}, e={eccentricity}, {direction}, period {period}",
	"TSG.Inspector.Satellite.MoonNumber": "Moon {number}",
	"TSG.Inspector.Satellite.Ring": "{name}: centre {centre}, span {span}",
	"TSG.Inspector.Satellite.RingNumber": "Ring {number}",
	"TSG.Inspector.Criterion.Habitability": "Habitability",
	"TSG.Inspector.Criterion.Refuelling": "Refuelling",
	"TSG.Inspector.Criterion.Resources": "Resources",
	"TSG.Inspector.Criterion.Sophonts": "Sophonts",
	"TSG.Inspector.Habitation.NativeSophont": "Inhabited — Native Sophonts",
	"TSG.Inspector.Habitation.Transplanted": "Inhabited — Transplanted / Colonial Population",
	"TSG.Inspector.Habitation.Uninhabited": "Uninhabited",
	"TSG.Inspector.Social.City": "City {rank}",
	"TSG.Inspector.Social.InternalFactions": "{faction} internal factions",
	"TSG.Inspector.Social.MajorCity": "Major City {rank}",
	"TSG.Inspector.Technology.FactionCandidates": "Faction {faction} candidates",
	"TSG.Inspector.SecondaryPopulation.CeilingZero": "Population ceiling is zero",
	"TSG.Inspector.SecondaryPopulation.Eligible": "Eligible for Referee-established secondary population",
	"TSG.Inspector.SecondaryPopulation.ExistingInhabited": "Already inhabited",
	"TSG.Inspector.SecondaryPopulation.TechInfeasible": "Current mainworld TL is insufficient",
	"TSG.Inspector.SecondaryGovernment.Independent": "Independent",
	"TSG.Inspector.SecondaryGovernment.LawMissing": "Law not yet generated for this legacy assignment",
	"TSG.Inspector.SecondaryGovernment.None": "No Referee secondary-government assignment",
	"TSG.Inspector.ContextMenu": "Traveller System Generator: Inspect WBH Details"
}, Q = {
	localize(e) {
		return Jm[e];
	},
	format(e, t) {
		return Object.entries(t).reduce((e, [t, n]) => e.replaceAll(`{${t}}`, String(n)), Jm[e]);
	}
};
//#endregion
//#region src/integrations/foundry/lawInspectorRows.ts
function Ym(e, t) {
	return U(t.localize("TSG.Inspector.Label.Notes"), e);
}
function Xm(e) {
	return q(e).map((e) => `${String(e.source ?? "Modifier")}: DM${Z(e.dm)}`).join("; ");
}
function Zm(e, t, n) {
	if (!t) return [B(e, n.localize("TSG.Inspector.Value.Unavailable"))];
	if (t.status !== "generated" || typeof t.lawLevel != "number") return [B(e, n.localize("TSG.Inspector.Value.Incomplete")), H(`${e} Calculation`, [
		B(n.localize("TSG.Inspector.Label.Status"), t.status ?? "incomplete"),
		B(n.localize("TSG.Inspector.Label.OverallLawLevel"), t.overallLawLevel ?? "—"),
		Ym(t.generationNotes, n)
	])];
	let r = Xm(t.dmBreakdown);
	return [B(e, t.lawLevel), H(`${e} Calculation`, [
		B(n.localize("TSG.Inspector.Label.OverallLawLevel"), t.overallLawLevel ?? "—"),
		B("2D3 roll", t.roll ?? "—"),
		B("2D3 - 4 variance", Z(t.variance)),
		B(n.localize("TSG.Inspector.Label.DMTotal"), Z(t.dmTotal)),
		r && B(n.localize("TSG.Inspector.Label.Modifiers"), r),
		B(n.localize("TSG.Inspector.Label.UnclampedTotal"), t.unclampedTotal ?? "—"),
		B(n.localize("TSG.Inspector.Label.FinalLawLevel"), t.lawLevel ?? "—"),
		Ym(t.generationNotes, n)
	])];
}
function Qm(e, t) {
	return e ? [
		B(t.localize("TSG.Inspector.Label.LawLevelProfileOWECPR"), e.profile ?? "Incomplete"),
		B(t.localize("TSG.Inspector.Label.ProfileStatus"), e.status ?? "—"),
		B(t.localize("TSG.Inspector.Label.OverallLawLevel"), e.overallLawLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.WeaponsArmour"), G(e.weaponsAndArmour)?.lawLevel ?? "Incomplete"),
		B(t.localize("TSG.Inspector.Label.Economic"), G(e.economic)?.lawLevel ?? "Incomplete"),
		B(t.localize("TSG.Inspector.Label.Criminal"), G(e.criminal)?.lawLevel ?? "Incomplete"),
		B(t.localize("TSG.Inspector.Label.Private"), G(e.privateLaw)?.lawLevel ?? "Incomplete"),
		B(t.localize("TSG.Inspector.Label.PersonalRights"), G(e.personalRights)?.lawLevel ?? "Incomplete"),
		H(t.localize("TSG.Inspector.Section.Subclassifications"), [
			Zm(t.localize("TSG.Inspector.Section.WeaponsArmour"), G(e.weaponsAndArmour), t),
			Zm(t.localize("TSG.Inspector.Section.Economic"), G(e.economic), t),
			Zm(t.localize("TSG.Inspector.Section.Criminal"), G(e.criminal), t),
			Zm(t.localize("TSG.Inspector.Section.Private"), G(e.privateLaw), t),
			Zm(t.localize("TSG.Inspector.Section.PersonalRights"), G(e.personalRights), t),
			Ym(e.generationNotes, t)
		])
	] : [W(t.localize("TSG.Inspector.Hint.NoWBHLawLevelSubclassificationResultIsStored"))];
}
function $m(e) {
	return G(G(e)?.world);
}
function eh(e, t) {
	for (let n of q(G(e)?.balkanisedFactions)) if (n.factionId === t) return G(n.details);
	return null;
}
function th(e, t = Q) {
	let n = G(e?.lawSubclassificationsDetails);
	if (!e || !n) return [W(t.localize("TSG.Inspector.Hint.NoWBHLawLevelSubclassificationDetailIsStoredForThisBody"))];
	if (e.governmentCode !== 7) return Qm($m(n), t);
	let r = K(n.balkanisedFactions).flatMap((e) => {
		let t = G(e);
		return typeof t?.factionId == "string" ? [t.factionId] : [];
	});
	return r.length ? z(W(t.localize("TSG.Inspector.Hint.Government7HasNoSingleWorldLevelLawLevelProfileEachRepresent")), r.map((e) => zm("boxed", e, Qm(eh(n, e), t)))) : [W(t.localize("TSG.Inspector.Hint.Government7UsesFactionSpecificLawLevelSubclassificationsButN"))];
}
//#endregion
//#region src/integrations/foundry/justiceInspectorRows.ts
function nh(e, t) {
	return U(t.localize("TSG.Inspector.Label.Notes"), e);
}
function rh(e) {
	return e ? `${String(e.code ?? "—")} — ${String(e.judicialSystem ?? "—")}` : "—";
}
function ih(e) {
	return e === "Y" ? "Y — Yes" : e === "N" ? "N — No" : "Unavailable";
}
function ah(e, t) {
	if (!e) return [W(t.localize("TSG.Inspector.Hint.NoPrimaryJudicialSystemResultIsStored"))];
	let n = G(e.secondarySystem), r = Xm(e.dmBreakdown);
	return z(B(t.localize("TSG.Inspector.Label.PrimaryJudicialSystem"), rh(e)), B(t.localize("TSG.Inspector.Label.SecondaryJudicialSystem"), n ? rh(n) : "—"), H(t.localize("TSG.Inspector.Section.JudicialSystemCalculation"), [
		B(t.localize("TSG.Inspector.Label.Status"), e.status ?? "—"),
		B("2D roll", e.roll ?? "—"),
		B(t.localize("TSG.Inspector.Label.DMTotal"), Z(e.dmTotal)),
		r && B(t.localize("TSG.Inspector.Label.Modifiers"), r),
		B(t.localize("TSG.Inspector.Label.FinalTotal"), e.total ?? "—"),
		B(t.localize("TSG.Inspector.Label.GovernmentCode"), e.governmentCode ?? "—"),
		B(t.localize("TSG.Inspector.Label.LawLevel"), e.lawLevelCode ?? "—"),
		B(t.localize("TSG.Inspector.Label.TechLevel"), e.techLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.JudicialFunctionAuthoritative"), e.judicialAuthoritative === !0 ? "Yes" : e.judicialAuthoritative === !1 ? "No" : "Unknown"),
		nh(e.generationNotes, t)
	]), n && H(t.localize("TSG.Inspector.Section.SecondarySystemCalculation"), [
		B(t.localize("TSG.Inspector.Label.Scope"), n.scope ?? "economic and regulatory"),
		B("2D roll", n.roll ?? t.localize("TSG.Inspector.Value.NotRequired")),
		B(t.localize("TSG.Inspector.Label.LawLevelDM"), Z(n.lawLevelDm)),
		B(t.localize("TSG.Inspector.Label.FinalTotal"), n.total ?? "—"),
		B(t.localize("TSG.Inspector.Label.ChangedFromPrimary"), n.changedFromPrimary === !0 ? "Yes" : "No"),
		nh(n.generationNotes, t)
	]));
}
function oh(e, t) {
	return e ? [B(t.localize("TSG.Inspector.Label.LawUniformity"), `${String(e.code ?? "—")} — ${String(e.uniformity ?? "—")}`), H(t.localize("TSG.Inspector.Section.LawUniformityCalculation"), [
		B(t.localize("TSG.Inspector.Label.Centralisation"), e.centralisationCode ?? "—"),
		B(t.localize("TSG.Inspector.Label.Roll"), e.roll ?? "Not required"),
		B(t.localize("TSG.Inspector.Label.DM"), Z(e.dm)),
		B(t.localize("TSG.Inspector.Label.FinalTotal"), e.total ?? "—"),
		nh(e.generationNotes, t)
	])] : [B(t.localize("TSG.Inspector.Label.LawUniformity"), "Unavailable")];
}
function sh(e, t) {
	return e ? [B(t.localize("TSG.Inspector.Label.PresumptionOfInnocence"), ih(e.code)), H(t.localize("TSG.Inspector.Section.PresumptionCalculation"), [
		B(t.localize("TSG.Inspector.Label.Status"), e.status ?? "—"),
		B("2D roll", e.roll ?? "—"),
		B(t.localize("TSG.Inspector.Label.LawLevelDM"), Z(e.lawLevelDm)),
		B(t.localize("TSG.Inspector.Label.AdversarialDM"), Z(e.adversarialDm)),
		B(t.localize("TSG.Inspector.Label.DMTotal"), Z(e.dmTotal)),
		B(t.localize("TSG.Inspector.Label.FinalTotal"), e.total ?? "—"),
		nh(e.generationNotes, t)
	])] : [B(t.localize("TSG.Inspector.Label.PresumptionOfInnocence"), "Unavailable")];
}
function ch(e, t) {
	return e ? [B(t.localize("TSG.Inspector.Label.DeathPenalty"), ih(e.code)), H(t.localize("TSG.Inspector.Section.DeathPenaltyCalculation"), [
		B("2D roll", e.roll ?? "—"),
		B(t.localize("TSG.Inspector.Label.GovernmentDM"), Z(e.governmentDm)),
		B(t.localize("TSG.Inspector.Label.LawLevelDM"), Z(e.lawLevelDm)),
		B(t.localize("TSG.Inspector.Label.DMTotal"), Z(e.dmTotal)),
		B(t.localize("TSG.Inspector.Label.FinalTotal"), e.total ?? "—"),
		nh(e.generationNotes, t)
	])] : [B(t.localize("TSG.Inspector.Label.DeathPenalty"), "Unavailable")];
}
function lh(e, t) {
	if (!e) return [B(t.localize("TSG.Inspector.Label.JusticeProfilePSUID"), "Unavailable")];
	let n = [
		`P=${String(e.primaryJudicialSystemCode ?? "—")}`,
		`S=${String(e.secondaryJudicialSystemCode ?? "—")}`,
		`U=${String(e.lawUniformityCode ?? "—")}`,
		`I=${String(e.presumptionOfInnocenceCode ?? "—")}`,
		`D=${String(e.deathPenaltyCode ?? "—")}`
	].join(", ");
	return z(B(t.localize("TSG.Inspector.Label.JusticeProfilePSUID"), e.profile ?? `Incomplete (${n})`), B(t.localize("TSG.Inspector.Label.ProfileStatus"), e.status ?? "—"), nh(e.generationNotes, t));
}
function uh(e, t) {
	return [
		...lh(e.profile, t),
		...ah(e.judicial, t),
		...oh(e.uniformity, t),
		...sh(e.innocence, t),
		...ch(e.deathPenalty, t)
	];
}
function dh(e, t = Q) {
	if (!e) return [W(t.localize("TSG.Inspector.Hint.NoWBHLawOrJusticeDetailIsStoredForThisBody"))];
	let n = H(t.localize("TSG.Inspector.Section.LawLevelProfileSubclassifications"), th(e, t)), r = {
		profile: G(e.justiceProfileDetails),
		judicial: G(e.judicialSystemDetails),
		uniformity: G(e.lawUniformityDetails),
		innocence: G(e.presumptionOfInnocenceDetails),
		deathPenalty: G(e.deathPenaltyDetails)
	}, i = Object.values(r);
	if (!i.some(Boolean)) return [n];
	let a = t.localize("TSG.Inspector.Section.JusticeProfileSystems");
	if (e.governmentCode !== 7) return [n, H(a, uh({
		profile: $m(r.profile),
		judicial: $m(r.judicial),
		uniformity: $m(r.uniformity),
		innocence: $m(r.innocence),
		deathPenalty: $m(r.deathPenalty)
	}, t))];
	let o = /* @__PURE__ */ new Set();
	for (let e of i) for (let t of q(K(e?.balkanisedFactions))) typeof t.factionId == "string" && o.add(t.factionId);
	return o.size ? [n, H(a, [W(t.localize("TSG.Inspector.Hint.Government7HasNoSingleWorldLevelJusticeProfileEachRepresente")), ...Array.from(o).map((e) => zm("boxed", e, uh({
		profile: eh(r.profile, e),
		judicial: eh(r.judicial, e),
		uniformity: eh(r.uniformity, e),
		innocence: eh(r.innocence, e),
		deathPenalty: eh(r.deathPenalty, e)
	}, t)))])] : [n, W(t.localize("TSG.Inspector.Hint.Government7UsesFactionSpecificJusticeResultsButNoRepresented"))];
}
//#endregion
//#region src/integrations/foundry/seedProvenance.ts
function fh(e, t = 0) {
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
function ph(e, t) {
	return e.name.localeCompare(t.name, void 0, { sensitivity: "base" }) || e.id.localeCompare(t.id);
}
function mh(e = Math.random) {
	return Math.floor(e() * 4294967296) >>> 0;
}
function hh(e) {
	let t = new Map(e.map((e) => [e.id, e])), n = /* @__PURE__ */ new Map();
	for (let r of e) {
		let e = r.parentId && r.parentId !== r.id && t.has(r.parentId) ? r.parentId : null, i = n.get(e) ?? [];
		i.push(r), n.set(e, i);
	}
	for (let e of n.values()) e.sort(ph);
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
	for (let t of [...e].sort(ph)) i.has(t.id) || a(t, 0, []);
	return r;
}
function gh(e, t, n = "") {
	return [I("", t.localize("TSG.Dialog.ActorFolderRoot"), n), ...hh(e).map((e) => {
		let t = e.depth > 0 ? `${"\xA0\xA0".repeat(e.depth)}└─ ` : "";
		return I(e.id, `${t}${e.path}`, n);
	})];
}
function _h(e, t, n = !0) {
	return L("populationMode", e.localize("TSG.Dialog.ExpandedSystemPopulation"), [I("established", e.localize("TSG.Dialog.EstablishedSettled"), t), I("survey", e.localize("TSG.Dialog.SurveyUnexplored"), t)], { hint: n ? e.localize("TSG.Dialog.PopulationModeHint") : null });
}
function vh(e, t) {
	return L("starDistribution", e.localize("TSG.Dialog.StarDistribution"), [I("classic", e.localize("TSG.Dialog.DistributionClassic"), t), I("realistic", e.localize("TSG.Dialog.DistributionRealistic"), t)]);
}
function yh(e, t) {
	return L("detailLevel", e.localize("TSG.Dialog.DetailLevel"), [
		I("basic", e.localize("TSG.Dialog.DetailBasic"), t),
		I("standard", e.localize("TSG.Dialog.DetailStandard"), t),
		I("deep", e.localize("TSG.Dialog.DetailDeep"), t)
	]);
}
function bh(e, t, n) {
	return L("gasGiantAtmosphereModel", e.localize("TSG.Dialog.GasGiantAtmospheres"), [I("wbh", e.localize("TSG.Dialog.WBHQualitative"), t), I("science-enhanced", e.localize("TSG.Dialog.ScienceEnhanced"), t)], { hint: e.localize(n) });
}
function xh(e, t) {
	return L("multiStarOrbitMethod", e.localize("TSG.Dialog.MultiStarOrbitMethod"), [I("simplified", e.localize("TSG.Dialog.WBHSimplified"), t), I("hill-stability", e.localize("TSG.Dialog.WBHHillStabilitySpheres"), t)], { hint: e.localize("TSG.Dialog.MultiStarOrbitMethodHint") });
}
function Sh(e, t) {
	return [I("expanded", e.localize("TSG.Dialog.MethodExpanded"), t), I("continuation", e.localize("TSG.Dialog.MethodContinuation"), t)];
}
function Ch(e = 1105, t = [], n = Q, r = "") {
	let i = n;
	return [
		Dm("name", i.localize("TSG.Dialog.SystemName"), i.localize("TSG.Dialog.DefaultSystemName"), { autofocus: !0 }),
		Om("seed", i.localize("TSG.Dialog.Seed"), e),
		L("method", i.localize("TSG.Dialog.Method"), Sh(i, "expanded")),
		_h(i, "established"),
		Dm("sourceUwp", i.localize("TSG.Dialog.SourceUwp"), "A867A74-C", {
			maxLength: 9,
			hint: i.localize("TSG.Dialog.SourceUwpHint")
		}),
		vh(i, "classic"),
		yh(i, "standard"),
		bh(i, "wbh", "TSG.Dialog.GasGiantAtmospheresHint"),
		xh(i, "simplified"),
		km("allowUnusualPrimaries", i.localize("TSG.Dialog.AllowUnusualPrimaries"), !0),
		L("folder", i.localize("TSG.Dialog.ActorFolder"), gh(t, n, r)),
		km("openSheet", i.localize("TSG.Dialog.OpenSheet"), !0)
	];
}
function wh(e, t = "") {
	return typeof e == "string" ? e : t;
}
function Th(e, t) {
	let n = typeof e == "number" ? e : Number(e);
	return Number.isFinite(n) ? Math.trunc(n) : t;
}
var Eh = Rm;
function Dh(e) {
	let t = wh(e.name, "Uncharted System").trim() || "Uncharted System", n = Th(e.seed, 1105), r = wh(e.method, "expanded"), i = {
		name: t,
		seed: n,
		settings: {
			starDistribution: wh(e.starDistribution, "classic") === "realistic" ? "realistic" : "classic",
			detailLevel: ["basic", "deep"].includes(wh(e.detailLevel)) ? wh(e.detailLevel) : "standard",
			allowUnusualPrimaries: Eh(e.allowUnusualPrimaries, !0),
			populationMode: wh(e.populationMode, "established") === "survey" ? "survey" : "established",
			gasGiantAtmosphereModel: wh(e.gasGiantAtmosphereModel, "wbh") === "science-enhanced" ? "science-enhanced" : "wbh",
			multiStarOrbitMethod: wh(e.multiStarOrbitMethod, "simplified") === "hill-stability" ? "hill-stability" : "simplified"
		}
	};
	return {
		request: r === "continuation" ? {
			...i,
			method: "continuation",
			sourceUwp: wh(e.sourceUwp, "A867A74-C").trim().toUpperCase()
		} : {
			...i,
			method: "expanded"
		},
		folder: wh(e.folder).trim() || null,
		openSheet: Eh(e.openSheet, !0)
	};
}
function Oh(e) {
	return Dh(e).request;
}
function kh(e, t) {
	if (e.generationMethod !== "continuation" || !e.sourceUwp || !e.summary.preliminaryUwp) return;
	let n = $f(e.sourceUwp, e.summary.preliminaryUwp);
	n.length && t.notifyWarning(t.localizer.format("TSG.Notification.UwpNormalized", {
		source: e.sourceUwp,
		imported: e.summary.preliminaryUwp,
		changes: n.join("; ")
	}));
}
async function Ah(e, t) {
	let { localizer: n } = e;
	if (!e.isGameMaster() || !e.canCreateActor()) {
		e.notifyWarning(n.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	let r = e.listActorFolders(), i = e.defaultSystemFolderId?.() ?? "", a = mh(), o = await e.showForm({
		title: n.localize("TSG.Dialog.Title"),
		submitLabel: n.localize("TSG.Dialog.Generate"),
		width: 720,
		refreshOn: [],
		fields: () => Ch(a, r, n, i)
	});
	if (o) try {
		let r = Dh(o), i = t.generateSystem(r.request);
		kh(i, e);
		let a = t.createTwodsixWorldActor(i), s = a.flags && typeof a.flags == "object" ? a.flags : {}, c = s["traveller-system-generator"] && typeof s["traveller-system-generator"] == "object" ? s["traveller-system-generator"] : {}, l = Number(r.request.seed ?? 1105);
		s["traveller-system-generator"] = {
			...c,
			generationSeed: l,
			generationSeedProvenance: fh(l, 0)
		}, a.flags = s, r.folder && (a.folder = r.folder);
		let u = await e.createActor(a);
		r.openSheet && u.sheet?.render(!0), e.notifyInfo(n.format("TSG.Notification.Created", { name: String(u.name ?? a.name ?? i.name) }));
	} catch (t) {
		let r = t instanceof Error ? t.message : String(t);
		e.notifyError(n.format("TSG.Notification.Failed", { message: r }));
	}
}
//#endregion
//#region src/integrations/foundry/regenerateControl.ts
var jh = [
	"notes",
	"adventureHooks",
	"relatedActors",
	"worldImage"
];
function Mh(e) {
	let t = e.flags?.[Ep];
	return t && typeof t == "object" ? t : null;
}
function Nh(e) {
	return !!(e && e.type === "world" && Mh(e));
}
function Ph(e) {
	return !!(e && e.type === "world" && !Mh(e));
}
function Fh(e, t, { adopting: n = !1, seed: r }) {
	let i = t, a = Mh(e), o = qp(a), s = Gp(a), c = Kp(a) ?? String(e.system.uwp ?? "A867A74-C"), l = o.populationMode, u = o.multiStarOrbitMethod;
	return [
		Nm(i.localize(n ? "TSG.Dialog.AdoptHint" : "TSG.Dialog.RegenerateHint")),
		Dm("name", i.localize("TSG.Dialog.SystemName"), Xp(e), {
			autofocus: !0,
			...n ? {} : { hint: i.localize("TSG.Dialog.RenameRerollsHint") }
		}),
		...!n && rm(a) ? [Nm(i.localize("TSG.Dialog.RenameWithOverridesWarning"), "warning")] : [],
		Om("seed", i.localize("TSG.Dialog.Seed"), r),
		...n ? [L("method", i.localize("TSG.Dialog.Method"), Sh(i, s))] : [Am("method", s), jm(i.localize("TSG.Dialog.Method"), i.localize(s === "expanded" ? "TSG.Dialog.MethodExpanded" : "TSG.Dialog.MethodContinuation"))],
		s === "expanded" ? _h(i, l, !1) : Am("populationMode", l),
		s === "continuation" || n ? Dm("sourceUwp", i.localize("TSG.Dialog.SourceUwp"), c, {
			maxLength: 9,
			hint: i.localize("TSG.Dialog.SourceUwpHint")
		}) : Am("sourceUwp", c),
		vh(i, o.starDistribution),
		yh(i, o.detailLevel),
		s === "expanded" || n ? xh(i, u) : Am("multiStarOrbitMethod", u),
		bh(i, o.gasGiantAtmosphereModel, "TSG.Dialog.GasGiantAtmospheresUpdateHint"),
		km("allowUnusualPrimaries", i.localize("TSG.Dialog.AllowUnusualPrimaries"), o.allowUnusualPrimaries),
		km("openSheet", i.localize("TSG.Dialog.OpenSheet"), !0)
	];
}
function Ih(e, t) {
	return Up(Mh(e)) ?? (t ? mh() : 1105);
}
function Lh(e, t) {
	return Fh(e, t, { seed: Ih(e, !1) });
}
function Rh(e, t, n = Ih(e, !0)) {
	return Fh(e, t, {
		adopting: !0,
		seed: n
	});
}
function zh(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Bh(e, t, n, r = { keepRefereeOverrides: !0 }) {
	let i = { ...t.system };
	for (let t of jh) e.system[t] !== void 0 && (i[t] = e.system[t]);
	let a = zh(zh(t.flags)?.["traveller-system-generator"]) ?? {}, o = Mh(e), s = {
		...a,
		habitationOverrides: Ap(Fp(a)),
		generationSeed: n,
		generationSeedProvenance: fh(n, 0)
	};
	if (r.keepRefereeOverrides) {
		let e = Ip(o, "cityOverrides"), t = Ip(o, "secondaryGovernmentOverrides");
		Object.keys(e).length && (s.cityOverrides = Ap(e)), Object.keys(t).length && (s.secondaryGovernmentOverrides = Ap(t));
	}
	return {
		name: e.name,
		img: e.img,
		folder: e.folder,
		ownership: e.ownership,
		prototypeToken: e.prototypeToken,
		system: i,
		flags: { [Ep]: Tp(s) }
	};
}
async function Vh(e, t, n, r) {
	let i = Mh(e), a = nm(e, t.name), o = Oh(i ? {
		...t,
		method: Gp(i),
		sourceUwp: Kp(i) ?? t.sourceUwp,
		populationMode: Hp(i)?.settings.populationMode ?? i.generationSettings?.populationMode ?? t.populationMode,
		multiStarOrbitMethod: Hp(i)?.settings.multiStarOrbitMethod ?? i.generationSettings?.multiStarOrbitMethod ?? t.multiStarOrbitMethod
	} : t), s = tm(o, i), c = s ? Yp(i) : void 0, l = s && o.method !== "continuation" ? {
		...o,
		habitationOverrides: Fp(i),
		...c ? { mainworldOverrideId: c } : {}
	} : o, u = r.generateSystem(l);
	kh(u, n);
	let d = r.createTwodsixWorldActor(u);
	await e.update(Bh(e, d, Number(l.seed ?? 1105), { keepRefereeOverrides: s })), t.openSheet !== !1 && e.sheet?.render(!0);
	let f = !!i && rm(i);
	return {
		clearedOverrides: f && !s,
		renamedWithOverrides: f && s && a
	};
}
async function Hh(e, t) {
	let n = e.getSelectedActor();
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	if (!Nh(n)) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.SelectGeneratedActor"));
		return;
	}
	let r = await e.showForm({
		title: e.localizer.localize("TSG.Dialog.RegenerateTitle"),
		submitLabel: e.localizer.localize("TSG.Dialog.Regenerate"),
		width: 720,
		refreshOn: [],
		fields: () => Lh(n, e.localizer)
	});
	if (r) try {
		let i = await Vh(n, r, e, t);
		e.notifyInfo(e.localizer.format("TSG.Notification.Regenerated", { name: n.name })), i.clearedOverrides && e.notifyWarning(e.localizer.format("TSG.Notification.OverridesCleared", { name: n.name })), i.renamedWithOverrides && e.notifyWarning(e.localizer.format("TSG.Notification.RenamedWithOverrides", { name: n.name }));
	} catch (t) {
		let n = t instanceof Error ? t.message : String(t);
		e.notifyError(e.localizer.format("TSG.Notification.Failed", { message: n }));
	}
}
async function Uh(e, t) {
	let n = e.getSelectedActor();
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	if (!Ph(n)) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.SelectUnmanagedActor"));
		return;
	}
	let r = Ih(n, !0), i = await e.showForm({
		title: e.localizer.localize("TSG.Dialog.AdoptTitle"),
		submitLabel: e.localizer.localize("TSG.Dialog.Adopt"),
		width: 720,
		refreshOn: [],
		fields: () => Rh(n, e.localizer, r)
	});
	if (i) try {
		await Vh(n, i, e, t), e.notifyInfo(e.localizer.format("TSG.Notification.Adopted", { name: n.name }));
	} catch (t) {
		let n = t instanceof Error ? t.message : String(t);
		e.notifyError(e.localizer.format("TSG.Notification.Failed", { message: n }));
	}
}
//#endregion
//#region src/integrations/foundry/mainworldOverride.ts
function Wh(e, t) {
	return $p(e, Fp(Bp(e)), t);
}
async function Gh(e, t, n) {
	let r = Wh(e, t);
	if (!r) return !1;
	let i = n.generateSystem(r), a = n.createTwodsixWorldActor(i);
	return await e.update(Bh(e, a, Number(r.seed))), e.sheet?.render(!0), !0;
}
//#endregion
//#region src/integrations/foundry/managerControl.ts
var Kh = "__all__", qh = "__root__", Jh = (e) => ({
	folderId: e.folderId ?? null,
	folderPath: e.folderPath ?? ""
});
function Yh(e) {
	return e.actorFolder ?? Jh;
}
function Xh(e) {
	return e.dataset.documentId ?? e.dataset.entryId ?? e.dataset.actorId ?? "";
}
function Zh(e, t) {
	return e.filter((e) => e.type === "world").sort((e, n) => t(e).folderPath.localeCompare(t(n).folderPath) || e.name.localeCompare(n.name));
}
function Qh(e, t, n) {
	let r = t(e).folderId;
	return n === Kh || (n === qh ? !r : r === n);
}
function $h(e, t) {
	return [
		I(Kh, e.localizer.localize("TSG.Manager.AllFolders"), t),
		I(qh, e.localizer.localize("TSG.Dialog.ActorFolderRoot"), t),
		...hh(e.listActorFolders()).map((e) => I(e.id, e.path, t))
	];
}
function eg(e, t, n) {
	if (!e) return null;
	let r = Bp(e), i = qp(r), a = Up(r), o = Nh(e);
	return {
		folderPath: t(e).folderPath || n.localize("TSG.Dialog.ActorFolderRoot"),
		managed: o,
		uwp: String(e.system.uwp ?? Kp(r) ?? "—"),
		method: o ? Gp(r) : "—",
		seed: o ? a === null ? n.localize("TSG.Manager.LegacySeed") : String(a) : "—",
		distribution: o ? i.starDistribution : "—",
		detailLevel: o ? i.detailLevel : "—"
	};
}
function tg(e, t) {
	let n = t.localizer, r = eg(e, Yh(t), n);
	return !e || !r ? Nm(n.localize("TSG.Manager.NoActorsInSelectedFolder")) : Im(e.name, {
		rows: [
			{
				label: n.localize("TSG.Manager.Status"),
				value: n.localize(r.managed ? "TSG.Manager.StatusManaged" : "TSG.Manager.StatusUnmanaged")
			},
			{
				label: n.localize("TSG.Manager.Folder"),
				value: r.folderPath
			},
			{
				label: n.localize("TSG.Manager.Uwp"),
				value: r.uwp
			},
			{
				label: n.localize("TSG.Manager.Method"),
				value: r.method
			},
			{
				label: n.localize("TSG.Manager.Seed"),
				value: r.seed
			},
			{
				label: n.localize("TSG.Manager.Distribution"),
				value: r.distribution
			},
			{
				label: n.localize("TSG.Manager.DetailLevel"),
				value: r.detailLevel
			}
		],
		hints: r.managed ? [] : [n.localize("TSG.Manager.AdoptHint")]
	});
}
function ng(e, t) {
	return e && t(e).folderId || (e ? qh : Kh);
}
function rg(e) {
	return typeof e == "string" ? e : "";
}
function ig(e, t, n = {}, r = null) {
	let i = t.localizer, a = Yh(t), o = Zh(e, a), s = o.find((e) => e.id === n.initialActorId) ?? o[0], c = R(r, "managerFolderId") ?? (n.initialActorId ? ng(s, a) : Kh), l = o.filter((e) => Qh(e, a, c)), u = R(r, "actorId") ?? s?.id, d = l.find((e) => e.id === u) ?? l[0], f = !!(d && Nh(d)), p = !!(d && Ph(d)), m = {
		generate: !0,
		open: l.length > 0,
		update: f,
		adopt: p
	}, h = R(r, "action") ?? n.initialAction ?? "generate", g = m[h] ? h : p ? "adopt" : f ? "update" : m.open ? "open" : "generate", _ = (e, t, n) => Mm("action", e, i.localize(t), i.localize(n), g === e && m[e], !m[e]);
	return [
		Pm(i.localize("TSG.Manager.GenerateHeading"), i.localize("TSG.Manager.GenerateHint")),
		_("generate", "TSG.Manager.Generate", "TSG.Manager.GenerateDescription"),
		Fm(),
		Pm(i.localize("TSG.Manager.ManageHeading"), i.localize("TSG.Manager.ManageHint")),
		L("managerFolderId", i.localize("TSG.Manager.ActorFolder"), $h(t, c)),
		L("actorId", i.localize("TSG.Manager.Actor"), l.length ? l.map((e) => I(e.id, `${e.name}${Nh(e) ? "" : " — not generator-managed"}`, d?.id)) : [I("", i.localize("TSG.Manager.NoActorsInFolder"), "")], { disabled: !l.length }),
		tg(d, t),
		_("open", "TSG.Manager.Open", "TSG.Manager.OpenDescription"),
		_("update", "TSG.Manager.Update", "TSG.Manager.UpdateDescription"),
		_("adopt", "TSG.Manager.Adopt", "TSG.Manager.AdoptDescription")
	];
}
function ag(e, t) {
	return {
		isGameMaster: t.isGameMaster,
		getSelectedActor: () => e,
		localizer: t.localizer,
		showForm: t.showForm,
		notifyInfo: t.notifyInfo,
		notifyWarning: t.notifyWarning,
		notifyError: t.notifyError
	};
}
async function og(e, t, n = {}) {
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	let r = e.listGeneratedActors(), i = await e.showForm({
		title: e.localizer.localize("TSG.Manager.Title"),
		submitLabel: e.localizer.localize("TSG.Manager.Continue"),
		width: 720,
		refreshOn: ["managerFolderId", "actorId"],
		fields: (t) => ig(r, e, n, t)
	});
	if (!i) return;
	let a = rg(i.action) || n.initialAction || "generate";
	if (a === "generate") {
		await Ah(e, t);
		return;
	}
	let o = Zh(r, Yh(e)).find((e) => e.id === rg(i.actorId));
	if (!o) {
		e.notifyWarning(e.localizer.localize("TSG.Manager.SelectWorldActor"));
		return;
	}
	if (a === "open") {
		o.sheet?.render(!0);
		return;
	}
	if (a === "adopt") {
		await Uh(ag(o, e), t);
		return;
	}
	await Hh(ag(o, e), t);
}
function sg(e, t, n) {
	let r = e.tokens;
	r && (r.tools ??= {}, r.tools.travellerSystemGenerator = {
		name: "travellerSystemGenerator",
		title: t.localizer.localize("TSG.Control.Manager"),
		icon: "fa-solid fa-solar-system",
		order: Object.keys(r.tools).length,
		button: !0,
		visible: t.isGameMaster(),
		onChange: () => {
			og(t, n);
		}
	});
}
//#endregion
//#region src/integrations/foundry/physicalInspectorRows.ts
function $(e) {
	return G(e?.details);
}
function cg(e, t) {
	return H(t.localize("TSG.Inspector.Label.CalculationDetails"), e);
}
function lg(e, t) {
	return U(t.localize("TSG.Inspector.Label.GenerationNotes"), e);
}
function ug(e, t) {
	let n = Wm(e?.sizeCode), r = Wm(e?.atmosphereCode), i = Wm(e?.hydrographicsCode), a = G($(e)?.size), o = G($(e)?.atmosphere), s = G($(e)?.hydrographics), c = [];
	if (n !== null) {
		let e = Wm(a?.diameterKm);
		c.push(`${e === null ? t.format("TSG.Inspector.Consistency.SizeMissing", { code: Y(n) }) : t.format("TSG.Inspector.Consistency.Size", {
			code: Y(n),
			diameter: X(e, 0, " km")
		})} ${e === null ? "⚠" : "✓"}`);
	}
	if (r !== null) {
		let e = J(o?.classification), n = Wm(o?.meanBaselinePressureBar);
		c.push(`${t.format("TSG.Inspector.Consistency.Atmosphere", {
			code: Y(r),
			classification: e ?? t.localize("TSG.Inspector.Consistency.NoClassification")
		})}${n === null ? "" : `, ${X(n, 3, " bar")}`} ${e ? "✓" : "⚠"}`);
	}
	if (i !== null) {
		let e = Wm(s?.coveragePercent), n = i === 0 ? 0 : Math.max(0, i * 10 - 5), r = i === 10 ? 100 : Math.min(100, i * 10 + 5), a = e !== null && e >= n && e <= r;
		c.push(`${e === null ? t.format("TSG.Inspector.Consistency.HydrographicsMissing", { code: Y(i) }) : t.format("TSG.Inspector.Consistency.Hydrographics", {
			code: Y(i),
			coverage: X(e, 1, "%")
		})} ${e === null ? "⚠" : a ? "✓" : `⚠ ${t.localize("TSG.Inspector.Consistency.Review")}`}`);
	}
	return c.length ? [Bm(null, c)] : [W(t.localize("TSG.Inspector.Hint.NoSAHConsistencyDataAvailableForThisBody"))];
}
function dg(e, t) {
	let n = G($(e)?.size), r = G($(e)?.gasGiant);
	return [
		B(t.localize("TSG.Inspector.Label.PhysicalProfile"), e?.uwpPhysical ?? "—"),
		B(t.localize("TSG.Inspector.Label.SizeCode"), Y(e?.sizeCode)),
		B(t.localize("TSG.Inspector.Label.Diameter"), X(n?.diameterKm ?? r?.diameterKm, 0, " km")),
		B(t.localize("TSG.Inspector.Label.Composition"), n?.composition ?? r?.category ?? "—"),
		B(t.localize("TSG.Inspector.Label.Density"), X(n?.densityTerra, 3, " Terra")),
		B(t.localize("TSG.Inspector.Label.Mass"), X(n?.massTerra ?? r?.massTerra, 6, " Terra")),
		B(t.localize("TSG.Inspector.Label.SurfaceGravity"), X(n?.gravityG, 3, " g")),
		B(t.localize("TSG.Inspector.Label.EscapeVelocity"), X(n?.escapeVelocityKps, 3, " km/s")),
		B(t.localize("TSG.Inspector.Label.Zone"), e?.zone ?? "—"),
		B(t.localize("TSG.Inspector.Label.OrbitalPeriod"), X(e?.orbitalPeriodYears, 6, " yr"))
	];
}
function fg(e, t) {
	let n = J(e.model), r = K(e.dominantConstituents).map((e) => String(e)).join(", "), i = q(e.quantitativeComposition).map((e) => {
		let t = J(e.code) ?? "?";
		return B(`${t} — ${J(e.name) ?? t}`, X(e.percentage, 4, "%"));
	}), a = n === "science-enhanced-v1";
	return z(B(t.localize("TSG.Inspector.Label.AtmosphereModel"), a ? "Science Enhanced v1" : n === "wbh" ? "WBH Qualitative" : n ?? "—"), B(t.localize("TSG.Inspector.Label.Method"), e.method ?? "—"), B(t.localize("TSG.Inspector.Label.CompositionBasis"), e.compositionBasis ?? "—"), B(t.localize("TSG.Inspector.Label.PrimaryConstituent"), e.primaryConstituent ?? "—"), B(t.localize("TSG.Inspector.Label.DominantConstituents"), r || "—"), a && [
		B(t.localize("TSG.Inspector.Label.ReferencePressure"), X(e.referencePressureBar, 3, " bar")),
		B(t.localize("TSG.Inspector.Label.ReferenceRegion"), e.referenceRegion ?? "—"),
		B(t.localize("TSG.Inspector.Label.IrradiationTemperature"), X(e.irradiationTemperatureK, 1, " K")),
		B(t.localize("TSG.Inspector.Label.ReferenceTemperature"), X(e.referenceTemperatureK, 1, " K")),
		B(t.localize("TSG.Inspector.Label.ChemistryRegime"), e.chemistryRegime ?? "—"),
		B(t.localize("TSG.Inspector.Label.EnrichmentEstimate"), X(e.enrichmentFactorSolar, 2, "× solar"))
	], B(t.localize("TSG.Inspector.Label.HydrogenSkimmable"), Km(e.hydrogenSkimmable, t)), i.length ? zm("label", t.localize("TSG.Inspector.Label.QuantitativeCompositionMole"), i) : B(t.localize("TSG.Inspector.Label.QuantitativeComposition"), "Not generated (WBH qualitative model)"), B(t.localize("TSG.Inspector.Label.AtmosphereProfile"), e.profile ?? "—"), lg(e.generationNotes, t));
}
function pg(e, t) {
	let n = G(G($(e)?.gasGiant)?.atmosphere);
	if (n) return fg(n, t);
	let r = G($(e)?.atmosphere), i = K(r?.taints).map((e) => G(e)?.profile ?? G(e)?.type ?? e).join(", "), a = K(r?.hazards).map((e) => G(e)?.type ?? e).join(", "), o = K(G(r?.gasMix)?.components).map((e) => {
		let t = G(e);
		return t ? `${t.name ?? "?"} ${t.percentage ?? "?"}%${t.retainedLongTerm === !1 ? " (not retained)" : ""}` : String(e);
	}).join(", ");
	return [
		B(t.localize("TSG.Inspector.Label.AtmosphereCode"), Y(e?.atmosphereCode)),
		B(t.localize("TSG.Inspector.Label.Classification"), r?.classification ?? "—"),
		B(t.localize("TSG.Inspector.Label.MeanPressure"), X(r?.meanBaselinePressureBar, 4, " bar")),
		B(t.localize("TSG.Inspector.Label.OFraction"), X(r?.oxygenFraction, 4)),
		B(t.localize("TSG.Inspector.Label.OPartialPressure"), X(r?.oxygenPartialPressureBar, 4, " bar")),
		B(t.localize("TSG.Inspector.Label.NPartialPressure"), X(r?.nitrogenPartialPressureBar, 4, " bar")),
		B(t.localize("TSG.Inspector.Label.OxygenSafety"), r?.oxygenSafety ?? "—"),
		B(t.localize("TSG.Inspector.Label.ScaleHeight"), X(r?.scaleHeightKm, 3, " km")),
		B(t.localize("TSG.Inspector.Label.SafeAltitude"), X(r?.minimumSafeAltitudeKm, 3, " km")),
		B(t.localize("TSG.Inspector.Label.SafeDepthBelowMean"), X(r?.safeAltitudeBelowMeanKm, 3, " km")),
		B(t.localize("TSG.Inspector.Label.Taints"), i || "—"),
		B(t.localize("TSG.Inspector.Label.Hazards"), a || "—"),
		B(t.localize("TSG.Inspector.Label.GasMix"), o || "—"),
		B(t.localize("TSG.Inspector.Label.AtmosphereProfile"), r?.profile ?? "—")
	];
}
function mg(e, t) {
	let n = G(e?.surfaceFeatures);
	if (!n) return [];
	let r = q(n.bodies).map((e) => `${e.id ?? "?"}: ${e.kind ?? "feature"} ${X(e.surfacePercent, 2, "%")}`).join("; ");
	return [
		B(t.localize("TSG.Inspector.Label.DiscreteFeatureCoverage"), X(n.discreteFeatureCoveragePercent, 2, "%")),
		B(t.localize("TSG.Inspector.Label.MajorFeatureCoverage"), X(n.majorCoveragePercent, 2, "%")),
		B(t.localize("TSG.Inspector.Label.MinorFeatureCoverage"), X(n.minorCoveragePercent, 2, "%")),
		B(t.localize("TSG.Inspector.Label.SmallFeatureCoverage"), X(n.smallCoveragePercent, 2, "%")),
		B(t.localize("TSG.Inspector.Label.MajorBodies"), n.majorBodyCount ?? "—"),
		B(t.localize("TSG.Inspector.Label.MinorBodies"), n.minorBodyCount ?? "—"),
		B(t.localize("TSG.Inspector.Label.SmallBodies"), n.smallBodyCount ?? "—"),
		B(t.localize("TSG.Inspector.Label.GeneratedSurfaceBodies"), r || "None")
	];
}
function hg(e, t) {
	let n = G($(e)?.hydrographics), r = G($(e)?.climate);
	return [
		B(t.localize("TSG.Inspector.Label.HydrographicsCode"), Y(e?.hydrographicsCode)),
		B(t.localize("TSG.Inspector.Label.PreciseCoverage"), X(n?.coveragePercent, 2, "%")),
		B(t.localize("TSG.Inspector.Label.Foundation"), n?.foundation ?? "—"),
		B(t.localize("TSG.Inspector.Label.LiquidComposition"), n?.composition ?? "—"),
		B(t.localize("TSG.Inspector.Label.Distribution"), G(n?.distribution)?.description ?? "—"),
		B(t.localize("TSG.Inspector.Label.HydrographicsProfile"), n?.profile ?? "—"),
		...mg(n, t),
		B(t.localize("TSG.Inspector.Label.MeanTemperature"), `${X(r?.meanTemperatureK, 2, " K")} / ${X(r?.meanTemperatureC, 2, " °C")}`),
		B(t.localize("TSG.Inspector.Label.TemperatureClass"), r?.temperatureClass ?? "—"),
		B(t.localize("TSG.Inspector.Label.Albedo"), X(r?.albedo, 4)),
		B(t.localize("TSG.Inspector.Label.GreenhouseFactor"), X(r?.greenhouseFactor, 4)),
		B(t.localize("TSG.Inspector.Label.RunawayGreenhouseEligible"), Km(r?.runawayGreenhouseEligible, t))
	];
}
function gg(e, t) {
	let n = G(G($(e)?.climate)?.temperatureExtremes);
	return n ? [
		B(t.localize("TSG.Inspector.Label.HighTemperature"), `${X(n.highTemperatureK, 2, " K")} / ${X(n.highTemperatureC, 2, " °C")}`),
		B(t.localize("TSG.Inspector.Label.LowTemperature"), `${X(n.lowTemperatureK, 2, " K")} / ${X(n.lowTemperatureC, 2, " °C")}`),
		B(t.localize("TSG.Inspector.Label.NearStellarDistance"), X(n.nearAu, 6, " AU")),
		B(t.localize("TSG.Inspector.Label.FarStellarDistance"), X(n.farAu, 6, " AU")),
		cg([
			B(t.localize("TSG.Inspector.Label.AxialTiltFactor"), X(n.axialTiltFactor, 6)),
			B(t.localize("TSG.Inspector.Label.RotationFactor"), X(n.rotationFactor, 6)),
			B(t.localize("TSG.Inspector.Label.GeographicFactor"), X(n.geographicFactor, 6)),
			B(t.localize("TSG.Inspector.Label.VarianceFactor"), X(n.varianceFactor, 6)),
			B(t.localize("TSG.Inspector.Label.AtmosphericFactor"), X(n.atmosphericFactor, 6)),
			B(t.localize("TSG.Inspector.Label.LuminosityModifier"), X(n.luminosityModifier, 6)),
			B(t.localize("TSG.Inspector.Label.HighLuminosity"), X(n.highLuminositySolar, 6, " Sol")),
			B(t.localize("TSG.Inspector.Label.LowLuminosity"), X(n.lowLuminositySolar, 6, " Sol")),
			lg(n.generationNotes, t)
		], t)
	] : [W(t.localize("TSG.Inspector.Hint.NoWBHHighLowTemperatureRecordIsAvailableForThisBody"))];
}
function _g(e, t) {
	let n = G($(e)?.rotation), r = G($(e)?.surfaceTides);
	return [
		B(t.localize("TSG.Inspector.Label.SiderealDay"), X(n?.siderealHours, 6, " h")),
		B(t.localize("TSG.Inspector.Label.SolarDay"), n?.solarDayInfinite ? "Infinite / undefined" : X(n?.solarDayHours, 6, " h")),
		B(t.localize("TSG.Inspector.Label.SolarDaysYear"), X(n?.solarDaysPerYear, 6)),
		B(t.localize("TSG.Inspector.Label.AxialTilt"), X(n?.axialTiltDegrees, 4, "°")),
		B(t.localize("TSG.Inspector.Label.Direction"), n?.direction ?? "—"),
		B(t.localize("TSG.Inspector.Label.TidalLockStatus"), n?.tidalLockStatus ?? "—"),
		B(t.localize("TSG.Inspector.Label.TidalLockCase"), n?.tidalLockCase ?? "—"),
		B(t.localize("TSG.Inspector.Label.TidalLockDM"), n?.tidalLockDm ?? "—"),
		B(t.localize("TSG.Inspector.Label.TidalLockTarget"), n?.tidalLockTargetId ?? "—"),
		B(t.localize("TSG.Inspector.Label.AdjustedEccentricity"), n?.adjustedEccentricity ?? "—"),
		B(t.localize("TSG.Inspector.Label.SurfaceTideTotal"), X(r?.totalAmplitudeMetres, 6, " m")),
		B(t.localize("TSG.Inspector.Label.StellarTide"), X(r?.stellarAmplitudeMetres, 6, " m")),
		B(t.localize("TSG.Inspector.Label.SatelliteTideSubtotal"), X(r?.directSatelliteAmplitudeMetres, 6, " m")),
		B(t.localize("TSG.Inspector.Label.ParentTide"), X(r?.directParentAmplitudeMetres, 6, " m"))
	];
}
function vg(e, t) {
	let n = G($(e)?.seismology);
	return n ? [
		B(t.localize("TSG.Inspector.Label.ResidualSeismicStress"), n.residualSeismicStress ?? "—"),
		B(t.localize("TSG.Inspector.Label.TidalStressFactor"), n.tidalStressFactor ?? "—"),
		B(t.localize("TSG.Inspector.Label.TidalHeatingFactor"), n.tidalHeatingFactor ?? "—"),
		B(t.localize("TSG.Inspector.Label.TotalSeismicStress"), n.totalSeismicStress ?? "—"),
		B(t.localize("TSG.Inspector.Label.SeismicAdjustedMeanTemperature"), X(n.seismicAdjustedMeanTemperatureK, 3, " K")),
		B(t.localize("TSG.Inspector.Label.MajorTectonicPlates"), n.majorTectonicPlates ?? "—"),
		B(t.localize("TSG.Inspector.Label.WaterBasedTectonicsEligible"), Km(n.waterBasedTectonicsEligible, t)),
		cg([
			B(t.localize("TSG.Inspector.Label.ResidualStressDM"), n.residualStressDm ?? "—"),
			B(t.localize("TSG.Inspector.Label.TectonicPlateRoll"), n.tectonicPlateRoll ?? "—"),
			B(t.localize("TSG.Inspector.Label.TectonicPlateDM"), n.tectonicPlateDm ?? "—"),
			lg(n.generationNotes, t)
		], t)
	] : [W(t.localize("TSG.Inspector.Hint.NoWBHTerrestrialSeismologyRecordIsAvailableForThisBody"))];
}
function yg(e, t) {
	let n = G($(e)?.surfaceGeology);
	if (!n) return [W(t.localize("TSG.Inspector.Hint.NoWBHDerivedSurfaceGeologyRecordIsAvailableForThisBody"))];
	let r = G(n.plateBoundaries), i = q(n.features).map((e) => {
		let t = K(e.relatedSurfaceBodyIds).map((e) => String(e)), n = e.sourceBoundary ? `; ${String(e.sourceBoundary)} boundary` : "";
		return `${String(e.id ?? "feature")} — ${String(e.kind ?? "terrain")} (${String(e.intensity ?? "—")})${n}${t.length ? ` — ${t.join(", ")}` : ""}`;
	}), a = t.localize("TSG.Inspector.Label.GeneratedMajorFeatures");
	return [
		B(t.localize("TSG.Inspector.Label.GeologicRegime"), n.regime ?? "—"),
		B(t.localize("TSG.Inspector.Label.TectonicPlatesUsed"), n.tectonicPlateCount ?? "—"),
		B(t.localize("TSG.Inspector.Label.TotalSeismicStressUsed"), n.totalSeismicStress ?? "—"),
		B(t.localize("TSG.Inspector.Label.ConvergentBoundaries"), r?.convergent ?? "—"),
		B(t.localize("TSG.Inspector.Label.DivergentBoundaries"), r?.divergent ?? "—"),
		B(t.localize("TSG.Inspector.Label.TransformBoundaries"), r?.transform ?? "—"),
		B(t.localize("TSG.Inspector.Label.StableBoundaries"), r?.stable ?? "—"),
		U(a, i) ?? zm("label", a, W(t.localize("TSG.Inspector.Hint.None"))),
		cg([B(t.localize("TSG.Inspector.Label.GenerationPolicy"), n.generationPolicy ?? "—"), lg(n.generationNotes, t)], t)
	];
}
function bg(e, t) {
	let n = G($(e)?.surfaceClimate);
	return n ? [
		B(t.localize("TSG.Inspector.Label.ThermalRegime"), n.thermalRegime ?? "—"),
		B(t.localize("TSG.Inspector.Label.MeanTemperatureUsed"), X(n.meanTemperatureK, 2, " K")),
		B(t.localize("TSG.Inspector.Label.HighTemperatureUsed"), X(n.highTemperatureK, 2, " K")),
		B(t.localize("TSG.Inspector.Label.LowTemperatureUsed"), X(n.lowTemperatureK, 2, " K")),
		B(t.localize("TSG.Inspector.Label.PermanentIceExtent"), n.permanentIceExtent ?? "—"),
		B(t.localize("TSG.Inspector.Label.AgricultureThermallyEligible"), Km(n.agricultureThermallyEligible, t)),
		B(t.localize("TSG.Inspector.Label.UnprotectedSettlementThermallyEligible"), Km(n.unprotectedSettlementThermallyEligible, t)),
		U(t.localize("TSG.Inspector.Label.BroadRegionGuidance"), n.broadRegionGuidance) ?? W(t.localize("TSG.Inspector.Hint.NoAdditionalBroadRegionGuidance")),
		cg([B(t.localize("TSG.Inspector.Label.GenerationPolicy"), n.generationPolicy ?? "—"), lg(n.generationNotes, t)], t)
	] : [W(t.localize("TSG.Inspector.Hint.NoWBHDerivedSurfaceClimateGuidanceIsAvailableForThisBody"))];
}
function xg(e, t) {
	let n = G($(e)?.satellites), r = K(n?.moons).map((e, n) => {
		let r = G(e), i = t.format("TSG.Inspector.Satellite.MoonNumber", { number: n + 1 });
		return r ? t.format("TSG.Inspector.Satellite.Moon", {
			name: String(r.designation ?? i),
			size: String(r.sizeCode ?? "?"),
			orbitPd: X(r.orbitPd, 3, " PD"),
			orbitKm: X(r.orbitKm, 0, " km"),
			eccentricity: X(r.eccentricity, 3),
			direction: String(r.direction ?? "?"),
			period: X(r.periodHours, 3, " h")
		}) : i;
	}), i = K(n?.rings).map((e, n) => {
		let r = G(e), i = t.format("TSG.Inspector.Satellite.RingNumber", { number: n + 1 });
		return r ? t.format("TSG.Inspector.Satellite.Ring", {
			name: String(r.designation ?? i),
			centre: X(r.centrePd, 3, " PD"),
			span: X(r.spanPd, 3, " PD")
		}) : i;
	}), a = t.localize("TSG.Inspector.Value.None");
	return [
		B(t.localize("TSG.Inspector.Label.HillSphere"), X(n?.hillSphereAu, 6, " AU")),
		B(t.localize("TSG.Inspector.Label.MoonLimit"), X(n?.hillSphereMoonLimitPd, 3, " PD")),
		B(t.localize("TSG.Inspector.Label.RocheLimit"), X(n?.rocheLimitPd, 3, " PD")),
		B(t.localize("TSG.Inspector.Label.MOR"), X(n?.moonOrbitRangePd, 3, " PD")),
		Bm(t.localize("TSG.Inspector.Label.Moons"), r.length ? r : [a]),
		Bm(t.localize("TSG.Inspector.Label.Rings"), i.length ? i : [a])
	];
}
function Sg(e, t) {
	let n = G($(e)?.nativeLife);
	if (!n) return [W(t.localize("TSG.Inspector.Hint.NoWBHTerrestrialNativeLifeRecordIsAvailableForThisBody"))];
	let r = G(n.biomassDm);
	return [
		Vm("IISS Native-Life Profile (MXDC)", J(n.profile) ?? "—"),
		B(t.localize("TSG.Inspector.Label.Biomass"), n.biomassRating ?? "—"),
		B(t.localize("TSG.Inspector.Label.Biocomplexity"), n.biocomplexityRating ?? "—"),
		B(t.localize("TSG.Inspector.Label.Biodiversity"), n.biodiversityRating ?? "—"),
		B(t.localize("TSG.Inspector.Label.Compatibility"), n.compatibilityRating ?? "—"),
		B(t.localize("TSG.Inspector.Label.BiomassSpecialCase"), n.biomassSpecialCase ?? "—"),
		B(t.localize("TSG.Inspector.Label.CurrentNativeSophont"), Km(n.currentNativeSophont, t)),
		B(t.localize("TSG.Inspector.Label.ExtinctNativeSophontEvidence"), Km(n.extinctNativeSophontEvidence, t)),
		cg([
			B(t.localize("TSG.Inspector.Label.BiomassRoll"), n.biomassRoll ?? "—"),
			B(t.localize("TSG.Inspector.Label.BiomassAtmosphereDM"), r?.atmosphere ?? "—"),
			B(t.localize("TSG.Inspector.Label.BiomassHydrographicsDM"), r?.hydrographics ?? "—"),
			B(t.localize("TSG.Inspector.Label.BiomassAgeDM"), r?.age ?? "—"),
			B(t.localize("TSG.Inspector.Label.BiomassTemperatureDM"), r?.temperature ?? "—"),
			B(t.localize("TSG.Inspector.Label.BiomassDMBeforeClamp"), r?.totalBeforeClamp ?? "—"),
			B(t.localize("TSG.Inspector.Label.BiomassDMApplied"), r?.totalApplied ?? "—"),
			B(t.localize("TSG.Inspector.Label.BiocomplexityRoll"), n.biocomplexityRoll ?? "—"),
			B(t.localize("TSG.Inspector.Label.BiocomplexityDM"), n.biocomplexityDm ?? "—"),
			B(t.localize("TSG.Inspector.Label.BiodiversityRoll"), n.biodiversityRoll ?? "—"),
			B(t.localize("TSG.Inspector.Label.CompatibilityRoll"), n.compatibilityRoll ?? "—"),
			B(t.localize("TSG.Inspector.Label.CompatibilityDM"), n.compatibilityDm ?? "—"),
			B(t.localize("TSG.Inspector.Label.CurrentSophontRoll"), n.currentNativeSophontRoll ?? "—"),
			B(t.localize("TSG.Inspector.Label.ExtinctSophontRoll"), n.extinctNativeSophontRoll ?? "—"),
			lg(n.generationNotes, t)
		], t)
	];
}
function Cg(e, t) {
	let n = G($(e)?.resourceRating);
	if (!n) return [W(t.localize("TSG.Inspector.Hint.NoWBHTerrestrialResourceRatingIsAvailableForThisBody"))];
	let r = G(n.dm);
	return [B(t.localize("TSG.Inspector.Label.ResourceRating"), `${n.code ?? "—"} (${n.rating ?? "—"})`), cg([
		B("2D roll", n.roll ?? "—"),
		B(t.localize("TSG.Inspector.Label.SizeCode"), n.sizeCode ?? "—"),
		B(t.localize("TSG.Inspector.Label.DensityDM"), r?.density ?? "—"),
		B(t.localize("TSG.Inspector.Label.BiomassDM"), r?.biomass ?? "—"),
		B(t.localize("TSG.Inspector.Label.BiodiversityDM"), r?.biodiversity ?? "—"),
		B(t.localize("TSG.Inspector.Label.CompatibilityDM"), r?.compatibility ?? "—"),
		B(t.localize("TSG.Inspector.Label.TotalDM"), r?.total ?? "—"),
		B(t.localize("TSG.Inspector.Label.UnclampedTotal"), n.unclampedTotal ?? "—"),
		lg(n.generationNotes, t)
	], t)];
}
function wg(e, t) {
	let n = G($(e)?.habitabilityRating);
	if (!n) return [W(t.localize("TSG.Inspector.Hint.NoWBHTerragenHabitabilityRatingIsAvailableForThisBody"))];
	let r = G(n.dm);
	return [
		B(t.localize("TSG.Inspector.Label.HabitabilityRating"), `${n.code ?? "—"} (${n.rating ?? "—"})`),
		B(t.localize("TSG.Inspector.Label.Remarks"), n.remarks ?? "—"),
		cg([
			B(t.localize("TSG.Inspector.Label.BaseRating"), n.baseRating ?? 10),
			B(t.localize("TSG.Inspector.Label.SizeDM"), r?.size ?? "—"),
			B(t.localize("TSG.Inspector.Label.AtmosphereDM"), r?.atmosphere ?? "—"),
			B(t.localize("TSG.Inspector.Label.LowOxygenTaintDM"), r?.lowOxygenTaint ?? "—"),
			B(t.localize("TSG.Inspector.Label.HydrographicsDM"), r?.hydrographics ?? "—"),
			B(t.localize("TSG.Inspector.Label.Solar11TidalLockDM"), r?.solarTidalLock ?? "—"),
			B(t.localize("TSG.Inspector.Label.HighTemperatureDM"), r?.highTemperature ?? "—"),
			B(t.localize("TSG.Inspector.Label.MeanTemperatureDM"), r?.meanTemperature ?? "—"),
			B(t.localize("TSG.Inspector.Label.LowTemperatureDM"), r?.lowTemperature ?? "—"),
			B(t.localize("TSG.Inspector.Label.TemperatureFallbackDM"), r?.temperatureFallback ?? "—"),
			B(t.localize("TSG.Inspector.Label.GravityDM"), r?.gravity ?? "—"),
			B(t.localize("TSG.Inspector.Label.MiscellaneousRefereeDM"), r?.miscellaneous ?? "—"),
			B(t.localize("TSG.Inspector.Label.TotalDM"), r?.total ?? "—"),
			B(t.localize("TSG.Inspector.Label.UnclampedTotal"), n.unclampedTotal ?? "—"),
			B(t.localize("TSG.Inspector.Label.DetailedTemperaturesUsed"), Km(n.usedDetailedTemperature, t)),
			B(t.localize("TSG.Inspector.Label.ComputedGravityUsed"), Km(n.usedComputedGravity, t)),
			lg(n.generationNotes, t)
		], t)
	];
}
//#endregion
//#region src/rules/worlds/wbhSecondaryWorldGovernments.ts
function Tg(e) {
	return Number.isFinite(e) ? Math.max(0, Math.min(10, Math.trunc(e))) : 0;
}
function Eg(e) {
	return e <= 1 ? 0 : e === 2 ? 1 : e === 3 ? 2 : e === 4 ? 3 : 6;
}
function Dg(e, t) {
	return e === 0 ? -2 : e === 6 ? t : 0;
}
function Og(e, t) {
	let n = Tg(t.secondaryPopulationCode);
	if (n <= 0) throw Error("WBH secondary world government generation requires an inhabited secondary world.");
	if (t.affiliation === "dependent") {
		if (!Number.isFinite(t.ownerGovernmentCode)) throw Error("Dependent secondary worlds require an owning government code.");
		let r = Math.max(0, Math.trunc(t.ownerGovernmentCode)), i = Tg(t.ownerPopulationCode ?? 0);
		if (r === 6 && !Number.isFinite(t.ownerPopulationCode)) throw Error("Government 6 owners require the owning mainworld Population code for the WBH secondary-government DM.");
		let a = e.die(6), o = Dg(r, i), s = a + o, c = Eg(s);
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
	let r = zl(e, n), i = r.governmentCode, a = i === 6;
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
function kg(e) {
	return Math.max(0, Math.min(18, Math.trunc(e)));
}
function Ag(e, t, n = 0) {
	let r = e.roll(2, 6).total, i = t - 7 + n;
	return {
		roll: r,
		dm: i,
		law: kg(r + i)
	};
}
function jg(e, t) {
	let n = Math.max(0, Math.trunc(t.secondaryGovernmentCode)), r = t.affiliation === "dependent", i = Number.isFinite(t.ownerGovernmentCode) ? Math.max(0, Math.trunc(t.ownerGovernmentCode)) : null, a = Number.isFinite(t.ownerLawLevelCode) ? kg(t.ownerLawLevelCode) : null, o = t.penalColony === !0, s = t.militaryBase === !0, c = t.freeport === !0;
	if (r && n === 6) {
		if (a === null) throw Error("WBH captive secondary-world Law generation requires the owning authority Law Level.");
		let r = e.die(6), l = o || s ? 1 : 0, u = r + l, d = null, f = 0, p;
		if (u <= 2) {
			let t = Ag(e, 6);
			d = t.roll, f = t.dm, p = t.law;
		} else u <= 4 ? p = a : u === 5 ? p = kg(a + 1) : (d = e.die(6), p = kg(a + d));
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
				let t = Ag(e, n);
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
	let l = Ag(e, n, c ? -1 : 0);
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
var Mg = "traveller-system-generator";
function Ng(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Pg(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function Fg(e) {
	return typeof e == "string" && e.length ? e : null;
}
function Ig(e) {
	return e === !0 || e === "true" || e === "on" || e === 1;
}
function Lg(e) {
	return Ng(e.flags?.[Mg]);
}
function Rg(e) {
	let t = Ip(Lg(e), "secondaryGovernmentOverrides"), n = {};
	for (let [e, r] of Object.entries(t)) {
		let t = Ng(r), i = Ng(t?.details), a = Ng(t?.lawDetails), o = Ng(t?.lawModifiers), s = t?.affiliation === "dependent" || t?.affiliation === "independent" ? t.affiliation : null;
		!t || !i || !s || (n[e] = {
			bodyId: e,
			affiliation: s,
			ownerId: Fg(t.ownerId),
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
function zg(e, t = Q) {
	return q_(e, t).filter((e) => !e.isMainworld && e.social && (Pg(e.social.populationCode) ?? 0) > 0);
}
function Bg(e) {
	return q_(e).find((e) => e.isMainworld && e.social);
}
function Vg(e, t) {
	let n = Ng(e.lawLevelDetails), r = Array.isArray(n?.balkanisedFactions) ? n.balkanisedFactions : [];
	for (let e of r) {
		let n = Ng(e), r = Ng(n?.details);
		if (n?.factionId === t) return Pg(r?.lawLevelCode);
	}
	return null;
}
function Hg(e, t = Q) {
	let n = Bg(e);
	if (!n?.social) return [];
	let r = Pg(n.social.populationCode) ?? 0, i = Pg(n.social.governmentCode) ?? 0, a = Pg(n.social.lawLevelCode) ?? 0, o = [{
		id: n.id,
		label: t.format("TSG.Editor.SecondaryGovernment.OwnerOption", {
			owner: n.label,
			government: i,
			law: a
		}),
		governmentCode: i,
		populationCode: r,
		lawLevelCode: a
	}], s = Ng(n.social.balkanisation), c = Array.isArray(s?.factions) ? s.factions : [];
	for (let e of c) {
		let i = Ng(e), a = Fg(i?.id), s = Pg(i?.governmentCode);
		if (!a || s === null) continue;
		let c = Vg(n.social, a);
		c !== null && o.push({
			id: `${n.id}:${a}`,
			label: t.format("TSG.Editor.SecondaryGovernment.OwnerOption", {
				owner: `${n.id} ${a}`,
				government: s,
				law: c
			}),
			governmentCode: s,
			populationCode: r,
			lawLevelCode: c
		});
	}
	return o;
}
function Ug(e) {
	return e.type === "world" && zg(e).length > 0 && Hg(e).length > 0;
}
function Wg(e, t, n, r) {
	let i = zg(e, t), a = Hg(e, t), o = Rg(e), s = R(n, "bodyId") ?? i[0]?.id ?? "", c = n === null || r === "bodyId", l = o[s], u = l?.ownerId && a.some((e) => e.id === l.ownerId) ? l.ownerId : null, d = c ? l?.affiliation ?? "dependent" : R(n, "affiliation") ?? "dependent", f = (c ? u : null) ?? R(n, "ownerId") ?? a[0]?.id ?? "", p = (e) => c ? l?.lawModifiers?.[e] ?? !1 : Ig(n?.[e]);
	return [
		Nm(t.localize("TSG.Editor.SecondaryGovernment.Intro")),
		L("bodyId", t.localize("TSG.Editor.SecondaryGovernment.SecondaryWorld"), i.map((e) => {
			let n = o[e.id], r = Pg(e.social?.populationCode) ?? 0, i = n?.lawDetails?.lawLevelCode, a = {
				body: e.label,
				population: r
			}, c = n ? i == null ? t.format("TSG.Editor.SecondaryGovernment.WorldOptionAssigned", {
				...a,
				affiliation: n.affiliation,
				government: n.details.governmentCode
			}) : t.format("TSG.Editor.SecondaryGovernment.WorldOptionAssignedLaw", {
				...a,
				affiliation: n.affiliation,
				government: n.details.governmentCode,
				law: i
			}) : t.format("TSG.Editor.SecondaryGovernment.WorldOption", a);
			return I(e.id, c, s);
		})),
		L("affiliation", t.localize("TSG.Editor.SecondaryGovernment.PoliticalStatus"), [
			I("dependent", t.localize("TSG.Editor.SecondaryGovernment.DependentOnMainworldAuthority"), d),
			I("independent", t.localize("TSG.Editor.SecondaryGovernment.Independent"), d),
			I("clear", t.localize("TSG.Editor.SecondaryGovernment.ClearRefereeGovernmentAssignment"), d)
		]),
		L("ownerId", t.localize("TSG.Editor.SecondaryGovernment.OwningAuthority"), a.map((e) => I(e.id, e.label, f)), { hidden: d !== "dependent" }),
		Lm(t.localize("TSG.Editor.SecondaryGovernment.SecondaryWorldLawModifiers"), [
			km("penalColony", t.localize("TSG.Editor.SecondaryGovernment.PenalColony"), p("penalColony")),
			km("militaryBase", t.localize("TSG.Editor.SecondaryGovernment.MilitaryBase"), p("militaryBase")),
			km("freeport", t.localize("TSG.Editor.SecondaryGovernment.Freeport"), p("freeport"))
		]),
		Nm(t.localize("TSG.Editor.SecondaryGovernment.LawHint"))
	];
}
async function Gg(e, t) {
	let n = t.localizer ?? Q;
	if (!t.isGameMaster()) return;
	if (!Ug(e)) {
		t.notifyWarning(n.localize("TSG.SecondaryGovernment.Unavailable"));
		return;
	}
	let r = await t.showForm({
		title: n.format("TSG.SecondaryGovernment.Title", { name: e.name }),
		submitLabel: n.localize("TSG.Editor.Apply"),
		width: 560,
		refreshOn: ["bodyId", "affiliation"],
		fields: (t, r) => Wg(e, n, t, r)
	});
	if (!r) return;
	let i = Fg(r.bodyId), a = zg(e).find((e) => e.id === i);
	if (!i || !a?.social) {
		t.notifyWarning(n.localize("TSG.SecondaryGovernment.SelectWorld"));
		return;
	}
	let o = { ...Rg(e) }, s = Fg(r.affiliation);
	if (s === "clear") delete o[i];
	else if (s === "dependent" || s === "independent") {
		let c = Pg(a.social.populationCode) ?? 0, l;
		if (s === "dependent") {
			let i = Fg(r.ownerId);
			if (l = Hg(e).find((e) => e.id === i), !l) {
				t.notifyWarning(n.localize("TSG.SecondaryGovernment.SelectOwner"));
				return;
			}
		}
		let u = Up(Bp(e)) ?? 1, d = Og(T("secondaryGovernmentAffiliation", u, i, s, l?.id ?? "independent"), {
			affiliation: s,
			secondaryPopulationCode: c,
			ownerGovernmentCode: l?.governmentCode,
			ownerPopulationCode: l?.populationCode,
			ownerId: l?.id
		}), f = {
			penalColony: Ig(r.penalColony),
			militaryBase: Ig(r.militaryBase),
			freeport: Ig(r.freeport)
		}, p = `${+!!f.penalColony}${+!!f.militaryBase}${+!!f.freeport}`, m = jg(T("secondaryLawLevel", u, i, s, l?.id ?? "independent", d.governmentCode, p), {
			affiliation: s,
			secondaryGovernmentCode: d.governmentCode,
			ownerGovernmentCode: l?.governmentCode,
			ownerLawLevelCode: l?.lawLevelCode,
			...f
		});
		o[i] = {
			bodyId: i,
			affiliation: s,
			ownerId: l?.id ?? null,
			details: d,
			lawDetails: m,
			lawModifiers: f
		};
	} else {
		t.notifyWarning(n.localize("TSG.SecondaryGovernment.SelectStatus"));
		return;
	}
	try {
		await e.update(Lp("secondaryGovernmentOverrides", o)), e.sheet?.render(!0), t.notifyInfo(n.format(s === "clear" ? "TSG.SecondaryGovernment.Cleared" : "TSG.SecondaryGovernment.Updated", { id: i }));
	} catch (e) {
		t.notifyError(n.format("TSG.SecondaryGovernment.Failed", { message: e instanceof Error ? e.message : String(e) }));
	}
}
//#endregion
//#region src/integrations/foundry/secondaryGovernmentInspectorRows.ts
function Kg(e, t = Q) {
	let n = Rg(e), r = q_(e, t).filter((e) => !e.isMainworld && e.social && Number(e.social.populationCode ?? 0) > 0);
	return r.length ? [B(t.localize("TSG.Inspector.Label.WBHPolicy"), "Referee chooses dependency or independence for each inhabited secondary world; Government and overall Law Level then follow the WBH secondary-world cases."), ...r.map((e) => {
		let r = n[e.id];
		if (!r) return B(e.id, t.localize("TSG.Inspector.SecondaryGovernment.None"));
		let i = r.details, a = r.affiliation === "dependent" ? r.ownerId ?? "—" : t.localize("TSG.Inspector.SecondaryGovernment.Independent"), o = r.affiliation === "dependent" ? `1D ${i.dependentRoll ?? "—"} DM${i.dependentDm >= 0 ? "+" : ""}${i.dependentDm} = ${i.dependentTotal ?? "—"}` : `ordinary Government 2D result ${i.independentGovernment?.roll ?? "—"} ${typeof i.independentGovernment?.modifier == "number" ? `${i.independentGovernment.modifier >= 0 ? "+" : ""}${i.independentGovernment.modifier}` : ""}`, s = r.lawDetails, c = s ? `Law ${s.lawLevelCode} — Case ${s.case}${s.penalColony ? " — Penal Colony" : ""}${s.militaryBase ? " — Military Base" : ""}${s.freeport ? " — Freeport" : ""}` : t.localize("TSG.Inspector.SecondaryGovernment.LawMissing");
		return B(e.id, `${r.affiliation} — owner ${a} — Government ${i.governmentCode} — ${o} — ${c}${i.independentGovernmentSixReview ? " — REVIEW: independent Government 6" : ""}`);
	})] : [W(t.localize("TSG.Inspector.Hint.NoInhabitedSecondaryWorldsAreCurrentlyPresent"))];
}
//#endregion
//#region src/integrations/foundry/secondaryPopulationInspectorRows.ts
function qg(e, t) {
	switch (e) {
		case "eligible": return t.localize("TSG.Inspector.SecondaryPopulation.Eligible");
		case "existing-inhabited": return t.localize("TSG.Inspector.SecondaryPopulation.ExistingInhabited");
		case "tech-infeasible": return t.localize("TSG.Inspector.SecondaryPopulation.TechInfeasible");
		case "population-ceiling-zero": return t.localize("TSG.Inspector.SecondaryPopulation.CeilingZero");
		default: return String(e ?? "—");
	}
}
function Jg(e, t = Q) {
	let n = G(e);
	if (!n) return [W(t.localize("TSG.Inspector.Hint.NoWBHSecondaryWorldPopulationPlanAppliesThisNormallyMeansThe"))];
	let r = q(n.candidates), i = r.length ? Hm([
		t.localize("TSG.Inspector.Label.Body"),
		t.localize("TSG.Inspector.Label.Kind"),
		t.localize("TSG.Inspector.Label.ExistingPop"),
		t.localize("TSG.Inspector.Label.NativeSophonts"),
		t.localize("TSG.Inspector.Label.MinTL"),
		t.localize("TSG.Inspector.Label.MainworldTLSupports"),
		t.localize("TSG.Inspector.Label.MaxPop"),
		t.localize("TSG.Inspector.Label.Status")
	], r.map((e) => [
		e.parentId ? `${String(e.id ?? "—")} (moon of ${String(e.parentId)})` : String(e.id ?? "—"),
		String(e.kind ?? "—"),
		e.existingPopulationCode === null || e.existingPopulationCode === void 0 ? t.localize("TSG.Inspector.Value.None") : Y(e.existingPopulationCode),
		Km(e.currentNativeSophonts, t),
		{
			text: `TL${String(e.minimumSustainableTechLevel ?? "—")}`,
			title: K(e.minimumSustainableTechLevelBasis).map(String).join("; ")
		},
		Km(e.sustainableAtMainworldTechLevel, t),
		Y(e.effectiveMaximumPopulationCode),
		qg(e.status, t)
	])) : W(t.localize("TSG.Inspector.Hint.NoEligiblePhysicalSecondaryWorldCandidatesWereFoundAfterExcl"));
	return z(B(t.localize("TSG.Inspector.Label.Mainworld"), n.mainworldId ?? "—"), B(t.localize("TSG.Inspector.Label.MainworldPopulation"), Y(n.mainworldPopulationCode)), B(t.localize("TSG.Inspector.Label.MainworldTechLevel"), `TL${Y(n.mainworldTechLevel)}`), B(t.localize("TSG.Inspector.Label.NormalIndividualMaximum"), `${Y(n.normalMaximumPopulationCode)} — mainworld Population − 1`), B(t.localize("TSG.Inspector.Label.OptionalOffworld1DRoll"), n.offworldMaximumRoll ?? "—"), B(t.localize("TSG.Inspector.Label.OptionalSystemMaximum"), `${Y(n.systemMaximumPopulationCode)} — mainworld Population − 1D`), B(t.localize("TSG.Inspector.Label.EffectiveMaximum"), Y(n.effectiveMaximumPopulationCode)), B(t.localize("TSG.Inspector.Label.SecondaryPopulationsPossible"), Km(n.secondaryPopulationsPossible, t)), i, U(t.localize("TSG.Inspector.Label.WBHMethodNotes"), n.generationNotes, { muted: !0 }));
}
//#endregion
//#region src/rules/worlds/wbhPopulationProfile.ts
function Yg(e, n, r, i) {
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
function Xg(e) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : Math.trunc(e).toLocaleString("en-US");
}
function Zg(e, t) {
	return e === "native-sophont" ? t.localize("TSG.Inspector.Habitation.NativeSophont") : e === "transplanted" ? t.localize("TSG.Inspector.Habitation.Transplanted") : e === "uninhabited" ? t.localize("TSG.Inspector.Habitation.Uninhabited") : "—";
}
function Qg(e) {
	let t = G(e);
	if (!t) return String(e ?? "—");
	let n = t.kind === "minimum" ? "minimum" : "maximum", r = typeof t.percentage == "number" ? t.percentage : "—";
	return `${String(t.source ?? "Unknown")}: ${n} ${r}%`;
}
function $g(e, t = 1) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : `${e.toFixed(t).replace(/\.0$/, "")}%`;
}
function e_(e, t) {
	return U(e, t, { format: qm });
}
function t_(e, t) {
	if (!e) return W(t.localize("TSG.Inspector.Hint.NoWBHFunctionalStructureDetailIsStored"));
	let n = q(e.functions);
	return n.length ? zm("label", t.localize("TSG.Inspector.Label.FunctionalStructure"), n.map((e) => {
		let t = e.roll === null || e.roll === void 0 ? "—" : String(e.roll), n = typeof e.dm == "number" && e.dm !== 0 ? ` DM${Z(e.dm)}` : "", r = e.total === null || e.total === void 0 ? "" : ` = ${String(e.total)}`, i = e.sharedFromFunction ? ` — shared from ${String(e.sharedFromFunction)}` : "";
		return B(`${String(e.functionCode ?? "—")} — ${String(e.functionName ?? "Function")}`, `${String(e.code ?? "—")} — ${String(e.structure ?? "—")} — ${String(e.method ?? "—")} — roll ${t}${n}${r}${i}`);
	})) : W(t.localize("TSG.Inspector.Hint.NoWBHFunctionalStructureBranchRecordsAreStored"));
}
function n_(e, t) {
	if (!e) return [W(t.localize("TSG.Inspector.Hint.NoWBHAuthorityDetailIsStored"))];
	let n = G(e.governmentProfile);
	return z(B(t.localize("TSG.Inspector.Label.Authority"), `${String(e.code ?? "—")} — ${String(e.authoritativeFunction ?? "—")}`), B(t.localize("TSG.Inspector.Label.Authority2DRoll"), e.roll ?? "—"), B(t.localize("TSG.Inspector.Label.AuthorityDMTotal"), Z(e.dmTotal)), B(t.localize("TSG.Inspector.Label.AuthorityFinalTotal"), e.total ?? "—"), e_(t.localize("TSG.Inspector.Label.AuthorityModifiers"), e.dmBreakdown), t_(G(e.functionalStructure), t), n && B(t.localize("TSG.Inspector.Label.GovernmentProfile"), n.profile ?? "—"), n && n.fullProfile !== n.profile && B(t.localize("TSG.Inspector.Label.ExpandedGovernmentProfile"), n.fullProfile ?? "—"));
}
function r_(e, t) {
	if (!e) return [W(t.localize("TSG.Inspector.Hint.NoWBHInternalFactionDetailIsStoredForThisEffectiveGovernment"))];
	let n = q(e.factions), r = q(e.relationships);
	return z(B(t.localize("TSG.Inspector.Label.D3FactionCountRoll"), e.factionCountRoll ?? "—"), B(t.localize("TSG.Inspector.Label.FactionCountDM"), Z(e.factionCountDm)), B(t.localize("TSG.Inspector.Label.RawFactionCountResult"), e.factionCountRaw ?? "—"), B(t.localize("TSG.Inspector.Label.StoredFactions"), e.factionCount ?? "—"), B(t.localize("TSG.Inspector.Label.OutsideFactions"), e.outsideFactionCount ?? "—"), e.recursionLimitReached === !0 && B(t.localize("TSG.Inspector.Label.RecursionSafetyCeiling"), "Reached — further Government-7 expansion stopped"), n.length > 0 && zm("label", t.localize("TSG.Inspector.Label.FactionProfiles"), n.map((e) => {
		let t = e.governmentRoll === null || e.governmentRoll === void 0 ? "official government" : `Government 2D ${String(e.governmentRoll)} ${Gm(e.governmentModifier)} = ${String(e.governmentUnclampedTotal ?? "—")}`, n = e.strengthRoll === null || e.strengthRoll === void 0 ? String(e.strengthDescription ?? "Official government") : `Strength 2D ${String(e.strengthRoll)} → ${String(e.strengthCode ?? "—")} — ${String(e.strengthDescription ?? "—")}`, r = e.parentId ? ` — spawned under ${String(e.parentId)}` : "";
		return B(String(e.profile ?? e.id ?? "Faction"), `${String(e.governmentType ?? "—")} — ${t} — ${n}${r}`);
	})), r.length > 0 ? zm("label", t.localize("TSG.Inspector.Label.FactionRelationships"), r.map((e) => {
		let t = K(e.dmBreakdown).map(qm).join("; ");
		return B(String(e.profile ?? `${String(e.leftFactionId ?? "?")}+${String(e.rightFactionId ?? "?")}`), `${String(e.relationship ?? "—")} — 1D ${String(e.roll ?? "—")} ${Gm(e.dmTotal)} = ${String(e.total ?? "—")}${t ? ` — ${t}` : ""}`);
	})) : W(t.localize("TSG.Inspector.Hint.NoPairwiseFactionRelationshipsApplyBecauseThereIsOnlyOneStor")), U(t.localize("TSG.Inspector.Label.FactionNotes"), e.generationNotes));
}
function i_(e, t) {
	let n = (e) => e != null, r = z(B(t.localize("TSG.Inspector.Label.PopulationAllocationCase"), e.populationAllocationCase ?? "—"), n(e.largestNonMajorCityPopulation) && B(t.localize("TSG.Inspector.Label.LargestNonMajorCity"), Xg(e.largestNonMajorCityPopulation)), n(e.largestNonMajorCityRoll) && B(t.localize("TSG.Inspector.Label.LargestNonMajorCity1DRoll"), e.largestNonMajorCityRoll), n(e.allocationChunkPercent) && B(t.localize("TSG.Inspector.Label.AllocationChunkSize"), $g(e.allocationChunkPercent, 2)), n(e.allocationRemainderPercent) && B(t.localize("TSG.Inspector.Label.AllocationRemainder"), $g(e.allocationRemainderPercent, 2))), i = q(e.cities);
	return i.length ? [...r, zm("label", t.localize("TSG.Inspector.Label.IndividualCityAllocations"), i.map((e, n) => {
		let r = K(e.allocationRolls).map((e) => String(e)).join(", "), i = e.chunkCount === null || e.chunkCount === void 0 ? "—" : String(e.chunkCount);
		return B(t.format("TSG.Inspector.Social.City", { rank: String(e.rank ?? n + 1) }), `${Xg(e.population)} — ${$g(e.sharePercent, 2)} share — chunks ${i} — rolls ${r || "—"}`);
	}))] : r;
}
function a_(e, t) {
	return e ? z(B(t.localize("TSG.Inspector.Label.Centralisation"), `${String(e.code ?? "—")} — ${String(e.description ?? "—")}`), B("2D roll", e.roll ?? "—"), B(t.localize("TSG.Inspector.Label.DMTotal"), Z(e.dmTotal)), B(t.localize("TSG.Inspector.Label.FinalTotal"), e.total ?? "—"), e_(t.localize("TSG.Inspector.Label.CentralisationModifiers"), e.dmBreakdown), n_(G(e.authority), t)) : [W(t.localize("TSG.Inspector.Hint.NoWorldLevelWBHCentralisationAppliesOrHasBeenGenerated"))];
}
function o_(e, t) {
	if (!e) return [W(t.localize("TSG.Inspector.Hint.ThisWorldIsNotRepresentedAsAWBHBalkanisedGovernment7World"))];
	let n = q(e.factions);
	return z(B(t.localize("TSG.Inspector.Label.Representation"), e.representation ?? "—"), B(t.localize("TSG.Inspector.Label.D3FactionCountRoll"), e.factionCountRoll ?? "—"), B(t.localize("TSG.Inspector.Label.SovereignFactions"), e.factionCount ?? "—"), n.length > 0 && zm("label", t.localize("TSG.Inspector.Label.FactionGovernments"), n.map((e) => {
		let n = G(e.centralisation), r = G(n?.authority), i = G(r?.governmentProfile), a = q(G(r?.functionalStructure)?.functions).map((e) => `${String(e.functionCode ?? "—")}${String(e.code ?? "—")}`).join("/"), o = n ? ` — centralisation ${String(n.code ?? "—")} (${String(n.roll ?? "—")} ${Gm(n.dmTotal)} = ${String(n.total ?? "—")})` : "", s = r ? ` — authority ${String(r.code ?? "—")} ${String(r.authoritativeFunction ?? "—")} (${String(r.roll ?? "—")} ${Gm(r.dmTotal)} = ${String(r.total ?? "—")})` : "", c = a ? ` — structure ${a}` : "", l = i ? ` — profile ${String(i.profile ?? "—")}` : "", u = String(e.id ?? "Faction");
		return [B(u, `${Y(e.governmentCode)} — ${String(e.governmentType ?? "—")} — 2D ${String(e.governmentRoll ?? "—")} ${Gm(e.governmentModifier)} = ${String(e.governmentUnclampedTotal ?? "—")}${o}${s}${c}${l}`), zm("indented", t.format("TSG.Inspector.Social.InternalFactions", { faction: u }), r_(G(e.internalFactions), t))];
	})), U(t.localize("TSG.Inspector.Label.BalkanisationNotes"), e.generationNotes));
}
function s_(e, t = Q) {
	if (!e) return [W(t.localize("TSG.Inspector.Hint.NoGeneratedSocialProfileIsAvailableForThisBody"))];
	let n = G(e.populationDetails), r = G(e.populationConcentration), i = G(e.urbanisation), a = G(e.majorCities), o = G(e.governmentDetails), s = e.populationCode === 0, c = Yg(n, r, i, a), l = [B(t.localize("TSG.Inspector.Label.Habitation"), Zg(e.habitationStatus, t)), B(t.localize("TSG.Inspector.Label.Basis"), e.habitationBasis ?? "—")], u = n ? z(B(t.localize("TSG.Inspector.Label.WBHMethod"), n.method ?? "—"), B(t.localize("TSG.Inspector.Label.PopulationPhase1Prefix"), n.profilePrefix ?? "—"), B(t.localize("TSG.Inspector.Label.PopulationCode"), Y(n.populationCode)), B(t.localize("TSG.Inspector.Label.PValue"), n.pValue ?? "—"), B(t.localize("TSG.Inspector.Label.AdditionalSignificantDigit"), n.additionalSignificantDigit ?? "—"), B(t.localize("TSG.Inspector.Label.EstimatedPopulation"), Xg(n.estimatedPopulation)), B(t.localize("TSG.Inspector.Label.NativeSophontPopulationProcedure"), n.nativeSophontPopulationProcedure ?? "—"), U(t.localize("TSG.Inspector.Label.PopulationNotes"), n.generationNotes)) : [W(t.localize("TSG.Inspector.Hint.NoWBHPopulationPhase1DetailIsStoredForThisBody"))], d = r ? z(B(t.localize("TSG.Inspector.Label.PCR"), r.rating ?? "—"), B(t.localize("TSG.Inspector.Label.Concentration"), r.description ?? "—"), B(t.localize("TSG.Inspector.Label.SingleSettlementArea"), r.singleSettlementArea === !0 ? "Yes" : "No"), B(t.localize("TSG.Inspector.Label.LowPopulationSettlementRoll"), r.settlementAreaRoll ?? "—"), B(t.localize("TSG.Inspector.Label.PCRRoll"), r.pcrRoll ?? "—"), B(t.localize("TSG.Inspector.Label.DMTotal"), Z(r.dmTotal)), B(t.localize("TSG.Inspector.Label.UnclampedTotal"), r.unclampedTotal ?? "—"), B(t.localize("TSG.Inspector.Label.AllowedRange"), `${r.minimumRating ?? 0}–${r.maximumRating ?? 9}`), e_(t.localize("TSG.Inspector.Label.PCRModifiers"), r.dmBreakdown), U(t.localize("TSG.Inspector.Label.PCRNotes"), r.generationNotes)) : [W(t.localize(s ? "TSG.Inspector.Hint.Population0NoPopulationConcentrationRatingApplies" : "TSG.Inspector.Hint.NoWBHPopulationConcentrationRatingDetailIsStoredForThisBody"))], f = i ? z(B(t.localize("TSG.Inspector.Label.Urbanisation"), `${i.urbanisationPercent ?? "—"}%`), B(t.localize("TSG.Inspector.Label.TotalUrbanPopulation"), Xg(i.totalUrbanPopulation)), B(t.localize("TSG.Inspector.Label.PCRUsed"), i.pcr ?? "—"), B("2D roll", i.baseRoll ?? "—"), B(t.localize("TSG.Inspector.Label.DMTotal"), Z(i.dmTotal)), B(t.localize("TSG.Inspector.Label.TableResult"), i.tableResult ?? "—"), B(t.localize("TSG.Inspector.Label.TableRange"), i.tableRange ?? "—"), B(t.localize("TSG.Inspector.Label.RolledPercentage"), `${i.rolledPercentage ?? "—"}%`), G(i.appliedMinimum) && B(t.localize("TSG.Inspector.Label.AppliedMinimum"), Qg(i.appliedMinimum)), G(i.appliedMaximum) && B(t.localize("TSG.Inspector.Label.AppliedMaximum"), Qg(i.appliedMaximum)), e_(t.localize("TSG.Inspector.Label.UrbanisationModifiers"), i.dmBreakdown), U(t.localize("TSG.Inspector.Label.MinimumRestrictions"), i.minimumLimits, { format: Qg }), U(t.localize("TSG.Inspector.Label.MaximumRestrictions"), i.maximumLimits, { format: Qg }), U(t.localize("TSG.Inspector.Label.UrbanisationNotes"), i.generationNotes)) : [W(t.localize(s ? "TSG.Inspector.Hint.Population0NoUrbanisationPercentageApplies" : "TSG.Inspector.Hint.NoWBHUrbanisationDetailIsStoredForThisBody"))], p = a ? z(B(t.localize("TSG.Inspector.Label.WBHCase"), a.case ?? "—"), B(t.localize("TSG.Inspector.Label.MajorCities"), a.numberMajorCities ?? "—"), B(t.localize("TSG.Inspector.Label.CombinedMajorCityPopulation"), Xg(a.totalMajorCityPopulation)), B(t.localize("TSG.Inspector.Label.ShareOfUrbanPopulation"), $g(a.totalMajorCitySharePercent)), B("2D count roll", a.countRoll ?? "—"), B(t.localize("TSG.Inspector.Label.UnroundedCityCountResult"), typeof a.countUnrounded == "number" ? a.countUnrounded.toFixed(2).replace(/\.00$/, "") : "—"), B(t.localize("TSG.Inspector.Label.MajorCityPopulation1DRoll"), a.majorCityPopulationRoll ?? "—"), i_(a, t), U(t.localize("TSG.Inspector.Label.MajorCityNotes"), a.generationNotes)) : [W(t.localize(s ? "TSG.Inspector.Hint.Population0NoMajorCityProcedureApplies" : "TSG.Inspector.Hint.NoWBHMajorCitySummaryIsStoredForThisBody"))], m = c ? [
		B(t.localize("TSG.Inspector.Label.Profile"), c.profile),
		B(t.localize("TSG.Inspector.Label.Format"), "P-p.pp-C-%%-M"),
		B(t.localize("TSG.Inspector.Label.Population"), Y(c.populationCode)),
		B(t.localize("TSG.Inspector.Label.PValue"), c.pValueText),
		B(t.localize("TSG.Inspector.Label.PCR"), c.pcr),
		B(t.localize("TSG.Inspector.Label.Urbanisation"), `${c.urbanisationPercent}%`),
		B(t.localize("TSG.Inspector.Label.MajorCities"), c.numberMajorCities)
	] : [W(t.localize(s ? "TSG.Inspector.Hint.Population0NoWBHPopulationProfileApplies" : "TSG.Inspector.Hint.ACompleteWBHPopulationProfileRequiresPopulationPValuePCRUrba"))], h = o ? z(B(t.localize("TSG.Inspector.Label.GovernmentCode"), Y(o.governmentCode)), B(t.localize("TSG.Inspector.Label.GovernmentType"), o.governmentType ?? "—"), B(t.localize("TSG.Inspector.Label.Source"), o.source ?? "—"), B("2D roll", o.roll ?? "—"), B(t.localize("TSG.Inspector.Label.PopulationModifier"), Z(o.modifier)), B(t.localize("TSG.Inspector.Label.UnclampedResult"), o.unclampedTotal ?? "—"), U(t.localize("TSG.Inspector.Label.GovernmentNotes"), o.generationNotes)) : [W(t.localize("TSG.Inspector.Hint.NoWBHGovernmentTypeDetailIsStoredForThisBody"))], g = z(B(t.localize("TSG.Inspector.Label.UWP"), e.uwp ?? "—"), B(t.localize("TSG.Inspector.Label.Starport"), e.starport ?? "—"), B(t.localize("TSG.Inspector.Label.GovernmentCode"), Y(e.governmentCode)), B(t.localize("TSG.Inspector.Label.LawLevel"), Y(e.lawLevelCode)), B(t.localize("TSG.Inspector.Label.TechLevel"), Y(e.techLevel)), B(t.localize("TSG.Inspector.Label.MinimumSustainableTL"), e.minimumSustainableTechLevel ?? "—"), U(t.localize("TSG.Inspector.Label.MinimumTLBasis"), e.minimumSustainableTechLevelBasis), B(t.localize("TSG.Inspector.Label.TradeCodes"), K(e.tradeCodes).map((e) => String(e)).join(" ") || "—"), B(t.localize("TSG.Inspector.Label.Importance"), e.importance ?? "—"), typeof e.notes == "string" && e.notes && B(t.localize("TSG.Inspector.Label.Notes"), e.notes), W(t.localize("TSG.Inspector.Hint.MainworldDesignationAndHabitationAreIndependentUninhabitedMa"))), _ = (e, n) => zm("heading", t.localize(e), n);
	return [
		_("TSG.Inspector.Section.Habitation", l),
		_("TSG.Inspector.Section.Population", u),
		_("TSG.Inspector.Section.PopulationConcentration", d),
		_("TSG.Inspector.Section.Urbanisation", f),
		_("TSG.Inspector.Section.MajorCities", p),
		_("TSG.Inspector.Section.PopulationProfile", m),
		_("TSG.Inspector.Section.Government", h),
		_("TSG.Inspector.Section.CentralisationAuthorityStructureProfile", a_(G(e.governmentCentralisation), t)),
		_("TSG.Inspector.Section.GovernmentFactions", e.governmentCode === 7 ? [W(t.localize("TSG.Inspector.Hint.Government7UsesTheSovereignBalkanisationLayerBelowInternalFa"))] : r_(G(e.governmentFactions), t)),
		_("TSG.Inspector.Section.Balkanisation", o_(G(e.balkanisation), t)),
		_("TSG.Inspector.Section.CurrentUWPSocialValues", g)
	];
}
//#endregion
//#region src/integrations/foundry/technologyInspectorRows.ts
function c_(e) {
	return e === !0 ? "Yes" : e === !1 ? "No" : "—";
}
function l_(e, t) {
	let n = q(e).map((e) => {
		let t = typeof e.source == "string" ? e.source : "DM", n = typeof e.dm == "number" ? e.dm : 0;
		return `${t} ${n >= 0 ? "+" : ""}${n}`;
	});
	return n.length ? n.join("; ") : t.localize("TSG.Inspector.Value.None");
}
function u_(e) {
	let t = G(e);
	return t ? `2D ${t.roll ?? "—"} → ${typeof t.modifier == "number" && t.modifier >= 0 ? "+" : ""}${t.modifier ?? "—"}` : "—";
}
function d_(e, t, n) {
	let r = G(t);
	return r ? H(e, [
		B(n.localize("TSG.Inspector.Label.Status"), r.status ?? "complete"),
		B(n.localize("TSG.Inspector.Label.TechLevel"), r.techLevel ?? "—"),
		B(n.localize("TSG.Inspector.Label.BaseTL"), r.baseTechLevel ?? "—"),
		B(n.localize("TSG.Inspector.Label.TLM"), u_(r.tlm)),
		B(n.localize("TSG.Inspector.Label.DMs"), l_(r.dmBreakdown, n)),
		B(n.localize("TSG.Inspector.Label.DMTotal"), r.dmTotal ?? 0),
		B(n.localize("TSG.Inspector.Label.UnboundedTL"), r.unboundedTechLevel ?? "—"),
		B(n.localize("TSG.Inspector.Label.Bounds"), `${r.lowerBound ?? "—"} to ${r.upperBound ?? "—"}`)
	]) : B(e, "—");
}
var f_ = (e, t) => {
	let n = G(e);
	return n ? [
		B(t.localize("TSG.Inspector.Label.HighCommonTLInput"), n.highCommonTechLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.MinimumSustainableTL"), n.minimumSustainableTechLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.EnvironmentalMeetsSustainableMinimum"), c_(n.environmentalMeetsSustainableMinimum)),
		d_(t.localize("TSG.Inspector.Section.Energy"), n.energy, t),
		d_(t.localize("TSG.Inspector.Section.Electronics"), n.electronics, t),
		d_(t.localize("TSG.Inspector.Section.Manufacturing"), n.manufacturing, t),
		d_(t.localize("TSG.Inspector.Section.Medical"), n.medical, t),
		d_(t.localize("TSG.Inspector.Section.Environmental"), n.environmental, t)
	] : [W(t.localize("TSG.Inspector.Hint.NoWBHQualityOfLifeTechnologyDetailsAreStored"))];
}, p_ = (e, t) => {
	let n = G(e);
	return n ? [
		B(t.localize("TSG.Inspector.Label.EnergyTLInput"), n.energyTechLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.ElectronicsTLInput"), n.electronicsTechLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.ManufacturingTLInput"), n.manufacturingTechLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.PCR"), n.pcr ?? "Unavailable for this faction candidate"),
		d_(t.localize("TSG.Inspector.Section.Land"), n.land, t),
		d_(t.localize("TSG.Inspector.Section.Water"), n.water, t),
		d_(t.localize("TSG.Inspector.Section.Air"), n.air, t),
		d_(t.localize("TSG.Inspector.Section.Space"), n.space, t)
	] : [W(t.localize("TSG.Inspector.Hint.NoWBHTransportationTechnologyDetailsAreStored"))];
}, m_ = (e, t) => {
	let n = G(e);
	return n ? [
		B(t.localize("TSG.Inspector.Label.ManufacturingTLInput"), n.manufacturingTechLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.ElectronicsTLInput"), n.electronicsTechLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.Population"), n.populationCode ?? "Unavailable for this faction candidate"),
		B(t.localize("TSG.Inspector.Label.Government"), n.governmentCode ?? "—"),
		B(t.localize("TSG.Inspector.Label.OverallLawLevel"), n.overallLawLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.WeaponsArmourLawLevel"), n.weaponsAndArmourLawLevel ?? "Unavailable / incomplete"),
		B(t.localize("TSG.Inspector.Label.IndustrialStatus"), n.industrial === !0 ? "Yes" : n.industrial === !1 ? "No" : "Unavailable for this faction candidate"),
		B(t.localize("TSG.Inspector.Label.Government7WorldRule"), n.worldGovernmentSeven === !0 ? "Applies" : "No"),
		d_(t.localize("TSG.Inspector.Section.PersonalMilitary"), n.personal, t),
		d_(t.localize("TSG.Inspector.Section.HeavyMilitary"), n.heavy, t)
	] : [W(t.localize("TSG.Inspector.Hint.NoWBHMilitaryTechnologyDetailsAreStored"))];
}, h_ = (e, t) => {
	let n = G(e);
	return n ? [
		B(t.localize("TSG.Inspector.Label.Status"), n.status ?? "—"),
		B(t.localize("TSG.Inspector.Label.NoveltyTL"), n.techLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.HighCommonTLInput"), n.highCommonTechLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.MinimumSustainableTL"), n.minimumSustainableTechLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.HighestSubcategoryTL"), n.highestSubcategoryTechLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.NearbyRichIndustrialClassATL"), n.nearbyRichIndustrialClassATechLevel ?? "Unresolved / none established"),
		B(t.localize("TSG.Inspector.Label.PreviousCultureTL"), n.previousCultureTechLevel ?? "Unresolved / none established"),
		B(t.localize("TSG.Inspector.Label.SurvivablePrototypeTL"), n.survivablePrototypeTechLevel ?? "Not required"),
		B(t.localize("TSG.Inspector.Label.UnresolvedFactors"), K(n.unresolvedFactors).join(", ") || "None"),
		H(t.localize("TSG.Inspector.Section.NoveltyFactors"), q(n.factors).map((e) => B(String(e.source ?? "Factor"), `${e.status ?? "—"}${typeof e.techLevel == "number" ? ` — TL${e.techLevel}` : ""}: ${e.note ?? ""}`)))
	] : [W(t.localize("TSG.Inspector.Hint.NoWBHNoveltyTechnologyDetailsAreStored"))];
}, g_ = (e, t) => {
	let n = G(e);
	if (!n) return [W(t.localize("TSG.Inspector.Hint.NoFinalWBHTechnologyProfileIsStored"))];
	let r = G(n.components);
	return [
		B(t.localize("TSG.Inspector.Label.Status"), n.status ?? "—"),
		B(t.localize("TSG.Inspector.Label.TechnologyProfile"), n.profile ?? "—"),
		B(t.localize("TSG.Inspector.Label.Format"), "H-L-QQQQQ-TTTT-MM-N"),
		B(t.localize("TSG.Inspector.Label.HighLowCommon"), `${r?.highCommon ?? "—"} / ${r?.lowCommon ?? "—"}`),
		B(t.localize("TSG.Inspector.Label.QualityOfLife"), `${r?.energy ?? "—"}, ${r?.electronics ?? "—"}, ${r?.manufacturing ?? "—"}, ${r?.medical ?? "—"}, ${r?.environmental ?? "—"}`),
		B(t.localize("TSG.Inspector.Label.Transportation"), `${r?.land ?? "—"}, ${r?.water ?? "—"}, ${r?.air ?? "—"}, ${r?.space ?? "—"}`),
		B(t.localize("TSG.Inspector.Label.Military"), `${r?.personalMilitary ?? "—"}, ${r?.heavyMilitary ?? "—"}`),
		B(t.localize("TSG.Inspector.Label.Novelty"), r?.novelty ?? "—"),
		B(t.localize("TSG.Inspector.Label.ProvisionalReasons"), K(n.provisionalReasons).join("; ") || "None")
	];
};
function __(e, t) {
	let n = G(e.commonTechnologyDetails);
	if (!n) return [W(t.localize("TSG.Inspector.Hint.NoWBHCommonTechnologyDetailsAreStoredForThisBody"))];
	let r = G(n.minimumSustainable);
	return [
		B(t.localize("TSG.Inspector.Label.UWPHighCommonTL"), n.highCommonTechLevel ?? e.techLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.LowCommonTL"), n.lowCommonTechLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.LowCommonTLM"), u_(n.lowCommonTlm)),
		B(t.localize("TSG.Inspector.Label.LowCommonDMs"), l_(n.lowCommonDmBreakdown, t)),
		B(t.localize("TSG.Inspector.Label.LowCommonUnboundedTL"), n.lowCommonUnbounded ?? "—"),
		B(t.localize("TSG.Inspector.Label.LowCommonBounds"), `${n.lowCommonLowerBound ?? "—"} to ${n.lowCommonUpperBound ?? "—"}`),
		B(t.localize("TSG.Inspector.Label.MinimumSustainableTL"), r?.minimumTechLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.AtmosphereMinimumTL"), r?.atmosphereMinimum ?? "—"),
		B(t.localize("TSG.Inspector.Label.HabitabilityMinimumTL"), r?.habitabilityMinimum ?? "—"),
		B(t.localize("TSG.Inspector.Label.ProsperousLowCommonMinimum"), r?.prosperousLowCommonMinimum ?? "—"),
		B(t.localize("TSG.Inspector.Label.HighCommonSustainable"), c_(n.highCommonMeetsSustainableMinimum)),
		B(t.localize("TSG.Inspector.Label.LowCommonProsperous"), c_(n.lowCommonMeetsProsperousMinimum))
	];
}
function v_(e, t) {
	let n = G(e.balkanisedCommonTechnologyDetails);
	return n ? H(t.localize("TSG.Inspector.Section.Government7CommonTLCandidates"), [
		B(t.localize("TSG.Inspector.Label.HostFactionEstablished"), n.hostFactionId ?? "No — Referee choice remains unresolved"),
		B(t.localize("TSG.Inspector.Label.WorldHighCommonTL"), n.worldHighCommonTechLevel ?? "—"),
		B(t.localize("TSG.Inspector.Label.WorldLowCommonTL"), n.worldLowCommonTechLevel ?? "—"),
		...q(n.factions).map((e) => {
			let n = G(e.hostOrAdjacentCandidate), r = G(e.nonHostCandidate);
			return H(`Faction ${e.factionId ?? "?"}`, [
				B(t.localize("TSG.Inspector.Label.Government"), e.governmentCode ?? "—"),
				B(t.localize("TSG.Inspector.Label.HostAdjacentHighLow"), `${n?.highCommonTechLevel ?? "—"} / ${n?.lowCommonTechLevel ?? "—"}`),
				B(t.localize("TSG.Inspector.Label.NonHostStatus"), r?.status ?? "—"),
				B(t.localize("TSG.Inspector.Label.NonHostHighCommonTL"), r?.highCommonTechLevel ?? "—"),
				B(t.localize("TSG.Inspector.Label.NonHostHighTLM"), u_(r?.highCommonTlm)),
				B(t.localize("TSG.Inspector.Label.NonHostHighDMs"), l_(r?.highCommonDmBreakdown, t)),
				B(t.localize("TSG.Inspector.Label.NonHostLowCommonTL"), r?.lowCommonTechLevel ?? "Incomplete — faction PCR not established"),
				B(t.localize("TSG.Inspector.Label.NonHostLowDMs"), l_(r?.lowCommonDmBreakdown, t))
			]);
		})
	]) : null;
}
function y_(e, t, n, r) {
	let i = G(e);
	if (!i) return [W(n)];
	let a = G(i.world);
	if (a) return t(a, r);
	let o = q(i.factions);
	return o.length ? o.map((e) => H(r.format("TSG.Inspector.Technology.FactionCandidates", { faction: String(e.factionId ?? "?") }), [H(r.localize("TSG.Inspector.Section.StarportHostAdjacent"), t(e.hostOrAdjacent, r), !0), H(r.localize("TSG.Inspector.Section.NonHost"), t(e.nonHost, r), !1)])) : [W(n)];
}
function b_(e, t = Q) {
	let n = G(e);
	if (!n) return [W(t.localize("TSG.Inspector.Hint.NoInhabitedSocialProfileIsStoredForThisBody"))];
	if (n.populationCode === 0) return [W(t.localize("TSG.Inspector.Hint.Population0NoInhabitedWorldTechnologyProfileIsGenerated"))];
	let r = (e, n, r, i) => H(t.localize(e), y_(n, r, t.localize(i), t), !0);
	return z(r("TSG.Inspector.Section.TechnologyProfile", n.technologyProfileDetails, g_, "TSG.Inspector.Hint.NoFinalWBHTechnologyProfileIsStored"), H(t.localize("TSG.Inspector.Section.CommonTechnology"), __(n, t), !0), v_(n, t), r("TSG.Inspector.Section.QualityOfLifeTechnology", n.qualityOfLifeTechnologyDetails, f_, "TSG.Inspector.Hint.NoWBHQualityOfLifeTechnologyDetailsAreStored"), r("TSG.Inspector.Section.TransportationTechnology", n.transportationTechnologyDetails, p_, "TSG.Inspector.Hint.NoWBHTransportationTechnologyDetailsAreStored"), r("TSG.Inspector.Section.MilitaryTechnology", n.militaryTechnologyDetails, m_, "TSG.Inspector.Hint.NoWBHMilitaryTechnologyDetailsAreStored"), r("TSG.Inspector.Section.NoveltyTechnology", n.noveltyTechnologyDetails, h_, "TSG.Inspector.Hint.NoWBHNoveltyTechnologyDetailsAreStored"), W(t.localize("TSG.Inspector.Hint.SecondaryTechnology")));
}
//#endregion
//#region src/rules/worlds/wbhCityInformation.ts
function x_(e) {
	return Math.trunc(e).toLocaleString("en-US");
}
function S_(e, t, n, r) {
	return `${e}${t.length ? ` (${t.join(", ")})` : ""}: ${x_(n)}: ${r ?? "—"}`;
}
function C_(e) {
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
				profile: S_(t, n, e.population, null)
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
var w_ = [
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
function T_(e) {
	return w_.find((t) => t.code === e) ?? null;
}
function E_(e, t) {
	return e.some((e) => e === t || e.startsWith(`${t} `) || e.endsWith(`(${t})`));
}
function D_(e) {
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
	].includes(e.atmosphereCode) ? n("Atmosphere 0, 1, or A", 2) : e.atmosphereCode === 11 ? n("Atmosphere B", 3) : e.atmosphereCode === 12 && n("Atmosphere C", 4), e.techLevel >= 16 ? n("TL16+", 3) : e.techLevel >= 13 ? n("TL13–15", 2) : e.techLevel >= 9 && n("TL9–12", 1), E_(e.tradeCodes, "In") && n("Industrial", 1), E_(e.tradeCodes, "Ni") && n("Non-Industrial", -1), E_(e.tradeCodes, "Ri") && n("Rich", 1), E_(e.tradeCodes, "Po") && n("Poor", -1);
	let r = t.reduce((e, t) => e + t.dm, 0);
	return {
		target: 12,
		dmTotal: r,
		effectiveNaturalRollRequired: Math.max(2, 12 - r),
		dmBreakdown: t
	};
}
function O_(e, t) {
	let n = T_(e);
	return !!(n && t >= n.minimumTechLevel);
}
function k_(e, t, n) {
	let r = n?.[String(t)];
	return r?.code ? e.includes(r.code) ? [...e] : [...e, r.code] : [...e];
}
//#endregion
//#region src/integrations/foundry/unusualCityEditor.ts
var A_ = "traveller-system-generator";
function j_(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function M_(e) {
	return typeof e == "string" && e.length ? e : null;
}
function N_(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function P_(e) {
	return j_(e.flags?.[A_]);
}
function F_(e) {
	let t = {};
	for (let [n, r] of Object.entries(Ip(P_(e), "cityOverrides"))) {
		let e = j_(r), i = N_(e?.cityRank), a = M_(e?.code), o = M_(e?.description), s = e?.source === "custom" ? "custom" : e?.source === "standard" ? "standard" : null;
		i !== null && a && o && s && (t[n] = {
			cityRank: i,
			code: a,
			description: o,
			source: s
		});
	}
	return t;
}
function I_(e) {
	return e?.source === "custom" ? {
		action: "custom",
		standardCode: w_[0]?.code ?? "",
		customCode: e.code,
		customDescription: e.description
	} : {
		action: "standard",
		standardCode: e?.source === "standard" ? e.code : w_[0]?.code ?? "",
		customCode: "",
		customDescription: ""
	};
}
function L_(e) {
	return q_(e).find((e) => e.isMainworld);
}
function R_(e) {
	let t = L_(e)?.social, n = j_(t?.majorCities);
	return Array.isArray(n?.cities) ? n.cities.flatMap((e) => {
		let t = j_(e), n = N_(t?.rank), r = N_(t?.population);
		return n !== null && r !== null ? [{
			rank: n,
			population: r
		}] : [];
	}) : [];
}
function z_(e) {
	return e.type === "world" && !!L_(e)?.social && R_(e).length > 0;
}
function B_(e, t, n, r) {
	let i = L_(e), a = i?.social, o = R_(e), s = N_(a?.techLevel) ?? 0, c = D_({
		starport: M_(a?.starport),
		hasHighport: !1,
		atmosphereCode: N_(i?.physical?.atmosphereCode) ?? 0,
		techLevel: s,
		tradeCodes: Array.isArray(a?.tradeCodes) ? a.tradeCodes.map(String) : []
	}), l = F_(e), u = c.dmTotal >= 0 ? `+${c.dmTotal}` : String(c.dmTotal), d = R(n, "cityRank") ?? String(o[0]?.rank ?? ""), f = n === null || r === "cityRank" ? I_(l[d]) : {
		action: R(n, "cityAction") ?? "standard",
		standardCode: R(n, "standardCode") ?? "",
		customCode: R(n, "customCode") ?? "",
		customDescription: R(n, "customDescription") ?? ""
	};
	return [
		Nm(t.localize("TSG.Editor.UnusualCity.Intro")),
		Im(t.localize("TSG.Editor.UnusualCity.WorldGuidance"), {
			lines: [t.format("TSG.Editor.UnusualCity.Guidance", {
				techLevel: s,
				dm: u,
				roll: c.effectiveNaturalRollRequired
			})],
			hints: [...c.dmBreakdown.length ? [c.dmBreakdown.map((e) => `${e.source}: DM${e.dm >= 0 ? "+" : ""}${e.dm}`).join("; ")] : [], t.localize("TSG.Editor.UnusualCity.HighportHint")]
		}),
		L("cityRank", t.localize("TSG.Editor.UnusualCity.MajorCity"), o.map((e) => {
			let n = l[String(e.rank)], r = {
				rank: e.rank,
				population: e.population.toLocaleString()
			};
			return I(String(e.rank), n ? t.format("TSG.Editor.UnusualCity.CityOptionCurrent", {
				...r,
				code: n.code
			}) : t.format("TSG.Editor.UnusualCity.CityOption", r), d);
		})),
		L("cityAction", t.localize("TSG.Editor.UnusualCity.Action"), [
			I("standard", t.localize("TSG.Editor.UnusualCity.AssignWBHUnusualCityType"), f.action),
			I("custom", t.localize("TSG.Editor.UnusualCity.AssignCustomRefereeType"), f.action),
			I("clear", t.localize("TSG.Editor.UnusualCity.ClearUnusualCityDesignation"), f.action)
		]),
		L("standardCode", t.localize("TSG.Editor.UnusualCity.UnusualCityType"), w_.map((e) => {
			let n = s < e.minimumTechLevel;
			return I(e.code, t.format(n ? "TSG.Editor.UnusualCity.TypeOptionUnavailable" : "TSG.Editor.UnusualCity.TypeOption", {
				code: e.code,
				name: e.name,
				minimumTechLevel: e.minimumTechLevel
			}), f.standardCode, n);
		}), { hidden: f.action !== "standard" }),
		Dm("customCode", t.localize("TSG.Editor.UnusualCity.CustomCode"), f.customCode, {
			maxLength: 4,
			placeholder: "Mx",
			hidden: f.action !== "custom"
		}),
		Dm("customDescription", t.localize("TSG.Editor.UnusualCity.Description"), f.customDescription, {
			maxLength: 120,
			placeholder: t.localize("TSG.Editor.UnusualCity.DescriptionPlaceholder"),
			hidden: f.action !== "custom",
			hint: t.localize("TSG.Editor.UnusualCity.CustomTypeHint")
		})
	];
}
async function V_(e, t) {
	let n = t.localizer ?? Q;
	if (!t.isGameMaster()) return;
	if (!z_(e)) {
		t.notifyWarning(n.localize("TSG.UnusualCity.Unavailable"));
		return;
	}
	let r = await t.showForm({
		title: n.format("TSG.UnusualCity.Title", { name: e.name }),
		submitLabel: n.localize("TSG.Editor.Apply"),
		width: 560,
		refreshOn: ["cityRank", "cityAction"],
		fields: (t, r) => B_(e, n, t, r)
	});
	if (!r) return;
	let i = Number(r.cityRank);
	if (!Number.isInteger(i) || !R_(e).some((e) => e.rank === i)) {
		t.notifyWarning(n.localize("TSG.UnusualCity.SelectCity"));
		return;
	}
	let a = { ...F_(e) }, o = M_(r.cityAction) ?? "standard";
	if (o === "clear") delete a[String(i)];
	else if (o === "custom") {
		let e = M_(r.customCode)?.trim(), o = M_(r.customDescription)?.trim();
		if (!e || !/^[A-Za-z0-9]{1,4}$/.test(e) || !o) {
			t.notifyWarning(n.localize("TSG.UnusualCity.CustomInvalid"));
			return;
		}
		a[String(i)] = {
			cityRank: i,
			code: e,
			description: o,
			source: "custom"
		};
	} else {
		let o = M_(r.standardCode), s = N_(L_(e)?.social?.techLevel) ?? 0, c = w_.find((e) => e.code === o);
		if (!o || !c) {
			t.notifyWarning(n.localize("TSG.UnusualCity.SelectType"));
			return;
		}
		if (!O_(o, s)) {
			t.notifyWarning(n.format("TSG.UnusualCity.TechLevelTooLow", {
				code: o,
				required: c.minimumTechLevel,
				techLevel: s
			}));
			return;
		}
		a[String(i)] = {
			cityRank: i,
			code: o,
			description: c.name,
			source: "standard"
		};
	}
	try {
		await e.update(Lp("cityOverrides", a)), e.sheet?.render(!0), t.notifyInfo(n.format(o === "clear" ? "TSG.UnusualCity.Cleared" : "TSG.UnusualCity.Updated", { rank: i }));
	} catch (e) {
		t.notifyError(n.format("TSG.UnusualCity.Failed", { message: e instanceof Error ? e.message : String(e) }));
	}
}
//#endregion
//#region src/integrations/foundry/unusualCityInspectorRows.ts
function H_(e, t = Q) {
	let n = q_(e, t).find((e) => e.isMainworld), r = n?.social, i = C_(G(r?.majorCities));
	if (!n || !r || !i) return [W(t.localize("TSG.Inspector.Hint.NoGeneratedMajorCitiesAreAvailableForUnusualCityDesignation"))];
	let a = Wm(r.techLevel) ?? 0, o = D_({
		starport: J(r.starport),
		hasHighport: !1,
		atmosphereCode: Wm(n.physical?.atmosphereCode) ?? 0,
		techLevel: a,
		tradeCodes: Array.isArray(r.tradeCodes) ? r.tradeCodes.map(String) : []
	}), s = F_(e), c = o.dmTotal >= 0 ? `+${o.dmTotal}` : String(o.dmTotal), l = i.cities.map((e) => {
		let n = s[String(e.rank)], r = k_(e.codes, e.rank, s), i = `${e.name}${r.length ? ` (${r.join(", ")})` : ""}: ${Math.trunc(e.population).toLocaleString("en-US")}: ${e.port ?? "—"}`, a = n ? `${i} — ${n.description}${n.source === "custom" ? " — custom Referee type" : ""}` : `${i} — normal city / no unusual designation`;
		return B(t.format("TSG.Inspector.Social.MajorCity", { rank: String(e.rank) }), a);
	});
	return [
		B(t.localize("TSG.Inspector.Label.WorldTechLevel"), a),
		B(t.localize("TSG.Inspector.Label.OptionalOccurrenceCheck"), `2D 12+; world DM ${c}; natural roll ${o.effectiveNaturalRollRequired}+ required`),
		B(t.localize("TSG.Inspector.Label.AutomaticAssignment"), "None — Referee controlled"),
		B(t.localize("TSG.Inspector.Label.HighportModifier"), "Not applied — no highport has been established by TSG yet"),
		U(t.localize("TSG.Inspector.Label.OptionalOccurrenceModifiers"), o.dmBreakdown, { format: (e) => {
			let t = e;
			return `${t.source}: DM${t.dm >= 0 ? "+" : ""}${t.dm}`;
		} }) ?? W(t.localize("TSG.Inspector.Hint.NoOptionalUnusualCityOccurrenceDMsApply")),
		zm("label", t.localize("TSG.Inspector.Label.MajorCityDesignations"), l)
	];
}
//#endregion
//#region src/integrations/foundry/wbhInspector.ts
var U_ = "traveller-system-generator";
function W_(e) {
	return G(G(e.flags?.[U_])?.sensorSystem);
}
function G_(e) {
	return e.type === "world" && Array.isArray(W_(e)?.bodies);
}
function K_(e, t) {
	return K(G(G(e.physical?.details)?.satellites)?.moons).flatMap((n, r) => {
		let i = G(n);
		if (!i) return [];
		let a = G(i.physical), o = J(i.sourceId) ?? `${e.id}.moon-${r + 1}`, s = i.isMainworld === !0;
		return [{
			id: o,
			label: `↳ ${o}${s ? " ★" : ""} — Moon (Size ${String(i.sizeCode ?? a?.sizeCode ?? "?")})`,
			parentId: e.id,
			kind: a && G(G(a.details)?.gasGiant) ? t.localize("TSG.Inspector.Value.GasGiantMoon") : t.localize("TSG.Inspector.Value.Moon"),
			isMainworld: s,
			physical: a,
			social: G(i.social),
			source: i
		}];
	});
}
function q_(e, t = Q) {
	return K(W_(e)?.bodies).flatMap((e, n) => {
		let r = G(e);
		if (!r) return [];
		let i = J(r.sourceId) ?? `body-${n + 1}`, a = G(r.physical), o = G(r.social), s = J(o?.uwp) ?? J(a?.uwpPhysical) ?? "—", c = J(r.worldKind) ?? t.localize("TSG.Inspector.Label.Body"), l = r.isMainworld === !0;
		return [{
			id: i,
			label: `${i}${l ? " ★" : ""} — ${c} — ${s}`,
			parentId: null,
			kind: c,
			isMainworld: l,
			physical: a,
			social: o,
			source: r
		}];
	}).flatMap((e) => [e, ...K_(e, t)]);
}
function J_(e, t) {
	let n = G(e.criterionWins), r = [
		n?.highestHabitability === !0 ? t.localize("TSG.Inspector.Criterion.Habitability") : null,
		n?.nativeSophontsPresent === !0 ? t.localize("TSG.Inspector.Criterion.Sophonts") : null,
		n?.highestResources === !0 ? t.localize("TSG.Inspector.Criterion.Resources") : null,
		n?.bestRefuelling === !0 ? t.localize("TSG.Inspector.Criterion.Refuelling") : null
	].filter((e) => !!e);
	return r.length ? r.join(", ") : t.localize("TSG.Inspector.Value.None");
}
function Y_(e, t) {
	let n = G(W_(e)?.mainworldDetermination);
	if (!n) return [W(t.localize("TSG.Inspector.Hint.NoWBHFinalMainworldDeterminationIsStoredForThisSystem"))];
	let r = t.localize("TSG.Inspector.Value.Recommended"), i = q(n.candidates).map((e) => [
		`${String(e.id ?? "")}${e.id === n.selectedMainworldId ? " ★" : ""}`,
		String(e.kind ?? "—"),
		String(e.habitabilityRating ?? "—"),
		Km(e.nativeSophontsPresent, t),
		String(e.resourceRating ?? "—"),
		String(G(e.refuelling)?.description ?? "—"),
		String(e.totalCriterionWins ?? 0),
		`${J_(e, t)}${e.id === n.recommendedMainworldId ? ` ${r}` : ""}`
	]);
	return z(B(t.localize("TSG.Inspector.Label.RecommendedBody"), n.recommendedMainworldId ?? "—"), B(t.localize("TSG.Inspector.Label.SelectedBody"), n.selectedMainworldId ?? "—"), B(t.localize("TSG.Inspector.Label.SelectionSource"), n.selectionSource ?? "—"), Hm([
		t.localize("TSG.Inspector.Label.Body"),
		t.localize("TSG.Inspector.Label.Kind"),
		t.localize("TSG.Inspector.Label.Hab"),
		t.localize("TSG.Inspector.Label.Sophonts"),
		t.localize("TSG.Inspector.Label.Res"),
		t.localize("TSG.Inspector.Label.Refuelling"),
		t.localize("TSG.Inspector.Label.Wins"),
		t.localize("TSG.Inspector.Label.WinningCriteria")
	], i), U(t.localize("TSG.Inspector.Label.MethodNotes"), n.explanation, { muted: !0 }));
}
function X_(e, t) {
	return [
		V(t.localize("TSG.Inspector.Section.FinalMainworldDetermination"), Y_(e, t), !0),
		V(t.localize("TSG.Inspector.Section.SecondaryWorldPopulations"), Jg(W_(e)?.secondaryPopulationPlan ?? null, t)),
		V(t.localize("TSG.Inspector.Section.SecondaryWorldGovernments"), Kg(e, t)),
		V(t.localize("TSG.Inspector.Section.UnusualCities"), H_(e, t))
	];
}
function Z_(e, t) {
	let n = e.physical;
	return {
		id: e.id,
		label: e.label,
		summary: [B(t.localize("TSG.Inspector.Label.ParentBody"), e.parentId ?? "Top-level system body"), B(t.localize("TSG.Inspector.Label.UWPPhysicalProfile"), J(e.social?.uwp) ?? J(n?.uwpPhysical) ?? "—")],
		sections: [
			V(t.localize("TSG.Inspector.Section.UWPDetailedConsistency"), ug(n, t), !0),
			V(t.localize("TSG.Inspector.Section.SocialCharacteristics"), s_(e.social, t)),
			V(t.localize("TSG.Inspector.Section.Justice"), dh(e.social, t)),
			V(t.localize("TSG.Inspector.Section.Technology"), b_(e.social, t)),
			V(t.localize("TSG.Inspector.Section.Physical"), dg(n, t), !0),
			V(t.localize("TSG.Inspector.Section.Atmosphere"), pg(n, t)),
			V(t.localize("TSG.Inspector.Section.HydrographicsClimate"), hg(n, t)),
			V(t.localize("TSG.Inspector.Section.TemperatureExtremes"), gg(n, t)),
			V(t.localize("TSG.Inspector.Section.RotationTides"), _g(n, t)),
			V(t.localize("TSG.Inspector.Section.Seismology"), vg(n, t)),
			V(t.localize("TSG.Inspector.Section.SurfaceGeology"), yg(n, t)),
			V(t.localize("TSG.Inspector.Section.SurfaceClimate"), bg(n, t)),
			V(t.localize("TSG.Inspector.Section.Satellites"), xg(n, t)),
			V(t.localize("TSG.Inspector.Section.NativeLife"), Sg(n, t)),
			V(t.localize("TSG.Inspector.Section.ResourceRating"), Cg(n, t)),
			V(t.localize("TSG.Inspector.Section.HabitabilityRating"), wg(n, t)),
			V(t.localize("TSG.Inspector.Section.RawStoredBodyData"), Um(JSON.stringify(e.source, null, 2)))
		]
	};
}
function Q_(e, t) {
	let n = bm(e, t);
	return n ? {
		view: xm(e, n.payload),
		notesMissing: n.notes === "unavailable"
	} : {
		view: e,
		notesMissing: !1
	};
}
function $_(e, t, n) {
	let r = t.localizer ?? Q, { view: i, notesMissing: a } = Q_(e, n), o = q_(i, r), s = o.find((e) => e.isMainworld) ?? o[0] ?? null, c = G(W_(e)?.mainworldDetermination), l = J(c?.selectedMainworldId), u = X_(i, r), d = /* @__PURE__ */ new Map(), f = (e) => {
		let t = d.get(e.id);
		return t || d.set(e.id, t = Z_(e, r)), t;
	}, p = {
		body: r.localize("TSG.Inspector.Label.Body"),
		mainworldSelection: r.localize("TSG.Inspector.Label.GMMainworldSelection"),
		mainworldHint: r.localize("TSG.Inspector.Hint.MainworldOverride"),
		readOnly: r.localize("TSG.Inspector.Hint.ReadOnly"),
		close: r.localize("TSG.Inspector.Close")
	}, m = q(c?.candidates).map((e) => {
		let t = J(e.id) ?? "";
		return {
			value: t,
			label: `${t} — ${J(e.kind) ?? p.body}`,
			selected: t === (l ?? "")
		};
	});
	return {
		title: r.format("TSG.Inspector.Title", { name: e.name }),
		initialBodyId: s?.id ?? null,
		context(e) {
			let t = o.find((t) => t.id === e) ?? s;
			return {
				labels: p,
				empty: t ? null : r.localize("TSG.Inspector.Hint.NoBodies"),
				bodyOptions: o.map((e) => ({
					value: e.id,
					label: e.label,
					selected: e.id === t?.id
				})),
				mainworldOptions: m,
				notesMissing: a ? r.localize("TSG.Inspector.NotesUnavailable") : null,
				systemSections: u,
				body: t ? f(t) : null
			};
		},
		async submit(i) {
			let a = J(i.wbhMainworldOverrideId);
			if (!(!n || !a || a === l)) try {
				await Gh(e, a, n) ? t.notifyInfo(r.format("TSG.Inspector.MainworldChanged", { id: a })) : t.notifyWarning(r.localize("TSG.Inspector.MainworldUnavailable"));
			} catch (e) {
				t.notifyError(r.format("TSG.Inspector.MainworldFailed", { message: e instanceof Error ? e.message : String(e) }));
			}
		}
	};
}
async function ev(e, t, n) {
	let r = t.localizer ?? Q;
	if (t.isGameMaster()) {
		if (!G_(e)) {
			t.notifyWarning(r.localize("TSG.Inspector.NoData"));
			return;
		}
		t.showInspector($_(e, t, n));
	}
}
//#endregion
//#region src/integrations/foundry/habitationOverride.ts
function tv(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function nv(e) {
	return typeof e == "string" && e.length ? e : null;
}
function rv(e) {
	let t = Bp(e);
	return e.type === "world" && Gp(t) !== "continuation" && Up(t) !== null;
}
function iv(e, t) {
	return $p(e, t, Yp(Bp(e)));
}
async function av(e, t, n) {
	let r = iv(e, t);
	if (!r) return !1;
	let i = n.generateSystem(r), a = n.createTwodsixWorldActor(i);
	return await e.update(Bh(e, a, Number(r.seed))), e.sheet?.render(!0), !0;
}
function ov(e, t, n) {
	let r = q_(e, t).filter((e) => e.physical ? !tv(tv(e.physical.details)?.gasGiant) && e.kind !== "Gas Giant" : !1);
	if (!r.length) return [Nm(t.localize("TSG.Editor.Habitation.NoBodies"))];
	let i = R(n, "bodyId") ?? r[0].id, a = R(n, "habitationAction") ?? "transplanted", o = R(n, "populationMode") ?? "generate", s = a === "transplanted";
	return [
		Nm(t.localize("TSG.Editor.Habitation.Intro")),
		L("bodyId", t.localize("TSG.Editor.Habitation.Body"), r.map((e) => I(e.id, `${e.label} — ${nv(e.social?.habitationStatus) ?? "uninhabited"}`, i))),
		L("habitationAction", t.localize("TSG.Editor.Habitation.Habitation"), [I("transplanted", t.localize("TSG.Editor.Habitation.InhabitedTransplantedColonialPopulation"), a), I("clear", t.localize("TSG.Editor.Habitation.UninhabitedClearRefereeTransplantedPopulation"), a)]),
		L("populationMode", t.localize("TSG.Editor.Habitation.Population"), [I("generate", t.localize("TSG.Editor.Habitation.GenerateFromWBH"), o), I("manual", t.localize("TSG.Editor.Habitation.SetPopulationCodeManually"), o)], { disabled: !s }),
		Om("populationCode", t.localize("TSG.Editor.Habitation.PopulationCode"), n?.populationCode ?? 5, {
			min: 1,
			max: 10,
			hidden: !(s && o === "manual"),
			hint: t.localize("TSG.Editor.Habitation.PopulationCodeHint")
		}),
		Nm(t.localize("TSG.Editor.Habitation.GenerateHint"))
	];
}
async function sv(e, t, n) {
	let r = t.localizer ?? Q;
	if (!t.isGameMaster()) return;
	if (!rv(e)) {
		t.notifyWarning(r.localize("TSG.Habitation.Unavailable"));
		return;
	}
	let i = await t.showForm({
		title: r.format("TSG.Habitation.Title", { name: e.name }),
		submitLabel: r.localize("TSG.Editor.Apply"),
		width: 560,
		refreshOn: ["habitationAction", "populationMode"],
		fields: (t) => ov(e, r, t)
	});
	if (!i) return;
	let a = nv(i.bodyId);
	if (!a) return;
	let o = q_(e).find((e) => e.id === a);
	if (!o) {
		t.notifyError(r.format("TSG.Habitation.BodyNotFound", { id: a }));
		return;
	}
	if (tv(tv(o.physical?.details)?.nativeLife)?.currentNativeSophont === !0) {
		t.notifyWarning(r.localize("TSG.Habitation.NativeSophonts"));
		return;
	}
	let s = { ...Fp(Bp(e)) }, c = nv(i.habitationAction);
	if (c === "clear") delete s[a];
	else {
		let e = nv(i.populationMode) ?? "generate", n = null;
		if (e === "manual") {
			let e = Number(i.populationCode);
			if (!Number.isInteger(e) || e < 1 || e > 10) {
				t.notifyWarning(r.localize("TSG.Habitation.PopulationRange"));
				return;
			}
			n = e;
		}
		s[a] = {
			origin: "transplanted",
			populationCode: n
		};
	}
	try {
		if (!await av(e, s, n)) {
			t.notifyWarning(r.localize("TSG.Habitation.Unavailable"));
			return;
		}
		t.notifyInfo(r.format(c === "clear" ? "TSG.Habitation.Cleared" : "TSG.Habitation.Established", { id: a }));
	} catch (e) {
		t.notifyError(r.format("TSG.Habitation.Failed", { message: e instanceof Error ? e.message : String(e) }));
	}
}
//#endregion
//#region src/integrations/foundry/actorContextMenuV14.ts
function cv(e, t) {
	let n = Xh(e);
	return t.listGeneratedActors().find((e) => e.id === n);
}
function lv(e, t, n) {
	e.push({
		label: t.localizer.localize("TSG.Manager.ContextManage"),
		icon: "<i class=\"fa-solid fa-solar-system\"></i>",
		visible: (e) => {
			let n = cv(e, t);
			return !!(t.isGameMaster() && n?.type === "world");
		},
		onClick: (e, r) => {
			let i = cv(r, t);
			i && og(t, n, {
				initialActorId: i.id,
				initialAction: Ph(i) ? "adopt" : "update"
			});
		}
	});
}
function uv(e, t, n) {
	e.push({
		label: t.localizer.localize("TSG.Inspector.ContextMenu"),
		icon: "<i class=\"fa-solid fa-magnifying-glass-chart\"></i>",
		visible: (e) => {
			let n = cv(e, t);
			return !!(t.isGameMaster() && n && G_(n));
		},
		onClick: (e, r) => {
			let i = cv(r, t);
			i && ev(i, t, n);
		}
	}), e.push({
		label: t.localizer.localize("TSG.UnusualCity.ContextMenu"),
		icon: "<i class=\"fa-solid fa-city\"></i>",
		visible: (e) => {
			let n = cv(e, t);
			return !!(t.isGameMaster() && n && z_(n));
		},
		onClick: (e, n) => {
			let r = cv(n, t);
			r && V_(r, t);
		}
	}), e.push({
		label: t.localizer.localize("TSG.SecondaryGovernment.ContextMenu"),
		icon: "<i class=\"fa-solid fa-landmark\"></i>",
		visible: (e) => {
			let n = cv(e, t);
			return !!(t.isGameMaster() && n && Ug(n));
		},
		onClick: (e, n) => {
			let r = cv(n, t);
			r && Gg(r, t);
		}
	}), n && e.push({
		label: t.localizer.localize("TSG.Habitation.ContextMenu"),
		icon: "<i class=\"fa-solid fa-people-roof\"></i>",
		visible: (e) => {
			let n = cv(e, t);
			return !!(t.isGameMaster() && n && rv(n));
		},
		onClick: (e, r) => {
			let i = cv(r, t);
			i && sv(i, t, n);
		}
	});
}
//#endregion
//#region src/integrations/foundry/settingsControl.ts
var dv = "traveller-system-generator", fv = "useDefaultSystemFolder", pv = "defaultSystemFolderId";
function mv(e, t) {
	return Object.fromEntries([["", t.localize("TSG.Dialog.ActorFolderRoot")], ...hh(e).map((e) => [e.id, e.path])]);
}
function hv(e, t) {
	e.register(dv, fv, {
		name: t.localize("TSG.Settings.UseDefaultFolder.Name"),
		hint: t.localize("TSG.Settings.UseDefaultFolder.Hint"),
		scope: "world",
		config: !0,
		type: Boolean,
		default: !1
	}), e.register(dv, pv, {
		name: t.localize("TSG.Settings.DefaultFolder.Name"),
		hint: t.localize("TSG.Settings.DefaultFolder.Hint"),
		scope: "world",
		config: !0,
		type: String,
		choices: { "": t.localize("TSG.Dialog.ActorFolderRoot") },
		default: ""
	});
}
async function gv(e) {
	if (e.isGameMaster && !e.isGameMaster()) return;
	let t = mv(e.listActorFolders(), e.localizer), n = e.settings.settings.get(`${dv}.${pv}`);
	n && (n.choices = t);
	let r = String(e.settings.get("traveller-system-generator", "defaultSystemFolderId") ?? "");
	r && !(r in t) && (await e.settings.set(dv, pv, ""), e.settings.get("traveller-system-generator", "useDefaultSystemFolder") && e.notifyWarning(e.localizer.localize("TSG.Notification.DefaultFolderMissing")));
}
function _v(e, t) {
	if (!e.get("traveller-system-generator", "useDefaultSystemFolder")) return null;
	let n = String(e.get("traveller-system-generator", "defaultSystemFolderId") ?? "");
	return n && t.some((e) => e.id === n) ? n : null;
}
//#endregion
//#region src/integrations/foundry/formApp.ts
var vv = `modules/${Sm}/templates/form`, yv = {
	form: `${vv}/form.hbs`,
	field: `${vv}/field.hbs`,
	footer: "templates/generic/form-footer.hbs"
};
function bv(e) {
	let t = {};
	for (let n of e) n.name && (n.type === "radio" ? n.checked && (t[n.name] = n.value) : n.type === "checkbox" ? t[n.name] = !!n.checked : t[n.name] = n.value);
	return t;
}
function xv(e) {
	let { ApplicationV2: t, HandlebarsApplicationMixin: n } = e.api, r = null;
	class i extends n(t) {
		static DEFAULT_OPTIONS = {
			tag: "form",
			classes: ["tsg-form"],
			window: { resizable: !0 },
			position: { height: "auto" },
			form: {
				handler: i.onSubmit,
				submitOnChange: !1,
				closeOnSubmit: !0
			}
		};
		static PARTS = {
			fields: {
				template: yv.form,
				scrollable: [""]
			},
			footer: { template: yv.footer }
		};
		request;
		resolve;
		settled = !1;
		values = null;
		changed = null;
		constructor(e, t) {
			super({
				window: { title: e.title },
				position: { width: e.width }
			}), this.request = e, this.resolve = t;
		}
		settle(e) {
			this.settled || (this.settled = !0, this.resolve(e));
		}
		async _prepareContext() {
			return {
				fields: this.request.fields(this.values, this.changed),
				buttons: [{
					type: "submit",
					icon: "fa-solid fa-check",
					label: this.request.submitLabel
				}]
			};
		}
		_onChangeForm(e, t) {
			let n = t.target?.name;
			if (!n || !this.request.refreshOn.includes(n)) return;
			let r = this.element;
			this.values = bv(r.elements), this.changed = n, this.render({ parts: ["fields"] });
		}
		_onClose(e) {
			super._onClose?.(e), this.settle(null);
		}
		static async onSubmit(e, t, n) {
			this.settle(n.object);
		}
	}
	return async (t) => (r ??= e.handlebars.loadTemplates([yv.field]), await r, new Promise((e) => {
		new i(t, e).render({ force: !0 });
	}));
}
//#endregion
//#region src/integrations/foundry/wbhInspectorApp.ts
var Sv = `modules/${Sm}/templates/inspector`, Cv = {
	node: `${Sv}/node.hbs`,
	controls: `${Sv}/controls.hbs`,
	system: `${Sv}/system.hbs`,
	body: `${Sv}/body.hbs`,
	footer: "templates/generic/form-footer.hbs"
};
function wv(e) {
	let { ApplicationV2: t, HandlebarsApplicationMixin: n } = e.api, r = null;
	class i extends n(t) {
		static DEFAULT_OPTIONS = {
			tag: "form",
			classes: ["tsg-wbh-inspector"],
			window: {
				icon: "fa-solid fa-magnifying-glass-chart",
				resizable: !0
			},
			position: {
				width: 1e3,
				height: 780
			},
			form: {
				handler: i.onSubmit,
				submitOnChange: !1,
				closeOnSubmit: !0
			}
		};
		static PARTS = {
			controls: { template: Cv.controls },
			system: { template: Cv.system },
			body: {
				template: Cv.body,
				scrollable: [""]
			},
			footer: { template: Cv.footer }
		};
		controller;
		selectedBodyId;
		constructor(e) {
			super({ window: { title: e.title } }), this.controller = e, this.selectedBodyId = e.initialBodyId;
		}
		async _prepareContext() {
			let e = this.controller.context(this.selectedBodyId);
			return {
				...e,
				buttons: [{
					type: "submit",
					icon: "fa-solid fa-check",
					label: e.labels.close
				}]
			};
		}
		_onChangeForm(e, t) {
			let n = t.target;
			n?.name === "wbhInspectorBodyId" && (this.selectedBodyId = n.value, this.render({ parts: ["body"] }));
		}
		static async onSubmit(e, t, n) {
			await this.controller.submit(n.object);
		}
	}
	return async (t) => {
		r ??= e.handlebars.loadTemplates([Cv.node]), await r, await new i(t).render({ force: !0 });
	};
}
//#endregion
//#region src/integrations/foundry/bootstrap.ts
function Tv(e) {
	let t = wm({ moduleVersion: () => e.getModules().get(Sm)?.version });
	e.Hooks.once("init", () => {
		Tm(e.getModules(), t);
		let n = e.getDefaultFolderSettingsEnvironment();
		hv(n.settings, n.localizer);
	});
	let n = () => {
		gv(e.getDefaultFolderSettingsEnvironment()).catch((e) => {
			console.error(`${Sm} | Unable to refresh the default system folder setting.`, e);
		});
	};
	e.Hooks.once("ready", n);
	for (let t of [
		"createFolder",
		"updateFolder",
		"deleteFolder"
	]) e.Hooks.on(t, (e) => {
		e && e.type !== "Actor" || n();
	});
	e.Hooks.on("getSceneControlButtons", (n) => {
		sg(n, e.getManagerEnvironment(), t);
	}), e.Hooks.on("getActorContextOptions", (n, r) => {
		let i = e.getManagerEnvironment();
		lv(r, i, t), uv(r, i, t);
	});
}
function Ev(e) {
	return typeof e == "string" ? e || null : e?.id ?? null;
}
function Dv(e) {
	return e.filter((e) => e.type === "Actor").map(({ id: e, name: t, folder: n, parent: r }) => ({
		id: e,
		name: t,
		parentId: Ev(n ?? r)
	}));
}
function Ov(e) {
	let t = new Map(e.filter((e) => e.type === "Actor").map((e) => [e.id, e])), n = /* @__PURE__ */ new Map(), r = (e) => {
		let r = n.get(e);
		if (r !== void 0) return r;
		let i = [], a = /* @__PURE__ */ new Set(), o = e;
		for (; o && !a.has(o);) {
			a.add(o);
			let e = t.get(o);
			if (!e) break;
			i.unshift(e.name), o = Ev(e.folder ?? e.parent);
		}
		let s = i.join(" / ");
		return n.set(e, s), s;
	};
	return (e) => {
		let t = Ev(e.folder);
		return {
			folderId: t,
			folderPath: t ? r(t) : ""
		};
	};
}
if (typeof Hooks < "u") {
	let e = {
		localize: (e) => game.i18n.localize(e),
		format: (e, t) => game.i18n.format(e, t)
	}, t = null, n = (e) => (t ??= xv(foundry.applications), t(e)), r = null, i = (e) => {
		r ??= wv(foundry.applications), r(e).catch((e) => {
			console.error("traveller-system-generator | Unable to open the WBH Inspector", e), ui.notifications.error(game.i18n.format("TSG.Notification.Failed", { message: e instanceof Error ? e.message : String(e) }));
		});
	}, a = () => Dv(Array.from(game.folders));
	Tv({
		Hooks,
		getModules: () => game.modules,
		getDefaultFolderSettingsEnvironment: () => ({
			settings: game.settings,
			localizer: e,
			listActorFolders: a,
			notifyWarning: (e) => ui.notifications.warn(e),
			isGameMaster: () => game.user.isGM
		}),
		getManagerEnvironment: () => {
			let t = Array.from(game.folders), r = Dv(t);
			return {
				isGameMaster: () => game.user.isGM,
				canCreateActor: () => Actor.implementation.canUserCreate(game.user),
				listActorFolders: () => r,
				defaultSystemFolderId: () => _v(game.settings, r),
				listGeneratedActors: () => Array.from(game.actors),
				actorFolder: Ov(t),
				localizer: e,
				showForm: n,
				showInspector: i,
				createActor: (e) => Actor.implementation.create(e),
				notifyInfo: (e) => ui.notifications.info(e),
				notifyWarning: (e) => ui.notifications.warn(e),
				notifyError: (e) => ui.notifications.error(e)
			};
		}
	});
}
//#endregion
export { Ov as actorFolderLookup, Tv as registerFoundryBootstrap };
