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
}, S = /* @__PURE__ */ new Map([
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
]), C = -2, w = 18;
function T(e) {
	if (!Number.isFinite(e)) throw Error(`Orbit# ${e} is not finite.`);
	if (e < C) throw Error(`Orbit# ${e} is below supported range.`);
	if (e > w) return S.get(w) * 2 ** (e - w);
	let t = Math.floor(e), n = Math.ceil(e), r = S.get(t), i = S.get(n);
	if (r === void 0 || i === void 0) throw Error(`Orbit# ${e} is outside supported range.`);
	if (t === n) return r;
	let a = e - t;
	return r + (i - r) * a;
}
function ee(e) {
	let t = [...S.entries()].sort((e, t) => e[0] - t[0]);
	if (e <= t[0][1]) return t[0][0];
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
//#region src/rules/orbits/eccentricity.ts
function D(e, t = 0) {
	let n = e.roll(2, 6, t).total, r;
	return r = n <= 5 ? Math.max(0, -.001 + e.d6() / 1e3) : n <= 7 ? e.d6() / 200 : n <= 9 ? .03 + e.d6() / 100 : n === 10 ? .05 + e.d6() / 20 : n === 11 ? .05 + e.roll(2, 6).total / 20 : .3 + e.roll(2, 6).total / 20, E(Math.max(0, Math.min(.999, r)), 3);
}
//#endregion
//#region src/rules/stars/starTables.ts
function te(e, t = "classic") {
	return t === "realistic" ? e <= 2 ? "Special" : e <= 8 ? "M" : e === 9 ? "K" : e === 10 ? "G" : e === 11 ? "F" : "Hot" : e <= 2 ? "Special" : e <= 6 ? "M" : e <= 8 ? "K" : e <= 10 ? "G" : e === 11 ? "F" : "Hot";
}
function ne(e, t) {
	return t ? e <= 3 ? "VI" : e <= 5 ? "BD" : e <= 8 ? "D" : e <= 10 ? "III" : e === 11 ? "II" : "Peculiar" : e <= 5 ? "VI" : e <= 8 ? "IV" : "III";
}
function re(e) {
	return e <= 8 ? "III" : e <= 10 ? "II" : e === 11 ? "Ib" : "Ia";
}
function ie(e) {
	return e <= 9 ? "A" : e <= 11 ? "B" : "O";
}
function ae(e, t, n) {
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
var oe = [
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
], se = {
	starDistribution: "classic",
	allowUnusualPrimaries: !0,
	detailLevel: "standard"
};
function ce(e) {
	return {
		...se,
		...e
	};
}
function le(e, t, n) {
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
function ue(e, t, n, r) {
	let i = oe.filter((t) => t.spectralType === e);
	if (i.length === 0) throw Error(`No rows for spectral type ${e}`);
	let a = i.filter((e) => e.subtype <= t).at(-1) ?? i[0], o = i.find((e) => e.subtype >= t) ?? i.at(-1), s = o.subtype - a.subtype || 1, c = (t - a.subtype) / s, l = (e) => {
		if (r === "temperatureK") return e.temperatureK;
		let t = e[r][n];
		return t === void 0 ? e[r].V ?? e[r].III ?? 1 : t;
	};
	return l(a) + (l(o) - l(a)) * c;
}
function de(e, t) {
	return e ** 2 * (t / 5772) ** 4;
}
function fe(e, t) {
	let n = 10 / Math.max(t, .08) ** 2.5;
	if (t < .9) return e.d6() * 2 + Math.ceil(e.d6() / 2) - 1;
	let r = Math.max(.01, e.d10ZeroToNine() / 10);
	return Math.max(.01, Math.min(n, n * r));
}
function pe(e, t, n, r, i) {
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
			luminositySolar: Number(de(s, o).toFixed(6)),
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
			luminositySolar: Number(de(o, r).toFixed(6)),
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
function me(e, t, n) {
	let r = te(e.roll(2, 6, t ? 0 : -1).total, n);
	return r === "Hot" ? ie(e.roll(2, 6).total) : r;
}
function he(e, t, n, r, i) {
	let a = ce(i), o = me(e, r, a.starDistribution), s = "V", c = "";
	if (o === "Special") {
		let i = ne(e.roll(2, 6).total, a.allowUnusualPrimaries);
		if (i === "BD" || i === "D" || i === "Peculiar") return pe(e, t, n, i, r);
		s = i === "III" ? re(e.roll(2, 6).total) : i, c = `Special-system result resolved as luminosity class ${s}.`;
	}
	let l;
	if (o === "Special") {
		let t = te(e.roll(2, 6, 1).total, a.starDistribution);
		l = t === "Hot" ? ie(e.roll(2, 6).total) : t === "Special" ? "M" : t;
	} else l = o;
	let u = ae(e.roll(2, 6).total, l, r), d = le(l, u, s);
	l = d.spectralType, u = d.subtype;
	let f = ue(l, u, s, "mass"), p = ue(l, u, s, "diameter"), m = ue(l, u, s, "temperatureK"), h = de(p, m), g = s === "V" || s === "VI" ? fe(e, f) : Math.max(fe(e, Math.max(.9, Math.min(f, 3))), 1);
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
function ge(e, t, n, r, i) {
	return he(e, t, n, r, i);
}
//#endregion
//#region src/rules/system/worldCounts.ts
function _e(e) {
	return e <= 4 ? 1 : e <= 7 ? 2 : e <= 10 ? 3 : e === 11 ? 4 : 5;
}
function ve(e) {
	return e <= 7 ? 1 : e <= 10 ? 2 : e === 11 ? 3 : 4;
}
function ye(e, t) {
	let n = e.roll(2, 6).total <= 9 ? _e(e.roll(2, 6).total) : 0, r = +(n > 0), i = e.roll(2, 6).total >= 8 ? ve(e.roll(2, 6, r).total) : 0, a = t >= 2 ? -1 : 0, o = Math.max(0, e.roll(2, 6, -2 + a).total);
	return {
		gasGiants: n,
		planetoidBelts: i,
		terrestrialPlanets: o,
		totalWorlds: n + i + o
	};
}
//#endregion
//#region src/rules/worlds/wbhTidalLock.ts
var be = 8766;
function xe(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Se(e, t) {
	return new x(xe([
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
function Ce(e, t) {
	let n = e.roll(2, 6, t).total, r;
	return r = n <= 5 ? -.001 + e.d6() / 1e3 : n <= 7 ? e.d6() / 200 : n <= 9 ? .03 + e.d6() / 100 : n === 10 ? .05 + e.d6() / 20 : n === 11 ? .05 + e.roll(2, 6).total / 20 : .3 + e.roll(2, 6).total / 20, E(Math.max(0, Math.min(.999, r)), 3);
}
function we(e, t, n, r, i) {
	let a = 0;
	return e !== null && e >= 1 && (a += Math.ceil(e / 3)), t > .1 && (a -= Math.floor(t * 10)), n > 30 && (a -= 2), n >= 60 && n <= 120 && (a -= 4), n >= 80 && n <= 100 && (a -= 4), r !== null && r > 2.5 && (a -= 2), i < 1 ? a -= 2 : i > 10 ? a += 4 : i >= 5 && (a += 2), a;
}
function Te(e) {
	return e < .5 ? -2 : e < 1 ? -1 : e <= 2 ? 0 : e <= 5 ? 1 : 2;
}
function Ee(e, t, n) {
	let r = -4;
	e.orbitNumber < 1 ? r += 4 + Math.floor(10 * (1 - e.orbitNumber)) : e.orbitNumber < 2 ? r += 4 : e.orbitNumber <= 3 ? r += 1 : r -= Math.floor(e.orbitNumber) * 2;
	let i = Math.max(1, t.starCount ?? 1), a = t.totalStarMassSolar ?? n.massSolar;
	r += Te(a), i > 1 && (r -= i);
	let o = (t.satellites ?? []).reduce((e, t) => e + (typeof t.sizeCode == "number" && t.sizeCode >= 1 ? t.sizeCode : 0), 0);
	return r -= o, r;
}
function De(e) {
	let t = 6;
	return e.orbitPd > 20 && (t -= Math.floor(e.orbitPd / 20)), e.direction === "Retrograde" && (t -= 2), e.parentMassTerra > 1e3 ? t += 8 : e.parentMassTerra > 100 ? t += 6 : e.parentMassTerra > 10 ? t += 4 : e.parentMassTerra >= 1 && (t += 2), t;
}
function Oe(e, t) {
	let n = -10;
	typeof e.sizeCode == "number" && e.sizeCode >= 1 && (n += e.sizeCode);
	let r = e.orbitPd;
	return r < 5 ? n += 5 + Math.ceil((5 - r) * 5) : r < 10 ? n += 4 : r < 20 ? n += 2 : r < 40 ? n += 1 : r > 60 && (n -= 6), n -= Math.max(0, t - 1) * 2, n;
}
function ke(e, t, n) {
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
function Ae(e, t) {
	return t <= 3 ? t : E(e.roll(2, 6, -2).total / 10, 3);
}
function je(e, t, n, r, i) {
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
	else if (a === 11) s = r.targetPeriodHours * 2 / 3, l = Ae(e, l), d = "3:2";
	else if (d = "1:1", s = r.targetPeriodHours, l = Ae(e, l), u > .1 && (u = Math.min(u, Ce(e, -2))), e.roll(2, 6).total === 12) {
		let t = e.roll(2, 6).total, a = je(e, t, n, r, i);
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
function Me(e, t, n, r) {
	let i = we(r.sizeCode, r.moon?.eccentricity ?? e.eccentricity, n.axialTiltDegrees, r.atmospherePressureBar, t.ageGyr);
	if (r.moon) return [{
		case: "moon-planet",
		dm: i + De(r.moon),
		targetId: r.moon.parentId,
		targetPeriodHours: r.moon.orbitalPeriodHours
	}];
	let a = [{
		case: "planet-star",
		dm: i + Ee(e, r, t),
		targetId: t.id,
		targetPeriodHours: r.orbitalPeriodYears * be
	}];
	if (r.sizeCode !== null && r.sizeCode >= 1 && r.satellites?.length) {
		let e = r.satellites.filter((e) => e.physical?.details?.rotation?.tidalLockStatus === "1:1" && e.physical.details.rotation.tidalLockCase === "moon-planet");
		for (let t of e) a.push({
			case: "planet-moon",
			dm: i + Oe(t, r.satellites.length),
			targetId: t.sourceId ?? t.designation,
			targetPeriodHours: t.periodHours,
			moon: t
		});
	}
	return a;
}
function Ne(e, t, n, r) {
	if (n.tidalLockStatus !== "unresolved") return n;
	let i = Me(e, t, n, r);
	if (!i.length) return n;
	let a = Math.max(...i.map((e) => e.dm)), o = i.filter((e) => e.dm === a).sort((e, t) => e.case === t.case && e.case === "planet-moon" ? (e.moon?.orbitPd ?? 0) - (t.moon?.orbitPd ?? 0) : e.case === "planet-moon" ? -1 : +(t.case === "planet-moon")), s = o[0], c = null, l = -Infinity;
	for (let t of o) {
		let i = Se(e, t), a;
		a = t.dm <= -10 ? 2 : t.dm >= 10 ? 12 : i.roll(2, 6, t.dm).total;
		let o = je(i, a, n, t, r.moon?.eccentricity ?? e.eccentricity);
		if (a > l && (c = o, l = a, s = t), o.status === "3:2" || o.status === "1:1") {
			c = o, s = t;
			break;
		}
	}
	if (!c) return n;
	let u = r.orbitalPeriodYears * be, d = s.case === "planet-star" && c.status === "1:1" ? {
		solarDaysPerYear: 0,
		solarDayHours: null,
		infinite: !0
	} : ke(u, c.siderealHours, c.direction === "Retrograde");
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
var Pe = 1e6;
function Fe(e, t, n) {
	return t <= 0 || n <= 0 ? 0 : e * t / (32 * n ** 3);
}
function Ie(e, t, n) {
	if (e <= 0 || t <= 0 || n <= 0) return 0;
	let r = n / Pe;
	return e * t / (3.2 * r ** 3);
}
function O(e) {
	return E(e, 6);
}
function Le(e) {
	let t = [], n = e.rotationLockStatus === "1:1" && e.rotationLockCase === "planet-star", r = n ? 0 : Fe(e.star.massSolar, e.sizeCode, e.distanceAu);
	t.push({
		sourceType: "star",
		sourceId: e.star.id,
		sourceDesignation: e.star.designation,
		amplitudeMetres: O(r),
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
		let o = e.rotationLockStatus === "1:1" && e.rotationLockCase === "planet-moon" && e.rotationLockTargetId === (n.sourceId ?? n.designation), s = o ? 0 : Ie(r, e.sizeCode, n.orbitKm);
		i += s, t.push({
			sourceType: "moon",
			sourceId: n.sourceId ?? n.designation,
			sourceDesignation: n.designation,
			amplitudeMetres: O(s),
			suppressedByOneToOneLock: o,
			distance: O(n.orbitKm / Pe),
			distanceUnit: "Mkm"
		});
	}
	return {
		method: "WBH surface tidal effects",
		totalAmplitudeMetres: O(r + i),
		stellarAmplitudeMetres: O(r),
		directSatelliteAmplitudeMetres: O(i),
		directParentAmplitudeMetres: 0,
		contributions: t,
		optionalMoonPairEffectsIncluded: !1,
		generationNotes: a
	};
}
function Re(e) {
	let t = [], n = Fe(e.star.massSolar, e.sizeCode, e.stellarDistanceAu);
	t.push({
		sourceType: "star",
		sourceId: e.star.id,
		sourceDesignation: e.star.designation,
		amplitudeMetres: O(n),
		suppressedByOneToOneLock: !1,
		distance: e.stellarDistanceAu,
		distanceUnit: "AU"
	});
	let r = e.rotationLockStatus === "1:1" && e.rotationLockCase === "moon-planet", i = r ? 0 : Ie(e.parentMassTerra, e.sizeCode, e.parentDistanceKm);
	return t.push({
		sourceType: "planet",
		sourceId: e.parentId,
		sourceDesignation: e.parentDesignation,
		amplitudeMetres: O(i),
		suppressedByOneToOneLock: r,
		distance: O(e.parentDistanceKm / Pe),
		distanceUnit: "Mkm"
	}), {
		method: "WBH surface tidal effects",
		totalAmplitudeMetres: O(n + i),
		stellarAmplitudeMetres: O(n),
		directSatelliteAmplitudeMetres: 0,
		directParentAmplitudeMetres: O(i),
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
function ze(e) {
	return e.details?.size?.massTerra ?? e.details?.gasGiant?.massTerra ?? null;
}
function Be(e, t, n, r) {
	let i = r.physical, a = ze(t);
	if (!i?.details || a === null || typeof r.sizeCode != "number" || r.sizeCode <= 0 || i.details.gasGiant) return r;
	let o = i.details.rotation, s = Re({
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
function Ve(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = t.find((t) => t.id === e.aroundStarId);
	if (!r) return e;
	let i = n.details.satellites, a = i && {
		...i,
		moons: i.moons.map((t) => Be(e, n, r, t))
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
	let o = n.details.rotation, s = Le({
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
function He(e, t) {
	return e.map((e) => Ve(e, t));
}
//#endregion
//#region src/rules/worlds/wbhTemperatureExtremes.ts
function Ue(e) {
	return Math.max(0, Math.min(1, e));
}
function We(e, t) {
	let n = Math.sin(Math.max(0, Math.min(180, e)) * Math.PI / 180);
	return t < .1 ? n /= 2 : t > 2 && (n += Math.min(.25, .01 * t)), Ue(n);
}
function Ge(e) {
	if (e.tidalLockStatus === "1:1" && e.tidalLockCase === "planet-star" || e.solarDayInfinite) return 1;
	let t = Math.abs(e.solarDayHours ?? 0);
	return t >= 2500 ? 1 : Ue(Math.sqrt(t) / 50);
}
function Ke(e) {
	return e ? e.code >= 9 ? .1 : e.code <= 1 ? -.1 : 0 : 0;
}
function qe(e, t) {
	return (10 - e) / 20 + (e >= 2 && e <= 8 ? Ke(t?.distribution) : 0);
}
function Je(e, t) {
	return t === null ? e.initialGreenhouseFactor === 0 ? 1 : null : Math.max(1, 1 + t);
}
function Ye(e, t, n, r) {
	let i = e * (1 - t) * (1 + n) / Math.max(r, 1e-6) ** 2;
	return Math.max(3, Math.round(279 * Math.max(0, i) ** .25));
}
function Xe(e) {
	let t = We(e.rotation.axialTiltDegrees, e.seasonalPeriodYears), n = Ge(e.rotation), r = qe(e.hydrographicsCode, e.hydrographics), i = Ue(t + n + r), a = Je(e.climate, e.pressureBar), o = a === null ? null : Ue(i / a), s = Math.max(0, Math.min(.999999, e.eccentricity)), c = Math.max(1e-6, e.distanceAu * (1 - s)), l = Math.max(1e-6, e.distanceAu * (1 + s)), u = null, d = null, f = null, p = null;
	o !== null && e.climate.greenhouseFactor !== null && (u = e.luminositySolar * (1 + o), d = e.luminositySolar * (1 - o), f = Ye(u, e.climate.albedo, e.climate.greenhouseFactor, c), p = Ye(d, e.climate.albedo, e.climate.greenhouseFactor, l));
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
var Ze = 8766;
function Qe(e) {
	return e.details?.atmosphere?.meanBaselinePressureBar ?? null;
}
function $e(e, t, n) {
	let r = n.physical, i = r?.details, a = i?.climate, o = i?.rotation;
	if (!r || !i || !a || !o || typeof n.sizeCode != "number" || n.sizeCode <= 0 || i.gasGiant || r.hydrographicsCode === null) return n;
	let s = Xe({
		climate: a,
		rotation: o,
		hydrographics: i.hydrographics,
		hydrographicsCode: r.hydrographicsCode,
		pressureBar: Qe(r),
		luminositySolar: t.luminositySolar,
		distanceAu: e.au,
		eccentricity: e.eccentricity,
		seasonalPeriodYears: n.periodHours / Ze,
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
function et(e, t) {
	let n = e.physical, r = n?.details;
	if (!n || !r) return e;
	let i = t.find((t) => t.id === e.aroundStarId);
	if (!i) return e;
	let a = r.satellites ? {
		...r.satellites,
		moons: r.satellites.moons.map((t) => $e(e, i, t))
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
	let o = Xe({
		climate: r.climate,
		rotation: r.rotation,
		hydrographics: r.hydrographics,
		hydrographicsCode: n.hydrographicsCode,
		pressureBar: Qe(n),
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
function tt(e, t) {
	return e.map((e) => et(e, t));
}
//#endregion
//#region src/rules/worlds/wbhSeismology.ts
var nt = 332971, rt = 1e6, it = 24, at = 365.25;
function ot(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function st(e) {
	return new x(ot(`wbh-seismology-v1|${e}`));
}
function ct(e, t, n, r, i = []) {
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
function lt(e) {
	return Math.max(0, Math.floor(e / 10));
}
function ut(e, t, n, r, i, a) {
	if (e <= 0 || t <= 0 || n <= 0 || r <= 0 || i <= 0 || a <= 0) return 0;
	let o = e ** 2 * t ** 5 * n ** 2 / (3e3 * r ** 5 * i * a);
	return o < 1 ? 0 : Math.floor(o);
}
function dt(e, t) {
	return e === null ? null : E((e ** 4 + Math.max(0, t) ** 4) ** .25, 6);
}
function ft(e, t, n, r, i) {
	if (!r || n < 1 || i <= 0) return {
		count: 0,
		roll: null,
		dm: 0
	};
	let a = i > 100 ? 2 : +(i >= 10), o = st(e).roll(2, 6).total, s = t + n - o + a;
	return {
		count: s <= 1 ? 0 : s,
		roll: o,
		dm: a
	};
}
function pt(e) {
	let t = e.profile.details, n = t?.size, r = e.profile.sizeCode;
	if (!t || !n || r === null || r <= 0) return null;
	let i = t.satellites?.moons ?? [], a = ct(r, e.star.ageGyr, n.densityTerra, !1, i), o = lt(t.surfaceTides?.totalAmplitudeMetres ?? 0), s = ut(e.star.massSolar * nt, r, e.eccentricity, e.profile.details?.climate?.distanceAuUsed ? e.profile.details.climate.distanceAuUsed * 149.5978709 : 0, e.profile.orbitalPeriodYears * at, n.massTerra), c = a.stress + o + s, l = t.hydrographics?.composition === "H2O", u = ft(e.id, r, e.profile.hydrographicsCode ?? 0, l, c);
	return {
		method: "WBH seismology",
		residualSeismicStress: a.stress,
		residualStressDm: a.dm,
		tidalStressFactor: o,
		tidalHeatingFactor: s,
		totalSeismicStress: c,
		seismicAdjustedMeanTemperatureK: dt(t.climate?.meanTemperatureK ?? null, c),
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
function mt(e) {
	let t = e.profile.details, n = t?.size;
	if (!t || !n || e.sizeCode <= 0) return null;
	let r = ct(e.sizeCode, e.starAgeGyr, n.densityTerra, !0), i = lt(t.surfaceTides?.totalAmplitudeMetres ?? 0), a = ut(e.parentMassTerra, e.sizeCode, e.eccentricity, e.orbitKm / rt, e.periodHours / it, n.massTerra), o = r.stress + i + a, s = t.hydrographics?.composition === "H2O", c = ft(e.id, e.sizeCode, e.profile.hydrographicsCode ?? 0, s, o);
	return {
		method: "WBH seismology",
		residualSeismicStress: r.stress,
		residualStressDm: r.dm,
		tidalStressFactor: i,
		tidalHeatingFactor: a,
		totalSeismicStress: o,
		seismicAdjustedMeanTemperatureK: dt(t.climate?.meanTemperatureK ?? null, o),
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
function ht(e) {
	return e.details?.size?.massTerra ?? e.details?.gasGiant?.massTerra ?? null;
}
function gt(e, t, n, r) {
	let i = r.physical, a = ht(t);
	if (!i?.details || a === null || typeof r.sizeCode != "number" || r.sizeCode <= 0 || i.details.gasGiant) return r;
	let o = mt({
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
function _t(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = t.find((t) => t.id === e.aroundStarId);
	if (!r) return e;
	let i = n.details.satellites, a = i && {
		...i,
		moons: i.moons.map((t) => gt(e, n, r, t))
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
	}, s = pt({
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
function vt(e, t) {
	return e.map((e) => _t(e, t));
}
//#endregion
//#region src/rules/worlds/wbhSurfaceGeology.ts
function yt(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function bt(e, t) {
	return e <= 1 || t <= 1 ? e > 1 ? "limited" : "inactive" : e > 100 ? "extreme" : e >= 10 ? "active" : "limited";
}
function xt(e) {
	let t = e.die(100);
	return t <= 35 ? "convergent" : t <= 60 ? "divergent" : t <= 85 ? "transform" : "stable";
}
function St(e) {
	return (e?.surfaceFeatures?.bodies ?? []).map((e) => e.id);
}
function Ct(e, t) {
	if (!t.length) return [];
	let n = t[e.die(t.length) - 1];
	if (t.length === 1 || e.d6() <= 3) return [n];
	let r = n;
	for (let i = 0; i < 4 && r === n; i += 1) r = t[e.die(t.length) - 1];
	return r === n ? [n] : [n, r];
}
function wt(e) {
	return e > 100 ? "severe" : e >= 10 ? "major" : "minor";
}
function Tt(e, t, n) {
	if (e === "convergent") {
		let e = ["mountain-chain"];
		return (t?.coveragePercent ?? 0) >= 40 && n % 2 == 0 && e.push("ocean-trench"), e;
	}
	return e === "divergent" ? n % 2 == 0 ? ["rift-system", "volcanic-belt"] : ["rift-system"] : e === "transform" ? ["fault-zone"] : [];
}
function Et(e, t, n) {
	if (!t) return null;
	let r = t.totalSeismicStress, i = t.majorTectonicPlates, a = bt(r, i), o = St(n), s = new x(yt(`wbh-surface-geology-v1|${e}|${r}|${i}|${o.join(",")}`)), c = i > 1 ? Math.max(3, Math.round(i * 1.5)) : 0, l = {
		convergent: 0,
		divergent: 0,
		transform: 0,
		stable: 0
	}, u = [], d = wt(r);
	for (let e = 0; e < c; e += 1) {
		let t = xt(s);
		l[t] += 1;
		for (let r of Tt(t, n, e)) u.push({
			id: `geology-${u.length + 1}`,
			kind: r,
			intensity: d,
			relatedSurfaceBodyIds: Ct(s, o),
			sourceBoundary: t
		});
	}
	return i <= 1 && r > 1 && u.push({
		id: "geology-1",
		kind: s.d6() <= 3 ? "isolated-volcanic-region" : "uplift-highland",
		intensity: d,
		relatedSurfaceBodyIds: Ct(s, o),
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
function Dt(e, t) {
	let n = t.physical;
	if (!n?.details || n.details.gasGiant) return t;
	let r = Et(t.sourceId ?? `${e.id}.${t.designation}`, n.details.seismology, n.details.hydrographics);
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
function Ot(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites, r = n && {
		...n,
		moons: n.moons.map((t) => Dt(e, t))
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
	}, a = Et(e.id, i.details?.seismology, i.details?.hydrographics);
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
function kt(e) {
	return e.map(Ot);
}
//#endregion
//#region src/rules/worlds/wbhSurfaceClimate.ts
function At(e) {
	return e < 253 ? "frigid" : e < 273 ? "cold" : e < 303 ? "temperate" : e < 323 ? "warm" : "hot";
}
function jt(e, t, n) {
	return n <= 273 ? "pervasive" : t <= 273 ? "substantial" : e <= 273 ? "localized" : "none";
}
function Mt(e) {
	let t = e.details?.climate, n = t?.temperatureExtremes;
	if (!t || !n || t.meanTemperatureK === null || n.highTemperatureK === null || n.lowTemperatureK === null) return null;
	let r = t.meanTemperatureK, i = n.highTemperatureK, a = n.lowTemperatureK, o = jt(a, r, i), s = i > 278 && r > 273, c = s && (i < 323 || r < 318), l = [];
	return o === "pervasive" ? l.push("Permanent ice or glaciation can dominate nearly all mapped latitude bands.") : o === "substantial" ? l.push("Large permanent polar or high-altitude ice regions are expected.") : o === "localized" ? l.push("Permanent ice is plausible in polar or high-altitude regions.") : l.push("The baseline temperature range does not imply permanent surface ice."), s ? l.push("At least some regions satisfy the WBH thermal threshold for agriculture.") : l.push("The global baseline temperatures do not satisfy the WBH thermal threshold for agriculture."), c ? l.push("At least some regions satisfy the WBH thermal threshold for unprotected human settlement.") : l.push("The global baseline temperatures do not satisfy the WBH thermal threshold for unprotected human settlement."), e.details?.rotation?.tidalLockStatus === "1:1" && e.details.rotation.tidalLockCase === "planet-star" && l.push("For mapping a stellar 1:1 tidal lock, treat the terminator/twilight zone as the principal surface-climate axis rather than ordinary latitude."), {
		method: "WBH surface climate phase 1",
		meanTemperatureK: r,
		highTemperatureK: i,
		lowTemperatureK: a,
		thermalRegime: At(r),
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
function Nt(e) {
	let t = e.physical;
	if (!t?.details || t.details.gasGiant || typeof e.sizeCode != "number" || e.sizeCode <= 0) return e;
	let n = Mt(t);
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
function Pt(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites ? {
		...t.details.satellites,
		moons: t.details.satellites.moons.map(Nt)
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
	}, i = Mt(r);
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
function Ft(e) {
	return e.map(Pt);
}
//#endregion
//#region src/rules/worlds/wbhNativeLife.ts
function It(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Lt(e, t, n, r) {
	return new x(It([
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
function Rt(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(Math.max(0, Math.trunc(e)));
}
function zt(e) {
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
function Bt(e) {
	return e === 0 ? -4 : e >= 1 && e <= 3 ? -2 : e >= 6 && e <= 8 ? 1 : e >= 9 ? 2 : 0;
}
function Vt(e) {
	return e < .2 ? -6 : e < 1 ? -2 : +(e > 4);
}
function Ht(e) {
	let t = e.details?.climate, n = t?.temperatureExtremes?.highTemperatureK ?? null, r = t?.meanTemperatureK ?? null, i = 0;
	return n !== null && (n > 353 ? i -= 2 : n < 273 && (i -= 4)), r === null ? e.temperatureBand === "Temperate" ? i + 2 : e.temperatureBand === "Cold" ? i - 2 : e.temperatureBand === "Frozen" || e.temperatureBand === "Boiling" ? i - 6 : i : (r > 353 ? i -= 4 : r < 273 ? i -= 2 : r >= 279 && r <= 303 && (i += 2), i);
}
function Ut(e) {
	return e ? e.taints.some((e) => e.type.toLowerCase().includes("biologic")) || e.hazards.some((e) => e.type === "Biologic") : !1;
}
function Wt(e) {
	return e === 0 || e === 1 || e === 10 || e === 11 || e === 12 || e >= 15;
}
function Gt(e, t) {
	let n = 0, r = e.atmosphereCode ?? 0;
	return (r < 4 || r > 9) && (n -= 2), e.details?.atmosphere?.oxygenSafety === "low" && (n -= 2), t <= 1 ? n -= 10 : t <= 2 ? n -= 8 : t <= 3 ? n -= 4 : t <= 4 && (n -= 2), n;
}
function Kt(e, t) {
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
function qt(e, t, n) {
	return t <= 0 ? 0 : Math.max(1, Math.ceil(e - 7 + (t + n) / 2));
}
function Jt(e, t, n) {
	return Math.max(0, Math.floor(e + 3 - t / 2 + n));
}
function Yt(e) {
	let { id: t, profile: n, ageGyr: r } = e, i = n.atmosphereCode, a = n.hydrographicsCode;
	if (i === null || a === null || !n.details) return null;
	let o = zt(i), s = Bt(a), c = Vt(r), l = Ht(n), u = o + s + c + l, d = Math.max(-12, Math.min(4, u)), f = Lt(t, "biomass", n, r), p = Math.max(0, f + d), m = "none", h = [`WBH biomass DM ${u >= 0 ? "+" : ""}${u} is clamped to ${d >= 0 ? "+" : ""}${d} within the -12/+4 limits.`];
	if (p === 0 && Ut(n.details.atmosphere)) p = 1, m = "biologic-taint-floor", h.push("Biologic atmospheric taint forces Biomass 1 and Biocomplexity 1 under the WBH special case.");
	else if (p >= 1 && Wt(i)) {
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
	m === "biologic-taint-floor" ? (g = 1, _ = null) : (v = Gt(n, r), _ = Lt(t, "biocomplexity", n, r), g = Math.max(1, _ - 7 + Math.min(9, p) + v));
	let y = null, b = null, x = null, S = null;
	if (g >= 8) {
		let e = Math.min(9, g);
		b = Lt(t, "current-sophont", n, r), y = b + e - 7 >= 13, S = Lt(t, "extinct-sophont", n, r), x = S + e - 7 + +(r > 5) >= 13;
	}
	let C = Lt(t, "biodiversity", n, r), w = qt(C, p, g), T = Kt(n, r), ee = Lt(t, "compatibility", n, r), E = Jt(ee, g, T), D = `${Rt(p)}${Rt(g)}${Rt(w)}${Rt(E)}`;
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
		biodiversityRating: w,
		biodiversityRoll: C,
		compatibilityRating: E,
		compatibilityRoll: ee,
		compatibilityDm: T,
		currentNativeSophont: y,
		currentNativeSophontRoll: b,
		extinctNativeSophontEvidence: x,
		extinctNativeSophontRoll: S,
		profile: D,
		generationNotes: h
	};
}
//#endregion
//#region src/rules/system/wbhSystemNativeLife.ts
function Xt(e, t, n) {
	let r = n.physical;
	if (!r?.details || typeof n.sizeCode != "number" || r.details.gasGiant) return n;
	let i = Yt({
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
function Zt(e, t) {
	let n = e.physical;
	if (!n?.details) return e;
	let r = t.find((t) => t.id === e.aroundStarId);
	if (!r) return e;
	let i = n.details.satellites, a = i && {
		...i,
		moons: i.moons.map((t) => Xt(e, r, t))
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
	let s = Yt({
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
function Qt(e, t) {
	return e.map((e) => Zt(e, t));
}
//#endregion
//#region src/rules/worlds/wbhResourceRating.ts
function $t(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function en(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(Math.max(0, Math.trunc(e)));
}
function tn(e) {
	return e === null ? 0 : e > 1.12 ? 2 : e < .5 ? -2 : 0;
}
function nn(e) {
	return e >= 11 ? 2 : +(e >= 8);
}
function rn(e, t) {
	return e < 1 ? 0 : t <= 3 ? -1 : t >= 8 ? 2 : 0;
}
function an(e) {
	let { id: t, profile: n } = e;
	if (typeof n.sizeCode != "number" || n.sizeCode <= 0 || n.details?.gasGiant) return null;
	let r = n.details?.nativeLife ?? null, i = n.details?.size?.densityTerra ?? null, a = r?.biomassRating ?? 0, o = r?.biodiversityRating ?? 0, s = r?.compatibilityRating ?? 0, c = tn(i), l = a >= 3 ? 2 : 0, u = nn(o), d = rn(a, s), f = c + l + u + d, p = new x($t([
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
		code: en(h),
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
function on(e, t) {
	let n = t.physical;
	if (!n?.details || typeof t.sizeCode != "number" || t.sizeCode <= 0 || n.details.gasGiant) return t;
	let r = an({
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
function sn(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites, r = n && {
		...n,
		moons: n.moons.map((t) => on(e, t))
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
	let a = an({
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
function cn(e, t) {
	return e.map(sn);
}
//#endregion
//#region src/rules/worlds/wbhHabitabilityRating.ts
function ln(e) {
	return "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.max(0, Math.trunc(e))] ?? String(Math.max(0, Math.trunc(e)));
}
function un(e) {
	return e <= 4 ? -1 : +(e >= 9);
}
function dn(e) {
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
function fn(e) {
	return e === 0 ? -4 : e >= 1 && e <= 3 ? -2 : e === 9 ? -1 : e >= 10 ? -2 : 0;
}
function pn(e) {
	return e < .2 ? -4 : e <= .4 ? -2 : e <= .7 ? -1 : e < .9 ? 1 : e < 1.1 ? 0 : e < 1.4 ? -1 : e < 2 ? -3 : -6;
}
function mn(e) {
	return 1 - Math.abs(6 - e);
}
function hn(e) {
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
function gn(e) {
	return e <= 0 ? "Actively hostile world: not survivable without specialised equipment" : e <= 2 ? "Barely habitable world: full protective equipment often needed" : e <= 5 ? "Marginally survivable world with proper equipment" : e <= 7 ? "Regionally habitable world: may require acclimation" : e <= 9 ? "Suitable for human habitation with minimal equipment or acclimation" : "Terra-equivalent garden world";
}
function _n(e) {
	let { profile: t } = e, n = t.sizeCode, r = t.atmosphereCode, i = t.hydrographicsCode;
	if (n === null || r === null || i === null) return null;
	let a = t.details?.atmosphere, o = t.details?.size?.gravityG ?? null, s = hn(t), c = Math.trunc(e.miscellaneousAdjustment ?? 0), l = a?.taints.some((e) => e.code === "L") ? -2 : 0, u = t.details?.rotation?.tidalLockStatus === "1:1" && t.details.rotation.tidalLockCase === "planet-star" ? -2 : 0, d = {
		size: un(n),
		atmosphere: dn(r),
		lowOxygenTaint: l,
		hydrographics: fn(i),
		solarTidalLock: u,
		highTemperature: s.high,
		meanTemperature: s.mean,
		lowTemperature: s.low,
		temperatureFallback: s.fallback,
		gravity: o === null ? mn(n) : pn(o),
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
		code: ln(p),
		baseRating: 10,
		dm: d,
		unclampedTotal: f,
		remarks: gn(p),
		usedDetailedTemperature: s.detailed,
		usedComputedGravity: o !== null,
		generationNotes: m
	};
}
//#endregion
//#region src/rules/system/wbhSystemHabitabilityRating.ts
function vn(e, t) {
	let n = t.physical;
	if (!n?.details || typeof t.sizeCode != "number" || t.sizeCode <= 0 || n.details.gasGiant) return t;
	let r = _n({ profile: n });
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
function yn(e) {
	let t = e.physical;
	if (!t?.details) return e;
	let n = t.details.satellites, r = n && {
		...n,
		moons: n.moons.map((t) => vn(e, t))
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
	let a = _n({ profile: i });
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
function bn(e, t) {
	return e.map(yn);
}
//#endregion
//#region src/rules/system/wbhSystemTidalLocks.ts
function xn(e) {
	return e ? e.meanBaselinePressureBar === null ? e.pressureRangeBar?.minimumBar !== void 0 && e.pressureRangeBar.minimumBar > 2.5 ? e.pressureRangeBar.minimumBar : e.specialSubtype?.minimumPressureBar !== null && e.specialSubtype?.minimumPressureBar !== void 0 && e.specialSubtype.minimumPressureBar > 2.5 ? e.specialSubtype.minimumPressureBar : null : e.meanBaselinePressureBar : null;
}
function Sn(e) {
	return e.details?.size?.massTerra ?? e.details?.gasGiant?.massTerra ?? null;
}
function Cn(e, t) {
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
function wn(e, t, n, r) {
	let i = r.physical, a = i?.details?.rotation, o = Sn(t);
	if (!i || !a || o === null) return r;
	let s = i.details?.gasGiant ? null : typeof r.sizeCode == "number" ? r.sizeCode : 0, c = Ne(Cn(e, r), n, a, {
		sizeCode: s,
		atmospherePressureBar: xn(i.details?.atmosphere),
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
function Tn(e, t) {
	let n = e.physical, r = n?.details?.rotation;
	if (!n || !r) return e;
	let i = t.find((t) => t.id === e.aroundStarId);
	if (!i) return e;
	let a = n.details?.satellites, o = a && {
		...a,
		moons: a.moons.map((t) => wn(e, n, i, t))
	}, s = Ne(e, i, r, {
		sizeCode: n.sizeCode,
		atmospherePressureBar: xn(n.details?.atmosphere),
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
function En(e, t) {
	return bn(cn(Qt(Ft(kt(vt(tt(He(e.map((e) => Tn(e, t)), t), t), t))), t), t), t);
}
//#endregion
//#region src/rules/worlds/wbhAtmosphereGasMix.ts
var Dn = {
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
}, On = {
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
}, kn = {
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
}, An = {
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
}, jn = {
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
}, Mn = {
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
}, Nn = {
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
}, Pn = {
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
function Fn(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function In(e, t, n, r) {
	return new x(Fn([
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
function Ln(e) {
	return e >= 453 ? {
		table: On,
		label: "Boiling 453K+",
		minimum: -2,
		maximum: 13
	} : e >= 353 ? {
		table: kn,
		label: "Boiling 353-453K",
		minimum: 1,
		maximum: 13
	} : e >= 303 ? {
		table: An,
		label: "Hot 303-353K",
		minimum: 1,
		maximum: 13
	} : e >= 273 ? {
		table: jn,
		label: "Temperate 273-303K",
		minimum: 1,
		maximum: 13
	} : e >= 223 ? {
		table: Mn,
		label: "Cold 223-273K",
		minimum: 1,
		maximum: 13
	} : e >= 123 ? {
		table: Nn,
		label: "Frozen 123-223K",
		minimum: 1,
		maximum: 13
	} : {
		table: Pn,
		label: "Frozen below 123K",
		minimum: 1,
		maximum: 13
	};
}
function Rn(e, t) {
	let n = 0;
	return t >= 453 ? (t > 2e3 ? n -= 5 : t >= 700 && (n -= 2), e >= 1 && e <= 7 && --n) : t >= 223 ? e >= 1 && e <= 7 && --n : t >= 123 ? e >= 1 && e <= 7 && (n -= 2) : (t < 70 ? n += 5 : t <= 100 && (n += 3), e >= 1 && e <= 7 && (n -= 3)), e >= 10 && (n += 1), n;
}
function zn(e) {
	return e?.composition === "H2O";
}
function Bn(e, t, n) {
	return e !== "CO" || n > 900 ? e : zn(t) ? "CO2" : e;
}
function Vn(e, t) {
	if (!e || e.diameterKm <= 0 || e.massTerra <= 0 || t <= 0) return null;
	let n = e.diameterKm / 12742;
	return E(1e3 * e.massTerra / (n * t), 3);
}
function Hn(e, t, n) {
	let r = Dn[e] ?? {
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
function Un(e, t) {
	let n = e.find((e) => e.code === t.code);
	n ? n.percentage = E(n.percentage + t.percentage, 1) : e.push(t);
}
function Wn(e) {
	let t = [...e].sort((e, t) => t.percentage - e.percentage).slice(0, 3);
	return t.length ? t.map((e) => `${e.code}-${Math.round(e.percentage).toString().padStart(2, "0")}`).join(":") : null;
}
function Gn(e, t, n, r, i, a, o) {
	if (![
		10,
		11,
		12
	].includes(r) || o === null) return null;
	let s = In(e, t, r, o), c = r, l = Ln(o), u = Rn(n, o), d = Vn(i, o), f = [], p = 0;
	for (let e = 0; e < 6 && p < 95; e += 1) {
		let e = s.roll(2, 6, u).total, t = Math.max(l.minimum, Math.min(l.maximum, e)), n = l.table[t][c], r = Bn(n, a, o), i = 100 - p, m = (s.d6() + 3) / 10;
		Un(f, Hn(r, E(Math.min(i, i * m), 1), d)), p = E(f.reduce((e, t) => e + t.percentage, 0), 1);
	}
	let m = E(Math.max(0, 100 - p), 1), h = ["Gas identities use the WBH temperature/type quick-reference tables; percentages use the Handbook (1D+3)×10% alternative applied successively to the remaining atmosphere.", "WBH quick gas tables are intentionally inspirational and do not guarantee chemically stable combinations; generated values remain Referee-editable source truth."];
	return d !== null && h.push(`Long-term gas-retention threshold is ${d}; a component passes when its WBH escape value is lower than this threshold.`), f.some((e) => e.retainedLongTerm === !1) && h.push("One or more generated gases fail the >1 Gyr WBH retention test and therefore imply replenishment, artificial support, unusual youth, or Referee revision. They are not silently rerolled."), m > 0 && h.push(`${m}% remains unallocated as trace/other gases.`), t.ageGyr < 1 && h.push("World or system is younger than 1 Gyr; WBH permits the Referee to reduce gas escape values for young worlds, but this optional adjustment is not applied automatically."), {
		method: "WBH temperature/type quick table",
		temperatureBand: l.label,
		retentionThreshold: d,
		components: f.sort((e, t) => t.percentage - e.percentage),
		unallocatedPercent: m,
		profile: Wn(f),
		generationNotes: h
	};
}
//#endregion
//#region src/rules/worlds/wbhClimateDetails.ts
function Kn(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function qn(e, t, n, r) {
	return new x(Kn([
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
function Jn(e) {
	return E(Math.max(.02, Math.min(.98, e)), 3);
}
function Yn(e, t, n, r, i) {
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
	].includes(r) || r >= 16 ? a += (e.roll(2, 6).total - 2) * .05 : r === 13 && (a += e.roll(2, 6).total * .03), i >= 2 && i <= 5 ? a += (e.roll(2, 6).total - 2) * .02 : i >= 6 && (a += (e.roll(2, 6).total - 4) * .03), Jn(a);
}
function Xn(e, t, n) {
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
function Zn(e) {
	return e < 222 ? "Frozen" : e < 273 ? "Cold" : e <= 303 ? "Temperate" : e <= 353 ? "Hot" : "Boiling";
}
function Qn(e, t, n, r, i, a, o) {
	let s = qn(e, t, n, r), c = Yn(s, e, i, n, r), l = Xn(s, n, a), u = Math.max(e.au, 1e-6), d = Math.max(t.luminositySolar, 0), f = null, p = null, m = null;
	if (l.effective !== null) {
		let e = d * (1 - c) * (1 + l.effective) / u ** 2;
		f = Math.max(3, Math.round(279 * Math.max(0, e) ** .25)), p = f - 273, m = Zn(f);
	}
	let h = i?.gravityG ?? 0, g = f !== null && h > 0 && n !== 0 ? E(8.5 * f / (h * 288), 3) : null, _ = f !== null && f > 303 && n >= 2 && n <= 15, v = [];
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
var $n = 12742;
function er(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function tr(e, t) {
	return t.primaryStar ? t.primaryStar : e.orbitClass === "Primary" ? e : void 0;
}
function nr(e, t, n, r = "wbh-gas-giant-v1") {
	let i = tr(t, n);
	return new x(er([
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
function rr(e, t) {
	let n = 0, r = [];
	return e ? (e.spectralType === "BD" || e.spectralType === "M" && e.luminosityClass === "V" || e.luminosityClass === "VI") && (--n, r.push("WBH gas-giant category DM-1 applied for a brown dwarf, M-class V, or Class VI primary star.")) : r.push("System primary-star context was unavailable; the WBH primary-star gas-giant category DM was not inferred from the secondary star being orbited."), t !== void 0 && t < .1 ? (--n, r.push("WBH gas-giant category DM-1 applied because system spread is below 0.1.")) : t === void 0 && r.push("System spread was unavailable to the gas-giant sizing procedure; the WBH spread <0.1 DM could not be evaluated."), {
		dm: n,
		notes: r
	};
}
function ir(e, t) {
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
function ar(e) {
	return e === "Small" ? "S" : e === "Medium" ? "M" : "L";
}
function or(e) {
	return {
		diameterTerra: e.die(3) + e.die(3),
		massTerra: 5 * (e.d6() + 1),
		adjusted: !1,
		notes: []
	};
}
function sr(e) {
	return {
		diameterTerra: e.d6() + 6,
		massTerra: 20 * e.roll(3, 6, -1).total,
		adjusted: !1,
		notes: ["WBH Medium row prints a 6–12 Terra-diameter range but specifies 1D+6; TSG follows the explicit formula, producing 7–12."]
	};
}
function cr(e) {
	let t = e.roll(2, 6, 6).total, n = e.die(3), r = e.roll(3, 6).total, i = n * 50 * (r + 4), a = i, o = !1, s = [];
	return i >= 3e3 && (a = 4e3 - e.roll(2, 6, -2).total * 200, o = !0, s.push(`WBH high-mass Large gas-giant rule replaced initial ${i} Terra masses with ${a}.`)), s.push("The WBH high-mass footnote is keyed to an initial mass of at least 3,000 Terra masses; TSG tests the computed initial mass rather than inferring the trigger only from the parenthetical 3D example."), {
		diameterTerra: t,
		massTerra: a,
		adjusted: o,
		notes: s
	};
}
function lr(e, t) {
	return t === "Small" ? or(e) : t === "Medium" ? sr(e) : cr(e);
}
function ur(e, n, r, i, a) {
	let o = ar(e);
	return {
		method: "WBH Gas Giant Sizing",
		category: e,
		categoryCode: o,
		categoryRoll: n,
		categoryDm: r,
		diameterTerra: i.diameterTerra,
		diameterKm: i.diameterTerra * $n,
		massTerra: i.massTerra,
		massAdjustedByHighMassRule: i.adjusted,
		profile: `G${o}${t(i.diameterTerra)}`,
		generationNotes: a
	};
}
function dr(e, t, n = {}) {
	let r = tr(t, n), i = nr(e, t, n), a = rr(r, n.systemSpread), o = ir(i, a.dm), s = lr(i, o.category);
	return ur(o.category, o.roll, a.dm, s, [
		...a.notes,
		...s.notes,
		"Gas-giant mass variance is optional in WBH and is not applied automatically."
	]);
}
function fr(e, t, n, r, i = {}) {
	let a = nr(e, t, i, `wbh-gas-giant-moon-${n.toLowerCase()}-v1`), o = lr(a, n), s = 1;
	for (; o.diameterTerra >= r && s < 64;) o = lr(a, n), s += 1;
	if (o.diameterTerra >= r) throw Error(`Unable to generate a ${n} gas-giant moon smaller than parent diameter ${r} Terra.`);
	return ur(n, 0, 0, o, [
		...o.notes,
		`Gas-giant moon category ${n} was fixed by the WBH Gas Giant Special Moon Sizing table rather than a gas-giant category roll.`,
		`Moon diameter was constrained to be smaller than its parent gas giant (${r} Terra diameters); resolved after ${s} sizing attempt${s === 1 ? "" : "s"}.`,
		"Gas-giant mass variance is optional in WBH and is not applied automatically."
	]);
}
//#endregion
//#region src/rules/worlds/wbhHydrographicsDetails.ts
var pr = {
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
}, mr = {
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
}, hr = [
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
function gr(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function _r(e, t, n) {
	return new x(gr([
		"wbh-hydrographics-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		n
	].join("|")));
}
function vr(e, t, n) {
	return new x(gr([
		"wbh-surface-features-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		n
	].join("|")));
}
function yr(e, t, n, r) {
	return new x(gr([
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
function br(e, t, n) {
	return n <= 0 ? Math.max(0, -4 + e.d10ZeroToNine()) : n >= 10 ? t > 9 ? 100 : Math.min(100, 96 + e.d10ZeroToNine()) : n * 10 - 4 + e.d10ZeroToNine();
}
function xr(e, t) {
	return t >= 6 ? "ocean" : t <= 4 ? "land" : e.d6() <= 3 ? "ocean" : "land";
}
function Sr(e) {
	let t = Math.max(0, Math.min(10, e.roll(2, 6, -2).total)), n = pr[t];
	return {
		code: t,
		description: n.description,
		effect: n.effect
	};
}
function Cr(e) {
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
function k(e) {
	return Number(e.toFixed(2));
}
function wr(e) {
	return (e.die(1e4) - 1) / 9999;
}
function Tr(e, t, n, r, i) {
	if (t <= 0 || e <= 0) return [];
	let a = [], o = e;
	for (let e = 0; e < t; e += 1) {
		let s = t - e - 1;
		if (s === 0) {
			a.push(o);
			break;
		}
		let c = Math.max(n, r === null ? n : o - r * s), l = Math.min(r ?? o, o - n * s), u = l <= c ? c : c + (l - c) * wr(i);
		a.push(u), o -= u;
	}
	let s = a.map(k), c = k(e - s.reduce((e, t) => e + t, 0));
	return s.length && c !== 0 && (s[s.length - 1] = k(s[s.length - 1] + c)), s;
}
function Er(e, t) {
	return t === 1 ? e : e === "sea" ? "seas" : `${e}s`;
}
function Dr(e, t, n, r, i, a) {
	let o = vr(e, t, n), s = i === "ocean" ? Math.max(0, 100 - r) : Math.max(0, r), c = i === "ocean" ? "land" : "water", [l, u] = mr[a], d = s * (l === u ? l : l + (u - l) * wr(o));
	d > 0 && d < 5 && (d = 0);
	let f = Math.max(0, s - d), p = f * (f === 0 ? 0 : .15 + .2 * wr(o)), m = f - p;
	m > 0 && m < 1 && (p += m, m = 0);
	let h = Math.floor(d / 5), g = h <= 0 ? 0 : a >= 9 ? 1 : o.die(Math.min(h, 4) + 1) - 1 || 1, _ = Math.min(4.5, 1.5 + a * .25), v = m > 0 ? Math.ceil(m / 4.99) : 0, y = m > 0 ? Math.ceil(m / _) : 0, b = m >= 1 ? Math.max(1, v, y) : 0, x = p > 0 ? Math.max(1, Math.ceil(p / .8)) : 0, S = i === "ocean" ? "continent" : "ocean", C = S, w = i === "ocean" ? "island" : "sea", T = Tr(d, g, 5, null, o), ee = Tr(m, b, 1, 4.99, o), E = Tr(p, x, .01, .99, o), D = [
		...T.map((e, t) => ({
			id: `${S}-major-${t + 1}`,
			classification: "major",
			kind: S,
			surfacePercent: e
		})),
		...ee.map((e, t) => ({
			id: `${C}-minor-${t + 1}`,
			classification: "minor",
			kind: C,
			surfacePercent: e
		})),
		...E.map((e, t) => ({
			id: `${w}-small-${t + 1}`,
			classification: "small",
			kind: w,
			surfacePercent: e
		}))
	];
	return {
		method: "WBH surface feature distribution",
		discreteFeatureCoveragePercent: k(s),
		discreteFeatureType: c,
		majorCoveragePercent: k(T.reduce((e, t) => e + t, 0)),
		minorCoveragePercent: k(ee.reduce((e, t) => e + t, 0)),
		smallCoveragePercent: k(E.reduce((e, t) => e + t, 0)),
		majorBodyCount: g,
		minorBodyCount: b,
		smallBodyCount: x,
		bodies: D,
		generationPolicy: `WBH supplies the 2D-2 distribution class and map thresholds (major >=5%, minor >=1%, small <1%) but not an exact count formula. Traveller System Generator deterministically allocates the discrete ${c} coverage into ${g} major ${Er(S, g)}, ${b} minor ${Er(C, b)}, and ${x} small ${Er(w, x)} while preserving those thresholds and the table's major-body coverage band.`
	};
}
function Or(e, t) {
	let n = t.reduce((e, t) => e + t.relativeAbundance, 0), r = e.die(n);
	for (let e of t) if (r -= e.relativeAbundance, r <= 0) return e;
	return t[t.length - 1];
}
function kr(e, t, n, r, i) {
	let a = _r(e, t, i), o = br(a, n, i), s = xr(a, i), c = Cr(s), l = Sr(a), u = Dr(e, t, i, o, s, l.code), d = [u.generationPolicy], f = null;
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
function Ar(e, t, n, r, i) {
	if (e.composition === "None" || e.composition === "H2O" || i === null) return e;
	let a = e.generationNotes.filter((e) => !e.includes("awaits the WBH mean-temperature result"));
	if (i > 1e3) return a.push("WBH notes that above 1000K the surface liquid may be magma (liquid rock)."), {
		...e,
		composition: "Magma",
		generationNotes: a
	};
	let o = hr.filter((e) => i >= e.meltingPointK && i <= e.boilingPointK);
	if (o.length === 0) return a.push(`No WBH Possible Exotic Liquid spans the generated mean surface temperature of ${i}K at standard-pressure reference points; Referee determination required.`), {
		...e,
		composition: null,
		generationNotes: a
	};
	let s = Or(yr(t, n, r, i), o);
	return a.push(`WBH temperature-qualified liquid candidates at ${i}K: ${o.map((e) => e.code).join(", ")}. Selection is weighted by the Handbook relative-abundance values.`), a.push("Melting/boiling reference points assume approximately standard atmospheric pressure; pressure-dependent phase chemistry remains outside the Handbook procedure."), {
		...e,
		composition: s.code,
		generationNotes: a
	};
}
//#endregion
//#region src/rules/worlds/wbhOrdinaryAtmosphereGasMix.ts
var jr = /* @__PURE__ */ new Set([
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
function Mr(e, t, n) {
	return {
		name: e,
		code: t,
		percentage: E(n, 1),
		escapeValue: null,
		retainedLongTerm: null,
		taint: !1
	};
}
function Nr(e, t) {
	if (!t || !jr.has(e) || t.oxygenFraction === null) return null;
	let n = E(t.oxygenFraction * 100, 1), r = E(Math.max(0, 100 - n), 1), i = [];
	return r > 0 && i.push(Mr("Nitrogen", "N2", r)), n > 0 && i.push(Mr("Oxygen", "O2", n)), {
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
var Pr = 12742, Fr = 11186, Ir = 8.5, Lr = {
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
}, Rr = {
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
}, zr = [
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
function Br(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Vr(e, t, n, r, i) {
	return new x(Br([
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
function Hr(e, t) {
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
function Ur(e, t, n) {
	let r = n <= 4 ? -1 : n >= 10 ? 3 : +(n >= 6);
	return e.hzDeviation <= 0 ? r += 1 : r -= 1 + Math.floor(e.hzDeviation), t.ageGyr > 10 && --r, r;
}
function Wr(e, t, n, r) {
	let i = e.roll(2, 6, Ur(t, n, r)).total;
	return i <= -4 ? "Exotic Ice" : i <= 2 ? "Mostly Ice" : i <= 6 ? "Mostly Rock" : i <= 11 ? "Rock and Metal" : i <= 14 ? "Mostly Metal" : "Compressed Metal";
}
function Gr(e, t) {
	return Rr[t][e.roll(2, 6).total - 2];
}
function Kr(e, t, n, r) {
	if (r <= 0) return null;
	let i = Hr(e, r), a = Wr(e, t, n, r), o = Gr(e, a), s = i / Pr, c = o * s, l = o * s ** 3;
	return {
		diameterKm: i,
		composition: a,
		densityTerra: o,
		gravityG: E(c, 3),
		massTerra: E(l, 3),
		escapeVelocityKps: E(Math.sqrt(l / s) * Fr / 1e3, 3)
	};
}
function qr(e) {
	return ((e.d6() - 1) * 5 + (e.d6() - 1)) / 30;
}
function Jr(e) {
	return e >= 2 && e <= 9 || e === 13 || e === 14;
}
function Yr(e, t) {
	let n = +(t.ageGyr > 4), r = (e.d6() + n) / 20 + e.roll(2, 6, -7).total / 100;
	return r <= 0 && (r = e.d6() * .01), E(Math.max(0, Math.min(.4, r)), 3);
}
function Xr(e) {
	return e === null ? "not-applicable" : e < .1 ? "low" : e > .5 ? "high" : "within-human-range";
}
function Zr(e, t) {
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
function Qr(e, t, n) {
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
function A(e, t) {
	let n = t === 4 ? -2 : t === 9 ? 2 : 0, r = e.roll(2, 6, n).total, i = zr.find((e) => r <= e.max);
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
	let a = Zr(e, i.code), o = Qr(e, i.code, a.code);
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
function $r(e, t) {
	let n = t === "low" ? "L" : "H", r = Zr(e, n), i = Qr(e, n, r.code);
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
function ei(e, t, n) {
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
		r.push($r(e, n));
		let i = A(e, t);
		return i.extra && (r.push(i.detail), A(e, t).extra && r.push(A(e, t).detail)), r.slice(0, 3);
	}
	let i = A(e, t);
	if (r.push(i.detail), i.extra && r.length < 3) {
		let n = A(e, t);
		r.push(n.detail), n.extra && r.length < 3 && r.push(A(e, t).detail);
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
function ti(e, t, n = !1) {
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
function ni(e, t, n) {
	let r = n >= 2 && n <= 4 ? -2 : 0;
	t.hzDeviation < -1 && (r -= 2), t.hzDeviation > 2 && (r += 2);
	let i = e.roll(2, 6, r).total;
	return i <= 2 ? j("2", "Very Thin, Irritant", !0, .1, .42, .32) : i === 3 ? j("3", "Very Thin", !1, .1, .42, .32) : i === 4 ? j("4", "Thin, Irritant", !0, .43, .7, .27) : i === 5 ? j("5", "Thin", !1, .43, .7, .27) : i === 6 ? j("6", "Standard", !1, .7, 1.49, .79) : i === 7 ? j("7", "Standard, Irritant", !0, .7, 1.49, .79) : i === 8 ? j("8", "Dense", !1, 1.5, 2.49, .99) : i === 9 ? j("9", "Dense, Irritant", !0, 1.5, 2.49, .99) : i === 10 || i === 13 ? j("A", "Very Dense", !1, 2.5, 10, 7.5) : i === 11 || i >= 14 ? j("B", "Very Dense, Irritant", !0, 2.5, 10, 7.5) : j("C", "Very Dense, Occasionally Corrosive", !1, 2.5, 10, 7.5);
}
function ri(e, t, n, r) {
	let i = 0;
	n >= 2 && n <= 4 && (i -= 3), n >= 8 && (i += 2), t.hzDeviation < -1 && (i += 4), t.hzDeviation > 2 && (i -= 2), r === 12 && (i += 2);
	let a = e.roll(2, 6, i).total;
	return a <= 1 ? j("1", "Very Thin, Temperature 50K or less", !1, .1, .42, .32) : a === 2 ? j("2", "Very Thin, Irritant", !0, .1, .42, .32) : a === 3 ? j("3", "Very Thin", !1, .1, .42, .32) : a === 4 ? j("4", "Thin, Irritant", !0, .43, .7, .27) : a === 5 ? j("5", "Thin", !1, .43, .7, .27) : a === 6 ? j("6", "Standard", !1, .7, 1.49, .79) : a === 7 ? j("7", "Standard, Irritant", !0, .7, 1.49, .79) : a === 8 ? j("8", "Dense", !1, 1.5, 2.49, .99) : a === 9 ? j("9", "Dense, Irritant", !0, 1.5, 2.49, .99) : a === 10 ? j("A", "Very Dense", !1, 2.5, 10, 7.5) : a === 11 ? j("B", "Very Dense, Irritant", !0, 2.5, 10, 7.5) : a === 12 ? ti("C", "Extremely Dense") : a === 13 ? ti("D", "Extremely Dense, Temperature 500K+") : ti("E", "Extremely Dense, Temperature 500K+, Irritant", !0);
}
function ii(e, t) {
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
function ai(e, t, n) {
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
	}, ii(e, !0)] : [ii(e, r)];
}
function oi(e, t, n, r, i, a) {
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
function si(e, t, n, r) {
	if (e !== 13 || t === null || n === null || r === null) return null;
	let i = Math.max(n / 2, r / .5);
	return i <= 1 ? 0 : E(Math.log(i) * t, 3);
}
function ci(e, t, n, r) {
	if (e !== 14 || t === null || n === null || r === null || r <= 0) return null;
	if (r >= .1) return 0;
	let i = .1 / r;
	return n * i > 2 ? null : E(Math.log(i) * t, 3);
}
function li(e, t, n, r, i, a) {
	let o = Lr[r] ?? { classification: `Atmosphere ${r}` }, s = null;
	r === 10 ? s = ni(e, t, i) : (r === 11 || r === 12) && (s = ri(e, t, i, r));
	let c = s ? {
		minimumBar: s.pressureRangeBar?.minimumBar,
		maximumBar: s.pressureRangeBar?.maximumBar,
		spanBar: s.pressureSpanBar
	} : o, l = c.minimumBar !== void 0 && c.maximumBar !== void 0 ? {
		minimumBar: c.minimumBar,
		maximumBar: c.maximumBar
	} : null, u = null;
	r === 0 ? u = 0 : c.minimumBar !== void 0 && c.spanBar !== void 0 && c.spanBar !== null && (u = E(c.minimumBar + c.spanBar * qr(e), 3));
	let d = null, f = null, p = null, m = null;
	Jr(r) && u !== null && (d = Yr(e, n), f = E(u * d, 3), p = E(u - f, 3), a && a.gravityG > 0 && (m = E(Ir / a.gravityG, 3)));
	let h = Xr(f), g = ei(e, r, h);
	s?.irritant && g.push(A(e, r).detail);
	let _ = ai(e, r, s), v = [];
	return [
		5,
		6,
		8
	].includes(r) && h !== "within-human-range" && v.push("WBH Referee choice required: nominally breathable atmosphere has oxygen partial pressure outside 0.1-0.5 bar; preserve established Atmosphere code until reviewed."), Jr(r) && v.push("Scale height currently uses the WBH temperate baseline 8.5 km / gravity; apply Kelvin temperature refinement when detailed mean temperature is implemented."), r === 10 && v.push("Exotic subtype and pressure are generated; detailed gas composition is deferred until gas-retention/temperature-aware composition is implemented."), (r === 11 || r === 12) && (v.push("Corrosive/Insidious subtype and applicable hazard are generated; detailed gas composition remains deferred until WBH temperature-aware gas-mix procedures are implemented."), v.push("WBH runaway-greenhouse subtype DM is not applied until runaway-greenhouse status is represented as structured source data."), s?.pressureUnbounded && v.push("WBH defines this subtype as 10+ bar with no upper bound; no mean pressure is invented before a bounded pressure procedure is available."), _.some((e) => e.code === "B") && v.push("Insidious biologic hazard implies Biomass Rating at least 1; enforce that constraint when WBH native-life generation is implemented."), _.some((e) => e.code === "R") && v.push("Insidious radioactivity hazard source is recorded; detailed radiation exposure values remain a later hazard-effect integration.")), r === 15 && v.push("Unusual atmosphere subtype remains deferred: WBH outcomes depend on prerequisite-specific conditions such as Panthalassic hydrographics and other world state; no subtype is invented here."), {
		classification: o.classification,
		pressureRangeBar: l,
		pressureSpanBar: c.spanBar ?? null,
		meanBaselinePressureBar: u,
		oxygenFraction: d,
		oxygenPartialPressureBar: f,
		nitrogenPartialPressureBar: p,
		scaleHeightKm: m,
		oxygenSafety: h,
		minimumSafeAltitudeKm: si(r, m, p, f),
		safeAltitudeBelowMeanKm: ci(r, m, p, f),
		taints: g,
		hazards: _,
		specialSubtype: s,
		profile: oi(r, u, f, g, _, s),
		generationNotes: v
	};
}
function di(e, t, n, r, i) {
	let a = Vr(e, t, n, r, i), o = Kr(a, e, t, n);
	return {
		size: o,
		atmosphere: li(a, e, t, r, n, o)
	};
}
//#endregion
//#region src/rules/worlds/wbhPlanetoidBeltDetails.ts
function fi(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function pi(e, t) {
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
function mi(e, t, n) {
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
function hi(e, n) {
	let r = new x(fi(`wbh-planetoid-belt-prereq-v1|${e.id}|${e.orbitNumber}|${e.hzco}|${n.ageGyr}`)), i = e.orbitNumber < e.hzco ? -4 : e.orbitNumber > e.hzco + 2 ? 4 : 0, a = r.roll(2, 6).total + i, o = mi(pi(r, a), a, i), s = r.roll(2, 6).total + 2, c = -Math.floor(n.ageGyr / 2), l = Math.floor(o.carbonaceousPercent / 10), u = c + l, d = Math.max(1, s + u), f = r.roll(2, 6).total, p = Math.floor(o.metallicPercent / 10), m = -Math.ceil(o.carbonaceousPercent / 10), h = d + p + m, g = f - 7 + h, _ = Math.max(1, g);
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
var gi = 8766;
function _i(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function vi(e, t, n, r) {
	return new x(_i([
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
function yi(e) {
	return (e.d6() - 1) * 10 + e.d10ZeroToNine();
}
function bi(e, t, n) {
	let r = Math.floor(Math.max(0, t) / 2), i = n ? 2 : 4, a = () => e.roll(2, 6, -2).total * i + 2 + e.d6() + r, o = a(), s = 0, c = 0;
	for (; o >= 40 && c < 16 && (c += 1, !(e.d6() < 5));) o += a(), s += 1;
	return {
		hours: o,
		additions: s
	};
}
function xi(e) {
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
		let a = yi(e), o = yi(e);
		n += a / 60 + o / 3600, i.push("WBH linear minute/second variance applied to an Extreme Axial Tilt result.");
	}
	for (; n > 180;) n = 360 - n;
	return {
		degrees: E(Math.max(0, Math.min(180, n)), 4),
		extreme: r,
		notes: i
	};
}
function Si(e, t, n) {
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
function Ci(e, t, n) {
	let r = vi(e, t, n.isGasGiant ?? !1, n.sizeCode ?? null), i = (n.isGasGiant ?? !1) || n.sizeCode === 0, a = bi(r, t.ageGyr, i), o = yi(r), s = yi(r), c = E(a.hours + o / 60 + s / 3600, 6), l = xi(r), u = l.degrees > 90 ? "Retrograde" : "Prograde", d = Si(Math.max(0, n.orbitalPeriodYears) * gi, c, u === "Retrograde"), f = [
		`WBH basic rotation uses ${i ? "×2" : "×4"} because this ${i ? "is a gas giant or Size 0/S body" : "is not a gas giant or Size 0/S body"}.`,
		`System age ${E(t.ageGyr, 3)} Gyr contributes DM+${Math.floor(Math.max(0, t.ageGyr) / 2)}.`,
		...a.additions > 0 ? [`WBH 40+ hour extension added ${a.additions} additional basic rotation determination(s).`] : [],
		...l.notes,
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
var wi = 149597870.9, Ti = 3e-6, Ei = 1.5;
function Di(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Oi(e, t, n, r) {
	return r ? new x(Di([
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
	].join("|"))) : new x(Di([
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
function ki(e, t, n, r) {
	return new x(Di([
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
function Ai(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function ji(e, t, n, r) {
	let i, a;
	r ? r.category === "Small" ? (i = 3, a = -7) : (i = 4, a = -6) : t <= 2 ? (i = 1, a = -5) : t <= 9 ? (i = 2, a = -8) : (i = 2, a = -6);
	let o = n < 1 ? -i : 0;
	return e.roll(i, 6, a + o).total;
}
function Mi(e, t) {
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
function Ni(e, t) {
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
function Pi(e, t) {
	let n = e.d6();
	if (n <= 3) return { sizeCode: "S" };
	if (n <= 5) {
		let t = e.die(3) - 1;
		return t === 0 ? "R" : { sizeCode: t };
	}
	return Ni(e, t);
}
function Fi(e, t) {
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
	let r = Ai(e.roll(2, 6, -7 + n).total, 0, 15), i = 0;
	return (r <= 1 || r >= 10) && (i -= 4), {
		numericSizeCode: n,
		atmosphereCode: r,
		hydrographicsCode: Ai(e.roll(2, 6, -7 + r + i).total, 0, 10)
	};
}
function Ii(e, t, n) {
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
function Li(e, t, n) {
	let r = n.massTerra * Ti, i = Math.max(t.massSolar, 1e-6), a = e.au * (1 - e.eccentricity) * Math.cbrt(r / (3 * i)), o = a * wi / n.diameterKm;
	return {
		au: E(a, 6),
		pd: E(o, 3),
		moonLimitPd: E(o / 2, 3)
	};
}
function Ri(e, t) {
	let n = Math.max(0, Math.floor(e) - 2);
	return n <= 200 ? n : Math.min(n, 200 + t);
}
function zi(e, t) {
	return t ? 6 : e === "Inner" ? -1 : e === "Middle" ? 1 : 4;
}
function Bi(e, t) {
	let n = e.d6() + +(t < 60), r, i;
	return n <= 3 ? (r = "Inner", i = e.roll(2, 6, -2).total * t / 60 + 2) : n <= 5 ? (r = "Middle", i = e.roll(2, 6, -2).total * t / 30 + t / 6 + 3) : (r = "Outer", i = e.roll(2, 6, -2).total * t / 20 + t / 2 + 4), {
		range: r,
		pd: E(Math.max(2, i), 2)
	};
}
function Vi(e, t) {
	let n = e.roll(2, 6, t).total, r;
	return r = n <= 5 ? -.001 + e.d6() / 1e3 : n <= 7 ? e.d6() / 200 : n <= 9 ? .03 + e.d6() / 100 : n === 10 ? .05 + e.d6() / 20 : n === 11 ? .05 + e.roll(2, 6).total / 20 : .3 + e.roll(2, 6).total / 20, E(Math.max(0, Math.min(.999, r)), 3);
}
function Hi(e, t) {
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
function Ui(e, t) {
	return t <= 0 ? 0 : E(Math.sqrt(e ** 3 / t) / 361730, 3);
}
function Wi(e, t) {
	return t ? {
		diameterKm: t.diameterKm,
		massTerra: t.massTerra
	} : e ? {
		diameterKm: e.diameterKm,
		massTerra: e.massTerra
	} : null;
}
function Gi(e, t, n, r, i, a, o) {
	let s = Wi(r, a);
	if (!s || !a && n <= 0) return null;
	let c = Oi(e, t, n, a), l = ji(c, n, e.orbitNumber, a), u = +(l === 0), d = Math.max(0, l), f = Li(e, t, s), p = ["WBH Hill sphere currently uses the immediate parent star mass supplied to the physical-world generator. Full multiple-interior-star mass aggregation remains a hierarchy-aware refinement.", "WBH companion/unavailability adjacency DMs for significant-moon quantity require broader system-slot context and are not yet applied in this per-world phase."];
	a && (p.push(`Gas-giant significant-moon quantity uses the WBH ${a.category === "Small" ? "3D-7" : "4D-6"} row for ${a.category} gas giants.`), p.push("Gas-giant moon sizing uses the WBH Gas Giant Special Moon Sizing table, including rare smaller gas-giant moons."));
	let m = d;
	f.moonLimitPd < Ei && (d > 0 && f.moonLimitPd >= .55 && (u += 1), m = 0, p.push("Hill Sphere Moon Limit is below the Roche limit; significant moons are removed per WBH.")), f.moonLimitPd < .55 && (u = 0, p.push("Hill Sphere Moon Limit is below 0.55 PD; significant rings are also precluded."));
	let h = [];
	for (let e = 0; e < m; e += 1) if (a) {
		let e = Pi(c, a);
		e === "R" ? u += 1 : h.push(e);
	} else {
		let e = Mi(c, n);
		e === "R" ? u += 1 : h.push({ sizeCode: e });
	}
	let g = Ri(f.moonLimitPd, h.length), _ = h.map(() => Bi(c, g)).sort((e, t) => e.pd - t.pd);
	for (let e = 1; e < _.length; e += 1) _[e].pd <= _[e - 1].pd && (_[e].pd = E(_[e - 1].pd + 1, 2));
	let v = h.map((n, r) => {
		let l = String.fromCharCode(97 + r), u = _[r], d = u.pd > g, p = u.pd > f.moonLimitPd, m = zi(u.range, d), h = Vi(c, m), v = m + (p ? 2 : 0), y = c.roll(2, 6, v).total >= 10, b = E(u.pd * s.diameterKm, 0), x = `${e.id}.${l}`, S, C = Ii(e, l, h);
		if (n.gasGiantCategory && o && a) S = o(C, n.gasGiantCategory, a.diameterTerra);
		else if (i) {
			let r = Fi(ki(e, t, l, n.sizeCode), n.sizeCode);
			S = i(C, r.numericSizeCode, r.atmosphereCode, r.hydrographicsCode);
		}
		return {
			designation: l,
			sizeCode: n.sizeCode,
			orbitRange: u.range,
			orbitPd: u.pd,
			orbitKm: b,
			eccentricity: h,
			direction: y ? "Retrograde" : "Prograde",
			periodHours: Ui(b, s.massTerra),
			beyondHillMoonLimit: p,
			sourceId: x,
			physical: S
		};
	}), y = Hi(c, u);
	y.some((e) => e.centrePd + e.spanPd / 2 > Ei) && p.push("At least one significant ring extends beyond the nominal 1.5 PD Roche limit; WBH permits the span to remain and later moon-gap handling can refine overlaps."), (i || o) && v.length > 0 && p.push("Significant moons include additive WBH physical profiles generated from dedicated moon sub-seeds; adding moon detail does not perturb established satellite geometry.");
	let b = v.map((e) => {
		let t = e.physical?.details?.gasGiant?.profile;
		return `${e.designation}:${t ?? e.sizeCode}@${e.orbitPd}PD`;
	}).join(","), x = y.length ? `R${String(y.length).padStart(2, "0")}:${y.map((e) => `${e.centrePd}-${e.spanPd}`).join(",")}` : "R00";
	return {
		method: "WBH significant moons and rings",
		hillSphereAu: f.au,
		hillSpherePd: f.pd,
		hillSphereMoonLimitPd: f.moonLimitPd,
		rocheLimitPd: Ei,
		moonOrbitRangePd: g,
		moons: v,
		rings: y,
		profile: `${x}${b ? ` ${b}` : ""}`,
		generationNotes: p
	};
}
//#endregion
//#region src/rules/worlds/wbhUnusualAtmosphereDetails.ts
var Ki = {
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
function qi(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Ji(e, t, n) {
	return new x(qi([
		"wbh-unusual-atmosphere-v1",
		e.id,
		e.aroundDesignation,
		e.orbitNumber,
		e.au,
		t.designation,
		n
	].join("|")));
}
function Yi(e) {
	return e.die(2) * 10 + e.d6();
}
function Xi(e) {
	switch (Yi(e)) {
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
function Zi(e, t, n) {
	return e === "6" ? (t?.gravityG ?? 0) > 1.2 : e === "7" ? n >= 10 : e !== "8" || n >= 5;
}
function Qi(e, t, n) {
	let r = Ki[e], i = [];
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
function $i(e, t, n, r = /* @__PURE__ */ new Set()) {
	for (let i = 0; i < 64; i += 1) {
		let i = Xi(e);
		if (i !== "COMBINATION" && !r.has(i) && Zi(i, t, n)) return i;
	}
	return "F";
}
function ea(e, t) {
	let n = /* @__PURE__ */ new Set([
		"1",
		"2",
		"3"
	]);
	return !!(n.has(e) && n.has(t) || e === "F" || t === "F");
}
function ta(e, t, n) {
	let r = [];
	for (let i = 0; i < 64; i += 1) {
		let i = Xi(e);
		if (i === "COMBINATION") {
			let i = $i(e, t, n, /* @__PURE__ */ new Set(["F"])), a = $i(e, t, n, /* @__PURE__ */ new Set([i, "F"]));
			for (let r = 0; r < 32 && ea(i, a); r += 1) a = $i(e, t, n, /* @__PURE__ */ new Set([i, "F"]));
			return ea(i, a) ? (r.push("WBH Combination could not produce two compatible automated results; resolved as Other for Referee definition."), {
				codes: ["F"],
				combination: !1,
				notes: r
			}) : (r.push("WBH Combination result resolved as two independently rolled, prerequisite-valid, compatible subtypes."), {
				codes: [i, a],
				combination: !0,
				notes: r
			});
		}
		if (Zi(i, t, n)) return {
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
function na(e, t) {
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
function ra(e, t, n, r) {
	let i = Ji(e, t, r), a = ta(i, n, r), o = a.codes.map((e) => Qi(e, n, r)), s = na(i, o), c = [...a.notes];
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
function ia(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function aa(e) {
	return e <= -3 ? "Inner" : e < -.75 ? "Inferno" : e <= .75 ? "Habitable Zone" : e <= 3 ? "Outer" : "Frozen";
}
function oa(e, t, n) {
	let r = t >= 10 ? 1 : t >= 4 ? 0 : -1, i = n >= 6 ? -1 : 0, a = {
		Inner: 4,
		Inferno: 3,
		"Habitable Zone": 1,
		Outer: -1,
		Frozen: -3
	}[e] + r + i;
	return a >= 4 ? "Inferno" : a >= 2 ? "Hot" : a >= 0 ? "Temperate" : a >= -2 ? "Cold" : "Frozen";
}
function sa(e) {
	return e === "Inner" || e === "Inferno" ? "Hot" : e === "Frozen" ? "Frozen" : "Cold";
}
function M(e, t) {
	return E(Math.sqrt(e ** 3 / Math.max(t, .01)), 3);
}
function ca(e, t) {
	let n = e.roll(2, 6, -2).total;
	return (t === "Inner" || t === "Frozen") && --n, t === "Habitable Zone" && (n += 1), ia(n, 0, 15);
}
function la(e, t, n) {
	if (t === 0) return 0;
	let r = e.roll(2, 6, -7 + t).total;
	return (n === "Inner" || n === "Inferno") && (r += 1), n === "Frozen" && (r -= 2), ia(r, 0, 15);
}
function ua(e, t, n, r) {
	if (t <= 1 || n <= 1) return 0;
	let i = e.roll(2, 6, -7 + t).total;
	return (r === "Inner" || r === "Inferno") && (i -= 4), r === "Outer" && --i, r === "Frozen" && (i -= 3), [
		10,
		11,
		12
	].includes(n) && (i -= 2), ia(i, 0, 10);
}
function da(e, t, n, r, i, a = !0) {
	let o = di(e, t, n, r, i), s = kr(e, t, n, r, i), c = o.atmosphere;
	if (r === 15 && o.atmosphere) {
		let n = ra(e, t, o.size, i);
		c = {
			...o.atmosphere,
			pressureRangeBar: n.pressureRangeBar,
			pressureSpanBar: n.pressureSpanBar,
			meanBaselinePressureBar: n.meanBaselinePressureBar,
			unusual: n.detail,
			generationNotes: [...o.atmosphere.generationNotes.filter((e) => !e.startsWith("Unusual atmosphere subtype remains deferred")), ...n.detail.generationNotes]
		};
	}
	let l = Qn(e, t, r, i, o.size, c, s), u = Ar(s, e, t, r, l.meanTemperatureK), d = Gn(e, t, n, r, o.size, u, l.meanTemperatureK) ?? Nr(r, c), f = c && {
		...c,
		gasMix: d
	}, p = Ci(e, t, {
		sizeCode: n,
		orbitalPeriodYears: M(e.au, t.massSolar)
	}), m = a ? Gi(e, t, n, o.size, (e, n, r, i) => _a(e, t, n, r, i, !1, "Physical profile generated for a WBH significant moon.")) : null;
	return {
		...o,
		atmosphere: f,
		hydrographics: u,
		climate: l,
		rotation: p,
		satellites: m
	};
}
function fa(e, t, n, r, i) {
	let a = aa(e.hzDeviation), o = M(e.au, t.massSolar), s = fr(e, t, n, r, i), c = Ci(e, t, {
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
		temperatureBand: sa(a),
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
function pa(e, t, n, r, i) {
	e.roll(2, 6), e.roll(2, 6);
	let a = M(t.au, n.massSolar), o = dr(t, n, i), s = Ci(t, n, {
		isGasGiant: !0,
		sizeCode: null,
		orbitalPeriodYears: a
	}), c = Gi(t, n, 0, null, (e, t, r, i) => _a(e, n, t, r, i, !1, "Physical profile generated for a WBH significant gas-giant moon."), o, (e, t, r) => fa(e, n, t, r, i));
	return {
		zone: r,
		sizeCode: null,
		atmosphereCode: null,
		hydrographicsCode: null,
		uwpPhysical: o.profile,
		temperatureBand: sa(r),
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
function ma(e, t, n) {
	return {
		zone: n,
		sizeCode: 0,
		atmosphereCode: 0,
		hydrographicsCode: 0,
		uwpPhysical: "000",
		temperatureBand: n === "Habitable Zone" ? "Temperate" : n,
		notes: "Planetoid belt; WBH composition, bulk and natural Resource Rating generated for system comparison.",
		orbitalPeriodYears: M(e.au, t.massSolar),
		details: {
			size: null,
			atmosphere: null,
			planetoidBelt: hi(e, t)
		}
	};
}
function ha(e) {
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
function ga(e, n, r, i) {
	let a = ca(e, i), o = la(e, a, i), s = ua(e, a, o, i);
	return {
		zone: i,
		sizeCode: a,
		atmosphereCode: o,
		hydrographicsCode: s,
		uwpPhysical: `${t(a)}${t(o)}${t(s)}`,
		temperatureBand: oa(i, o, s),
		notes: n.hzDeviation > 3 ? "Distant ice/rock world." : n.hzDeviation < -2 ? "Inner rocky world." : "Terrestrial world candidate.",
		orbitalPeriodYears: M(n.au, r.massSolar),
		details: da(n, r, a, o, s)
	};
}
function _a(e, n, r, i, a, o, s) {
	let c = aa(e.hzDeviation);
	return {
		zone: c,
		sizeCode: r,
		atmosphereCode: i,
		hydrographicsCode: a,
		uwpPhysical: `${t(r)}${t(i)}${t(a)}`,
		temperatureBand: oa(c, i, a),
		notes: s,
		orbitalPeriodYears: M(e.au, n.massSolar),
		details: da(e, n, r, i, a, o)
	};
}
function va(e, t, n, r = {}) {
	let i = aa(t.hzDeviation), a, o = t.worldKind;
	return a = o === "Gas Giant" ? pa(e, t, n, i, r) : o === "Planetoid Belt" ? ma(t, n, i) : o === "Empty Orbit" ? ha(i) : ga(e, t, n, i), {
		...a,
		orbitalPeriodYears: M(t.au, n.massSolar)
	};
}
function ya(e, t, n, r, i) {
	return _a(e, t, n, r, i, !0, "Physical profile imported from source UWP.");
}
//#endregion
//#region src/rules/worlds/wbhGovernmentType.ts
var ba = [
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
function xa(e) {
	return Math.max(0, Math.min(15, Math.trunc(e)));
}
function Sa(e) {
	return ba[xa(e)] ?? "Unknown";
}
function Ca(e, t) {
	if (t <= 0) return {
		method: "WBH government type",
		source: "generated",
		populationCode: 0,
		roll: null,
		modifier: null,
		unclampedTotal: 0,
		governmentCode: 0,
		governmentType: Sa(0),
		generationNotes: ["Population 0 has Government 0."]
	};
	let n = t - 7, r = e.roll(2, 6).total, i = r + n, a = xa(i);
	return {
		method: "WBH government type",
		source: "generated",
		populationCode: t,
		roll: r,
		modifier: n,
		unclampedTotal: i,
		governmentCode: a,
		governmentType: Sa(a),
		generationNotes: ["Government code = 2D - 7 + Population code, bounded to 0-F."]
	};
}
function wa(e, t) {
	let n = e <= 0 ? 0 : xa(t);
	return {
		method: "WBH government type",
		source: "imported",
		populationCode: e,
		roll: null,
		modifier: null,
		unclampedTotal: n,
		governmentCode: n,
		governmentType: Sa(n),
		generationNotes: [e <= 0 ? "Population 0 forces Government 0." : "Government code preserved from the source UWP."]
	};
}
//#endregion
//#region src/rules/worlds/wbhMajorCities.ts
function Ta(e) {
	return Math.max(0, Math.ceil(e));
}
function Ea(e, t, n, r) {
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
function Da(e, t, n, r, i) {
	if (n === 0) {
		let t = e.d6(), n = Math.min(i / 100, (t + 2) * 1e4);
		return n < 100 && (n = Math.max(i / 10, t + 1)), {
			populationAllocationCase: 1,
			largestNonMajorCityPopulation: Ta(n),
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
		cities: Ea(r, [100], [[]], [null])
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
			cities: Ea(r, t, i, Array(n).fill(null))
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
		cities: Ea(r, h, d, u)
	};
}
function Oa(e, t) {
	let n = t.populationConcentration, r = t.urbanisation;
	if (t.populationCode <= 0 || !n || !r) return null;
	let i = t.populationCode, a = n.rating, o = r.totalUrbanPopulation, s = r.urbanisationPercent, c = [];
	if (a === 0) {
		c.push("WBH Major Cities Case 1: PCR 0 has no major cities.");
		let t = Da(e, a, 0, 0, o);
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
		let t = Da(e, a, 1, o, o);
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
		let n = Da(e, a, t, o, o);
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
		let r = Da(e, a, n, o, o);
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
	let f = e.d6(), p = Ta(a / (f + 7) * o), m = o > 0 ? p / o * 100 : 0, h = Da(e, a, d, p, o);
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
var ka = [
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
function Aa(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function ja(e) {
	let t = e.physical?.details?.rotation;
	return t?.tidalLockStatus === "1:1" && t.tidalLockCase === "planet-star";
}
function Ma(e) {
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
function Na(e, t) {
	let n = [], r = e.physical?.sizeCode ?? 0, i = t.populationCode, a = t.governmentCode, o = t.techLevel, s = Ma(e), c = new Set(t.tradeCodes), l = (e, t) => {
		n.push({
			source: e,
			dm: t
		});
	};
	return r === 1 ? l("Size 1", 2) : (r === 2 || r === 3) && l(`Size ${r}`, 1), ja(e) && l("Twilight zone world", 2), s >= 8 ? l(`Minimum sustainable TL ${s}`, 3) : s >= 3 && l(`Minimum sustainable TL ${s}`, 1), i === 8 ? l("Population 8", -1) : i >= 9 && l(`Population ${i}`, -2), a === 7 && l("Government 7", -2), o <= 1 ? l(`Tech Level ${o}`, -2) : o <= 3 ? l(`Tech Level ${o}`, -1) : o <= 9 && l(`Tech Level ${o}`, 1), c.has("Ag") && l("Agricultural", -2), c.has("In") && l("Industrial", 1), c.has("Na") && l("Non-Agricultural", -1), c.has("Ri") && l("Rich", 1), n;
}
function Pa(e, t, n) {
	if (n.populationCode <= 0) return null;
	let r = n.populationCode, i = +(r >= 9), a = [], o = null;
	if (r < 6) {
		if (o = e.d6(), o > r) return a.push("Population below 6 and the preliminary 1D roll exceeded the Population code: the entire population occupies one settlement area, so PCR is 9."), {
			method: "WBH population concentration rating",
			rating: 9,
			description: ka[9],
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
	let s = e.d6(), c = Na(t, n), l = c.reduce((e, t) => e + t.dm, 0), u = s + l, d = Aa(u, i, 9);
	return a.push(r >= 9 ? "Population 9+ sets the WBH minimum PCR to 1." : "WBH minimum PCR is 0 for Population below 9."), a.push("PCR is bounded to a maximum of 9."), {
		method: "WBH population concentration rating",
		rating: d,
		description: ka[d],
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
function Fa(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Ia(e) {
	return e.die(2);
}
function La(e, t) {
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
		percentage: 22 + e.d6() * 2 + Ia(e),
		range: "25–36%"
	} : t === 6 ? {
		percentage: 34 + e.d6() * 2 + Ia(e),
		range: "37–48%"
	} : t === 7 ? {
		percentage: 46 + e.d6() * 2 + Ia(e),
		range: "49–60%"
	} : t === 8 ? {
		percentage: 58 + e.d6() * 2 + Ia(e),
		range: "61–72%"
	} : t === 9 ? {
		percentage: 70 + e.d6() * 2 + Ia(e),
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
function Ra(e, t, n) {
	let r = [], i = (e, t) => {
		r.push({
			source: e,
			dm: t
		});
	}, a = Ma(e), o = e.physical?.sizeCode ?? 0, s = t.populationCode, c = t.governmentCode, l = t.lawLevelCode, u = t.techLevel, d = new Set(t.tradeCodes);
	return n <= 2 ? i(`PCR ${n}`, -3 + n) : n >= 7 && i(`PCR ${n}`, -6 + n), a <= 3 && i(`Minimum sustainable TL ${a}`, -1), o === 0 && i("Size 0", 2), s === 8 ? i("Population 8", 1) : s === 9 ? i("Population 9", 2) : s >= 10 && i(`Population ${s}`, 4), c === 0 && i("Government 0", -2), l >= 9 && i(`Law Level ${l}`, 1), u <= 2 ? i(`Tech Level ${u}`, -2) : u === 3 ? i("Tech Level 3", -1) : u === 4 ? i("Tech Level 4", 1) : u <= 9 ? i(`Tech Level ${u}`, 2) : i(`Tech Level ${u}`, 1), d.has("Ag") && i("Agricultural", -2), d.has("Na") && i("Non-Agricultural", 2), r;
}
function za(e, t) {
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
function Ba(e, t, n) {
	if (n.populationCode <= 0 || !n.populationConcentration) return null;
	let r = n.populationConcentration.rating, i = Ra(t, n, r), a = i.reduce((e, t) => e + t.dm, 0), o = e.roll(2, 6).total, s = o + a, c = La(e, s), l = za(e, n), u = l.minimums.length ? l.minimums.reduce((e, t) => t.percentage > e.percentage ? t : e) : null, d = l.maximums.length ? l.maximums.reduce((e, t) => t.percentage < e.percentage ? t : e) : null, f = c.percentage, p = null, m = null;
	u && f < u.percentage && (f = u.percentage, p = u), d && f > d.percentage && (!u || u.percentage <= d.percentage) && (f = d.percentage, m = d), f = Fa(f, 0, 100);
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
function Va(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Ha(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function N(e) {
	return t(Va(e, 0, 33));
}
function Ua(e) {
	return e >= 11 ? "A" : e >= 9 ? "B" : e >= 7 ? "C" : e >= 5 ? "D" : e >= 3 ? "E" : "X";
}
function Wa(e) {
	let t = e.physical, n = 0;
	return t?.zone === "Habitable Zone" && (n += 1), t?.temperatureBand === "Temperate" && (n += 1), e.worldKind === "Planetoid Belt" && --n, e.worldKind === "Gas Giant" && (n -= 3), n;
}
function Ga(e) {
	return e.physical?.details?.nativeLife?.currentNativeSophont === !0;
}
function Ka(e, t) {
	return Ga(e) ? {
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
function qa(e, t) {
	return e.isMainworld === !0 || Ga(e) || t?.origin === "transplanted";
}
function Ja(e) {
	for (let t = 0; t < 32; t += 1) {
		let t = Va(e.roll(2, 6, -2).total, 0, 10);
		if (t > 0) return t;
	}
	return 1;
}
function Ya(e, t, n) {
	return t === "native-sophont" ? e.die(3) + e.die(3) + 4 : t === "transplanted" ? typeof n?.populationCode == "number" ? Va(Math.trunc(n.populationCode), 1, 10) : Ja(e) : 0;
}
function Xa(e, t) {
	if (t === 0) return 0;
	let n = e.die(3), r = e.die(3);
	return (n - 1) * 3 + r;
}
function Za(e, t, n = null) {
	if (e === 0 || t === 0) return 0;
	let r = t + (n === null ? 0 : n / 10);
	return Math.round(r * 10 ** e);
}
function Qa(e, t, n, r, i) {
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
	let a = e.d10ZeroToNine(), o = Za(t, n, a), s = `${n}.${a}`, c = ["P value uses the WBH two-D3 procedure; one d10 supplies an additional significant digit."];
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
function $a(e, t, n) {
	return n === 0 ? 0 : Va(e.roll(2, 6, -7 + t).total, 0, 18);
}
function eo(e, t, n, r, i, a) {
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
function to(e) {
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
function no(e, t, n, r, i, a) {
	if (r === 0) return 0;
	let o = n.physical, s = o?.sizeCode ?? 0, c = o?.atmosphereCode ?? 0, l = o?.hydrographicsCode ?? 0, u = e.die(6) + eo(t, s, c, l, r, i);
	return Va(Math.max(u, a), 0, 15);
}
function P(e, t, n) {
	return e >= t && e <= n;
}
function ro(e, t, n, r) {
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
function io(e) {
	let t = 0;
	return (e.starport === "A" || e.starport === "B") && (t += 1), (e.starport === "D" || e.starport === "E" || e.starport === "X") && --t, e.populationCode <= 6 && --t, e.populationCode >= 9 && (t += 1), e.techLevel <= 8 && --t, e.techLevel >= 10 && e.techLevel <= 15 && (t += 1), e.techLevel >= 16 && (t += 2), e.tradeCodes.includes("Ag") && (t += 1), e.tradeCodes.includes("In") && (t += 1), e.tradeCodes.includes("Ri") && (t += 1), t;
}
function ao(e, t, n) {
	if (!t.physical || t.worldKind === "Empty Orbit" || t.worldKind === "Gas Giant" || !qa(t, n)) return;
	let r = Ka(t, n), i = Ya(e, r.status, n), a = Xa(e, i), o = Qa(e, i, a, r.status, n), s = o.estimatedPopulation, c = Ca(e, i), l = c.governmentCode, u = $a(e, l, i), d = i === 0 ? "X" : Ua(e.roll(2, 6, Wa(t)).total), f = i === 0 ? {
		minimum: 0,
		basis: []
	} : to(t), p = no(e, d, t, i, l, f.minimum), m = t.physical.sizeCode ?? 0, h = t.physical.atmosphereCode ?? 0, g = t.physical.hydrographicsCode ?? 0, _ = {
		starport: d,
		populationCode: i,
		populationMultiplier: a,
		populationTotal: s,
		populationDetails: o,
		populationConcentration: null,
		urbanisation: null,
		majorCities: null,
		governmentDetails: c,
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
	return _.tradeCodes = ro(_, m, h, g), _.importance = io(_), _.uwp = `${d}${t.physical.uwpPhysical}${N(i)}${N(l)}${N(u)}-${N(p)}`, _.populationConcentration = Pa(new x(Ha(`wbh-social-pcr-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), t, _), _.urbanisation = Ba(new x(Ha(`wbh-social-urbanisation-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), t, _), _.majorCities = Oa(new x(Ha(`wbh-social-major-cities-v1|${t.id}|${t.au}|${t.eccentricity}|${_.uwp}`)), _), _;
}
function oo(e, t, n, r, i, a, o, s, c) {
	let l = wa(t, r), u = {
		starport: e,
		populationCode: t,
		populationMultiplier: n,
		populationTotal: Za(t, n),
		populationDetails: null,
		populationConcentration: null,
		urbanisation: null,
		majorCities: null,
		governmentDetails: l,
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
	return u.tradeCodes = ro(u, o, s, c), u.importance = io(u), u.uwp = `${e}${N(o)}${N(s)}${N(c)}${N(t)}${N(u.governmentCode)}${N(i)}-${N(a)}`, u;
}
//#endregion
//#region src/rules/validation/systemValidation.ts
function F(e, t, n, r, i) {
	e.push({
		severity: t,
		scope: n,
		message: r,
		recommendation: i
	});
}
function so(e, t) {
	if (t.worldKind === "Empty Orbit") return;
	let n = t.physical;
	if (!n) {
		F(e, "warning", t.id, "World has no physical profile.", "Regenerate the system or check the physical world generation step.");
		return;
	}
	let r = n.sizeCode ?? 0, i = n.atmosphereCode ?? 0, a = n.hydrographicsCode ?? 0, o = t.social;
	r === 0 && (i !== 0 || a !== 0) && F(e, "error", t.id, "Size 0 world has non-zero atmosphere or hydrographics.", "Set atmosphere and hydrographics to 0 for asteroid-size bodies."), i === 0 && a > 0 && n.temperatureBand !== "Frozen" && F(e, "warning", t.id, "Vacuum world has surface hydrographics outside a frozen environment.", "Treat water as ice, subsurface reservoirs, or reroll hydrographics."), a === 10 && ["Inferno", "Inner"].includes(n.zone) && F(e, "warning", t.id, "Very high hydrographics on a hot inner-zone world.", "Consider revising temperature, hydrographics, or atmosphere."), t.worldKind === "Gas Giant" && n.uwpPhysical !== "---" && F(e, "info", t.id, "Gas giant is excluded from UWP-style physical coding.", "This is expected for the current generator."), o && (o.populationCode === 0 && (o.governmentCode !== 0 || o.lawLevelCode !== 0 || o.starport !== "X") && F(e, "error", t.id, "Uninhabited world has government, law, or starport values that imply habitation.", "Set starport X and social codes 000."), o.populationCode > 0 && o.techLevel === 0 && F(e, "warning", t.id, "Inhabited world has TL 0.", "Confirm this is intentional for a primitive or collapsed society."), o.techLevel < 5 && (i <= 3 || i >= 10) && o.populationCode >= 6 && F(e, "warning", t.id, "Large population on a hostile-atmosphere world with low TL.", "Raise TL, reduce population, or explain outside support."), o.starport === "A" && o.populationCode <= 3 && F(e, "info", t.id, "Excellent starport with very low population.", "This may indicate a depot, research station, or external installation."), o.tradeCodes.includes("Ba") && o.populationCode !== 0 && F(e, "error", t.id, "Barren trade code conflicts with non-zero population.", "Recalculate trade codes."));
}
function co(e) {
	let t = [], n = e.worlds.find((e) => e.isMainworld);
	n ? n.social?.uwp || F(t, "warning", "system", "Selected mainworld does not have a complete UWP.", "Generate or manually assign social characteristics.") : F(t, "error", "system", "No mainworld was selected.", "Choose the most habitable terrestrial world or belt as the mainworld."), e.worlds.filter((e) => e.isMainworld).length > 1 && F(t, "error", "system", "More than one world is marked as the mainworld.", "Keep exactly one mainworld flag."), e.stars.length === 0 && F(t, "error", "system", "System has no stars.", "Regenerate primary star data."), e.summary.totalWorlds !== e.worlds.filter((e) => e.worldKind !== "Empty Orbit").length && F(t, "warning", "system", "Summary world count does not match generated non-empty world rows.", "Check world placement and empty-orbit accounting.");
	for (let n of e.worlds) so(t, n);
	return t.length === 0 && F(t, "info", "system", "No validation issues found."), t;
}
//#endregion
//#region src/rules/system/wbhMainworldDetermination.ts
function lo(e) {
	return (e.physical?.details?.satellites?.moons ?? []).flatMap((t, n) => !t.physical || t.physical.details?.gasGiant ? [] : [{
		id: t.sourceId ?? `${e.id}.moon-${n + 1}`,
		parentId: e.id,
		kind: "Significant Moon",
		physical: t.physical,
		parentWorldKind: e.worldKind
	}]);
}
function uo(e) {
	return e.flatMap((e) => {
		let t = lo(e);
		return e.worldKind === "Empty Orbit" || e.worldKind === "Gas Giant" ? t : [{
			id: e.id,
			parentId: null,
			kind: e.worldKind,
			physical: e.physical,
			parentWorldKind: null
		}, ...t];
	});
}
function fo(e) {
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
function po(e) {
	let t = e.physical?.details;
	return {
		id: e.id,
		parentId: e.parentId,
		kind: e.kind,
		habitabilityRating: t?.habitabilityRating?.rating ?? null,
		nativeSophontsPresent: t?.nativeLife?.currentNativeSophont === !0,
		resourceRating: t?.resourceRating?.rating ?? t?.planetoidBelt?.resourceRating.rating ?? null,
		refuelling: fo(e)
	};
}
function mo(e) {
	let t = e.filter((e) => e !== null && Number.isFinite(e));
	return t.length ? Math.max(...t) : null;
}
function ho(e, t) {
	return e.totalCriterionWins === t.totalCriterionWins ? (e.habitabilityRating ?? -1) === (t.habitabilityRating ?? -1) ? e.nativeSophontsPresent === t.nativeSophontsPresent ? (e.resourceRating ?? -1) === (t.resourceRating ?? -1) ? e.refuelling.rank === t.refuelling.rank ? e.id.localeCompare(t.id) : t.refuelling.rank - e.refuelling.rank : (t.resourceRating ?? -1) - (e.resourceRating ?? -1) : Number(t.nativeSophontsPresent) - Number(e.nativeSophontsPresent) : (t.habitabilityRating ?? -1) - (e.habitabilityRating ?? -1) : t.totalCriterionWins - e.totalCriterionWins;
}
function go(e) {
	let t = uo(e).map(po), n = mo(t.map((e) => e.habitabilityRating)), r = mo(t.map((e) => e.resourceRating)), i = Math.max(0, ...t.map((e) => e.refuelling.rank)), a = t.map((e) => {
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
	}).sort(ho), o = a[0]?.id ?? null;
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
function _o(e, t) {
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
function vo(e, t) {
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
function yo(e) {
	return {
		...se,
		...e,
		populationMode: e?.populationMode ?? "established"
	};
}
function bo(e) {
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
function xo(e, t) {
	return t === "Close" ? Math.max(.5, e.d6() - 1) + e.d10ZeroToNine() / 10 : t === "Near" ? e.d6() + 5 + e.d10ZeroToNine() / 10 : t === "Far" ? e.d6() + 11 + e.d10ZeroToNine() / 10 : e.d6() / 10 + e.roll(2, 6, -7).total / 100;
}
function So(e, t, n, r) {
	let i = [n], a = bo(n);
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
		let n = ge(e, `${t} ${o.designation}`, o.designation, !1, r);
		n.orbitClass = o.orbitClass, n.orbitNumber = E(xo(e, o.orbitClass), 2), n.orbitAu = E(T(n.orbitNumber), 3), n.eccentricity = D(e, 2), i.push(n);
	}
	if (r.detailLevel !== "basic") {
		let n = [...i];
		for (let o of n) if (e.roll(2, 6, a - (r.detailLevel === "deep" ? 0 : 1)).total >= 10) {
			let n = `${o.designation}b`, a = ge(e, `${t} ${n}`, n, !1, r);
			a.orbitClass = "Companion", a.parentId = o.id, a.orbitNumber = E(xo(e, "Companion"), 2), a.orbitAu = E(T(a.orbitNumber), 3), a.eccentricity = D(e, 2), i.push(a);
		}
	}
	return i;
}
function Co(e) {
	let t = Math.max(.01, .01 * e.diameterSolar);
	return E(Math.max(-2, ee(t)), 2);
}
function wo(e) {
	return E(ee(Math.sqrt(Math.max(e.luminositySolar, 1e-6))), 2);
}
function To(e) {
	let t = [];
	for (let n of e) {
		if (n.orbitClass === "Companion" || n.orbitClass === "Primary" || n.orbitNumber === void 0) continue;
		let e = n.orbitClass === "Close" ? 1.5 : n.orbitClass === "Near" ? 2.5 : 3.5;
		t.push({
			source: n.designation,
			aroundStarId: "A",
			centerOrbitNumber: n.orbitNumber,
			inner: E(n.orbitNumber - e, 2),
			outer: E(n.orbitNumber + e, 2),
			reason: `${n.orbitClass} stellar companion clears or destabilises nearby planetary orbits.`
		});
	}
	return t;
}
function Eo(e, t, n) {
	return n.find((n) => n.aroundStarId === t && e >= n.inner && e <= n.outer);
}
function Do(e, t) {
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
function Oo(e, t) {
	return Math.max(1, Math.min(t, e.roll(2, 6).total));
}
function ko(e, t, n) {
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
function Ao(e, t) {
	return t === "basic" ? +(e.roll(2, 6).total >= 11) : t === "deep" ? e.roll(2, 6).total >= 9 ? Math.max(0, e.d6() - 2) : 0 : e.roll(2, 6).total >= 10 ? Math.max(0, Math.min(3, e.d6() - 3)) : 0;
}
function jo(e, t, n, r, i) {
	let a = Math.max(1, n.totalWorlds), o = Ao(e, i.detailLevel), s = a + Math.max(0, o), c = Oo(e, a), l = t[0], u = l?.hzco ?? 4, d = l?.minimumAllowableOrbit ?? -2, f = E(Math.max(.1, (u - d) / c), 2), p = {
		"Empty Orbit": o,
		"Gas Giant": n.gasGiants,
		"Planetoid Belt": n.planetoidBelts,
		"Terrestrial Planet": n.terrestrialPlanets
	}, m = [];
	for (let n of t) {
		let t = 1, i = 0;
		for (; t <= n.allocatedWorlds && i < n.allocatedWorlds * 8 + 16;) {
			i += 1;
			let a = t - c, o = e.roll(2, 6, -7).total * .05 * f, s = E(Math.max(n.minimumAllowableOrbit, n.hzco + a * f + o), 2), l = Eo(s, n.star.id, r), u = [];
			if (l && (s = E(l.outer + .2 + e.d10ZeroToNine() / 20, 2), u.push(`Moved outward to avoid forbidden zone from ${l.source}.`)), s > n.outerLimit && (s = E(n.outerLimit - e.d10ZeroToNine() / 10, 2)), Eo(s, n.star.id, r)) continue;
			let d = E(T(s), 3), h = E(s - n.hzco, 2), g = D(e, s < 1 ? -1 : 0), _ = {
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
				worldKind: ko(e, _, p),
				generationNotes: u.length ? u : void 0
			}), t += 1;
		}
	}
	for (; m.length < s;) {
		let n = t[0], r = m.filter((e) => e.aroundStarId === n.star.id).length + 1, i = E(n.hzco + r * f, 2), a = E(i - n.hzco, 2);
		m.push({
			id: `${n.star.designation}-${r}`,
			aroundStarId: n.star.id,
			aroundDesignation: n.star.designation,
			sequence: r,
			orbitNumber: i,
			au: E(T(i), 3),
			eccentricity: D(e, 0),
			hzco: n.hzco,
			hzDeviation: a,
			worldKind: ko(e, {
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
function Mo(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function No(e, t, n) {
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
function Po(e, t, n = {}) {
	return t.map((t) => {
		let r = ao(e, t, n[t.id]), i = t.physical?.details?.satellites, a = i && {
			...i,
			moons: i.moons.map((e, r) => {
				if (!e.physical || e.physical.details?.gasGiant) return e;
				let i = e.sourceId ?? `${t.id}.moon-${r + 1}`, a = new x(Mo(`wbh-moon-social-v1|${t.id}|${e.sourceId ?? r}`));
				return {
					...e,
					social: ao(a, No(t, e, r), n[i])
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
function Fo(e, t) {
	return e + Math.imul(t, 2654435761) >>> 0;
}
function Io(e, t, n, r) {
	let i = { ...r ?? {} };
	if (n.populationMode === "survey" || r !== void 0 || !t) return i;
	let a = vo(e, t);
	return (a?.moon?.physical ?? a?.world?.physical)?.details?.nativeLife?.currentNativeSophont === !0 || (i[t] = {
		origin: "transplanted",
		populationCode: null
	}), i;
}
function Lo(e = {}) {
	let t = yo(e.settings), n = e.seed ?? Date.now(), r = new x(Fo(n, e.rerollIndex ?? 0)), i = e.name ?? "Uncharted System", a = ge(r, `${i} A`, "A", !0, t), o = So(r, i, a, t).sort((e, t) => (e.orbitAu ?? 0) - (t.orbitAu ?? 0)), s = ye(r, o.length), c = To(o), l = o.filter((e) => e.orbitClass !== "Companion"), u = t.detailLevel === "deep" ? 4 : t.detailLevel === "basic" ? -2 : 0, d = jo(r, Do(l.map((e) => {
		let t = Co(e), n = wo(e), r = e.orbitClass === "Primary" ? 18 + u : Math.max(2, (e.orbitNumber ?? 10) - 1), i = c.filter((t) => t.aroundStarId === e.id).sort((e, t) => e.inner - t.inner)[0], a = Math.max(t + 1, Math.min(r, i ? i.inner - .2 : r));
		return {
			star: e,
			minimumAllowableOrbit: t,
			hzco: n,
			availableOrbitCount: Math.max(0, a - t),
			outerLimit: a,
			allocatedWorlds: 0
		};
	}), s.totalWorlds), s, c, t), f = En(d.worlds.map((e) => {
		let t = o.find((t) => t.id === e.aroundStarId) ?? a;
		return {
			...e,
			physical: va(r, e, t)
		};
	}), o), p = go(f), m = e.mainworldOverrideId, h = m && p.candidates.some((e) => e.id === m) ? {
		...p,
		selectedMainworldId: m,
		selectionSource: "referee-override",
		explanation: [...p.explanation, `Referee override selected ${m}.`]
	} : p, g = h.selectedMainworldId ?? void 0, _ = _o(f, h.selectedMainworldId), v = Io(_, g, t, e.habitationOverrides), y = Po(r, _, v), b = vo(y, h.selectedMainworldId), S = b?.moon ? No(b.world, b.moon, b.world.physical?.details?.satellites?.moons.indexOf(b.moon) ?? 0) : b?.world, C = S?.social?.uwp ?? (S?.physical?.uwpPhysical ? `X${S.physical.uwpPhysical}000-0` : void 0), w = {
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
			preliminaryUwp: C,
			tradeCodes: S?.social?.tradeCodes,
			importance: S?.social?.importance,
			forbiddenZones: c.map((e) => `${e.source}: orbit ${e.inner}-${e.outer}`)
		},
		refereeNotes: "",
		imageUrl: "",
		mapUrl: ""
	};
	return {
		...w,
		validation: co(w)
	};
}
//#endregion
//#region src/rules/system/continuationUwp.ts
var Ro = /^([ABCDEX])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])-([0-9A-HJ-NP-Z])$/i;
function zo(e) {
	let t = e.trim().toUpperCase().replace(/\s+/g, "").match(Ro);
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
function Bo(e, t, n) {
	if (e <= 0 || t <= 0) return 0;
	let r = t + (n === null ? 0 : n / 10);
	return Math.round(r * 10 ** e);
}
function Vo(e, t) {
	if (t <= 0) return 0;
	let n = e.die(3), r = e.die(3);
	return (n - 1) * 3 + r;
}
function Ho(e, t) {
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
	let n = Vo(e, t), r = e.d10ZeroToNine();
	return {
		method: "WBH population phase 1",
		populationCode: t,
		pValue: n,
		additionalSignificantDigit: r,
		estimatedPopulation: Bo(t, n, r),
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
function Uo(e, t) {
	return e + Math.imul(t, 2246822507) >>> 0;
}
function Wo(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Go(e, t) {
	let n = e.primary, r = Math.round((e.worlds.find((e) => e.aroundStarId === n.id)?.hzco ?? 4) * 100) / 100, i = E(r + t.roll(2, 6, -7).total * .04, 2), a = E(T(i), 3);
	return {
		id: "A-MW",
		aroundStarId: n.id,
		aroundDesignation: n.designation,
		sequence: 0,
		orbitNumber: i,
		au: a,
		eccentricity: D(t, 0),
		hzco: r,
		hzDeviation: E(i - r, 2),
		worldKind: "Terrestrial Planet",
		isMainworld: !0
	};
}
function Ko(e, t) {
	return e.isMainworld ? e : {
		...e,
		id: `${e.aroundDesignation}-${t + 1}`,
		sequence: t + 1
	};
}
function qo(e) {
	let t = zo(e.sourceUwp), n = Lo(e), r = e.seed ?? Date.now(), i = Go(n, new x(Uo(r, (e.rerollIndex ?? 0) + 101))), a = ya(i, n.primary, t.size, t.atmosphere, t.hydrographics), o = Ho(new x(Wo(`wbh-continuation-population-v1|${r}|${e.rerollIndex ?? 0}|${t.normalized}`)), t.population), s = {
		...oo(t.starport, t.population, o.pValue, t.government, t.law, t.techLevel, t.size, t.atmosphere, t.hydrographics),
		populationMultiplier: o.pValue,
		populationTotal: o.estimatedPopulation,
		populationDetails: o
	}, c = n.worlds.filter((e) => !e.isMainworld).map((e) => ({
		...e,
		isMainworld: !1
	})).sort((e, t) => e.au - t.au).map(Ko), l = En([{
		...i,
		physical: a,
		social: s
	}, ...c].sort((e, t) => e.au - t.au || (e.isMainworld ? -1 : 1)), n.stars).map((t) => {
		if (!t.isMainworld || !t.social) return t;
		let n = Pa(new x(Wo(`wbh-social-pcr-v1|${r}|${e.rerollIndex ?? 0}|${t.id}|${t.social.uwp}`)), t, t.social), i = {
			...t.social,
			populationConcentration: n
		}, a = Ba(new x(Wo(`wbh-social-urbanisation-v1|${r}|${e.rerollIndex ?? 0}|${t.id}|${t.social.uwp}`)), t, i), o = {
			...i,
			urbanisation: a
		}, s = new x(Wo(`wbh-social-major-cities-v1|${r}|${e.rerollIndex ?? 0}|${t.id}|${t.social.uwp}`));
		return {
			...t,
			social: {
				...o,
				majorCities: Oa(s, o)
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
		validation: co(d)
	};
}
//#endregion
//#region src/integrations/foundry/sensorSystemPayload.ts
function Jo(e) {
	let t = new Map(e.stars.map((e) => [e.id, e.designation]));
	return {
		schemaVersion: "traveller-system-generator/sensors-v1",
		sourceSystemId: e.id,
		mainworldDetermination: e.summary.mainworldDetermination,
		stars: e.stars.map((e) => ({
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
			aroundDesignation: e.aroundDesignation,
			orbitNumber: e.sequence,
			physicalOrbitNumber: e.orbitNumber,
			au: e.au,
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
var Yo = "traveller-system-generator";
function Xo() {
	return {
		moduleId: Yo,
		generateSystem(e = {}) {
			return e.method === "continuation" ? qo(e) : Lo(e);
		},
		createTwodsixWorldActor(e) {
			let t = b(e), n = t.flags[Yo];
			return t.flags[Yo] = {
				...n && typeof n == "object" ? n : {},
				habitationOverrides: e.habitationOverrides ?? {},
				sensorSystem: Jo(e)
			}, t;
		}
	};
}
function Zo(e, t = Xo()) {
	let n = e.get(Yo);
	if (!n) throw Error(`Foundry module ${Yo} is not registered.`);
	return n.api = t, t;
}
//#endregion
//#region src/integrations/foundry/localization.ts
var Qo = {
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
}, $o = {
	localize(e) {
		return Qo[e];
	},
	format(e, t) {
		return Object.entries(t).reduce((e, [t, n]) => e.replaceAll(`{${t}}`, String(n)), Qo[e]);
	}
};
//#endregion
//#region src/integrations/foundry/generatorControl.ts
function es(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function ts(e, t) {
	return e.name.localeCompare(t.name, void 0, { sensitivity: "base" }) || e.id.localeCompare(t.id);
}
function ns(e) {
	e.style.width = "720px", e.style.maxWidth = "calc(100vw - 2rem)", e.style.boxSizing = "border-box";
	for (let t of e.querySelectorAll("select, input[type=\"text\"], input[type=\"number\"]")) t.style.maxWidth = "100%", t.style.minWidth = "0", t.style.boxSizing = "border-box";
}
function rs(e = Math.random) {
	return Math.floor(e() * 4294967296) >>> 0;
}
function is(e) {
	let t = new Map(e.map((e) => [e.id, e])), n = /* @__PURE__ */ new Map();
	for (let r of e) {
		let e = r.parentId && r.parentId !== r.id && t.has(r.parentId) ? r.parentId : null, i = n.get(e) ?? [];
		i.push(r), n.set(e, i);
	}
	for (let e of n.values()) e.sort(ts);
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
	for (let t of [...e].sort(ts)) i.has(t.id) || a(t, 0, []);
	return r;
}
function as(e, t, n = "") {
	let r = is(e).map((e) => {
		let t = e.depth > 0 ? `${"\xA0\xA0".repeat(e.depth)}└─ ` : "", r = e.id === n ? " selected" : "";
		return `<option value="${es(e.id)}"${r}>${es(`${t}${e.path}`)}</option>`;
	});
	return [`<option value=""${n ? "" : " selected"}>${es(t.localize("TSG.Dialog.ActorFolderRoot"))}</option>`, ...r].join("");
}
function os(e = 1105, t = [], n = $o, r = "") {
	let i = n.localize;
	return `
    <div class="form-group"><label>${i("TSG.Dialog.SystemName")}</label><input name="name" type="text" value="${es(i("TSG.Dialog.DefaultSystemName"))}" autofocus></div>
    <div class="form-group"><label>${i("TSG.Dialog.Seed")}</label><input name="seed" type="number" value="${es(String(e))}" step="1"></div>
    <div class="form-group"><label>${i("TSG.Dialog.Method")}</label><select name="method"><option value="expanded" selected>${i("TSG.Dialog.MethodExpanded")}</option><option value="continuation">${i("TSG.Dialog.MethodContinuation")}</option></select></div>
    <div class="form-group"><label>Expanded System Population</label><select name="populationMode"><option value="established" selected>Established / Settled</option><option value="survey">Survey / Unexplored</option></select><p class="hint">Established generates an ordinary WBH population for the selected mainworld. Survey leaves worlds uninhabited unless native Sophonts or Referee habitation are present.</p></div>
    <div class="form-group"><label>${i("TSG.Dialog.SourceUwp")}</label><input name="sourceUwp" type="text" value="A867A74-C" maxlength="9"><p class="hint">${i("TSG.Dialog.SourceUwpHint")}</p></div>
    <div class="form-group"><label>${i("TSG.Dialog.StarDistribution")}</label><select name="starDistribution"><option value="classic" selected>${i("TSG.Dialog.DistributionClassic")}</option><option value="realistic">${i("TSG.Dialog.DistributionRealistic")}</option></select></div>
    <div class="form-group"><label>${i("TSG.Dialog.DetailLevel")}</label><select name="detailLevel"><option value="basic">${i("TSG.Dialog.DetailBasic")}</option><option value="standard" selected>${i("TSG.Dialog.DetailStandard")}</option><option value="deep">${i("TSG.Dialog.DetailDeep")}</option></select></div>
    <div class="form-group"><label class="checkbox"><input name="allowUnusualPrimaries" type="checkbox" checked> ${i("TSG.Dialog.AllowUnusualPrimaries")}</label></div>
    <div class="form-group"><label>${i("TSG.Dialog.ActorFolder")}</label><select name="folder">${as(t, n, r)}</select></div>
    <div class="form-group"><label class="checkbox"><input name="openSheet" type="checkbox" checked> ${i("TSG.Dialog.OpenSheet")}</label></div>`;
}
function I(e, t = "") {
	return typeof e == "string" ? e : t;
}
function ss(e, t) {
	let n = typeof e == "number" ? e : Number(e);
	return Number.isFinite(n) ? Math.trunc(n) : t;
}
function cs(e, t = !1) {
	return typeof e == "boolean" ? e : typeof e == "string" ? e === "true" || e === "on" : t;
}
function ls(e) {
	let t = I(e.name, "Uncharted System").trim() || "Uncharted System", n = ss(e.seed, 1105), r = I(e.method, "expanded"), i = {
		name: t,
		seed: n,
		settings: {
			starDistribution: I(e.starDistribution, "classic") === "realistic" ? "realistic" : "classic",
			detailLevel: ["basic", "deep"].includes(I(e.detailLevel)) ? I(e.detailLevel) : "standard",
			allowUnusualPrimaries: cs(e.allowUnusualPrimaries, !0),
			populationMode: I(e.populationMode, "established") === "survey" ? "survey" : "established"
		}
	};
	return {
		request: r === "continuation" ? {
			...i,
			method: "continuation",
			sourceUwp: I(e.sourceUwp, "A867A74-C").trim().toUpperCase()
		} : {
			...i,
			method: "expanded"
		},
		folder: I(e.folder).trim() || null,
		openSheet: cs(e.openSheet, !0)
	};
}
function us(e) {
	return ls(e).request;
}
async function ds(e, t) {
	let { localizer: n } = e;
	if (!e.isGameMaster() || !e.canCreateActor()) {
		e.notifyWarning(n.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	let r = e.listActorFolders(), i = e.defaultSystemFolderId?.() ?? "", a = await e.prompt({
		window: { title: n.localize("TSG.Dialog.Title") },
		content: os(rs(), r, n, i),
		ok: { label: n.localize("TSG.Dialog.Generate") },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => ns(t.element)
	});
	if (a) try {
		let r = ls(a), i = t.generateSystem(r.request), o = t.createTwodsixWorldActor(i), s = o.flags && typeof o.flags == "object" ? o.flags : {};
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
var fs = "traveller-system-generator", ps = [
	"notes",
	"adventureHooks",
	"relatedActors",
	"worldImage"
];
function ms(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function hs(e) {
	let t = e.flags?.[fs];
	return t && typeof t == "object" ? t : null;
}
function gs(e) {
	return !!(e && e.type === "world" && hs(e));
}
function _s(e) {
	return !!(e && e.type === "world" && !hs(e));
}
function vs(e, t, { adopting: n = !1 } = {}) {
	let r = hs(e) ?? {}, i = r.generationSettings ?? {}, a = String(e.system.name ?? e.name.replace(/ System$/, "")), o = r.generationMethod ?? "expanded", s = r.sourceUwp ?? String(e.system.uwp ?? "A867A74-C"), c = r.generationSeed ?? (n ? rs() : 1105), l = i.starDistribution ?? "classic", u = i.detailLevel ?? "standard", d = i.allowUnusualPrimaries ?? !0, f = t.localize;
	return `
    <p class="hint">${ms(f(n ? "TSG.Dialog.AdoptHint" : "TSG.Dialog.RegenerateHint"))}</p>
    <div class="form-group"><label>${f("TSG.Dialog.SystemName")}</label><input name="name" type="text" value="${ms(a)}" autofocus></div>
    <div class="form-group"><label>${f("TSG.Dialog.Seed")}</label><input name="seed" type="number" value="${c}" step="1"></div>
    <div class="form-group"><label>${f("TSG.Dialog.Method")}</label><select name="method"><option value="expanded"${o === "expanded" ? " selected" : ""}>${f("TSG.Dialog.MethodExpanded")}</option><option value="continuation"${o === "continuation" ? " selected" : ""}>${f("TSG.Dialog.MethodContinuation")}</option></select></div>
    <div class="form-group"><label>${f("TSG.Dialog.SourceUwp")}</label><input name="sourceUwp" type="text" value="${ms(s)}" maxlength="9"><p class="hint">${f("TSG.Dialog.SourceUwpHint")}</p></div>
    <div class="form-group"><label>${f("TSG.Dialog.StarDistribution")}</label><select name="starDistribution"><option value="classic"${l === "classic" ? " selected" : ""}>${f("TSG.Dialog.DistributionClassic")}</option><option value="realistic"${l === "realistic" ? " selected" : ""}>${f("TSG.Dialog.DistributionRealistic")}</option></select></div>
    <div class="form-group"><label>${f("TSG.Dialog.DetailLevel")}</label><select name="detailLevel"><option value="basic"${u === "basic" ? " selected" : ""}>${f("TSG.Dialog.DetailBasic")}</option><option value="standard"${u === "standard" ? " selected" : ""}>${f("TSG.Dialog.DetailStandard")}</option><option value="deep"${u === "deep" ? " selected" : ""}>${f("TSG.Dialog.DetailDeep")}</option></select></div>
    <div class="form-group"><label class="checkbox"><input name="allowUnusualPrimaries" type="checkbox"${d ? " checked" : ""}> ${f("TSG.Dialog.AllowUnusualPrimaries")}</label></div>
    <div class="form-group"><label class="checkbox"><input name="openSheet" type="checkbox" checked> ${f("TSG.Dialog.OpenSheet")}</label></div>`;
}
function ys(e, t) {
	return vs(e, t);
}
function bs(e, t) {
	return vs(e, t, { adopting: !0 });
}
function xs(e, t, n) {
	let r = { ...t.system };
	for (let t of ps) e.system[t] !== void 0 && (r[t] = e.system[t]);
	let i = { ...t.flags };
	return i[fs] = {
		...i[fs] ?? {},
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
async function Ss(e, t, n, r) {
	let i = us(t), a = r.generateSystem(i), o = r.createTwodsixWorldActor(a);
	await e.update(xs(e, o, Number(i.seed ?? 1105))), t.openSheet !== !1 && e.sheet?.render(!0);
}
async function Cs(e, t) {
	let n = e.getSelectedActor();
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	if (!gs(n)) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.SelectGeneratedActor"));
		return;
	}
	let r = await e.prompt({
		window: { title: e.localizer.localize("TSG.Dialog.RegenerateTitle") },
		content: ys(n, e.localizer),
		ok: { label: e.localizer.localize("TSG.Dialog.Regenerate") },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => ns(t.element)
	});
	if (r) try {
		await Ss(n, r, e, t), e.notifyInfo(e.localizer.format("TSG.Notification.Regenerated", { name: n.name }));
	} catch (t) {
		let n = t instanceof Error ? t.message : String(t);
		e.notifyError(e.localizer.format("TSG.Notification.Failed", { message: n }));
	}
}
async function ws(e, t) {
	let n = e.getSelectedActor();
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	if (!_s(n)) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.SelectUnmanagedActor"));
		return;
	}
	let r = await e.prompt({
		window: { title: e.localizer.localize("TSG.Dialog.AdoptTitle") },
		content: bs(n, e.localizer),
		ok: { label: e.localizer.localize("TSG.Dialog.Adopt") },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => ns(t.element)
	});
	if (r) try {
		await Ss(n, r, e, t), e.notifyInfo(e.localizer.format("TSG.Notification.Adopted", { name: n.name }));
	} catch (t) {
		let n = t instanceof Error ? t.message : String(t);
		e.notifyError(e.localizer.format("TSG.Notification.Failed", { message: n }));
	}
}
//#endregion
//#region src/integrations/foundry/mainworldOverride.ts
var Ts = "traveller-system-generator";
function Es(e) {
	let t = e.flags?.[Ts];
	return t && typeof t == "object" ? t : null;
}
function Ds(e, t) {
	let n = Es(e);
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
async function Os(e, t, n) {
	let r = Ds(e, t);
	if (!r) return !1;
	let i = n.generateSystem(r), a = n.createTwodsixWorldActor(i);
	return await e.update(xs(e, a, Number(r.seed))), e.sheet?.render(!0), !0;
}
//#endregion
//#region src/integrations/foundry/socialInspectorRows.ts
function L(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function R(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function ks(e) {
	return Array.isArray(e) ? e : [];
}
function As(e) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.trunc(e)] ?? String(e);
}
function z(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${L(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${L(t ?? "—")}</span></div>`;
}
function B(e, t) {
	return `<div style="margin-top:0.55rem;padding-top:0.35rem;"><h4 style="margin:0 0 0.25rem;">${L(e)}</h4>${t}</div>`;
}
function js(e) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : Math.trunc(e).toLocaleString("en-US");
}
function Ms(e) {
	return e === "native-sophont" ? "Inhabited — Native Sophonts" : e === "transplanted" ? "Inhabited — Transplanted / Colonial Population" : e === "uninhabited" ? "Uninhabited" : "—";
}
function Ns(e) {
	let t = R(e);
	if (!t) return String(e ?? "—");
	let n = String(t.source ?? "Unknown"), r = typeof t.dm == "number" ? t.dm : 0;
	return `${n}: DM${r >= 0 ? "+" : ""}${r}`;
}
function Ps(e) {
	let t = R(e);
	return t ? `${String(t.source ?? "Unknown")}: ${t.kind === "minimum" ? "minimum" : "maximum"} ${typeof t.percentage == "number" ? t.percentage : "—"}%` : String(e ?? "—");
}
function Fs(e, t = 1) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : `${e.toFixed(t).replace(/\.0$/, "")}%`;
}
function Is(e) {
	let t = ks(e.cities).map((e) => R(e)).filter((e) => !!e), n = [
		z("Population allocation case", e.populationAllocationCase ?? "—"),
		e.largestNonMajorCityPopulation !== null && e.largestNonMajorCityPopulation !== void 0 ? z("Largest non-major city", js(e.largestNonMajorCityPopulation)) : "",
		e.largestNonMajorCityRoll !== null && e.largestNonMajorCityRoll !== void 0 ? z("Largest non-major city 1D roll", e.largestNonMajorCityRoll) : "",
		e.allocationChunkPercent !== null && e.allocationChunkPercent !== void 0 ? z("Allocation chunk size", Fs(e.allocationChunkPercent, 2)) : "",
		e.allocationRemainderPercent !== null && e.allocationRemainderPercent !== void 0 ? z("Allocation remainder", Fs(e.allocationRemainderPercent, 2)) : ""
	].join("");
	return t.length ? `${n}<div style="padding:0.45rem 0 0.15rem;"><strong>Individual city allocations</strong></div>${t.map((e, t) => {
		let n = ks(e.allocationRolls).map((e) => String(e)).join(", "), r = e.chunkCount === null || e.chunkCount === void 0 ? "—" : String(e.chunkCount);
		return z(`City ${e.rank ?? t + 1}`, `${js(e.population)} — ${Fs(e.sharePercent, 2)} share — chunks ${r} — rolls ${n || "—"}`);
	}).join("")}` : n;
}
function Ls(e) {
	if (!e) return "<p class=\"hint\">No generated social profile is available for this body.</p>";
	let t = R(e.populationDetails), n = R(e.populationConcentration), r = R(e.urbanisation), i = R(e.majorCities), a = R(e.governmentDetails), o = ks(e.tradeCodes).map((e) => String(e)).join(" "), s = ks(e.minimumSustainableTechLevelBasis).map((e) => String(e)), c = typeof e.notes == "string" ? e.notes : null, l = [z("Habitation", Ms(e.habitationStatus)), z("Basis", e.habitationBasis ?? "—")].join(""), u = t ? [
		z("WBH method", t.method ?? "—"),
		z("Population profile", t.profilePrefix ?? "—"),
		z("Population code", As(t.populationCode)),
		z("P value", t.pValue ?? "—"),
		z("Additional significant digit", t.additionalSignificantDigit ?? "—"),
		z("Estimated population", js(t.estimatedPopulation)),
		z("Native Sophont population procedure", t.nativeSophontPopulationProcedure ?? "—"),
		Array.isArray(t.generationNotes) && t.generationNotes.length ? `<div style="margin-top:0.45rem;"><strong>Population notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${t.generationNotes.map((e) => `<li>${L(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : "<p class=\"hint\">No WBH Population phase-1 detail is stored for this body.</p>", d = n ? [
		z("PCR", n.rating ?? "—"),
		z("Concentration", n.description ?? "—"),
		z("Single settlement area", n.singleSettlementArea === !0 ? "Yes" : "No"),
		z("Low-population settlement roll", n.settlementAreaRoll ?? "—"),
		z("PCR roll", n.pcrRoll ?? "—"),
		z("DM total", typeof n.dmTotal == "number" ? `${n.dmTotal >= 0 ? "+" : ""}${n.dmTotal}` : "—"),
		z("Unclamped total", n.unclampedTotal ?? "—"),
		z("Allowed range", `${n.minimumRating ?? 0}–${n.maximumRating ?? 9}`),
		Array.isArray(n.dmBreakdown) && n.dmBreakdown.length ? `<div style="padding:0.35rem 0;"><strong>PCR modifiers</strong><ul style="margin:0.3rem 0 0 1.25rem;">${n.dmBreakdown.map((e) => `<li>${L(Ns(e))}</li>`).join("")}</ul></div>` : "",
		Array.isArray(n.generationNotes) && n.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>PCR notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${n.generationNotes.map((e) => `<li>${L(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : e.populationCode === 0 ? "<p class=\"hint\">Population 0: no Population Concentration Rating applies.</p>" : "<p class=\"hint\">No WBH Population Concentration Rating detail is stored for this body.</p>", f = r ? [
		z("Urbanisation", `${r.urbanisationPercent ?? "—"}%`),
		z("Total urban population", js(r.totalUrbanPopulation)),
		z("PCR used", r.pcr ?? "—"),
		z("2D roll", r.baseRoll ?? "—"),
		z("DM total", typeof r.dmTotal == "number" ? `${r.dmTotal >= 0 ? "+" : ""}${r.dmTotal}` : "—"),
		z("Table result", r.tableResult ?? "—"),
		z("Table range", r.tableRange ?? "—"),
		z("Rolled percentage", `${r.rolledPercentage ?? "—"}%`),
		R(r.appliedMinimum) ? z("Applied minimum", Ps(r.appliedMinimum)) : "",
		R(r.appliedMaximum) ? z("Applied maximum", Ps(r.appliedMaximum)) : "",
		Array.isArray(r.dmBreakdown) && r.dmBreakdown.length ? `<div style="padding:0.35rem 0;"><strong>Urbanisation modifiers</strong><ul style="margin:0.3rem 0 0 1.25rem;">${r.dmBreakdown.map((e) => `<li>${L(Ns(e))}</li>`).join("")}</ul></div>` : "",
		Array.isArray(r.minimumLimits) && r.minimumLimits.length ? `<div style="padding:0.35rem 0;"><strong>Minimum restrictions</strong><ul style="margin:0.3rem 0 0 1.25rem;">${r.minimumLimits.map((e) => `<li>${L(Ps(e))}</li>`).join("")}</ul></div>` : "",
		Array.isArray(r.maximumLimits) && r.maximumLimits.length ? `<div style="padding:0.35rem 0;"><strong>Maximum restrictions</strong><ul style="margin:0.3rem 0 0 1.25rem;">${r.maximumLimits.map((e) => `<li>${L(Ps(e))}</li>`).join("")}</ul></div>` : "",
		Array.isArray(r.generationNotes) && r.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>Urbanisation notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${r.generationNotes.map((e) => `<li>${L(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : e.populationCode === 0 ? "<p class=\"hint\">Population 0: no urbanisation percentage applies.</p>" : "<p class=\"hint\">No WBH urbanisation detail is stored for this body.</p>", p = i ? [
		z("WBH case", i.case ?? "—"),
		z("Major cities", i.numberMajorCities ?? "—"),
		z("Combined major-city population", js(i.totalMajorCityPopulation)),
		z("Share of urban population", Fs(i.totalMajorCitySharePercent)),
		z("2D count roll", i.countRoll ?? "—"),
		z("Unrounded city-count result", typeof i.countUnrounded == "number" ? i.countUnrounded.toFixed(2).replace(/\.00$/, "") : "—"),
		z("Major-city population 1D roll", i.majorCityPopulationRoll ?? "—"),
		Is(i),
		Array.isArray(i.generationNotes) && i.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>Major-city notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${i.generationNotes.map((e) => `<li>${L(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : e.populationCode === 0 ? "<p class=\"hint\">Population 0: no major-city procedure applies.</p>" : "<p class=\"hint\">No WBH major-city summary is stored for this body.</p>", m = a ? [
		z("Government code", As(a.governmentCode)),
		z("Government type", a.governmentType ?? "—"),
		z("Source", a.source ?? "—"),
		z("2D roll", a.roll ?? "—"),
		z("Population modifier", typeof a.modifier == "number" ? `${a.modifier >= 0 ? "+" : ""}${a.modifier}` : "—"),
		z("Unclamped result", a.unclampedTotal ?? "—"),
		Array.isArray(a.generationNotes) && a.generationNotes.length ? `<div style="padding:0.35rem 0;"><strong>Government notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${a.generationNotes.map((e) => `<li>${L(e)}</li>`).join("")}</ul></div>` : ""
	].join("") : "<p class=\"hint\">No WBH government-type detail is stored for this body.</p>", h = [
		z("UWP", e.uwp ?? "—"),
		z("Starport", e.starport ?? "—"),
		z("Government code", As(e.governmentCode)),
		z("Law Level", As(e.lawLevelCode)),
		z("Tech Level", As(e.techLevel)),
		z("Minimum sustainable TL", e.minimumSustainableTechLevel ?? "—"),
		s.length ? `<div style="padding:0.35rem 0;"><strong>Minimum TL basis</strong><ul style="margin:0.3rem 0 0 1.25rem;">${s.map((e) => `<li>${L(e)}</li>`).join("")}</ul></div>` : "",
		z("Trade codes", o || "—"),
		z("Importance", e.importance ?? "—"),
		c ? z("Notes", c) : "",
		"<p class=\"hint\" style=\"margin:0.45rem 0 0;\">Mainworld designation and habitation are independent. Uninhabited mainworlds retain a Population-0 UWP. Referee-established transplanted populations generate their own social values without changing the physical world.</p>"
	].join("");
	return [
		B("Habitation", l),
		B("Population", u),
		B("Population Concentration", d),
		B("Urbanisation", f),
		B("Major Cities", p),
		B("Government", m),
		B("Current UWP Social Values", h)
	].join("");
}
//#endregion
//#region src/integrations/foundry/managerControl.ts
var Rs = "traveller-system-generator", V = "__all__", zs = "__root__";
function H(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Bs(e) {
	return e.dataset.documentId ?? e.dataset.entryId ?? e.dataset.actorId ?? "";
}
function Vs(e) {
	return e.filter((e) => e.type === "world").sort((e, t) => (e.folderPath ?? "").localeCompare(t.folderPath ?? "") || e.name.localeCompare(t.name));
}
function Hs(e, t = "", n = V) {
	return Vs(e).filter((e) => n === V || (n === zs ? !e.folderId : e.folderId === n)).map((e) => {
		let n = gs(e), r = `${e.name}${n ? "" : " — not generator-managed"}`;
		return `<option value="${H(e.id)}" data-folder-id="${H(e.folderId ?? "")}" data-generator-managed="${n ? "true" : "false"}"${e.id === t ? " selected" : ""}>${H(r)}</option>`;
	}).join("");
}
function Us(e, t = V) {
	let n = e.localizer.localize("TSG.Dialog.ActorFolderRoot"), r = is(e.listActorFolders());
	return [
		`<option value="${V}"${t === V ? " selected" : ""}>All Actor folders</option>`,
		`<option value="${zs}"${t === zs ? " selected" : ""}>${H(n)}</option>`,
		...r.map((e) => `<option value="${H(e.id)}"${e.id === t ? " selected" : ""}>${H(e.path)}</option>`)
	].join("");
}
function Ws(e) {
	if (!e) return null;
	let t = e.flags?.[Rs], n = t && typeof t == "object" ? t : {}, r = n.generationSettings, i = r && typeof r == "object" ? r : {}, a = gs(e);
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
function U(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(8rem,0.8fr) minmax(0,1.2fr);gap:0.75rem;padding:0.3rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${H(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${H(t)}</span></div>`;
}
function Gs(e, t) {
	let n = t.localizer.localize, r = Ws(e);
	return !e || !r ? "<p class=\"hint\">No World Actors found in the selected folder.</p>" : `
    <div style="padding:0.75rem;border:1px solid var(--color-border-light-primary);border-radius:6px;background:var(--color-bg-option);min-width:0;">
      <h3 style="margin:0 0 0.5rem;">${H(e.name)}</h3>
      ${U("Generator status", r.managed ? "Generator-managed" : "Not generator-managed")}
      ${U(n("TSG.Manager.Folder"), r.folderPath)}
      ${U(n("TSG.Manager.Uwp"), r.uwp)}
      ${U(n("TSG.Manager.Method"), r.method)}
      ${U(n("TSG.Manager.Seed"), r.seed)}
      ${U(n("TSG.Manager.Distribution"), r.distribution)}
      ${U(n("TSG.Manager.DetailLevel"), r.detailLevel)}
      ${r.managed ? "" : `<p class="hint" style="margin:0.6rem 0 0;">${H(n("TSG.Manager.AdoptHint"))}</p>`}
    </div>`;
}
function Ks(e, t, n, r, i = !1) {
	return `
    <label style="display:block;padding:0.75rem;border:1px solid var(--color-border-light-primary);border-radius:6px;cursor:${i ? "not-allowed" : "pointer"};opacity:${i ? "0.55" : "1"};" data-manager-action-card="${e}">
      <span style="display:flex;align-items:flex-start;gap:0.6rem;">
        <input type="radio" name="action" value="${e}"${r ? " checked" : ""}${i ? " disabled" : ""}>
        <span><strong>${H(t)}</strong><br><span class="hint">${H(n)}</span></span>
      </span>
    </label>`;
}
function qs(e) {
	return e?.folderId || (e ? zs : V);
}
function Js(e, t, n = {}) {
	let r = t.localizer.localize, i = Vs(e), a = i.find((e) => e.id === n.initialActorId) ?? i[0], o = n.initialActorId ? qs(a) : V, s = o === V ? i : i.filter((e) => o === zs ? !e.folderId : e.folderId === o), c = s.find((e) => e.id === a?.id) ?? s[0], l = Hs(i, c?.id, o), u = n.initialAction ?? "generate", d = i.length > 0, f = !!(c && gs(c)), p = !!(c && _s(c));
	return `
    <section style="display:grid;gap:0.8rem;min-width:0;">
      <header>
        <h2 style="margin:0;">${r("TSG.Manager.GenerateHeading")}</h2>
        <p class="hint">${r("TSG.Manager.GenerateHint")}</p>
      </header>
      ${Ks("generate", r("TSG.Manager.Generate"), r("TSG.Manager.GenerateDescription"), u === "generate")}
    </section>
    <hr style="margin:1rem 0;">
    <section style="display:grid;gap:0.8rem;min-width:0;">
      <header>
        <h2 style="margin:0;">${r("TSG.Manager.ManageHeading")}</h2>
        <p class="hint">Choose an Actor folder, then select any World Actor. Generator-managed Actors can be updated; unmanaged World Actors can be explicitly adopted.</p>
      </header>
      <div class="form-group" style="min-width:0;"><label>Actor Folder</label><select name="managerFolderId" aria-label="Actor Folder" style="width:100%;min-width:0;max-width:100%;">${Us(t, o)}</select></div>
      <div class="form-group" style="min-width:0;"><label>${r("TSG.Manager.Actor")}</label><select name="actorId" aria-label="${r("TSG.Manager.Actor")}" style="width:100%;min-width:0;max-width:100%;"${d ? "" : " disabled"}>
        ${l || "<option value=\"\">No World Actors found in this folder</option>"}
      </select></div>
      <div data-manager-actor-details style="min-width:0;">${Gs(c, t)}</div>
      <div style="display:grid;grid-template-columns:1fr;gap:0.75rem;">
        ${Ks("open", r("TSG.Manager.Open"), r("TSG.Manager.OpenDescription"), u === "open", !d)}
        ${Ks("update", r("TSG.Manager.Update"), r("TSG.Manager.UpdateDescription"), u === "update" && f, !f)}
        ${Ks("adopt", r("TSG.Manager.Adopt"), r("TSG.Manager.AdoptDescription"), u === "adopt" && p, !p)}
      </div>
    </section>`;
}
function Ys(e) {
	return typeof e == "string" ? e : "";
}
function Xs(e, t, n) {
	let r = Vs(t);
	e.style.width = "720px", e.style.maxWidth = "calc(100vw - 2rem)", e.style.boxSizing = "border-box";
	for (let t of e.querySelectorAll("select, input[type=\"text\"], input[type=\"number\"]")) t.style.maxWidth = "100%", t.style.minWidth = "0", t.style.boxSizing = "border-box";
	let i = e.querySelector("select[name=\"managerFolderId\"]"), a = e.querySelector("select[name=\"actorId\"]"), o = e.querySelector("[data-manager-actor-details]"), s = e.querySelector("input[name=\"action\"][value=\"update\"]"), c = e.querySelector("[data-manager-action-card=\"update\"]"), l = e.querySelector("input[name=\"action\"][value=\"adopt\"]"), u = e.querySelector("[data-manager-action-card=\"adopt\"]");
	if (!i || !a || !o) return;
	let d = (e, t, n) => {
		e && (e.disabled = !n), t && (t.style.opacity = n ? "1" : "0.55", t.style.cursor = n ? "pointer" : "not-allowed");
	}, f = () => {
		let t = r.find((e) => e.id === a.value);
		o.innerHTML = Gs(t, n);
		let i = !!(t && gs(t)), f = !!(t && _s(t));
		if (d(s, c, i), d(l, u, f), e.querySelector("input[name=\"action\"]:checked")?.disabled) {
			let t = f ? l : i ? s : e.querySelector("input[name=\"action\"][value=\"open\"]");
			t && (t.checked = !0);
		}
	};
	i.addEventListener("change", () => {
		let e = i.value || V, t = a.value, n = Hs(r, t, e);
		a.innerHTML = n || "<option value=\"\">No World Actors found in this folder</option>", a.disabled = !n, n && !a.value && (a.selectedIndex = 0), f();
	}), a.addEventListener("change", f), f();
}
function Zs(e, t) {
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
async function Qs(e, t, n = {}) {
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	let r = e.listGeneratedActors(), i = await e.prompt({
		window: { title: e.localizer.localize("TSG.Manager.Title") },
		content: Js(r, e, n),
		ok: { label: e.localizer.localize("TSG.Manager.Continue") },
		rejectClose: !1,
		modal: !1,
		render: (t, n) => Xs(n.element, r, e)
	});
	if (!i) return;
	let a = Ys(i.action) || n.initialAction || "generate";
	if (a === "generate") {
		await ds(e, t);
		return;
	}
	let o = Vs(r).find((e) => e.id === Ys(i.actorId));
	if (!o) {
		e.notifyWarning("Select a World Actor.");
		return;
	}
	if (a === "open") {
		o.sheet?.render(!0);
		return;
	}
	if (a === "adopt") {
		await ws(Zs(o, e), t);
		return;
	}
	await Cs(Zs(o, e), t);
}
function $s(e, t, n) {
	let r = e.tokens;
	r && (r.tools ??= {}, r.tools.travellerSystemGenerator = {
		name: "travellerSystemGenerator",
		title: t.localizer.localize("TSG.Control.Manager"),
		icon: "fa-solid fa-solar-system",
		order: Object.keys(r.tools).length,
		button: !0,
		visible: t.isGameMaster(),
		onChange: () => {
			Qs(t, n);
		}
	});
}
//#endregion
//#region src/integrations/foundry/wbhInspector.ts
var ec = "traveller-system-generator";
function W(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function G(e) {
	return Array.isArray(e) ? e : [];
}
function tc(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function K(e) {
	return typeof e == "string" && e.length ? e : null;
}
function q(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function nc(e) {
	return W(W(e.flags?.[ec])?.sensorSystem);
}
function rc(e) {
	let t = nc(e);
	return e.type === "world" && !!(t && Array.isArray(t.bodies));
}
function ic(e) {
	return G(W(W(e.physical?.details)?.satellites)?.moons).flatMap((t, n) => {
		let r = W(t);
		if (!r) return [];
		let i = W(r.physical), a = K(r.sourceId) ?? `${e.id}.moon-${n + 1}`, o = r.sizeCode ?? i?.sizeCode ?? "?", s = r.isMainworld === !0;
		return [{
			id: a,
			label: `↳ ${a}${s ? " ★" : ""} — Moon (Size ${String(o)})`,
			parentId: e.id,
			kind: i && W(W(i.details)?.gasGiant) ? "Gas Giant Moon" : "Moon",
			isMainworld: s,
			physical: i,
			social: W(r.social),
			source: r
		}];
	});
}
function ac(e) {
	return (nc(e)?.bodies ?? []).flatMap((e, t) => {
		let n = W(e);
		if (!n) return [];
		let r = K(n.sourceId) ?? `body-${t + 1}`, i = W(n.physical), a = W(n.social), o = K(a?.uwp) ?? K(i?.uwpPhysical) ?? "—", s = K(n.worldKind) ?? "Body", c = n.isMainworld === !0;
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
	}).flatMap((e) => [e, ...ic(e)]);
}
function oc(e) {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.trunc(e)] ?? String(e);
}
function J(e, t = 3, n = "") {
	return typeof e != "number" || !Number.isFinite(e) ? "—" : `${Number(e.toFixed(t))}${n}`;
}
function Y(e) {
	return e === !0 ? "Yes" : e === !1 ? "No" : "—";
}
function X(e, t, n = "") {
	return `<div style="display:grid;grid-template-columns:minmax(10rem,0.9fr) minmax(0,1.3fr);gap:0.75rem;padding:0.28rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${q(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${n ? `${q(n)} ` : ""}${q(t ?? "—")}</span></div>`;
}
function Z(e, t, n = !0) {
	return `<details${n ? " open" : ""} style="border:1px solid var(--color-border-light-primary);border-radius:6px;padding:0.65rem;"><summary style="cursor:pointer;font-weight:700;">${q(e)}</summary><div style="margin-top:0.5rem;">${t}</div></details>`;
}
function Q(e) {
	return `<details style="margin-top:0.55rem;padding:0.45rem;border:1px dashed var(--color-border-light-primary);border-radius:4px;"><summary style="cursor:pointer;font-weight:600;">Calculation Details</summary><div style="margin-top:0.4rem;">${e}</div></details>`;
}
function $(e) {
	let t = G(e).map((e) => String(e));
	return t.length ? `<div style="margin-top:0.45rem;"><strong>Generation notes</strong><ul style="margin:0.3rem 0 0 1.25rem;">${t.map((e) => `<li>${q(e)}</li>`).join("")}</ul></div>` : "";
}
function sc(e, t, n, r) {
	let i = W(r?.details), a = W(i?.size), o = W(i?.atmosphere), s = W(i?.hydrographics), c = [];
	if (e !== null) {
		let t = tc(a?.diameterKm);
		c.push(`Size ${oc(e)} → ${t === null ? "no precise diameter" : `${J(t, 0, " km")} precise diameter`} ${t === null ? "⚠" : "✓"}`);
	}
	if (t !== null) {
		let e = K(o?.classification), n = tc(o?.meanBaselinePressureBar);
		c.push(`Atmosphere ${oc(t)} → ${e ?? "no detailed classification"}${n === null ? "" : `, ${J(n, 3, " bar")}`} ${e ? "✓" : "⚠"}`);
	}
	if (n !== null) {
		let e = tc(s?.coveragePercent), t = n === 0 ? 0 : Math.max(0, n * 10 - 5), r = n === 10 ? 100 : Math.min(100, n * 10 + 5), i = e !== null && e >= t && e <= r;
		c.push(`Hydrographics ${oc(n)} → ${e === null ? "no precise coverage" : `${J(e, 1, "%")} coverage`} ${e === null ? "⚠" : i ? "✓" : "⚠ review"}`);
	}
	return c.map((e) => `<div style="padding:0.2rem 0;">${q(e)}</div>`).join("") || "<p class=\"hint\">No SAH consistency data available for this body.</p>";
}
function cc(e) {
	let t = W(e?.details), n = W(t?.size), r = W(t?.gasGiant);
	return [
		X("Physical profile", e?.uwpPhysical ?? "—"),
		X("Size code", oc(e?.sizeCode)),
		X("Diameter", J(n?.diameterKm ?? r?.diameterKm, 0, " km")),
		X("Composition", n?.composition ?? r?.category ?? "—"),
		X("Density", J(n?.densityTerra, 3, " Terra")),
		X("Mass", J(n?.massTerra ?? r?.massTerra, 6, " Terra")),
		X("Surface gravity", J(n?.gravityG, 3, " g")),
		X("Escape velocity", J(n?.escapeVelocityKps, 3, " km/s")),
		X("Zone", e?.zone ?? "—"),
		X("Orbital period", J(e?.orbitalPeriodYears, 6, " yr"))
	].join("");
}
function lc(e) {
	let t = e?.atmosphereCode, n = W(W(e?.details)?.atmosphere), r = G(n?.taints).map((e) => W(e)?.profile ?? W(e)?.type ?? e).join(", "), i = G(n?.hazards).map((e) => W(e)?.type ?? e).join(", "), a = G(W(n?.gasMix)?.components).map((e) => {
		let t = W(e);
		return t ? `${t.name ?? "?"} ${t.percentage ?? "?"}%${t.retainedLongTerm === !1 ? " (not retained)" : ""}` : String(e);
	}).join(", ");
	return [
		X("Atmosphere code", oc(t)),
		X("Classification", n?.classification ?? "—"),
		X("Mean pressure", J(n?.meanBaselinePressureBar, 4, " bar")),
		X("O₂ fraction", J(n?.oxygenFraction, 4)),
		X("O₂ partial pressure", J(n?.oxygenPartialPressureBar, 4, " bar")),
		X("N₂ partial pressure", J(n?.nitrogenPartialPressureBar, 4, " bar")),
		X("Oxygen safety", n?.oxygenSafety ?? "—"),
		X("Scale height", J(n?.scaleHeightKm, 3, " km")),
		X("Safe altitude", J(n?.minimumSafeAltitudeKm, 3, " km")),
		X("Safe depth below mean", J(n?.safeAltitudeBelowMeanKm, 3, " km")),
		X("Taints", r || "—"),
		X("Hazards", i || "—"),
		X("Gas mix", a || "—"),
		X("Atmosphere profile", n?.profile ?? "—")
	].join("");
}
function uc(e) {
	let t = W(e?.surfaceFeatures);
	if (!t) return "";
	let n = G(t.bodies).map((e) => W(e)).filter((e) => !!e).map((e) => `${e.id ?? "?"}: ${e.kind ?? "feature"} ${J(e.surfacePercent, 2, "%")}`).join("; ");
	return [
		X("Discrete feature coverage", J(t.discreteFeatureCoveragePercent, 2, "%")),
		X("Major feature coverage", J(t.majorCoveragePercent, 2, "%")),
		X("Minor feature coverage", J(t.minorCoveragePercent, 2, "%")),
		X("Small feature coverage", J(t.smallCoveragePercent, 2, "%")),
		X("Major bodies", t.majorBodyCount ?? "—"),
		X("Minor bodies", t.minorBodyCount ?? "—"),
		X("Small bodies", t.smallBodyCount ?? "—"),
		X("Generated surface bodies", n || "None")
	].join("");
}
function dc(e) {
	let t = W(e?.details), n = W(t?.hydrographics), r = W(t?.climate);
	return [
		X("Hydrographics code", oc(e?.hydrographicsCode)),
		X("Precise coverage", J(n?.coveragePercent, 2, "%")),
		X("Foundation", n?.foundation ?? "—"),
		X("Liquid composition", n?.composition ?? "—"),
		X("Distribution", W(n?.distribution)?.description ?? "—"),
		X("Hydrographics profile", n?.profile ?? "—"),
		uc(n),
		X("Mean temperature", `${J(r?.meanTemperatureK, 2, " K")} / ${J(r?.meanTemperatureC, 2, " °C")}`),
		X("Temperature class", r?.temperatureClass ?? "—"),
		X("Albedo", J(r?.albedo, 4)),
		X("Greenhouse factor", J(r?.greenhouseFactor, 4)),
		X("Runaway greenhouse eligible", Y(r?.runawayGreenhouseEligible))
	].join("");
}
function fc(e) {
	let t = W(W(W(e?.details)?.climate)?.temperatureExtremes);
	if (!t) return "<p class=\"hint\">No WBH high/low temperature record is available for this body.</p>";
	let n = [
		X("Axial tilt factor", J(t.axialTiltFactor, 6)),
		X("Rotation factor", J(t.rotationFactor, 6)),
		X("Geographic factor", J(t.geographicFactor, 6)),
		X("Variance factor", J(t.varianceFactor, 6)),
		X("Atmospheric factor", J(t.atmosphericFactor, 6)),
		X("Luminosity modifier", J(t.luminosityModifier, 6)),
		X("High luminosity", J(t.highLuminositySolar, 6, " Sol")),
		X("Low luminosity", J(t.lowLuminositySolar, 6, " Sol")),
		$(t.generationNotes)
	].join("");
	return [
		X("High temperature", `${J(t.highTemperatureK, 2, " K")} / ${J(t.highTemperatureC, 2, " °C")}`),
		X("Low temperature", `${J(t.lowTemperatureK, 2, " K")} / ${J(t.lowTemperatureC, 2, " °C")}`),
		X("Near stellar distance", J(t.nearAu, 6, " AU")),
		X("Far stellar distance", J(t.farAu, 6, " AU")),
		Q(n)
	].join("");
}
function pc(e) {
	let t = W(e?.details), n = W(t?.rotation), r = W(t?.surfaceTides);
	return [
		X("Sidereal day", J(n?.siderealHours, 6, " h")),
		X("Solar day", n?.solarDayInfinite ? "Infinite / undefined" : J(n?.solarDayHours, 6, " h")),
		X("Solar days/year", J(n?.solarDaysPerYear, 6)),
		X("Axial tilt", J(n?.axialTiltDegrees, 4, "°")),
		X("Direction", n?.direction ?? "—"),
		X("Tidal-lock status", n?.tidalLockStatus ?? "—"),
		X("Tidal-lock case", n?.tidalLockCase ?? "—"),
		X("Tidal-lock DM", n?.tidalLockDm ?? "—"),
		X("Tidal-lock target", n?.tidalLockTargetId ?? "—"),
		X("Adjusted eccentricity", n?.adjustedEccentricity ?? "—"),
		X("Surface tide total", J(r?.totalAmplitudeMetres, 6, " m")),
		X("Stellar tide", J(r?.stellarAmplitudeMetres, 6, " m")),
		X("Satellite tide subtotal", J(r?.directSatelliteAmplitudeMetres, 6, " m")),
		X("Parent tide", J(r?.directParentAmplitudeMetres, 6, " m"))
	].join("");
}
function mc(e) {
	let t = W(W(e?.details)?.seismology);
	if (!t) return "<p class=\"hint\">No WBH terrestrial seismology record is available for this body.</p>";
	let n = [
		X("Residual stress DM", t.residualStressDm ?? "—"),
		X("Tectonic plate roll", t.tectonicPlateRoll ?? "—"),
		X("Tectonic plate DM", t.tectonicPlateDm ?? "—"),
		$(t.generationNotes)
	].join("");
	return [
		X("Residual seismic stress", t.residualSeismicStress ?? "—"),
		X("Tidal stress factor", t.tidalStressFactor ?? "—"),
		X("Tidal heating factor", t.tidalHeatingFactor ?? "—"),
		X("Total seismic stress", t.totalSeismicStress ?? "—"),
		X("Seismic-adjusted mean temperature", J(t.seismicAdjustedMeanTemperatureK, 3, " K")),
		X("Major tectonic plates", t.majorTectonicPlates ?? "—"),
		X("Water-based tectonics eligible", Y(t.waterBasedTectonicsEligible)),
		Q(n)
	].join("");
}
function hc(e) {
	let t = W(W(e?.details)?.surfaceGeology);
	if (!t) return "<p class=\"hint\">No WBH-derived surface geology record is available for this body.</p>";
	let n = W(t.plateBoundaries), r = G(t.features).map((e) => W(e)).filter((e) => !!e).map((e) => {
		let t = G(e.relatedSurfaceBodyIds).map((e) => String(e)), n = e.sourceBoundary ? `; ${String(e.sourceBoundary)} boundary` : "";
		return `<li><strong>${q(e.id ?? "feature")}</strong> — ${q(e.kind ?? "terrain")} (${q(e.intensity ?? "—")})${q(n)}${t.length ? ` — ${q(t.join(", "))}` : ""}</li>`;
	}).join("");
	return [
		X("Geologic regime", t.regime ?? "—"),
		X("Tectonic plates used", t.tectonicPlateCount ?? "—"),
		X("Total seismic stress used", t.totalSeismicStress ?? "—"),
		X("Convergent boundaries", n?.convergent ?? "—"),
		X("Divergent boundaries", n?.divergent ?? "—"),
		X("Transform boundaries", n?.transform ?? "—"),
		X("Stable boundaries", n?.stable ?? "—"),
		`<div style="padding:0.4rem 0;"><strong>Generated major features</strong>${r ? `<ul style="margin:0.3rem 0 0 1.25rem;">${r}</ul>` : "<div class=\"hint\" style=\"margin-top:0.25rem;\">None</div>"}</div>`,
		Q([X("Generation policy", t.generationPolicy ?? "—"), $(t.generationNotes)].join(""))
	].join("");
}
function gc(e) {
	let t = W(W(e?.details)?.surfaceClimate);
	if (!t) return "<p class=\"hint\">No WBH-derived surface climate guidance is available for this body.</p>";
	let n = G(t.broadRegionGuidance).map((e) => String(e));
	return [
		X("Thermal regime", t.thermalRegime ?? "—"),
		X("Mean temperature used", J(t.meanTemperatureK, 2, " K")),
		X("High temperature used", J(t.highTemperatureK, 2, " K")),
		X("Low temperature used", J(t.lowTemperatureK, 2, " K")),
		X("Permanent ice extent", t.permanentIceExtent ?? "—"),
		X("Agriculture thermally eligible", Y(t.agricultureThermallyEligible)),
		X("Unprotected settlement thermally eligible", Y(t.unprotectedSettlementThermallyEligible)),
		n.length ? `<div style="padding:0.4rem 0;"><strong>Broad region guidance</strong><ul style="margin:0.3rem 0 0 1.25rem;">${n.map((e) => `<li>${q(e)}</li>`).join("")}</ul></div>` : "<div class=\"hint\" style=\"padding:0.4rem 0;\">No additional broad-region guidance.</div>",
		Q([X("Generation policy", t.generationPolicy ?? "—"), $(t.generationNotes)].join(""))
	].join("");
}
function _c(e) {
	let t = W(W(e?.details)?.satellites), n = G(t?.moons), r = G(t?.rings), i = n.map((e, t) => {
		let n = W(e);
		return n ? `${n.designation ?? `Moon ${t + 1}`}: Size ${String(n.sizeCode ?? "?")}, ${J(n.orbitPd, 3, " PD")}, ${J(n.orbitKm, 0, " km")}, e=${J(n.eccentricity, 3)}, ${n.direction ?? "?"}, period ${J(n.periodHours, 3, " h")}` : `Moon ${t + 1}`;
	}).join("<br>"), a = r.map((e, t) => {
		let n = W(e);
		return n ? `${n.designation ?? `Ring ${t + 1}`}: centre ${J(n.centrePd, 3, " PD")}, span ${J(n.spanPd, 3, " PD")}` : `Ring ${t + 1}`;
	}).join("<br>");
	return [
		X("Hill sphere", J(t?.hillSphereAu, 6, " AU")),
		X("Moon limit", J(t?.hillSphereMoonLimitPd, 3, " PD")),
		X("Roche limit", J(t?.rocheLimitPd, 3, " PD")),
		X("MOR", J(t?.moonOrbitRangePd, 3, " PD")),
		`<div style="padding:0.35rem 0;"><strong>Moons</strong><div style="margin-top:0.25rem;overflow-wrap:anywhere;">${i || "None"}</div></div>`,
		`<div style="padding:0.35rem 0;"><strong>Rings</strong><div style="margin-top:0.25rem;overflow-wrap:anywhere;">${a || "None"}</div></div>`
	].join("");
}
function vc(e) {
	let t = W(W(e?.details)?.nativeLife);
	if (!t) return "<p class=\"hint\">No WBH terrestrial native-life record is available for this body.</p>";
	let n = W(t.biomassDm), r = [
		X("Biomass roll", t.biomassRoll ?? "—"),
		X("Biomass atmosphere DM", n?.atmosphere ?? "—"),
		X("Biomass hydrographics DM", n?.hydrographics ?? "—"),
		X("Biomass age DM", n?.age ?? "—"),
		X("Biomass temperature DM", n?.temperature ?? "—"),
		X("Biomass DM before clamp", n?.totalBeforeClamp ?? "—"),
		X("Biomass DM applied", n?.totalApplied ?? "—"),
		X("Biocomplexity roll", t.biocomplexityRoll ?? "—"),
		X("Biocomplexity DM", t.biocomplexityDm ?? "—"),
		X("Biodiversity roll", t.biodiversityRoll ?? "—"),
		X("Compatibility roll", t.compatibilityRoll ?? "—"),
		X("Compatibility DM", t.compatibilityDm ?? "—"),
		X("Current sophont roll", t.currentNativeSophontRoll ?? "—"),
		X("Extinct sophont roll", t.extinctNativeSophontRoll ?? "—"),
		$(t.generationNotes)
	].join("");
	return [
		`<div style="padding:0.5rem 0 0.65rem;text-align:center;"><div class="hint">IISS Native-Life Profile (MXDC)</div><strong style="font-size:1.35rem;letter-spacing:0.12em;">${q(K(t.profile) ?? "—")}</strong></div>`,
		X("Biomass", t.biomassRating ?? "—"),
		X("Biocomplexity", t.biocomplexityRating ?? "—"),
		X("Biodiversity", t.biodiversityRating ?? "—"),
		X("Compatibility", t.compatibilityRating ?? "—"),
		X("Biomass special case", t.biomassSpecialCase ?? "—"),
		X("Current native sophont", Y(t.currentNativeSophont)),
		X("Extinct native sophont evidence", Y(t.extinctNativeSophontEvidence)),
		Q(r)
	].join("");
}
function yc(e) {
	let t = W(W(e?.details)?.resourceRating);
	if (!t) return "<p class=\"hint\">No WBH terrestrial Resource Rating is available for this body.</p>";
	let n = W(t.dm), r = [
		X("2D roll", t.roll ?? "—"),
		X("Size code", t.sizeCode ?? "—"),
		X("Density DM", n?.density ?? "—"),
		X("Biomass DM", n?.biomass ?? "—"),
		X("Biodiversity DM", n?.biodiversity ?? "—"),
		X("Compatibility DM", n?.compatibility ?? "—"),
		X("Total DM", n?.total ?? "—"),
		X("Unclamped total", t.unclampedTotal ?? "—"),
		$(t.generationNotes)
	].join("");
	return [X("Resource Rating", `${t.code ?? "—"} (${t.rating ?? "—"})`), Q(r)].join("");
}
function bc(e) {
	let t = W(W(e?.details)?.habitabilityRating);
	if (!t) return "<p class=\"hint\">No WBH Terragen Habitability Rating is available for this body.</p>";
	let n = W(t.dm), r = [
		X("Base rating", t.baseRating ?? 10),
		X("Size DM", n?.size ?? "—"),
		X("Atmosphere DM", n?.atmosphere ?? "—"),
		X("Low-oxygen taint DM", n?.lowOxygenTaint ?? "—"),
		X("Hydrographics DM", n?.hydrographics ?? "—"),
		X("Solar 1:1 tidal-lock DM", n?.solarTidalLock ?? "—"),
		X("High-temperature DM", n?.highTemperature ?? "—"),
		X("Mean-temperature DM", n?.meanTemperature ?? "—"),
		X("Low-temperature DM", n?.lowTemperature ?? "—"),
		X("Temperature fallback DM", n?.temperatureFallback ?? "—"),
		X("Gravity DM", n?.gravity ?? "—"),
		X("Miscellaneous Referee DM", n?.miscellaneous ?? "—"),
		X("Total DM", n?.total ?? "—"),
		X("Unclamped total", t.unclampedTotal ?? "—"),
		X("Detailed temperatures used", Y(t.usedDetailedTemperature)),
		X("Computed gravity used", Y(t.usedComputedGravity)),
		$(t.generationNotes)
	].join("");
	return [
		X("Habitability Rating", `${t.code ?? "—"} (${t.rating ?? "—"})`),
		X("Remarks", t.remarks ?? "—"),
		Q(r)
	].join("");
}
function xc(e) {
	let t = W(e.criterionWins), n = [
		t?.highestHabitability === !0 ? "Habitability" : null,
		t?.nativeSophontsPresent === !0 ? "Sophonts" : null,
		t?.highestResources === !0 ? "Resources" : null,
		t?.bestRefuelling === !0 ? "Refuelling" : null
	].filter((e) => !!e);
	return n.length ? n.join(", ") : "None";
}
function Sc(e) {
	let t = W(nc(e)?.mainworldDetermination);
	if (!t) return "<p class=\"hint\">No WBH Final Mainworld Determination is stored for this system.</p>";
	let n = G(t.candidates).map((e) => {
		let n = W(e);
		if (!n) return "";
		let r = W(n.refuelling), i = n.id === t.selectedMainworldId, a = n.id === t.recommendedMainworldId;
		return `<tr>
      <td style="white-space:nowrap;">${q(n.id)}${i ? " ★" : ""}</td>
      <td>${q(n.kind ?? "—")}</td>
      <td>${q(n.habitabilityRating ?? "—")}</td>
      <td>${q(Y(n.nativeSophontsPresent))}</td>
      <td>${q(n.resourceRating ?? "—")}</td>
      <td style="min-width:12rem;">${q(r?.description ?? "—")}</td>
      <td>${q(n.totalCriterionWins ?? 0)}</td>
      <td>${q(xc(n))}${a ? " (recommended)" : ""}</td>
    </tr>`;
	}).join(""), r = G(t.explanation).map((e) => `<li>${q(e)}</li>`).join("");
	return [
		X("Recommended body", t.recommendedMainworldId ?? "—"),
		X("Selected body", t.selectedMainworldId ?? "—"),
		X("Selection source", t.selectionSource ?? "—"),
		`<div style="overflow:auto;margin-top:0.55rem;"><table style="width:100%;border-collapse:collapse;font-size:0.9em;">
      <thead><tr><th>Body</th><th>Kind</th><th>Hab.</th><th>Sophonts</th><th>Res.</th><th>Refuelling</th><th>Wins</th><th>Winning criteria</th></tr></thead>
      <tbody>${n}</tbody>
    </table></div>`,
		r ? `<div class="hint" style="margin-top:0.5rem;"><strong>Method notes</strong><ul>${r}</ul></div>` : ""
	].join("");
}
function Cc(e) {
	let t = W(nc(e)?.mainworldDetermination);
	if (!t) return "";
	let n = G(t.candidates).map(W).filter((e) => !!e), r = K(t.selectedMainworldId) ?? "";
	return n.length ? `<div class="form-group" style="min-width:0;">
    <label>GM Mainworld Selection</label>
    <select name="wbhMainworldOverrideId" style="width:100%;min-width:0;max-width:100%;">
      ${n.map((e) => {
		let t = K(e.id) ?? "", n = K(e.kind) ?? "Body";
		return `<option value="${q(t)}"${t === r ? " selected" : ""}>${q(`${t} — ${n}`)}</option>`;
	}).join("")}
    </select>
    <p class="hint" style="margin:0.25rem 0 0;">The generated recommendation remains recorded. Choosing another body applies a Referee override when this inspector is closed.</p>
  </div>` : "";
}
function wc(e) {
	let t = e.physical, n = tc(t?.sizeCode), r = tc(t?.atmosphereCode), i = tc(t?.hydrographicsCode), a = K(e.social?.uwp), o = JSON.stringify(e.source, null, 2);
	return `
    <div data-wbh-body-panel="${q(e.id)}" style="display:grid;gap:0.7rem;min-width:0;">
      <div style="padding:0.65rem;border:1px solid var(--color-border-light-primary);border-radius:6px;background:var(--color-bg-option);">
        <h3 style="margin:0 0 0.4rem;">${q(e.label)}</h3>
        ${X("Parent body", e.parentId ?? "Top-level system body")}
        ${X("UWP / physical profile", a ?? K(t?.uwpPhysical) ?? "—")}
      </div>
      ${Z("UWP / Detailed Consistency", sc(n, r, i, t))}
      ${Z("Social Characteristics", Ls(e.social), !1)}
      ${Z("Physical", cc(t))}
      ${Z("Atmosphere", lc(t), !1)}
      ${Z("Hydrographics / Climate", dc(t), !1)}
      ${Z("Temperature Extremes", fc(t), !1)}
      ${Z("Rotation / Tides", pc(t), !1)}
      ${Z("Seismology", mc(t), !1)}
      ${Z("Surface Geology", hc(t), !1)}
      ${Z("Surface Climate", gc(t), !1)}
      ${Z("Satellites", _c(t), !1)}
      ${Z("Native Life", vc(t), !1)}
      ${Z("Resource Rating", yc(t), !1)}
      ${Z("Habitability Rating", bc(t), !1)}
      ${Z("Raw Stored Body Data", `<pre style="white-space:pre-wrap;overflow:auto;max-height:24rem;margin:0;">${q(o)}</pre>`, !1)}
    </div>`;
}
function Tc(e, t) {
	return `<div style="display:grid;gap:0.7rem;min-width:0;">
    ${Z("Final Mainworld Determination", Sc(e), !0)}
    <div data-wbh-selected-body>${wc(t)}</div>
  </div>`;
}
function Ec(e) {
	let t = ac(e), n = t.find((e) => e.isMainworld) ?? t[0];
	return n ? `
    <div style="display:grid;gap:0.75rem;min-width:0;">
      <div class="form-group" style="min-width:0;">
        <label>Body</label>
        <select name="wbhInspectorBodyId" style="width:100%;min-width:0;max-width:100%;">
          ${t.map((e) => `<option value="${q(e.id)}"${e.id === n.id ? " selected" : ""}>${q(e.label)}</option>`).join("")}
        </select>
      </div>
      ${Cc(e)}
      <p class="hint" style="margin:0;">Read-only view of authoritative generated data stored on this World Actor. The GM mainworld selection is the only editable value here. It does not represent what characters have discovered through Sensors.</p>
      <div data-wbh-inspector-panel>${Tc(e, n)}</div>
    </div>` : "<p>No stored TSG body data is available on this Actor.</p>";
}
function Dc(e, t) {
	e.style.width = "900px", e.style.maxWidth = "calc(100vw - 2rem)", e.style.maxHeight = "calc(100vh - 2rem)", e.style.boxSizing = "border-box";
	let n = e.querySelector("select[name=\"wbhInspectorBodyId\"]"), r = e.querySelector("[data-wbh-selected-body]");
	if (!n || !r) return;
	let i = ac(t);
	n.addEventListener("change", () => {
		let e = i.find((e) => e.id === n.value);
		e && (r.innerHTML = wc(e));
	});
}
async function Oc(e, t, n) {
	if (!t.isGameMaster()) return;
	if (!rc(e)) {
		t.notifyWarning("This World Actor does not contain Traveller System Generator detail data.");
		return;
	}
	let r = K(W(nc(e)?.mainworldDetermination)?.selectedMainworldId), i = await t.prompt({
		window: { title: `WBH Detail Inspector — ${e.name}` },
		content: Ec(e),
		ok: { label: "Close" },
		rejectClose: !1,
		modal: !1,
		render: (t, n) => Dc(n.element, e)
	});
	if (!i || !n) return;
	let a = K(i.wbhMainworldOverrideId);
	if (!(!a || a === r)) try {
		await Os(e, a, n) ? t.notifyInfo(`Mainworld changed to ${a}. The WBH generated recommendation remains recorded.`) : t.notifyWarning("Mainworld override is only available for generator-managed expanded systems.");
	} catch (e) {
		t.notifyError(`Unable to change mainworld: ${e instanceof Error ? e.message : String(e)}`);
	}
}
//#endregion
//#region src/integrations/foundry/habitationOverride.ts
var kc = "traveller-system-generator";
function Ac(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function jc(e) {
	return typeof e == "string" && e.length ? e : null;
}
function Mc(e) {
	let t = e.flags?.[kc];
	return t && typeof t == "object" ? t : null;
}
function Nc(e) {
	let t = Ac(Ac(e.sensorSystem)?.mainworldDetermination);
	if (t?.selectionSource === "referee-override") return jc(t.selectedMainworldId) ?? void 0;
}
function Pc(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function Fc(e) {
	let t = Mc(e);
	return !!(e.type === "world" && t?.generationMethod !== "continuation" && Number.isFinite(t?.generationSeed));
}
function Ic(e, t) {
	let n = Mc(e);
	if (!n || n.generationMethod === "continuation" || !Number.isFinite(n.generationSeed)) return null;
	let r = n.generationSettings ?? {}, i = Nc(n);
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
async function Lc(e, t, n) {
	let r = Ic(e, t);
	if (!r) return !1;
	let i = n.generateSystem(r), a = n.createTwodsixWorldActor(i);
	return await e.update(xs(e, a, Number(r.seed))), e.sheet?.render(!0), !0;
}
function Rc(e) {
	Mc(e)?.habitationOverrides;
	let t = ac(e).filter((e) => e.physical ? !Ac(Ac(e.physical.details)?.gasGiant) && e.kind !== "Gas Giant" : !1);
	return t.length ? `
    <p class="hint">Establish or clear a Referee-defined transplanted population. Native Sophonts are authoritative physical-generation results and cannot be removed here.</p>
    <div class="form-group">
      <label>Body</label>
      <select name="bodyId">
        ${t.map((e) => {
		let t = e.social, n = jc(t?.habitationStatus) ?? "uninhabited";
		return `<option value="${Pc(e.id)}">${Pc(`${e.label} — ${n}`)}</option>`;
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
function zc(e) {
	let t = e.querySelector("select[name=\"habitationAction\"]"), n = e.querySelector("select[name=\"populationMode\"]"), r = e.querySelector("[data-population-code-row]");
	if (!t || !n || !r) return;
	let i = () => {
		let e = t.value === "transplanted";
		n.disabled = !e, r.style.display = e && n.value === "manual" ? "" : "none";
	};
	t.addEventListener("change", i), n.addEventListener("change", i), i();
}
async function Bc(e, t, n) {
	if (!t.isGameMaster()) return;
	if (!Fc(e)) {
		t.notifyWarning("Habitation editing is only available for generator-managed expanded systems.");
		return;
	}
	let r = await t.prompt({
		window: { title: `Edit Habitation — ${e.name}` },
		content: Rc(e),
		ok: { label: "Apply" },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => zc(t.element)
	});
	if (!r) return;
	let i = jc(r.bodyId);
	if (!i) return;
	let a = ac(e).find((e) => e.id === i);
	if (!a) {
		t.notifyError(`Unable to find body ${i}.`);
		return;
	}
	if (Ac(Ac(a.physical?.details)?.nativeLife)?.currentNativeSophont === !0) {
		t.notifyWarning("This body has current native Sophonts. Its native habitation cannot be changed with the transplanted-population editor.");
		return;
	}
	let o = { ...Mc(e)?.habitationOverrides ?? {} }, s = jc(r.habitationAction);
	if (s === "clear") delete o[i];
	else {
		let e = jc(r.populationMode) ?? "generate", n = null;
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
		if (!await Lc(e, o, n)) {
			t.notifyWarning("Habitation editing is only available for generator-managed expanded systems.");
			return;
		}
		t.notifyInfo(s === "clear" ? `Cleared the Referee transplanted population from ${i}.` : `Established a transplanted population on ${i}.`);
	} catch (e) {
		t.notifyError(`Unable to update habitation: ${e instanceof Error ? e.message : String(e)}`);
	}
}
//#endregion
//#region src/integrations/foundry/actorContextMenuV14.ts
function Vc(e, t) {
	let n = Bs(e);
	return t.listGeneratedActors().find((e) => e.id === n);
}
function Hc(e, t, n) {
	e.push({
		label: t.localizer.localize("TSG.Manager.ContextManage"),
		icon: "<i class=\"fa-solid fa-solar-system\"></i>",
		visible: (e) => {
			let n = Vc(e, t);
			return !!(t.isGameMaster() && n?.type === "world");
		},
		onClick: (e, r) => {
			let i = Vc(r, t);
			i && Qs(t, n, {
				initialActorId: i.id,
				initialAction: _s(i) ? "adopt" : "update"
			});
		}
	});
}
function Uc(e, t, n) {
	e.push({
		label: "Traveller System Generator: Inspect WBH Details",
		icon: "<i class=\"fa-solid fa-magnifying-glass-chart\"></i>",
		visible: (e) => {
			let n = Vc(e, t);
			return !!(t.isGameMaster() && n && rc(n));
		},
		onClick: (e, r) => {
			let i = Vc(r, t);
			i && Oc(i, t, n);
		}
	}), n && e.push({
		label: "Traveller System Generator: Edit Habitation",
		icon: "<i class=\"fa-solid fa-people-roof\"></i>",
		visible: (e) => {
			let n = Vc(e, t);
			return !!(t.isGameMaster() && n && Fc(n));
		},
		onClick: (e, r) => {
			let i = Vc(r, t);
			i && Bc(i, t, n);
		}
	});
}
//#endregion
//#region src/integrations/foundry/settingsControl.ts
var Wc = "traveller-system-generator", Gc = "useDefaultSystemFolder", Kc = "defaultSystemFolderId";
function qc(e, t) {
	return Object.fromEntries([["", t.localize("TSG.Dialog.ActorFolderRoot")], ...is(e).map((e) => [e.id, e.path])]);
}
function Jc(e, t) {
	e.register(Wc, Gc, {
		name: t.localize("TSG.Settings.UseDefaultFolder.Name"),
		hint: t.localize("TSG.Settings.UseDefaultFolder.Hint"),
		scope: "world",
		config: !0,
		type: Boolean,
		default: !1
	}), e.register(Wc, Kc, {
		name: t.localize("TSG.Settings.DefaultFolder.Name"),
		hint: t.localize("TSG.Settings.DefaultFolder.Hint"),
		scope: "world",
		config: !0,
		type: String,
		choices: { "": t.localize("TSG.Dialog.ActorFolderRoot") },
		default: ""
	});
}
async function Yc(e) {
	let t = qc(e.listActorFolders(), e.localizer), n = e.settings.settings.get(`${Wc}.${Kc}`);
	n && (n.choices = t);
	let r = String(e.settings.get("traveller-system-generator", "defaultSystemFolderId") ?? "");
	r && !(r in t) && (await e.settings.set(Wc, Kc, ""), e.settings.get("traveller-system-generator", "useDefaultSystemFolder") && e.notifyWarning(e.localizer.localize("TSG.Notification.DefaultFolderMissing")));
}
function Xc(e, t) {
	if (!e.get("traveller-system-generator", "useDefaultSystemFolder")) return null;
	let n = String(e.get("traveller-system-generator", "defaultSystemFolderId") ?? "");
	return n && t.some((e) => e.id === n) ? n : null;
}
//#endregion
//#region src/integrations/foundry/bootstrap.ts
function Zc(e) {
	let t = Xo();
	e.Hooks.once("init", () => {
		Zo(e.getModules(), t);
		let n = e.getDefaultFolderSettingsEnvironment();
		Jc(n.settings, n.localizer);
	}), e.Hooks.once("ready", () => {
		Yc(e.getDefaultFolderSettingsEnvironment());
	});
	for (let t of [
		"createFolder",
		"updateFolder",
		"deleteFolder"
	]) e.Hooks.on(t, () => {
		Yc(e.getDefaultFolderSettingsEnvironment());
	});
	e.Hooks.on("getSceneControlButtons", (n) => {
		$s(n, e.getManagerEnvironment(), t);
	}), e.Hooks.on("getActorContextOptions", (n, r) => {
		let i = e.getManagerEnvironment();
		Hc(r, i, t), Uc(r, i, t);
	});
}
function Qc(e) {
	return typeof e == "string" ? e || null : e?.id ?? null;
}
function $c(e) {
	return e.filter((e) => e.type === "Actor").map(({ id: e, name: t, folder: n, parent: r }) => ({
		id: e,
		name: t,
		parentId: Qc(n ?? r)
	}));
}
function el(e, t) {
	let n = new Map(t.map((e) => [e.id, e])), r = [], i = /* @__PURE__ */ new Set(), a = Qc(e.folder);
	for (; a && !i.has(a);) {
		i.add(a);
		let e = n.get(a);
		if (!e) break;
		r.unshift(e.name), a = Qc(e.folder ?? e.parent);
	}
	return r.join(" / ");
}
if (typeof Hooks < "u") {
	let e = {
		localize: (e) => game.i18n.localize(e),
		format: (e, t) => game.i18n.format(e, t)
	}, t = (e) => foundry.applications.api.DialogV2.input(e), n = () => $c(Array.from(game.folders));
	Zc({
		Hooks,
		getModules: () => game.modules,
		getDefaultFolderSettingsEnvironment: () => ({
			settings: game.settings,
			localizer: e,
			listActorFolders: n,
			notifyWarning: (e) => ui.notifications.warn(e)
		}),
		getManagerEnvironment: () => {
			let n = Array.from(game.folders), r = $c(n);
			return {
				isGameMaster: () => game.user.isGM,
				canCreateActor: () => Actor.implementation.canUserCreate(game.user),
				listActorFolders: () => r,
				defaultSystemFolderId: () => Xc(game.settings, r),
				listGeneratedActors: () => Array.from(game.actors).map((e) => Object.assign(e, {
					folderId: Qc(e.folder),
					folderPath: el(e, n.filter((e) => e.type === "Actor"))
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
export { Zc as registerFoundryBootstrap };
