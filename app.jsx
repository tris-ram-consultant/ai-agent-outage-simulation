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
      emit("REQUEST", `Request received for ${customer.name}`);
      setProgress(0.1);
      await delay(700);

      t = new Date(t.getTime() + 1000);
      emit("SYSTEM", "Querying CRM");
      setStepsDone((s) => [...s, "CRM verification"]);
      setProgress(0.25);
      await delay(700);

      emit(
        "VALIDATION",
        `Account OK — ${customer.dataRemainingGB} GB remaining`
      );
      setStepsDone((s) => [...s, "Account entitlement check"]);
      setProgress(0.45);
      await delay(700);

      emit(
        "SYSTEM",
        `Checking location vs outage map (${zone.area})`
      );
      setStepsDone((s) => [...s, "Location correlation"]);
      setProgress(0.65);
      await delay(700);

      if (zone.status === "ACTIVE") {
        emit(
          "RESULT",
          `Outage detected — Incident ${zone.incidentId} (${zone.affected} affected)`
        );
        setStepsDone((s) => [...s, "Network outage detected"]);
      } else {
        emit("RESULT", "No outage detected");
      }

      setProgress(1);
      await delay(500);

      emit("STATUS", "Case completed");
      setStatus("COMPLETED");
    }

    run();
    return () => (cancelled = true);
  }, [mobile, runId]);

  return (
    <div className="p-6 h-screen grid grid-cols-[320px_1fr] gap-4">
      <div className="space-y-4">
        <div className="bg-white p-3 rounded-xl shadow">
          <h2 className="font-semibold">Controls</h2>

          <button
            className="mt-2 w-full bg-blue-600 text-white rounded p-2"
            onClick={() => setRunId((r) => r + 1)}
          >
            ▶ Run once
          </button>

          <button
            className="mt-2 w-full bg-gray-800 text-white rounded p-2"
            onClick={() => setAutoplay((a) => !a)}
          >
            {autoplay ? "⏸ Pause autoplay" : "▶ Resume autoplay"}
          </button>
        </div>

        <div className="bg-white p-3 rounded-xl shadow">
          <p className="text-sm">Customer: {customer.name}</p>
          <p className="text-sm">Mobile: {mobile}</p>
          <p className="text-sm">
            Status: <span className="font-semibold">{status}</span>
          </p>

          <div className="w-full bg-gray-200 h-2 rounded mt-2">
            <div
              className="bg-blue-600 h-2 rounded"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <ul className="text-xs mt-2 space-y-1">
            {stepsDone.map((s) => (
              <li key={s}>✔ {s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-black text-green-400 font-mono text-xs p-3 rounded-xl overflow-y-auto">
        <div className="text-white font-semibold mb-2">
          Event Log
        </div>
        {events.map((e, i) => (
          <div key={i}>{e}</div>
        ))}
      </div>
    </div>
  );
}

/* =============================
   Mount React App
============================= */
ReactDOM.createRoot(
  document.getElementById("root")
).render(<App />);
