const STORAGE_KEY = "topazVbeTeamsV4";
const IDX_KEY = "topazVbeActiveTeam";
const TEAMS = 8;
const REGION_ROWS = [
  ["Export","p1exportQty","p2exportQty","p3exportQty"],
  ["South","p1southQty","p2southQty","p3southQty"],
  ["West","p1westQty","p2westQty","p3westQty"],
  ["North","p1northQty","p2northQty","p3northQty"]
];
const META_IDS = ["year","quarter","simCode","groupNo","companyNo","identityNo","statusNo"];
const FIELDS = [
  ["major1","Major improvement P1 (0/1)","marketing",0],
  ["major2","Major improvement P2 (0/1)","marketing",0],
  ["major3","Major improvement P3 (0/1)","marketing",1],
  ["p1export","Export price P1 (£)","marketing",170],
  ["p1home","Home price P1 (£)","marketing",150],
  ["p2export","Export price P2 (£)","marketing",290],
  ["p2home","Home price P2 (£)","marketing",270],
  ["p3export","Export price P3 (£)","marketing",580],
  ["p3home","Home price P3 (£)","marketing",550],
  ["p1advert","Advertising P1 (£000)","marketing",12],
  ["p2advert","Advertising P2 (£000)","marketing",14],
  ["p3advert","Advertising P3 (£000)","marketing",20],
  ["p1trade","Trade press P1 (£000)","marketing",10],
  ["p2trade","Trade press P2 (£000)","marketing",10],
  ["p3trade","Trade press P3 (£000)","marketing",18],
  ["p1merch","Merchandising P1 (£000)","marketing",8],
  ["p2merch","Merchandising P2 (£000)","marketing",8],
  ["p3merch","Merchandising P3 (£000)","marketing",10],
  ["p1time","Assembly time P1 (mins)","marketing",118],
  ["p2time","Assembly time P2 (mins)","marketing",165],
  ["p3time","Assembly time P3 (mins)","marketing",330],
  ["exportSales","Salespeople: Export","operations",13],
  ["southSales","Salespeople: South","operations",1],
  ["westSales","Salespeople: West","operations",1],
  ["northSales","Salespeople: North","operations",3],
  ["research1","Research P1 (£000)","operations",15],
  ["research2","Research P2 (£000)","operations",15],
  ["research3","Research P3 (£000)","operations",15],
  ["rawUnits","Raw material units to order","operations",12000],
  ["supplier","Supplier number (1–3)","operations",2],
  ["deliveries","Number of deliveries","operations",6],
  ["machinesOrder","Machines to buy","operations",1],
  ["machinesSell","Machines to sell","operations",0],
  ["maintenance","Contract maintenance hours","operations",50],
  ["dividend","Dividend (pence/share)","finance",4],
  ["credit","Days credit allowed","finance",30],
  ["vansBuy","Vans to buy","finance",0],
  ["vansSell","Vans to sell","finance",0],
  ["infoCompanies","Info on other companies (0/1)","finance",1],
  ["marketShares","Info on market shares (0/1)","finance",0],
  ["recruitSales","Salespeople recruit","personnel",0],
  ["dismissSales","Salespeople dismiss","personnel",0],
  ["trainSales","Salespeople train","personnel",1],
  ["recruitWorkers","Workers recruit","personnel",0],
  ["dismissWorkers","Workers dismiss","personnel",0],
  ["trainWorkers","Workers train","personnel",1],
  ["salary","Sales base salary (£00 / qtr)","personnel",50],
  ["commission","Sales commission (%)","personnel",2],
  ["wage","Assembly wage (£/hour)","personnel",6.95],
  ["shift","Shift level (1–3)","personnel",2],
  ["budget","Management budget (£000)","management",120],
  ["rawPrice","Raw material price (£/unit)","management",50],
  ["quarterBudget","Quarterly budget note (£000)","management",0]
];
const OPEN = {
  machines: 10, vans: 17, workers: 85, materialStock: 8000,
  cash: 185000, property: 300000, machineNBV: 1594818, vehicleNBV: 175758,
  shareCapital: 1000000, reserves: 865000, shares: 500000, taxRate: 0.19,
  interestAnnual: 0.05, factoryBase: 85000, machineHour: 500,
  bom: [1, 1.65, 3.3], mhrs: [0.35, 0.62, 1.25]
};

const $ = id => document.getElementById(id);
const page = document.body.dataset.page || "home";
let idx = 0, loading = false, saveTimer = 0;
let teams = Array.from({length: TEAMS}, (_, i) => emptyTeam(i));

function emptyValues(){
  const v = {};
  FIELDS.forEach(f => v[f[0]] = "");
  return v;
}
function emptyTeam(i){
  return {
    year: "", quarter: "", simCode: "", groupNo: "", companyNo: String(i + 1),
    identityNo: String(i + 1), statusNo: "",
    d: emptyValues(), report: null, savedAt: null
  };
}
function n(v){ const x = Number(v); return Number.isFinite(x) ? x : 0; }
function isBlank(v){ return v === null || v === undefined || String(v).trim() === ""; }
function fmt(x){ return Number(x || 0).toLocaleString("en-GB", {maximumFractionDigits: 2}); }
function gbp(x){ const v = Math.round(Number(x) || 0); return (v < 0 ? "−£" : "£") + Math.abs(v).toLocaleString("en-GB"); }
function persist(){
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    localStorage.setItem(IDX_KEY, String(idx));
  } catch (e) {}
}
function restore(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length === TEAMS) teams = saved;
    const i = Number(localStorage.getItem(IDX_KEY));
    if (Number.isInteger(i) && i >= 0 && i < TEAMS) idx = i;
  } catch (e) {}
}

function allFieldIds(){
  return FIELDS.map(f => f[0]).concat(REGION_ROWS.flatMap(r => r.slice(1)));
}
function hasForm(){ return Boolean($("year") && $("g-marketing")); }

function fieldHTML(f){
  return `<label class="mini-field">${f[1]}<input type="number" step="any" id="${f[0]}"></label>`;
}
function buildForm(){
  if (!hasForm()) return;
  const groups = {marketing:[], operations:[], finance:[], personnel:[], management:[]};
  FIELDS.forEach(f => groups[f[2]].push(f));
  for (const g of Object.keys(groups)) $("g-" + g).innerHTML = groups[g].map(fieldHTML).join("");
  $("regions").innerHTML = REGION_ROWS.map(r =>
    `<tr><td>${r[0]}</td>${r.slice(1).map(k => `<td><input type="number" step="1" id="${k}" inputmode="numeric"></td>`).join("")}</tr>`
  ).join("");
}
function fillTeamSelect(){
  document.querySelectorAll("[data-team-select]").forEach(sel => {
    sel.innerHTML = Array.from({length: TEAMS}, (_, i) =>
      `<option value="${i}">Team ${i + 1} / Company ${i + 1}</option>`).join("");
    sel.value = String(idx);
  });
}
function labelOf(id){
  const f = FIELDS.find(x => x[0] === id);
  if (f) return f[1];
  const meta = {year:"Year", quarter:"Quarter", simCode:"Simulation Code", groupNo:"Group Number", companyNo:"Company Number", identityNo:"Identity Number", statusNo:"Status"};
  if (meta[id]) return meta[id];
  for (const r of REGION_ROWS){
    const p = r.indexOf(id);
    if (p > 0) return `${r[0]} — Product ${p}`;
  }
  return id;
}
function requiredControls(){
  return META_IDS.concat(allFieldIds()).map(id => ({id, el: $(id), label: labelOf(id)}));
}
function readForm(){
  if (!hasForm()) return teams[idx];
  const t = teams[idx];
  t.year = $("year").value;
  t.quarter = $("quarter").value;
  t.simCode = $("simCode").value;
  t.groupNo = $("groupNo").value;
  t.companyNo = $("companyNo").value;
  t.identityNo = $("identityNo").value;
  t.statusNo = $("statusNo").value;
  const d = {};
  allFieldIds().forEach(id => { const el = $(id); d[id] = el ? el.value : ""; });
  t.d = d;
  return t;
}
function loadTeam(i){
  if (hasForm() && !loading) { readForm(); persist(); }
  idx = i;
  persist();
  fillTeamSelect();
  if (!hasForm()) {
    if ($("reportArea")) renderReport();
    return;
  }
  loading = true;
  const t = teams[i];
  $("year").value = t.year ?? "";
  if ($("year2")) $("year2").value = t.year ?? "";
  $("quarter").value = t.quarter ?? "";
  if ($("quarter2")) $("quarter2").value = t.quarter ?? "";
  $("simCode").value = t.simCode ?? "";
  $("groupNo").value = t.groupNo ?? "";
  $("companyNo").value = t.companyNo ?? String(i + 1);
  $("identityNo").value = t.identityNo ?? String(i + 1);
  $("statusNo").value = t.statusNo ?? "";
  allFieldIds().forEach(id => { if ($(id)) $(id).value = t.d[id] ?? ""; });
  loading = false;
  clearValidation();
  if ($("status")) $("status").textContent = t.report ? "Report on file" : "No report yet";
}

function validate(){
  clearValidation();
  const missing = [];
  requiredControls().forEach(c => {
    if (!c.el) return;
    if (isBlank(c.el.value)) {
      c.el.classList.add("invalid");
      c.el.setAttribute("aria-invalid", "true");
      missing.push(c);
    }
  });
  if (!missing.length) return true;
  const banner = $("errorBanner");
  if (banner) {
    banner.classList.remove("hidden");
    banner.innerHTML = `<strong>Report not generated.</strong> ${missing.length} required field(s) are empty or unassigned. Fill every highlighted input (zero is allowed; blank is not).
      <div style="margin-top:8px">${missing.slice(0, 12).map(c => `<a href="#${c.id}">${c.label}</a>`).join(" · ")}${missing.length > 12 ? " · …" : ""}</div>`;
    banner.focus();
  }
  missing[0].el.focus({preventScroll:false});
  if ($("status")) $("status").textContent = "Validation failed";
  return false;
}
function clearValidation(){
  document.querySelectorAll(".invalid").forEach(el => { el.classList.remove("invalid"); el.removeAttribute("aria-invalid"); });
  const banner = $("errorBanner");
  if (banner) { banner.classList.add("hidden"); banner.innerHTML = ""; }
}

function nums(d){
  const o = {};
  allFieldIds().forEach(id => o[id] = n(d[id]));
  return o;
}
function calculate(raw){
  const d = nums(raw);
  const u = [
    d.p1exportQty + d.p1southQty + d.p1westQty + d.p1northQty,
    d.p2exportQty + d.p2southQty + d.p2westQty + d.p2northQty,
    d.p3exportQty + d.p3southQty + d.p3westQty + d.p3northQty
  ];
  const homeRev = (qs, qw, qn, price) => (qs + qw + qn) * price;
  const revenue =
    d.p1exportQty * d.p1export + homeRev(d.p1southQty, d.p1westQty, d.p1northQty, d.p1home) +
    d.p2exportQty * d.p2export + homeRev(d.p2southQty, d.p2westQty, d.p2northQty, d.p2home) +
    d.p3exportQty * d.p3export + homeRev(d.p3southQty, d.p3westQty, d.p3northQty, d.p3home);
  const matUsed = u[0]*OPEN.bom[0] + u[1]*OPEN.bom[1] + u[2]*OPEN.bom[2];
  const materialsPurchased = d.rawUnits * d.rawPrice;
  const materialStock = Math.max(0, OPEN.materialStock + d.rawUnits - matUsed);
  const materialsConsumedCost = matUsed * d.rawPrice;
  const mins = u[0]*d.p1time + u[1]*d.p2time + u[2]*d.p3time;
  const hoursReq = mins / 60;
  const salesForce = d.exportSales + d.southSales + d.westSales + d.northSales;
  const workers = Math.max(0, OPEN.workers + d.recruitWorkers - d.dismissWorkers);
  const shiftFactor = d.shift <= 1 ? 1 : d.shift === 2 ? 1.15 : 1.33;
  const trainBoost = 1 + 0.04 * Math.min(d.trainWorkers, workers);
  const hoursCap = workers * 13 * 37.5 * shiftFactor * trainBoost;
  const otHours = Math.max(0, hoursReq - hoursCap);
  const wages = (Math.min(hoursReq, hoursCap) * d.wage) + (otHours * d.wage * 1.5);
  const advert = (d.p1advert + d.p2advert + d.p3advert) * 1000;
  const trade = (d.p1trade + d.p2trade + d.p3trade) * 1000;
  const merch = (d.p1merch + d.p2merch + d.p3merch) * 1000;
  const research = (d.research1 + d.research2 + d.research3) * 1000;
  const salesSalary = d.salary * 100 * salesForce;
  const commission = revenue * (d.commission / 100);
  const mgmt = d.budget * 1000;
  const maint = d.maintenance * d.wage * 1.25;
  const machines = Math.max(0, OPEN.machines + d.machinesOrder - d.machinesSell);
  const vans = Math.max(0, OPEN.vans + d.vansBuy - d.vansSell);
  const depMachines = OPEN.machineNBV * 0.031;
  const depVans = OPEN.vehicleNBV * 0.05;
  const factory = OPEN.factoryBase + machines * 2200 + maint;
  const transport = d.deliveries * 8500 + vans * 420;
  const sellingOH = advert + trade + merch + salesSalary + commission + transport;
  const adminOH = mgmt + research + (d.infoCompanies ? 2500 : 0) + (d.marketShares ? 4000 : 0);
  const prodOH = factory + depMachines;
  const costOfSales = materialsConsumedCost + wages + prodOH;
  const gross = revenue - costOfSales;
  const operating = gross - sellingOH - adminOH - depVans;
  const capex = d.machinesOrder * 80000 + d.vansBuy * 12000;
  const assetSales = d.machinesSell * (OPEN.machineNBV / OPEN.machines) * 0.45 + d.vansSell * 4000;
  const debtors = revenue * Math.min(d.credit, 90) / 90;
  const creditors = materialsPurchased * 0.35;
  let cash = OPEN.cash + (revenue - debtors) - (materialsPurchased - creditors) - wages - sellingOH - adminOH - factory - capex + assetSales;
  const interest = (cash < 0 ? Math.abs(cash) * OPEN.interestAnnual / 4 : 0);
  cash -= interest;
  const pbt = operating - interest;
  const tax = pbt > 0 ? pbt * OPEN.taxRate : 0;
  const net = pbt - tax;
  const dividend = (d.dividend / 100) * OPEN.shares;
  cash -= dividend + tax;
  const overdraft = Math.max(0, -cash);
  const cashShown = Math.max(0, cash);
  const machineNBV = OPEN.machineNBV + d.machinesOrder * 80000 - d.machinesSell * (OPEN.machineNBV / OPEN.machines) - depMachines;
  const vehicleNBV = OPEN.vehicleNBV + d.vansBuy * 12000 - d.vansSell * (OPEN.vehicleNBV / OPEN.vans) - depVans;
  const matValue = materialStock * d.rawPrice;
  const netAssets = OPEN.property + machineNBV + vehicleNBV + matValue + debtors + cashShown - creditors - overdraft;
  const mNeed = u[0]*OPEN.mhrs[0] + u[1]*OPEN.mhrs[1] + u[2]*OPEN.mhrs[2];
  const mAvail = machines * OPEN.machineHour;
  const q = n(teams[idx].quarter) || 1;
  return {
    u, revenue, materialsConsumedCost, materialsPurchased, wages, otHours, hoursReq, hoursCap,
    advert, trade, merch, research, salesSalary, commission, mgmt, sellingOH, adminOH, prodOH,
    factory, depVans, transport, costOfSales, gross, operating, interest, tax, net, dividend,
    machines, vans, workers, salesForce, materialStock, debtors, creditors, cashShown, overdraft,
    machineNBV, vehicleNBV, matValue, netAssets, capex, assetSales, mNeed, mAvail,
    gdp: 734 + (q - 1) * 4, nextMat: Math.round(d.rawPrice * 1000 * 1.004),
    regions: REGION_ROWS.map(r => [r[0], d[r[1]], d[r[2]], d[r[3]]]), d
  };
}

function table(headers, rows){
  return `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function block(title, html){ return `<div class="report-block"><h3>${title}</h3>${html}</div>`; }

function renderReport(){
  const area = $("reportArea");
  if (!area) return;
  const t = teams[idx];
  if (!t.report){
    area.innerHTML = `<p class="muted">No report generated for Team ${idx + 1} yet. Open <a href="decision.html">Decisions</a>, complete the form, then generate the report.</p>`;
    return;
  }
  const r = t.report, d = r.d;
  const productRows = [
    ["Major improvement", d.major1, d.major2, d.major3],
    ["Export price (£)", d.p1export, d.p2export, d.p3export],
    ["Home price (£)", d.p1home, d.p2home, d.p3home],
    ["Advertising (£000)", d.p1advert, d.p2advert, d.p3advert],
    ["Trade press (£000)", d.p1trade, d.p2trade, d.p3trade],
    ["Merchandising (£000)", d.p1merch, d.p2merch, d.p3merch],
    ["Assembly time (mins)", d.p1time, d.p2time, d.p3time],
    ["Units delivered", fmt(r.u[0]), fmt(r.u[1]), fmt(r.u[2])]
  ];
  area.innerHTML = `
    <div class="report-title">
      <h2>THE TOPAZ MANAGEMENT SIMULATION REPORT</h2>
      <p><strong>Team ${idx + 1}</strong> &nbsp; Company ${t.companyNo || idx + 1} &nbsp; Group ${t.groupNo || "—"} &nbsp; Identity ${t.identityNo || "—"} &nbsp; Status ${t.statusNo || "—"}</p>
      <p>Year ${t.year || "—"} &nbsp; Quarter ${t.quarter || "—"} &nbsp; Simulation ${t.simCode || "—"}</p>
      <p class="muted">Educational estimate from this team’s decisions. Not the original Topaz-Vbe engine.</p>
    </div>
    ${block("Decisions in effect", table(["Decision","Product 1","Product 2","Product 3"], productRows))}
    <div class="report-columns">
      ${block("Accounts — overhead cost analysis", table(["Account","£"], [
        ["Advertising", gbp(r.advert)], ["Trade press", gbp(r.trade)], ["Merchandising", gbp(r.merch)],
        ["Sales salaries", gbp(r.salesSalary)], ["Sales commission", gbp(r.commission)],
        ["Distribution / deliveries", gbp(r.transport)], ["Product research", gbp(r.research)],
        ["Management budget", gbp(r.mgmt)], ["Factory & maintenance", gbp(r.factory)],
        ["Total selling + admin overheads", gbp(r.sellingOH + r.adminOH)]
      ]))}
      ${block("Profit and loss account", table(["Item","£"], [
        ["Sales revenue (units × price)", gbp(r.revenue)],
        ["Direct materials consumed", gbp(r.materialsConsumedCost)],
        ["Direct assembly wages", gbp(r.wages)],
        ["Production overheads", gbp(r.prodOH)],
        ["Cost of sales", gbp(r.costOfSales)],
        ["Gross profit / (loss)", gbp(r.gross)],
        ["Selling overheads", gbp(r.sellingOH)],
        ["Administration & R&amp;D", gbp(r.adminOH)],
        ["Vehicle depreciation", gbp(r.depVans)],
        ["Operating profit", gbp(r.operating)],
        ["Interest on overdraft", gbp(r.interest)],
        ["Taxation (19%)", gbp(r.tax)],
        ["Net profit / (loss)", gbp(r.net)],
        ["Dividends paid", gbp(r.dividend)],
        ["Transferred to reserves", gbp(r.net - r.dividend)]
      ]))}
    </div>
    <div class="report-columns">
      ${block("Balance sheet", table(["Assets / liabilities","£"], [
        ["Property", gbp(OPEN.property)], ["Plant and machinery (NBV)", gbp(r.machineNBV)],
        ["Vehicles (NBV)", gbp(r.vehicleNBV)], ["Raw material inventory", gbp(r.matValue)],
        ["Debtors", gbp(r.debtors)], ["Cash", gbp(r.cashShown)], ["Creditors", gbp(r.creditors)],
        ["Bank overdraft", gbp(r.overdraft)], ["Share capital", gbp(OPEN.shareCapital)],
        ["Reserves", gbp(OPEN.reserves + r.net - r.dividend)], ["Net assets", gbp(r.netAssets)]
      ]))}
      ${block("Cash flow statement", table(["Activity","£"], [
        ["Trading receipts (after debtors)", gbp(r.revenue - r.debtors)],
        ["Materials paid (after creditors)", gbp(r.materialsPurchased - r.creditors)],
        ["Wages and overheads (cash)", gbp(r.wages + r.sellingOH + r.adminOH)],
        ["Capital expenditure", gbp(r.capex)], ["Proceeds of asset sales", gbp(r.assetSales)],
        ["Interest paid", gbp(r.interest)], ["Tax paid", gbp(r.tax)], ["Dividends paid", gbp(r.dividend)],
        ["Closing cash / (overdraft)", gbp(r.cashShown - r.overdraft)]
      ]))}
    </div>
    ${block("Availability and use of resources", table(["Resource","Last quarter","This / next quarter"], [
      ["Machines (count)", OPEN.machines, r.machines], ["Machine hours available", "—", fmt(r.mAvail)],
      ["Machine hours required", "—", fmt(r.mNeed)], ["Van fleet", OPEN.vans, r.vans],
      ["Assembly workers", OPEN.workers, r.workers], ["Worker hours capacity", "—", fmt(r.hoursCap)],
      ["Worker hours required", "—", fmt(r.hoursReq)], ["Overtime hours", "—", fmt(r.otHours)],
      ["Salespeople deployed", "—", fmt(r.salesForce)], ["Raw material stock (units)", OPEN.materialStock, fmt(r.materialStock)]
    ]))}
    ${block("Product movements (units delivered)", table(["Region","Product 1","Product 2","Product 3"], r.regions.map(a => [a[0], fmt(a[1]), fmt(a[2]), fmt(a[3])])))}
    ${block("Personnel", table(["Group","Recruit","Dismiss","Train"], [["Salespeople", d.recruitSales, d.dismissSales, d.trainSales],["Assembly workers", d.recruitWorkers, d.dismissWorkers, d.trainWorkers]]))}
    ${block("Economic indicators", table(["Measure","Value"], [
      ["GDP last quarter (deseasonalised index)", fmt(r.gdp)],
      ["Unemployment rate last quarter", "5.0%"],
      ["Central bank rate (annual)", (OPEN.interestAnnual * 100).toFixed(1) + "%"],
      ["Benchmark raw material next quarter (£ per 000)", fmt(r.nextMat)]
    ]))}
    <p class="muted">Revenue = Σ (units × regional price). Cost of sales = direct materials + direct labour + production overheads.</p>`;
}

function toast(msg){
  const el = $("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 2800);
}
function fillSample(){
  loading = true;
  const y = $("year").value || "2026";
  const q = $("quarter").value || "3";
  $("year").value = y; if ($("year2")) $("year2").value = y;
  $("quarter").value = q; if ($("quarter2")) $("quarter2").value = q;
  if (isBlank($("simCode").value)) $("simCode").value = "TV-" + y;
  if (isBlank($("groupNo").value)) $("groupNo").value = "1";
  $("companyNo").value = $("companyNo").value || String(idx + 1);
  $("identityNo").value = $("identityNo").value || String(idx + 1);
  if (isBlank($("statusNo").value)) $("statusNo").value = "2";
  FIELDS.forEach(f => { if ($(f[0])) $(f[0]).value = String(f[3]); });
  REGION_ROWS.forEach(r => {
    const samples = {Export:[2800,1400,600], South:[200,200,100], West:[100,75,75], North:[600,350,125]};
    samples[r[0]].forEach((v, i) => { $(r[i + 1]).value = String(v); });
  });
  loading = false;
  clearValidation();
  readForm(); persist();
  if ($("status")) $("status").textContent = "Sample / benchmark data loaded";
  toast("Benchmark data filled for Team " + (idx + 1));
}
function generateReport(){
  readForm();
  if (!validate()) return;
  teams[idx].report = calculate(teams[idx].d);
  teams[idx].savedAt = new Date().toISOString();
  persist();
  toast("Management report generated");
  window.location.href = "report.html";
}
function renderHome(){
  const grid = $("companyGrid");
  if (!grid) return;
  grid.innerHTML = teams.map((t, i) => `
    <button type="button" class="company-card" data-open-team="${i}">
      <strong>Team ${i + 1}</strong>
      <small>Company ${t.companyNo || i + 1}</small>
      <span class="badge ${t.report ? "" : "off"}">${t.report ? "Report ready" : "No report"}</span>
    </button>`).join("");
}
function selfCheck(){
  const sample = {};
  FIELDS.forEach(f => sample[f[0]] = f[3]);
  Object.assign(sample, {p1exportQty:2800,p2exportQty:1400,p3exportQty:600,p1southQty:200,p2southQty:200,p3southQty:100,p1westQty:100,p2westQty:75,p3westQty:75,p1northQty:600,p2northQty:350,p3northQty:125});
  const r = calculate(sample);
  if (!(r.revenue > 0 && Math.abs(r.gross - (r.revenue - r.costOfSales)) < 1)) console.error("Topaz self-check failed", r);
}

restore();
selfCheck();
buildForm();
fillTeamSelect();
if (hasForm()) loadTeam(idx);
else if (page === "report") renderReport();
else if (page === "home") renderHome();

const navToggle = $("navToggle");
const siteNav = $("siteNav");
if (navToggle && siteNav) {
  navToggle.onclick = () => {
    const open = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  };
}
document.querySelectorAll("[data-team-select]").forEach(sel => {
  sel.onchange = e => loadTeam(Number(e.target.value));
});
if ($("saveBtn")) $("saveBtn").onclick = () => { readForm(); persist(); if ($("status")) $("status").textContent = "Saved Team " + (idx + 1); toast("Decisions saved for Team " + (idx + 1)); };
if ($("reportBtn")) $("reportBtn").onclick = generateReport;
if ($("sampleBtn")) $("sampleBtn").onclick = fillSample;
if ($("clearBtn")) $("clearBtn").onclick = () => $("clearDialog").showModal();
if ($("clearCancel")) $("clearCancel").onclick = () => $("clearDialog").close();
if ($("clearConfirm")) $("clearConfirm").onclick = () => {
  teams[idx] = emptyTeam(idx);
  persist(); loadTeam(idx); $("clearDialog").close();
  toast("Team " + (idx + 1) + " data cleared");
};
if ($("printBtn")) $("printBtn").onclick = () => window.print();
if ($("year") && $("year2")) {
  $("year").addEventListener("input", () => { if (!loading) $("year2").value = $("year").value; });
  $("year2").addEventListener("input", () => { $("year").value = $("year2").value; });
}
if ($("quarter") && $("quarter2")) {
  $("quarter").addEventListener("change", () => { if (!loading) $("quarter2").value = $("quarter").value; });
  $("quarter2").addEventListener("input", () => { $("quarter").value = $("quarter2").value; });
}
document.addEventListener("input", e => {
  if (!hasForm() || loading || !e.target.matches("input,select")) return;
  e.target.classList.remove("invalid");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { readForm(); persist(); if ($("status")) $("status").textContent = "Auto-saved"; }, 250);
});
document.querySelectorAll("[data-open-team]").forEach(btn => {
  btn.onclick = () => { idx = Number(btn.dataset.openTeam); persist(); window.location.href = "decision.html"; };
});
