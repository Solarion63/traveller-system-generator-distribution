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
//#region src/exporters/twodsixActorExport.ts
var r = "systems/twodsix/assets/icons/default_world.png";
function i(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function a(e, t = 3) {
	return e === void 0 || Number.isNaN(e) ? "-" : Number(e.toFixed(t)).toString();
}
function o(e) {
	return `${e.spectralType}${e.subtype ?? ""} ${e.luminosityClass}`;
}
function s(e) {
	return e.social?.uwp ?? e.physical?.uwpPhysical ?? "-";
}
function c(e) {
	return `<p>${i(e)}</p>`;
}
function l(e, t) {
	return e.length ? e.join("; ") : t;
}
function u(e) {
	return e.worlds.find((e) => e.isMainworld);
}
function d(e) {
	if (!e?.physical) return "No mainworld climate profile was generated.";
	let t = e.physical;
	return `${t.temperatureBand} climate in the ${t.zone.toLowerCase()}; physical profile ${t.uwpPhysical}.`;
}
function f(e) {
	if (!e?.physical) return "No environmental hazards were generated.";
	let t = e.physical, n = [];
	return (t.atmosphereCode ?? 0) === 0 ? n.push("vacuum exposure") : (t.atmosphereCode ?? 0) <= 3 ? n.push("hostile or trace atmosphere") : (t.atmosphereCode ?? 0) >= 10 && n.push("exotic or corrosive atmosphere"), t.zone === "Inferno" && n.push("extreme heat"), t.zone === "Frozen" && n.push("extreme cold"), (t.hydrographicsCode ?? 0) === 10 && n.push("minimal exposed land"), l(n, "No exceptional environmental hazards were identified by the generated profile.");
}
function p(e) {
	if (!e?.social) return "No inhabited mainworld economy was generated.";
	let n = e.social, r = n.tradeCodes.length ? n.tradeCodes.join(", ") : "no assigned trade classifications";
	return `Population ${n.populationTotal.toLocaleString("en-US")}; tech level ${t(n.techLevel)}; importance ${n.importance}; ${r}.`;
}
function m(e) {
	if (!e?.social) return "Uninhabited or socially unprofiled market.";
	let n = e.social;
	return `Starport ${n.starport}; population code ${t(n.populationCode)} with multiplier ${n.populationMultiplier}; law ${t(n.lawLevelCode)}; government ${t(n.governmentCode)}.`;
}
function h(e) {
	let t = e.filter((e) => e.severity !== "info");
	return t.length ? `<ul>${t.map((e) => `<li><strong>${i(e.severity.toUpperCase())}:</strong> ${i(e.message)}${e.recommendation ? ` <em>${i(e.recommendation)}</em>` : ""}</li>`).join("")}</ul>` : "<p>No generation warnings or errors.</p>";
}
function g(e) {
	let t = u(e), n = e.stars.map((e) => `
    <tr>
      <td>${i(e.designation)}</td>
      <td>${i(o(e))}</td>
      <td>${i(e.stellarNature ?? "-")}</td>
      <td>${i(e.orbitClass)}</td>
      <td>${i(a(e.orbitAu))}</td>
      <td>${i(a(e.massSolar))}</td>
      <td>${i(a(e.luminositySolar))}</td>
    </tr>`).join(""), r = e.worlds.filter((e) => e.worldKind !== "Empty Orbit").map((e) => `
      <tr>
        <td>${i(e.id)}${e.isMainworld ? " ★" : ""}</td>
        <td>${i(e.aroundDesignation)}</td>
        <td>${i(e.worldKind)}</td>
        <td>${i(e.physical?.zone ?? "-")}</td>
        <td>${i(s(e))}</td>
        <td>${i(e.social?.populationTotal ?? "-")}</td>
        <td>${i(e.social?.tradeCodes.join(" ") || "-")}</td>
        <td>${i(a(e.au))}</td>
      </tr>`).join(""), c = e.generationSettings ? `${e.generationSettings.starDistribution}; ${e.generationSettings.detailLevel} detail; unusual primaries ${e.generationSettings.allowUnusualPrimaries ? "allowed" : "disabled"}` : "default settings";
	return [
		`<h2>${i(e.name)} System</h2>`,
		"<h3>Mainworld</h3>",
		`<p><strong>World:</strong> ${i(t?.id ?? "None")} &nbsp; <strong>UWP:</strong> ${i(t?.social?.uwp ?? e.summary.preliminaryUwp ?? "-")} &nbsp; <strong>Trade Codes:</strong> ${i(t?.social?.tradeCodes.join(" ") || e.summary.tradeCodes?.join(" ") || "-")}</p>`,
		`<p>${i(d(t))}</p>`,
		"<h3>System Summary</h3>",
		`<p><strong>Stars:</strong> ${e.stars.length} &nbsp; <strong>Terrestrial Worlds:</strong> ${e.summary.terrestrialPlanets} &nbsp; <strong>Gas Giants:</strong> ${e.summary.gasGiants} &nbsp; <strong>Planetoid Belts:</strong> ${e.summary.planetoidBelts}</p>`,
		"<h3>Stars</h3>",
		"<table><thead><tr><th>Designation</th><th>Class</th><th>Nature</th><th>Orbit</th><th>AU</th><th>Mass</th><th>Luminosity</th></tr></thead>",
		`<tbody>${n}</tbody></table>`,
		"<h3>Worlds</h3>",
		"<table><thead><tr><th>ID</th><th>Around</th><th>Kind</th><th>Zone</th><th>UWP</th><th>Population</th><th>Trade</th><th>AU</th></tr></thead>",
		`<tbody>${r}</tbody></table>`,
		"<h3>Generation Notes</h3>",
		`<p><strong>Method:</strong> ${i(e.generationMethod ?? "expanded")} &nbsp; <strong>Settings:</strong> ${i(c)} &nbsp; <strong>Schema:</strong> ${i(e.schemaVersion)}</p>`,
		h(e.validation)
	].join("");
}
function _(e) {
	let n = u(e), i = n?.social, a = n?.physical, o = `${e.name} System`, s = i?.tradeCodes.join(" ") ?? e.summary.tradeCodes?.join(" ") ?? "";
	return {
		name: o,
		type: "world",
		img: e.imageUrl || r,
		system: {
			name: e.name,
			uwp: i?.uwp ?? e.summary.preliminaryUwp ?? "",
			starport: i?.starport ?? "X",
			size: a?.sizeCode === null || a?.sizeCode === void 0 ? "0" : t(a.sizeCode),
			atmosphere: a?.atmosphereCode === null || a?.atmosphereCode === void 0 ? "0" : t(a.atmosphereCode),
			hydrographics: a?.hydrographicsCode === null || a?.hydrographicsCode === void 0 ? "0" : t(a.hydrographicsCode),
			population: i ? t(i.populationCode) : "0",
			government: i ? t(i.governmentCode) : "0",
			lawLevel: i ? t(i.lawLevelCode) : "0",
			techLevel: i ? t(i.techLevel) : "0",
			coordinates: "",
			allegiance: "N/A",
			features: [],
			tradeCodes: s,
			travelZone: "none",
			description: g(e),
			worldImage: e.imageUrl ?? "",
			mainExports: s || "No trade classifications generated.",
			mainImports: "Not generated; assign during campaign preparation.",
			economicLevel: p(n),
			marketProfile: m(n),
			localCurrency: "Not generated.",
			portFees: `Starport ${i?.starport ?? "X"}; fees not generated.`,
			climate: c(d(n)),
			hazards: c(f(n)),
			specialRules: c(n?.generationNotes?.join("; ") || "No special world rules generated."),
			adventureHooks: "<p>Not generated; add campaign-specific hooks here.</p>",
			notes: c(e.refereeNotes || "Generated by Traveller System Generator."),
			relatedActors: "",
			populationModifier: i?.populationMultiplier ?? 0,
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
				src: e.imageUrl || r,
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
var v = class {
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
}, y = /* @__PURE__ */ new Map([
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
]);
function b(e) {
	let t = Math.floor(e), n = Math.ceil(e), r = y.get(t), i = y.get(n);
	if (r === void 0) throw Error(`Orbit# ${t} is below supported range.`);
	if (i === void 0) return y.get(18) * 2 ** (e - 18);
	if (t === n) return r;
	let a = e - t;
	return r + (i - r) * a;
}
function ee(e) {
	let t = [...y.entries()].sort((e, t) => e[0] - t[0]);
	if (e <= t[0][1]) return t[0][0];
	for (let n = 0; n < t.length - 1; n += 1) {
		let [r, i] = t[n], [a, o] = t[n + 1];
		if (e >= i && e <= o) return r + (e - i) / (o - i);
	}
	let [n, r] = t.at(-1);
	return n + Math.log2(e / r);
}
function x(e, t = 3) {
	return Number(e.toFixed(t));
}
//#endregion
//#region src/rules/orbits/eccentricity.ts
function S(e, t = 0) {
	let n = e.roll(2, 6, t).total, r;
	return r = n <= 5 ? Math.max(0, -.001 + e.d6() / 1e3) : n <= 7 ? e.d6() / 200 : n <= 9 ? .03 + e.d6() / 100 : n === 10 ? .05 + e.d6() / 20 : n === 11 ? .05 + e.roll(2, 6).total / 20 : .3 + e.roll(2, 6).total / 20, x(Math.max(0, Math.min(.999, r)), 3);
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
function C(e, t, n, r) {
	let i = oe.filter((t) => t.spectralType === e);
	if (i.length === 0) throw Error(`No rows for spectral type ${e}`);
	let a = i.filter((e) => e.subtype <= t).at(-1) ?? i[0], o = i.find((e) => e.subtype >= t) ?? i.at(-1), s = o.subtype - a.subtype || 1, c = (t - a.subtype) / s, l = (e) => {
		if (r === "temperatureK") return e.temperatureK;
		let t = e[r][n];
		return t === void 0 ? e[r].V ?? e[r].III ?? 1 : t;
	};
	return l(a) + (l(o) - l(a)) * c;
}
function w(e, t) {
	return e ** 2 * (t / 5772) ** 4;
}
function ue(e, t) {
	let n = 10 / Math.max(t, .08) ** 2.5;
	if (t < .9) return e.d6() * 2 + Math.ceil(e.d6() / 2) - 1;
	let r = Math.max(.01, e.d10ZeroToNine() / 10);
	return Math.max(.01, Math.min(n, n * r));
}
function de(e, t, n, r, i) {
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
			luminositySolar: Number(w(s, o).toFixed(6)),
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
			luminositySolar: Number(w(o, r).toFixed(6)),
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
function fe(e, t, n) {
	let r = te(e.roll(2, 6, t ? 0 : -1).total, n);
	return r === "Hot" ? ie(e.roll(2, 6).total) : r;
}
function pe(e, t, n, r, i) {
	let a = ce(i), o = fe(e, r, a.starDistribution), s = "V", c = "";
	if (o === "Special") {
		let i = ne(e.roll(2, 6).total, a.allowUnusualPrimaries);
		if (i === "BD" || i === "D" || i === "Peculiar") return de(e, t, n, i, r);
		s = i === "III" ? re(e.roll(2, 6).total) : i, c = `Special-system result resolved as luminosity class ${s}.`;
	}
	let l;
	if (o === "Special") {
		let t = te(e.roll(2, 6, 1).total, a.starDistribution);
		l = t === "Hot" ? ie(e.roll(2, 6).total) : t === "Special" ? "M" : t;
	} else l = o;
	let u = ae(e.roll(2, 6).total, l, r), d = le(l, u, s);
	l = d.spectralType, u = d.subtype;
	let f = C(l, u, s, "mass"), p = C(l, u, s, "diameter"), m = C(l, u, s, "temperatureK"), h = w(p, m), g = s === "V" || s === "VI" ? ue(e, f) : Math.max(ue(e, Math.max(.9, Math.min(f, 3))), 1);
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
function T(e, t, n, r, i) {
	return pe(e, t, n, r, i);
}
//#endregion
//#region src/rules/system/worldCounts.ts
function me(e) {
	return e <= 4 ? 1 : e <= 7 ? 2 : e <= 10 ? 3 : e === 11 ? 4 : 5;
}
function he(e) {
	return e <= 7 ? 1 : e <= 10 ? 2 : e === 11 ? 3 : 4;
}
function ge(e, t) {
	let n = e.roll(2, 6).total <= 9 ? me(e.roll(2, 6).total) : 0, r = +(n > 0), i = e.roll(2, 6).total >= 8 ? he(e.roll(2, 6, r).total) : 0, a = t >= 2 ? -1 : 0, o = Math.max(0, e.roll(2, 6, -2 + a).total);
	return {
		gasGiants: n,
		planetoidBelts: i,
		terrestrialPlanets: o,
		totalWorlds: n + i + o
	};
}
//#endregion
//#region src/rules/worlds/physicalWorld.ts
function E(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function _e(e) {
	return e <= -3 ? "Inner" : e < -.75 ? "Inferno" : e <= .75 ? "Habitable Zone" : e <= 3 ? "Outer" : "Frozen";
}
function ve(e, t, n) {
	let r = t >= 10 ? 1 : t >= 4 ? 0 : -1, i = n >= 6 ? -1 : 0, a = {
		Inner: 4,
		Inferno: 3,
		"Habitable Zone": 1,
		Outer: -1,
		Frozen: -3
	}[e] + r + i;
	return a >= 4 ? "Inferno" : a >= 2 ? "Hot" : a >= 0 ? "Temperate" : a >= -2 ? "Cold" : "Frozen";
}
function ye(e, t) {
	let n = e.roll(2, 6, -2).total;
	return (t === "Inner" || t === "Frozen") && --n, t === "Habitable Zone" && (n += 1), E(n, 0, 15);
}
function be(e, t, n) {
	if (t === 0) return 0;
	let r = e.roll(2, 6, -7 + t).total;
	return (n === "Inner" || n === "Inferno") && (r += 1), n === "Frozen" && (r -= 2), E(r, 0, 15);
}
function xe(e, t, n, r) {
	if (t <= 1 || n <= 1) return 0;
	let i = e.roll(2, 6, -7 + t).total;
	return (r === "Inner" || r === "Inferno") && (i -= 4), r === "Outer" && --i, r === "Frozen" && (i -= 3), [
		10,
		11,
		12
	].includes(n) && (i -= 2), E(i, 0, 10);
}
function Se(e, t) {
	let n = e.roll(2, 6).total >= 8 ? "Large" : "Small", r = e.roll(2, 6).total >= 8;
	return {
		zone: t,
		sizeCode: null,
		atmosphereCode: null,
		hydrographicsCode: null,
		uwpPhysical: "GG",
		temperatureBand: t === "Inner" || t === "Inferno" ? "Hot" : t === "Frozen" ? "Frozen" : "Cold",
		notes: `${n} gas giant${r ? ", prominent ring system" : ""}`,
		orbitalPeriodYears: 0
	};
}
function Ce(e) {
	return {
		zone: e,
		sizeCode: 0,
		atmosphereCode: 0,
		hydrographicsCode: 0,
		uwpPhysical: "000",
		temperatureBand: e === "Habitable Zone" ? "Temperate" : e,
		notes: "Planetoid belt; individual bodies require separate detailing.",
		orbitalPeriodYears: 0
	};
}
function we(e) {
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
function Te(e, n, r) {
	let i = ye(e, r), a = be(e, i, r), o = xe(e, i, a, r);
	return {
		zone: r,
		sizeCode: i,
		atmosphereCode: a,
		hydrographicsCode: o,
		uwpPhysical: `${t(i)}${t(a)}${t(o)}`,
		temperatureBand: ve(r, a, o),
		notes: n.hzDeviation > 3 ? "Distant ice/rock world." : n.hzDeviation < -2 ? "Inner rocky world." : "Terrestrial world candidate.",
		orbitalPeriodYears: 0
	};
}
function Ee(e, t) {
	return x(Math.sqrt(e ** 3 / Math.max(t, .01)), 3);
}
function De(e, t, n) {
	let r = _e(t.hzDeviation), i, a = t.worldKind;
	return i = a === "Gas Giant" ? Se(e, r) : a === "Planetoid Belt" ? Ce(r) : a === "Empty Orbit" ? we(r) : Te(e, t, r), {
		...i,
		orbitalPeriodYears: Ee(t.au, n.massSolar)
	};
}
function Oe(e) {
	return e.filter((e) => e.worldKind !== "Empty Orbit").map((e) => {
		let t = e.physical, n = 0;
		return e.worldKind === "Terrestrial Planet" && (n += 20), t?.zone === "Habitable Zone" && (n += 20), t?.temperatureBand === "Temperate" && (n += 10), (t?.sizeCode ?? 0) >= 5 && (t?.sizeCode ?? 0) <= 10 && (n += 8), (t?.atmosphereCode ?? -1) >= 4 && (t?.atmosphereCode ?? -1) <= 9 && (n += 8), (t?.hydrographicsCode ?? -1) >= 3 && (t?.hydrographicsCode ?? -1) <= 8 && (n += 6), e.worldKind === "Planetoid Belt" && (n += 4), e.worldKind === "Gas Giant" && (n -= 5), n -= Math.abs(e.hzDeviation), {
			id: e.id,
			score: n
		};
	}).sort((e, t) => t.score - e.score)[0]?.id;
}
function ke(e, n, r, i, a) {
	let o = _e(e.hzDeviation);
	return {
		zone: o,
		sizeCode: r,
		atmosphereCode: i,
		hydrographicsCode: a,
		uwpPhysical: `${t(r)}${t(i)}${t(a)}`,
		temperatureBand: ve(o, i, a),
		notes: "Physical profile imported from source UWP.",
		orbitalPeriodYears: Ee(e.au, n.massSolar)
	};
}
//#endregion
//#region src/rules/worlds/socialWorld.ts
function D(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function O(e) {
	return t(D(e, 0, 33));
}
function Ae(e) {
	return e >= 11 ? "A" : e >= 9 ? "B" : e >= 7 ? "C" : e >= 5 ? "D" : e >= 3 ? "E" : "X";
}
function je(e) {
	let t = e.physical, n = 0;
	return t?.zone === "Habitable Zone" && (n += 1), t?.temperatureBand === "Temperate" && (n += 1), e.worldKind === "Planetoid Belt" && --n, e.worldKind === "Gas Giant" && (n -= 3), n;
}
function Me(e, t) {
	if (t.worldKind === "Empty Orbit" || t.worldKind === "Gas Giant") return 0;
	let n = t.physical, r = -2;
	return t.isMainworld && (r += 2), n?.zone === "Habitable Zone" && (r += 1), n?.temperatureBand === "Temperate" && (r += 1), n?.atmosphereCode !== null && n?.atmosphereCode !== void 0 && (n.atmosphereCode >= 4 && n.atmosphereCode <= 9 && (r += 1), (n.atmosphereCode === 0 || n.atmosphereCode >= 10) && --r), n?.hydrographicsCode !== null && n?.hydrographicsCode !== void 0 && (n.hydrographicsCode >= 4 && n.hydrographicsCode <= 8 && (r += 1), n.hydrographicsCode === 0 && --r), t.worldKind === "Planetoid Belt" && --r, D(e.roll(2, 6, r).total, 0, 10);
}
function Ne(e, t) {
	return t === 0 ? 0 : e.die(9);
}
function Pe(e, t) {
	return e === 0 || t === 0 ? 0 : t * 10 ** e;
}
function Fe(e, t) {
	return t === 0 ? 0 : D(e.roll(2, 6, -7 + t).total, 0, 15);
}
function Ie(e, t, n) {
	return n === 0 ? 0 : D(e.roll(2, 6, -7 + t).total, 0, 18);
}
function Le(e, t, n, r, i, a) {
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
function Re(e, t, n) {
	let r = 0;
	return (t === 0 || t === 1) && (r = Math.max(r, 8)), (t === 2 || t === 3 || t >= 10) && (r = Math.max(r, 5)), n === 0 && t >= 4 && (r = Math.max(r, 4)), e === 0 && (r = Math.max(r, 8)), r;
}
function ze(e, t, n, r, i) {
	if (r === 0) return 0;
	let a = n.physical, o = a?.sizeCode ?? 0, s = a?.atmosphereCode ?? 0, c = a?.hydrographicsCode ?? 0, l = e.die(6) + Le(t, o, s, c, r, i);
	return D(Math.max(l, Re(o, s, c)), 0, 15);
}
function k(e, t, n) {
	return e >= t && e <= n;
}
function Be(e, t, n, r) {
	let i = e.populationCode, a = e.governmentCode, o = e.lawLevelCode, s = e.techLevel, c = [];
	return k(t, 4, 9) && k(n, 4, 8) && k(r, 5, 7) && c.push("Ag"), t === 0 && n === 0 && r === 0 && c.push("As"), i === 0 && a === 0 && o === 0 && c.push("Ba"), k(t, 2, 9) && r === 0 && c.push("De"), (k(n, 10, 12) || n >= 15) && r >= 1 && c.push("Fl"), k(t, 6, 8) && [
		5,
		6,
		8
	].includes(n) && k(r, 5, 7) && c.push("Ga"), i >= 9 && c.push("Hi"), s >= 12 && c.push("Ht"), (n === 0 || n === 1) && r >= 1 && c.push("Ic"), [
		0,
		1,
		2,
		4,
		7,
		9,
		10,
		11,
		12
	].includes(n) && i >= 9 && c.push("In"), i >= 1 && i <= 3 && c.push("Lo"), i >= 1 && s <= 5 && c.push("Lt"), k(n, 0, 3) && k(r, 0, 3) && i >= 6 && c.push("Na"), k(i, 4, 6) && c.push("Ni"), k(n, 2, 5) && k(r, 0, 3) && c.push("Po"), (n === 6 || n === 8) && k(i, 6, 8) && k(a, 4, 9) && c.push("Ri"), n === 0 && c.push("Va"), k(t, 2, 9) && r === 10 && c.push("Wa"), c;
}
function Ve(e) {
	let t = 0;
	return (e.starport === "A" || e.starport === "B") && (t += 1), (e.starport === "D" || e.starport === "E" || e.starport === "X") && --t, e.populationCode <= 6 && --t, e.populationCode >= 9 && (t += 1), e.techLevel <= 8 && --t, e.techLevel >= 10 && e.techLevel <= 15 && (t += 1), e.techLevel >= 16 && (t += 2), e.tradeCodes.includes("Ag") && (t += 1), e.tradeCodes.includes("In") && (t += 1), e.tradeCodes.includes("Ri") && (t += 1), t;
}
function He(e, t) {
	if (!t.physical || t.worldKind === "Empty Orbit" || t.worldKind === "Gas Giant") return;
	let n = Me(e, t), r = Ne(e, n), i = Pe(n, r), a = Fe(e, n), o = Ie(e, a, n), s = n === 0 ? "X" : Ae(e.roll(2, 6, je(t)).total), c = ze(e, s, t, n, a), l = t.physical.sizeCode ?? 0, u = t.physical.atmosphereCode ?? 0, d = t.physical.hydrographicsCode ?? 0, f = {
		starport: s,
		populationCode: n,
		populationMultiplier: r,
		populationTotal: i,
		governmentCode: a,
		lawLevelCode: o,
		techLevel: c,
		uwp: "",
		tradeCodes: [],
		importance: 0,
		notes: n === 0 ? "Uninhabited; starport treated as X." : "Initial UWP social profile."
	};
	return f.tradeCodes = Be(f, l, u, d), f.importance = Ve(f), f.uwp = `${s}${t.physical.uwpPhysical}${O(n)}${O(a)}${O(o)}-${O(c)}`, f;
}
function Ue(e, t, n, r, i, a, o, s, c) {
	let l = {
		starport: e,
		populationCode: t,
		populationMultiplier: n,
		populationTotal: Pe(t, n),
		governmentCode: r,
		lawLevelCode: i,
		techLevel: a,
		uwp: "",
		tradeCodes: [],
		importance: 0,
		notes: "Social profile imported from source UWP."
	};
	return l.tradeCodes = Be(l, o, s, c), l.importance = Ve(l), l.uwp = `${e}${O(o)}${O(s)}${O(c)}${O(t)}${O(r)}${O(i)}-${O(a)}`, l;
}
//#endregion
//#region src/rules/validation/systemValidation.ts
function A(e, t, n, r, i) {
	e.push({
		severity: t,
		scope: n,
		message: r,
		recommendation: i
	});
}
function We(e, t) {
	if (t.worldKind === "Empty Orbit") return;
	let n = t.physical;
	if (!n) {
		A(e, "warning", t.id, "World has no physical profile.", "Regenerate the system or check the physical world generation step.");
		return;
	}
	let r = n.sizeCode ?? 0, i = n.atmosphereCode ?? 0, a = n.hydrographicsCode ?? 0, o = t.social;
	r === 0 && (i !== 0 || a !== 0) && A(e, "error", t.id, "Size 0 world has non-zero atmosphere or hydrographics.", "Set atmosphere and hydrographics to 0 for asteroid-size bodies."), i === 0 && a > 0 && n.temperatureBand !== "Frozen" && A(e, "warning", t.id, "Vacuum world has surface hydrographics outside a frozen environment.", "Treat water as ice, subsurface reservoirs, or reroll hydrographics."), a === 10 && ["Inferno", "Inner"].includes(n.zone) && A(e, "warning", t.id, "Very high hydrographics on a hot inner-zone world.", "Consider revising temperature, hydrographics, or atmosphere."), t.worldKind === "Gas Giant" && n.uwpPhysical !== "---" && A(e, "info", t.id, "Gas giant is excluded from UWP-style physical coding.", "This is expected for the current generator."), o && (o.populationCode === 0 && (o.governmentCode !== 0 || o.lawLevelCode !== 0 || o.starport !== "X") && A(e, "error", t.id, "Uninhabited world has government, law, or starport values that imply habitation.", "Set starport X and social codes 000."), o.populationCode > 0 && o.techLevel === 0 && A(e, "warning", t.id, "Inhabited world has TL 0.", "Confirm this is intentional for a primitive or collapsed society."), o.techLevel < 5 && (i <= 3 || i >= 10) && o.populationCode >= 6 && A(e, "warning", t.id, "Large population on a hostile-atmosphere world with low TL.", "Raise TL, reduce population, or explain outside support."), o.starport === "A" && o.populationCode <= 3 && A(e, "info", t.id, "Excellent starport with very low population.", "This may indicate a depot, research station, or external installation."), o.tradeCodes.includes("Ba") && o.populationCode !== 0 && A(e, "error", t.id, "Barren trade code conflicts with non-zero population.", "Recalculate trade codes."));
}
function j(e) {
	let t = [], n = e.worlds.find((e) => e.isMainworld);
	n ? n.social?.uwp || A(t, "warning", "system", "Selected mainworld does not have a complete UWP.", "Generate or manually assign social characteristics.") : A(t, "error", "system", "No mainworld was selected.", "Choose the most habitable terrestrial world or belt as the mainworld."), e.worlds.filter((e) => e.isMainworld).length > 1 && A(t, "error", "system", "More than one world is marked as the mainworld.", "Keep exactly one mainworld flag."), e.stars.length === 0 && A(t, "error", "system", "System has no stars.", "Regenerate primary star data."), e.summary.totalWorlds !== e.worlds.filter((e) => e.worldKind !== "Empty Orbit").length && A(t, "warning", "system", "Summary world count does not match generated non-empty world rows.", "Check world placement and empty-orbit accounting.");
	for (let n of e.worlds) We(t, n);
	return t.length === 0 && A(t, "info", "system", "No validation issues found."), t;
}
//#endregion
//#region src/rules/system/generateExpandedSystem.ts
function Ge(e) {
	return {
		...se,
		...e
	};
}
function Ke(e) {
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
function M(e, t) {
	return t === "Close" ? Math.max(.5, e.d6() - 1) + e.d10ZeroToNine() / 10 : t === "Near" ? e.d6() + 5 + e.d10ZeroToNine() / 10 : t === "Far" ? e.d6() + 11 + e.d10ZeroToNine() / 10 : e.d6() / 10 + e.roll(2, 6, -7).total / 100;
}
function qe(e, t, n, r) {
	let i = [n], a = Ke(n);
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
		let n = T(e, `${t} ${o.designation}`, o.designation, !1, r);
		n.orbitClass = o.orbitClass, n.orbitNumber = x(M(e, o.orbitClass), 2), n.orbitAu = x(b(n.orbitNumber), 3), n.eccentricity = S(e, 2), i.push(n);
	}
	if (r.detailLevel !== "basic") {
		let n = [...i];
		for (let o of n) if (e.roll(2, 6, a - (r.detailLevel === "deep" ? 0 : 1)).total >= 10) {
			let n = `${o.designation}b`, a = T(e, `${t} ${n}`, n, !1, r);
			a.orbitClass = "Companion", a.parentId = o.id, a.orbitNumber = x(M(e, "Companion"), 2), a.orbitAu = x(b(a.orbitNumber), 3), a.eccentricity = S(e, 2), i.push(a);
		}
	}
	return i;
}
function Je(e) {
	let t = Math.max(.01, .01 * e.diameterSolar);
	return x(Math.max(-2, ee(t)), 2);
}
function Ye(e) {
	return x(ee(Math.sqrt(Math.max(e.luminositySolar, 1e-6))), 2);
}
function Xe(e) {
	let t = [];
	for (let n of e) {
		if (n.orbitClass === "Companion" || n.orbitClass === "Primary" || n.orbitNumber === void 0) continue;
		let e = n.orbitClass === "Close" ? 1.5 : n.orbitClass === "Near" ? 2.5 : 3.5;
		t.push({
			source: n.designation,
			aroundStarId: "A",
			centerOrbitNumber: n.orbitNumber,
			inner: x(n.orbitNumber - e, 2),
			outer: x(n.orbitNumber + e, 2),
			reason: `${n.orbitClass} stellar companion clears or destabilises nearby planetary orbits.`
		});
	}
	return t;
}
function N(e, t, n) {
	return n.find((n) => n.aroundStarId === t && e >= n.inner && e <= n.outer);
}
function Ze(e, t) {
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
function Qe(e, t) {
	return Math.max(1, Math.min(t, e.roll(2, 6).total));
}
function P(e, t, n) {
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
function $e(e, t) {
	return t === "basic" ? +(e.roll(2, 6).total >= 11) : t === "deep" ? e.roll(2, 6).total >= 9 ? Math.max(0, e.d6() - 2) : 0 : e.roll(2, 6).total >= 10 ? Math.max(0, Math.min(3, e.d6() - 3)) : 0;
}
function et(e, t, n, r, i) {
	let a = Math.max(1, n.totalWorlds), o = $e(e, i.detailLevel), s = a + Math.max(0, o), c = Qe(e, a), l = t[0], u = l?.hzco ?? 4, d = l?.minimumAllowableOrbit ?? -2, f = x(Math.max(.1, (u - d) / c), 2), p = {
		"Empty Orbit": o,
		"Gas Giant": n.gasGiants,
		"Planetoid Belt": n.planetoidBelts,
		"Terrestrial Planet": n.terrestrialPlanets
	}, m = [];
	for (let n of t) {
		let t = 1, i = 0;
		for (; t <= n.allocatedWorlds && i < n.allocatedWorlds * 8 + 16;) {
			i += 1;
			let a = t - c, o = e.roll(2, 6, -7).total * .05 * f, s = x(Math.max(n.minimumAllowableOrbit, n.hzco + a * f + o), 2), l = N(s, n.star.id, r), u = [];
			if (l && (s = x(l.outer + .2 + e.d10ZeroToNine() / 20, 2), u.push(`Moved outward to avoid forbidden zone from ${l.source}.`)), s > n.outerLimit && (s = x(n.outerLimit - e.d10ZeroToNine() / 10, 2)), N(s, n.star.id, r)) continue;
			let d = x(b(s), 3), h = x(s - n.hzco, 2), g = S(e, s < 1 ? -1 : 0), _ = {
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
				worldKind: P(e, _, p),
				generationNotes: u.length ? u : void 0
			}), t += 1;
		}
	}
	for (; m.length < s;) {
		let n = t[0], r = m.filter((e) => e.aroundStarId === n.star.id).length + 1, i = x(n.hzco + r * f, 2), a = x(i - n.hzco, 2);
		m.push({
			id: `${n.star.designation}-${r}`,
			aroundStarId: n.star.id,
			aroundDesignation: n.star.designation,
			sequence: r,
			orbitNumber: i,
			au: x(b(i), 3),
			eccentricity: S(e, 0),
			hzco: n.hzco,
			hzDeviation: a,
			worldKind: P(e, {
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
function tt(e, t) {
	return e + Math.imul(t, 2654435761) >>> 0;
}
function F(e = {}) {
	let t = Ge(e.settings), n = e.seed ?? Date.now(), r = new v(tt(n, e.rerollIndex ?? 0)), i = e.name ?? "Uncharted System", a = T(r, `${i} A`, "A", !0, t), o = qe(r, i, a, t).sort((e, t) => (e.orbitAu ?? 0) - (t.orbitAu ?? 0)), s = ge(r, o.length), c = Xe(o), l = o.filter((e) => e.orbitClass !== "Companion"), u = t.detailLevel === "deep" ? 4 : t.detailLevel === "basic" ? -2 : 0, d = et(r, Ze(l.map((e) => {
		let t = Je(e), n = Ye(e), r = e.orbitClass === "Primary" ? 18 + u : Math.max(2, (e.orbitNumber ?? 10) - 1), i = c.filter((t) => t.aroundStarId === e.id).sort((e, t) => e.inner - t.inner)[0], a = Math.max(t + 1, Math.min(r, i ? i.inner - .2 : r));
		return {
			star: e,
			minimumAllowableOrbit: t,
			hzco: n,
			availableOrbitCount: Math.max(0, a - t),
			outerLimit: a,
			allocatedWorlds: 0
		};
	}), s.totalWorlds), s, c, t), f = d.worlds.map((e) => {
		let t = o.find((t) => t.id === e.aroundStarId) ?? a;
		return {
			...e,
			physical: De(r, e, t)
		};
	}), p = Oe(f), m = f.map((e) => ({
		...e,
		isMainworld: e.id === p
	})).map((e) => ({
		...e,
		social: He(r, e)
	})), h = m.find((e) => e.isMainworld), g = h?.social?.uwp ?? (h?.physical?.uwpPhysical ? `X${h.physical.uwpPhysical}000-0` : void 0), _ = {
		schemaVersion: "traveller-system-generator/v9",
		id: `system-${n}-${e.rerollIndex ?? 0}-${i.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
		name: i,
		generationMethod: "expanded",
		generationSettings: t,
		primary: a,
		stars: o,
		worlds: m,
		summary: {
			...s,
			emptyOrbits: d.emptyOrbits,
			baselineNumber: d.baselineNumber,
			baselineOrbitNumber: d.baselineOrbitNumber,
			spread: d.spread,
			mainworldId: p,
			preliminaryUwp: g,
			tradeCodes: h?.social?.tradeCodes,
			importance: h?.social?.importance,
			forbiddenZones: c.map((e) => `${e.source}: orbit ${e.inner}-${e.outer}`)
		},
		refereeNotes: "",
		imageUrl: "",
		mapUrl: ""
	};
	return {
		..._,
		validation: j(_)
	};
}
//#endregion
//#region src/rules/system/continuationUwp.ts
var nt = /^([ABCDEX])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])([0-9A-HJ-NP-Z])-([0-9A-HJ-NP-Z])$/i;
function rt(e) {
	let t = e.trim().toUpperCase().replace(/\s+/g, "").match(nt);
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
//#region src/rules/system/generateContinuationSystem.ts
function it(e, t) {
	return e + Math.imul(t, 2246822507) >>> 0;
}
function at(e, t) {
	let n = e.primary, r = Math.round((e.worlds.find((e) => e.aroundStarId === n.id)?.hzco ?? 4) * 100) / 100, i = x(r + t.roll(2, 6, -7).total * .04, 2), a = x(b(i), 3);
	return {
		id: "A-MW",
		aroundStarId: n.id,
		aroundDesignation: n.designation,
		sequence: 0,
		orbitNumber: i,
		au: a,
		eccentricity: S(t, 0),
		hzco: r,
		hzDeviation: x(i - r, 2),
		worldKind: "Terrestrial Planet",
		isMainworld: !0
	};
}
function ot(e, t) {
	return e.isMainworld ? e : {
		...e,
		id: `${e.aroundDesignation}-${t + 1}`,
		sequence: t + 1
	};
}
function st(e) {
	let t = rt(e.sourceUwp), n = F(e), r = new v(it(e.seed ?? Date.now(), (e.rerollIndex ?? 0) + 101)), i = at(n, r), a = ke(i, n.primary, t.size, t.atmosphere, t.hydrographics), o = t.population === 0 ? 0 : r.die(9), s = Ue(t.starport, t.population, o, t.government, t.law, t.techLevel, t.size, t.atmosphere, t.hydrographics), c = n.worlds.filter((e) => !e.isMainworld).map((e) => ({
		...e,
		isMainworld: !1
	})).sort((e, t) => e.au - t.au).map(ot), l = [{
		...i,
		physical: a,
		social: s
	}, ...c].sort((e, t) => e.au - t.au || (e.isMainworld ? -1 : 1)), u = {
		...n,
		schemaVersion: "traveller-system-generator/v9",
		generationMethod: "continuation",
		sourceUwp: t.normalized,
		worlds: l,
		summary: {
			...n.summary,
			totalWorlds: l.filter((e) => e.worldKind !== "Empty Orbit").length,
			mainworldId: i.id,
			preliminaryUwp: s.uwp,
			tradeCodes: s.tradeCodes,
			importance: s.importance
		}
	};
	return {
		...u,
		id: `system-${e.seed ?? "date"}-${e.rerollIndex ?? 0}-${t.normalized.toLowerCase()}`,
		validation: j(u)
	};
}
//#endregion
//#region src/integrations/foundry/sensorSystemPayload.ts
function ct(e) {
	let t = new Map(e.stars.map((e) => [e.id, e.designation]));
	return {
		schemaVersion: "traveller-system-generator/sensors-v1",
		sourceSystemId: e.id,
		stars: e.stars.map((e) => ({
			designation: e.designation,
			parentDesignation: e.parentId ? t.get(e.parentId) ?? null : null,
			spectralType: `${e.spectralType}${e.subtype ?? ""}`,
			luminosityClass: e.luminosityClass,
			massSolar: e.massSolar,
			luminositySolar: e.luminositySolar,
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
var I = "traveller-system-generator";
function L() {
	return {
		moduleId: I,
		generateSystem(e = {}) {
			return e.method === "continuation" ? st(e) : F(e);
		},
		createTwodsixWorldActor(e) {
			let t = _(e), n = t.flags[I];
			return t.flags[I] = {
				...n && typeof n == "object" ? n : {},
				sensorSystem: ct(e)
			}, t;
		}
	};
}
function lt(e, t = L()) {
	let n = e.get(I);
	if (!n) throw Error(`Foundry module ${I} is not registered.`);
	return n.api = t, t;
}
//#endregion
//#region src/integrations/foundry/localization.ts
var ut = {
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
	"TSG.Notification.Failed": "Traveller system generation failed: {message}"
}, dt = {
	localize(e) {
		return ut[e];
	},
	format(e, t) {
		return Object.entries(t).reduce((e, [t, n]) => e.replaceAll(`{${t}}`, String(n)), ut[e]);
	}
};
//#endregion
//#region src/integrations/foundry/generatorControl.ts
function R(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function ft(e, t) {
	return e.name.localeCompare(t.name, void 0, { sensitivity: "base" }) || e.id.localeCompare(t.id);
}
function z(e) {
	e.style.width = "720px", e.style.maxWidth = "calc(100vw - 2rem)", e.style.boxSizing = "border-box";
	for (let t of e.querySelectorAll("select, input[type=\"text\"], input[type=\"number\"]")) t.style.maxWidth = "100%", t.style.minWidth = "0", t.style.boxSizing = "border-box";
}
function pt(e = Math.random) {
	return Math.floor(e() * 4294967296) >>> 0;
}
function mt(e) {
	let t = new Map(e.map((e) => [e.id, e])), n = /* @__PURE__ */ new Map();
	for (let r of e) {
		let e = r.parentId && r.parentId !== r.id && t.has(r.parentId) ? r.parentId : null, i = n.get(e) ?? [];
		i.push(r), n.set(e, i);
	}
	for (let e of n.values()) e.sort(ft);
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
	for (let t of [...e].sort(ft)) i.has(t.id) || a(t, 0, []);
	return r;
}
function ht(e, t) {
	let n = mt(e).map((e) => {
		let t = e.depth > 0 ? `${"\xA0\xA0".repeat(e.depth)}└─ ` : "";
		return `<option value="${R(e.id)}">${R(`${t}${e.path}`)}</option>`;
	});
	return [`<option value="">${R(t.localize("TSG.Dialog.ActorFolderRoot"))}</option>`, ...n].join("");
}
function gt(e = 1105, t = [], n = dt) {
	let r = n.localize;
	return `
    <div class="form-group"><label>${r("TSG.Dialog.SystemName")}</label><input name="name" type="text" value="${R(r("TSG.Dialog.DefaultSystemName"))}" autofocus></div>
    <div class="form-group"><label>${r("TSG.Dialog.Seed")}</label><input name="seed" type="number" value="${R(String(e))}" step="1"></div>
    <div class="form-group"><label>${r("TSG.Dialog.Method")}</label><select name="method"><option value="expanded" selected>${r("TSG.Dialog.MethodExpanded")}</option><option value="continuation">${r("TSG.Dialog.MethodContinuation")}</option></select></div>
    <div class="form-group"><label>${r("TSG.Dialog.SourceUwp")}</label><input name="sourceUwp" type="text" value="A867A74-C" maxlength="9"><p class="hint">${r("TSG.Dialog.SourceUwpHint")}</p></div>
    <div class="form-group"><label>${r("TSG.Dialog.StarDistribution")}</label><select name="starDistribution"><option value="classic" selected>${r("TSG.Dialog.DistributionClassic")}</option><option value="realistic">${r("TSG.Dialog.DistributionRealistic")}</option></select></div>
    <div class="form-group"><label>${r("TSG.Dialog.DetailLevel")}</label><select name="detailLevel"><option value="basic">${r("TSG.Dialog.DetailBasic")}</option><option value="standard" selected>${r("TSG.Dialog.DetailStandard")}</option><option value="deep">${r("TSG.Dialog.DetailDeep")}</option></select></div>
    <div class="form-group"><label class="checkbox"><input name="allowUnusualPrimaries" type="checkbox" checked> ${r("TSG.Dialog.AllowUnusualPrimaries")}</label></div>
    <div class="form-group"><label>${r("TSG.Dialog.ActorFolder")}</label><select name="folder">${ht(t, n)}</select></div>
    <div class="form-group"><label class="checkbox"><input name="openSheet" type="checkbox" checked> ${r("TSG.Dialog.OpenSheet")}</label></div>`;
}
function B(e, t = "") {
	return typeof e == "string" ? e : t;
}
function _t(e, t) {
	let n = typeof e == "number" ? e : Number(e);
	return Number.isFinite(n) ? Math.trunc(n) : t;
}
function vt(e, t = !1) {
	return typeof e == "boolean" ? e : typeof e == "string" ? e === "true" || e === "on" : t;
}
function yt(e) {
	let t = B(e.name, "Uncharted System").trim() || "Uncharted System", n = _t(e.seed, 1105), r = B(e.method, "expanded"), i = {
		name: t,
		seed: n,
		settings: {
			starDistribution: B(e.starDistribution, "classic") === "realistic" ? "realistic" : "classic",
			detailLevel: ["basic", "deep"].includes(B(e.detailLevel)) ? B(e.detailLevel) : "standard",
			allowUnusualPrimaries: vt(e.allowUnusualPrimaries, !0)
		}
	};
	return {
		request: r === "continuation" ? {
			...i,
			method: "continuation",
			sourceUwp: B(e.sourceUwp, "A867A74-C").trim().toUpperCase()
		} : {
			...i,
			method: "expanded"
		},
		folder: B(e.folder).trim() || null,
		openSheet: vt(e.openSheet, !0)
	};
}
function bt(e) {
	return yt(e).request;
}
async function xt(e, t) {
	let { localizer: n } = e;
	if (!e.isGameMaster() || !e.canCreateActor()) {
		e.notifyWarning(n.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	let r = await e.prompt({
		window: { title: n.localize("TSG.Dialog.Title") },
		content: gt(pt(), e.listActorFolders(), n),
		ok: { label: n.localize("TSG.Dialog.Generate") },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => z(t.element)
	});
	if (r) try {
		let i = yt(r), a = t.generateSystem(i.request), o = t.createTwodsixWorldActor(a), s = o.flags && typeof o.flags == "object" ? o.flags : {};
		s["traveller-system-generator"] = {
			...s["traveller-system-generator"] && typeof s["traveller-system-generator"] == "object" ? s["traveller-system-generator"] : {},
			generationSeed: Number(i.request.seed ?? 1105)
		}, o.flags = s, i.folder && (o.folder = i.folder);
		let c = await e.createActor(o);
		i.openSheet && c.sheet?.render(!0), e.notifyInfo(n.format("TSG.Notification.Created", { name: String(c.name ?? o.name ?? a.name) }));
	} catch (t) {
		let r = t instanceof Error ? t.message : String(t);
		e.notifyError(n.format("TSG.Notification.Failed", { message: r }));
	}
}
//#endregion
//#region src/integrations/foundry/regenerateControl.ts
var V = "traveller-system-generator", St = [
	"notes",
	"adventureHooks",
	"relatedActors",
	"worldImage"
];
function H(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function U(e) {
	let t = e.flags?.[V];
	return t && typeof t == "object" ? t : null;
}
function W(e) {
	return !!(e && e.type === "world" && U(e));
}
function G(e) {
	return !!(e && e.type === "world" && !U(e));
}
function Ct(e, t, { adopting: n = !1 } = {}) {
	let r = U(e) ?? {}, i = r.generationSettings ?? {}, a = String(e.system.name ?? e.name.replace(/ System$/, "")), o = r.generationMethod ?? "expanded", s = r.sourceUwp ?? String(e.system.uwp ?? "A867A74-C"), c = r.generationSeed ?? (n ? pt() : 1105), l = i.starDistribution ?? "classic", u = i.detailLevel ?? "standard", d = i.allowUnusualPrimaries ?? !0, f = t.localize;
	return `
    <p class="hint">${H(f(n ? "TSG.Dialog.AdoptHint" : "TSG.Dialog.RegenerateHint"))}</p>
    <div class="form-group"><label>${f("TSG.Dialog.SystemName")}</label><input name="name" type="text" value="${H(a)}" autofocus></div>
    <div class="form-group"><label>${f("TSG.Dialog.Seed")}</label><input name="seed" type="number" value="${c}" step="1"></div>
    <div class="form-group"><label>${f("TSG.Dialog.Method")}</label><select name="method"><option value="expanded"${o === "expanded" ? " selected" : ""}>${f("TSG.Dialog.MethodExpanded")}</option><option value="continuation"${o === "continuation" ? " selected" : ""}>${f("TSG.Dialog.MethodContinuation")}</option></select></div>
    <div class="form-group"><label>${f("TSG.Dialog.SourceUwp")}</label><input name="sourceUwp" type="text" value="${H(s)}" maxlength="9"><p class="hint">${f("TSG.Dialog.SourceUwpHint")}</p></div>
    <div class="form-group"><label>${f("TSG.Dialog.StarDistribution")}</label><select name="starDistribution"><option value="classic"${l === "classic" ? " selected" : ""}>${f("TSG.Dialog.DistributionClassic")}</option><option value="realistic"${l === "realistic" ? " selected" : ""}>${f("TSG.Dialog.DistributionRealistic")}</option></select></div>
    <div class="form-group"><label>${f("TSG.Dialog.DetailLevel")}</label><select name="detailLevel"><option value="basic"${u === "basic" ? " selected" : ""}>${f("TSG.Dialog.DetailBasic")}</option><option value="standard"${u === "standard" ? " selected" : ""}>${f("TSG.Dialog.DetailStandard")}</option><option value="deep"${u === "deep" ? " selected" : ""}>${f("TSG.Dialog.DetailDeep")}</option></select></div>
    <div class="form-group"><label class="checkbox"><input name="allowUnusualPrimaries" type="checkbox"${d ? " checked" : ""}> ${f("TSG.Dialog.AllowUnusualPrimaries")}</label></div>
    <div class="form-group"><label class="checkbox"><input name="openSheet" type="checkbox" checked> ${f("TSG.Dialog.OpenSheet")}</label></div>`;
}
function wt(e, t) {
	return Ct(e, t);
}
function Tt(e, t) {
	return Ct(e, t, { adopting: !0 });
}
function Et(e, t, n) {
	let r = { ...t.system };
	for (let t of St) e.system[t] !== void 0 && (r[t] = e.system[t]);
	let i = { ...t.flags };
	return i[V] = {
		...i[V] ?? {},
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
async function K(e, t, n, r) {
	let i = bt(t), a = r.generateSystem(i), o = r.createTwodsixWorldActor(a);
	await e.update(Et(e, o, Number(i.seed ?? 1105))), t.openSheet !== !1 && e.sheet?.render(!0);
}
async function Dt(e, t) {
	let n = e.getSelectedActor();
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	if (!W(n)) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.SelectGeneratedActor"));
		return;
	}
	let r = await e.prompt({
		window: { title: e.localizer.localize("TSG.Dialog.RegenerateTitle") },
		content: wt(n, e.localizer),
		ok: { label: e.localizer.localize("TSG.Dialog.Regenerate") },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => z(t.element)
	});
	if (r) try {
		await K(n, r, e, t), e.notifyInfo(e.localizer.format("TSG.Notification.Regenerated", { name: n.name }));
	} catch (t) {
		let n = t instanceof Error ? t.message : String(t);
		e.notifyError(e.localizer.format("TSG.Notification.Failed", { message: n }));
	}
}
async function Ot(e, t) {
	let n = e.getSelectedActor();
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	if (!G(n)) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.SelectUnmanagedActor"));
		return;
	}
	let r = await e.prompt({
		window: { title: e.localizer.localize("TSG.Dialog.AdoptTitle") },
		content: Tt(n, e.localizer),
		ok: { label: e.localizer.localize("TSG.Dialog.Adopt") },
		rejectClose: !1,
		modal: !1,
		render: (e, t) => z(t.element)
	});
	if (r) try {
		await K(n, r, e, t), e.notifyInfo(e.localizer.format("TSG.Notification.Adopted", { name: n.name }));
	} catch (t) {
		let n = t instanceof Error ? t.message : String(t);
		e.notifyError(e.localizer.format("TSG.Notification.Failed", { message: n }));
	}
}
//#endregion
//#region src/integrations/foundry/managerControl.ts
var kt = "traveller-system-generator", q = "__all__", J = "__root__";
function Y(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function At(e) {
	return e.dataset.documentId ?? e.dataset.entryId ?? e.dataset.actorId ?? "";
}
function X(e) {
	return e.filter((e) => e.type === "world").sort((e, t) => (e.folderPath ?? "").localeCompare(t.folderPath ?? "") || e.name.localeCompare(t.name));
}
function jt(e, t = "", n = q) {
	return X(e).filter((e) => n === q || (n === J ? !e.folderId : e.folderId === n)).map((e) => {
		let n = W(e), r = `${e.name}${n ? "" : " — not generator-managed"}`;
		return `<option value="${Y(e.id)}" data-folder-id="${Y(e.folderId ?? "")}" data-generator-managed="${n ? "true" : "false"}"${e.id === t ? " selected" : ""}>${Y(r)}</option>`;
	}).join("");
}
function Mt(e, t = q) {
	let n = e.localizer.localize("TSG.Dialog.ActorFolderRoot"), r = mt(e.listActorFolders());
	return [
		`<option value="${q}"${t === q ? " selected" : ""}>All Actor folders</option>`,
		`<option value="${J}"${t === J ? " selected" : ""}>${Y(n)}</option>`,
		...r.map((e) => `<option value="${Y(e.id)}"${e.id === t ? " selected" : ""}>${Y(e.path)}</option>`)
	].join("");
}
function Nt(e) {
	if (!e) return null;
	let t = e.flags?.[kt], n = t && typeof t == "object" ? t : {}, r = n.generationSettings, i = r && typeof r == "object" ? r : {}, a = W(e);
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
function Z(e, t) {
	return `<div style="display:grid;grid-template-columns:minmax(8rem,0.8fr) minmax(0,1.2fr);gap:0.75rem;padding:0.3rem 0;border-bottom:1px solid var(--color-border-light-primary);"><strong>${Y(e)}</strong><span style="min-width:0;overflow-wrap:anywhere;">${Y(t)}</span></div>`;
}
function Pt(e, t) {
	let n = t.localizer.localize, r = Nt(e);
	return !e || !r ? "<p class=\"hint\">No World Actors found in the selected folder.</p>" : `
    <div style="padding:0.75rem;border:1px solid var(--color-border-light-primary);border-radius:6px;background:var(--color-bg-option);min-width:0;">
      <h3 style="margin:0 0 0.5rem;">${Y(e.name)}</h3>
      ${Z("Generator status", r.managed ? "Generator-managed" : "Not generator-managed")}
      ${Z(n("TSG.Manager.Folder"), r.folderPath)}
      ${Z(n("TSG.Manager.Uwp"), r.uwp)}
      ${Z(n("TSG.Manager.Method"), r.method)}
      ${Z(n("TSG.Manager.Seed"), r.seed)}
      ${Z(n("TSG.Manager.Distribution"), r.distribution)}
      ${Z(n("TSG.Manager.DetailLevel"), r.detailLevel)}
      ${r.managed ? "" : `<p class="hint" style="margin:0.6rem 0 0;">${Y(n("TSG.Manager.AdoptHint"))}</p>`}
    </div>`;
}
function Q(e, t, n, r, i = !1) {
	return `
    <label style="display:block;padding:0.75rem;border:1px solid var(--color-border-light-primary);border-radius:6px;cursor:${i ? "not-allowed" : "pointer"};opacity:${i ? "0.55" : "1"};" data-manager-action-card="${e}">
      <span style="display:flex;align-items:flex-start;gap:0.6rem;">
        <input type="radio" name="action" value="${e}"${r ? " checked" : ""}${i ? " disabled" : ""}>
        <span><strong>${Y(t)}</strong><br><span class="hint">${Y(n)}</span></span>
      </span>
    </label>`;
}
function Ft(e) {
	return e?.folderId || (e ? J : q);
}
function It(e, t, n = {}) {
	let r = t.localizer.localize, i = X(e), a = i.find((e) => e.id === n.initialActorId) ?? i[0], o = n.initialActorId ? Ft(a) : q, s = o === q ? i : i.filter((e) => o === J ? !e.folderId : e.folderId === o), c = s.find((e) => e.id === a?.id) ?? s[0], l = jt(i, c?.id, o), u = n.initialAction ?? "generate", d = i.length > 0, f = !!(c && W(c)), p = !!(c && G(c));
	return `
    <section style="display:grid;gap:0.8rem;min-width:0;">
      <header>
        <h2 style="margin:0;">${r("TSG.Manager.GenerateHeading")}</h2>
        <p class="hint">${r("TSG.Manager.GenerateHint")}</p>
      </header>
      ${Q("generate", r("TSG.Manager.Generate"), r("TSG.Manager.GenerateDescription"), u === "generate")}
    </section>
    <hr style="margin:1rem 0;">
    <section style="display:grid;gap:0.8rem;min-width:0;">
      <header>
        <h2 style="margin:0;">${r("TSG.Manager.ManageHeading")}</h2>
        <p class="hint">Choose an Actor folder, then select any World Actor. Generator-managed Actors can be updated; unmanaged World Actors can be explicitly adopted.</p>
      </header>
      <div class="form-group" style="min-width:0;"><label>Actor Folder</label><select name="managerFolderId" aria-label="Actor Folder" style="width:100%;min-width:0;max-width:100%;">${Mt(t, o)}</select></div>
      <div class="form-group" style="min-width:0;"><label>${r("TSG.Manager.Actor")}</label><select name="actorId" aria-label="${r("TSG.Manager.Actor")}" style="width:100%;min-width:0;max-width:100%;"${d ? "" : " disabled"}>
        ${l || "<option value=\"\">No World Actors found in this folder</option>"}
      </select></div>
      <div data-manager-actor-details style="min-width:0;">${Pt(c, t)}</div>
      <div style="display:grid;grid-template-columns:1fr;gap:0.75rem;">
        ${Q("open", r("TSG.Manager.Open"), r("TSG.Manager.OpenDescription"), u === "open", !d)}
        ${Q("update", r("TSG.Manager.Update"), r("TSG.Manager.UpdateDescription"), u === "update" && f, !f)}
        ${Q("adopt", r("TSG.Manager.Adopt"), r("TSG.Manager.AdoptDescription"), u === "adopt" && p, !p)}
      </div>
    </section>`;
}
function Lt(e) {
	return typeof e == "string" ? e : "";
}
function Rt(e, t, n) {
	let r = X(t);
	e.style.width = "720px", e.style.maxWidth = "calc(100vw - 2rem)", e.style.boxSizing = "border-box";
	for (let t of e.querySelectorAll("select, input[type=\"text\"], input[type=\"number\"]")) t.style.maxWidth = "100%", t.style.minWidth = "0", t.style.boxSizing = "border-box";
	let i = e.querySelector("select[name=\"managerFolderId\"]"), a = e.querySelector("select[name=\"actorId\"]"), o = e.querySelector("[data-manager-actor-details]"), s = e.querySelector("input[name=\"action\"][value=\"update\"]"), c = e.querySelector("[data-manager-action-card=\"update\"]"), l = e.querySelector("input[name=\"action\"][value=\"adopt\"]"), u = e.querySelector("[data-manager-action-card=\"adopt\"]");
	if (!i || !a || !o) return;
	let d = (e, t, n) => {
		e && (e.disabled = !n), t && (t.style.opacity = n ? "1" : "0.55", t.style.cursor = n ? "pointer" : "not-allowed");
	}, f = () => {
		let t = r.find((e) => e.id === a.value);
		o.innerHTML = Pt(t, n);
		let i = !!(t && W(t)), f = !!(t && G(t));
		if (d(s, c, i), d(l, u, f), e.querySelector("input[name=\"action\"]:checked")?.disabled) {
			let t = f ? l : i ? s : e.querySelector("input[name=\"action\"][value=\"open\"]");
			t && (t.checked = !0);
		}
	};
	i.addEventListener("change", () => {
		let e = i.value || q, t = a.value, n = jt(r, t, e);
		a.innerHTML = n || "<option value=\"\">No World Actors found in this folder</option>", a.disabled = !n, n && !a.value && (a.selectedIndex = 0), f();
	}), a.addEventListener("change", f), f();
}
function zt(e, t) {
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
async function Bt(e, t, n = {}) {
	if (!e.isGameMaster()) {
		e.notifyWarning(e.localizer.localize("TSG.Notification.PermissionDenied"));
		return;
	}
	let r = e.listGeneratedActors(), i = await e.prompt({
		window: { title: e.localizer.localize("TSG.Manager.Title") },
		content: It(r, e, n),
		ok: { label: e.localizer.localize("TSG.Manager.Continue") },
		rejectClose: !1,
		modal: !1,
		render: (t, n) => Rt(n.element, r, e)
	});
	if (!i) return;
	let a = Lt(i.action) || n.initialAction || "generate";
	if (a === "generate") {
		await xt(e, t);
		return;
	}
	let o = X(r).find((e) => e.id === Lt(i.actorId));
	if (!o) {
		e.notifyWarning("Select a World Actor.");
		return;
	}
	if (a === "open") {
		o.sheet?.render(!0);
		return;
	}
	if (a === "adopt") {
		await Ot(zt(o, e), t);
		return;
	}
	await Dt(zt(o, e), t);
}
function Vt(e, t, n) {
	e.push({
		name: t.localizer.localize("TSG.Manager.ContextManage"),
		icon: "<i class=\"fa-solid fa-solar-system\"></i>",
		condition: (e) => {
			let n = At(e);
			return t.isGameMaster() && t.listGeneratedActors().some((e) => e.id === n && e.type === "world");
		},
		callback: (e) => {
			let r = At(e), i = t.listGeneratedActors().find((e) => e.id === r);
			Bt(t, n, {
				initialActorId: r,
				initialAction: i && G(i) ? "adopt" : "update"
			});
		}
	});
}
function Ht(e, t, n) {
	let r = e.tokens;
	r && (r.tools ??= {}, r.tools.travellerSystemGenerator = {
		name: "travellerSystemGenerator",
		title: t.localizer.localize("TSG.Control.Manager"),
		icon: "fa-solid fa-solar-system",
		order: Object.keys(r.tools).length,
		button: !0,
		visible: t.isGameMaster(),
		onChange: () => {
			Bt(t, n);
		}
	});
}
//#endregion
//#region src/integrations/foundry/bootstrap.ts
function Ut(e) {
	let t = L();
	e.Hooks.once("init", () => {
		lt(e.getModules(), t);
	}), e.Hooks.on("getSceneControlButtons", (n) => {
		Ht(n, e.getManagerEnvironment(), t);
	}), e.Hooks.on("getActorContextOptions", (n, r) => {
		Vt(r, e.getManagerEnvironment(), t);
	});
}
function $(e) {
	return typeof e == "string" ? e || null : e?.id ?? null;
}
function Wt(e, t) {
	let n = new Map(t.map((e) => [e.id, e])), r = [], i = /* @__PURE__ */ new Set(), a = $(e.folder);
	for (; a && !i.has(a);) {
		i.add(a);
		let e = n.get(a);
		if (!e) break;
		r.unshift(e.name), a = $(e.folder ?? e.parent);
	}
	return r.join(" / ");
}
if (typeof Hooks < "u") {
	let e = {
		localize: (e) => game.i18n.localize(e),
		format: (e, t) => game.i18n.format(e, t)
	}, t = (e) => foundry.applications.api.DialogV2.input(e);
	Ut({
		Hooks,
		getModules: () => game.modules,
		getManagerEnvironment: () => {
			let n = Array.from(game.folders).filter((e) => e.type === "Actor");
			return {
				isGameMaster: () => game.user.isGM,
				canCreateActor: () => Actor.implementation.canUserCreate(game.user),
				listActorFolders: () => n.map(({ id: e, name: t, folder: n, parent: r }) => ({
					id: e,
					name: t,
					parentId: $(n ?? r)
				})),
				listGeneratedActors: () => Array.from(game.actors).map((e) => Object.assign(e, {
					folderId: $(e.folder),
					folderPath: Wt(e, n)
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
export { Ut as registerFoundryBootstrap };
