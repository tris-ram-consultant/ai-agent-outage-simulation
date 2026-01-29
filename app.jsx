const { useEffect, useState } = React;

/* =============================
   Fake Backend (Simulation)
============================= */
const FakeDB = {
  customers: {
    "+447700900123": {
      name: "James Walker",
      location: "Camden",
      zone: "Z7",
      dataRemainingGB: 12.4,
    },
    "+447700900456": {
      name: "Sarah Collins",
      location: "Greenwich",
      zone: "Z3",
      dataRemainingGB: 5.1,
    },
  },
  outageZones: {
    Z7: {
      area: "North London",
      status: "ACTIVE",
      incidentId: "INC-7712",
      affected: 186,
    },
    Z3: {
      area: "South East London",
      status: "NONE",
      incidentId: null,
      affected: 0,
    },
  },
};

function now(ts) {
  return ts.toLocaleTimeString("en-GB", { hour12: false });
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/* =============================
   Main App
============================= */
function App() {
  const [mobile, setMobile] = useState("+447700900123");
  const [events, setEvents] = useState([]);
  const [stepsDone, setStepsDone] = useState([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("IDLE");

  // 🔁 AUTOPLAY CONTROLS
  const [autoplay, setAutoplay] = useState(true);
  const [runId, setRunId] = useState(0);

  const customer = FakeDB.customers[mobile];
  const zone = FakeDB.outageZones[customer.zone];

  /* =============================
     AUTOPLAY LOOP
  ============================= */
  useEffect(() => {
    if (!autoplay) return;

    const timer = setInterval(() => {
      setMobile((m) =>
        m === "+447700900123"
          ? "+447700900456"
          : "+447700900123"
      );
      setRunId((r) => r + 1);
    }, 16000);

    return () => clearInterval(timer);
  }, [autoplay]);

  /* =============================
     SIMULATION RUN
  ============================= */
  useEffect(() => {
    let cancelled = false;
    let t = new Date("2025-11-18T19:16:10");

    setEvents([]);
    setStepsDone([]);
    setProgress(0);
    setStatus("RUNNING");

    const emit = (type, msg) => {
      if (cancelled) return;
      setEvents((e) => [
        ...e,
        `${now(t)} — ${type} — ${msg}`,
      ]);
    };
async function run() {
  const addStep = (label) =>
    setStepsDone((s) => (s.includes(label) ? s : [...s, label]));

  emit(
    "REQUEST",
    `Request received from front-facing Agentic AI (mobile ${mobile})`
  );
  setProgress(0.05);
  await delay(600);

  t = new Date(t.getTime() + 1000);
  emit("SYSTEM", "Querying CRM to cross-check customer information.");
  addStep("CRM customer verification");
  setProgress(0.1);
  await delay(600);

  emit(
    "RESULT",
    `Customer match confirmed: ${customer.name} associated with mobile ${mobile}.`
  );
  setProgress(0.15);
  await delay(600);

  t = new Date(t.getTime() + 1000);
  emit(
    "SYSTEM",
    "AI initiated proactive network diagnostics on customer device."
  );
  setProgress(0.2);
  await delay(600);

  emit(
    "VALIDATION",
    "Checking device network state: mobile data enabled, airplane mode off."
  );
  addStep("Device network state check");
  setProgress(0.25);
  await delay(600);

  emit(
    "VALIDATION",
    "Validating SIM registration and provisioning status."
  );
  addStep("SIM registration & provisioning");
  setProgress(0.3);
  await delay(600);

  emit(
    "VALIDATION",
    `Checking account entitlement: ${customer.dataRemainingGB} GB remaining; no FUP applied; account in good standing.`
  );
  addStep("Account entitlement check");
  setProgress(0.4);
  await delay(600);

  emit(
    "VALIDATION",
    "Checking service impact: voice & SMS unaffected; mobile data impacted."
  );
  addStep("Service impact analysis");
  setProgress(0.5);
  await delay(600);

  t = new Date(t.getTime() + 1000);
  emit(
    "SYSTEM",
    "Reading customer location (coarse) and correlating with outage map."
  );
  addStep("Location & zone correlation");
  setProgress(0.65);
  await delay(600);

  emit(
    "SYSTEM",
    `Querying network health and incident feeds for Zone ${customer.zone}.`
  );
  setProgress(0.8);
  await delay(600);

  if (zone.status === "ACTIVE") {
    emit(
      "RESULT",
      `Ongoing network outage detected — Incident ${zone.incidentId}, ${zone.affected} customers affected.`
    );
    addStep("Network outage detected");
  } else {
    emit("RESULT", "No outage detected in customer area.");
  }

  setProgress(0.95);
  await delay(600);

  emit(
    "RESPONSE",
    `Diagnostic results sent back to front-facing Agentic AI for ${customer.name}.`
  );
  setProgress(1);
  await delay(400);

  emit("STATUS", "Case completed successfully.");
  setStatus("COMPLETED");
}

   

/* =============================
   Mount React App
============================= */
ReactDOM.createRoot(
  document.getElementById("root")
).render(<App />);
