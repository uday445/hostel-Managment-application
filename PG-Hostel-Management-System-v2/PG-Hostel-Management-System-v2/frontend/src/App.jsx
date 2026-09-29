import React, { useEffect, useMemo, useState } from "react";
import { roomApi, candidateApi, feeApi } from "./api";

const EMPTY_ROOM = {
  roomNumber: "",
  sharingType: "ONE",
  rent: ""
};

const EMPTY_CANDIDATE = {
  name: "",
  phone: "",
  email: "",
  gender: "",
  address: "",
  admissionDate: new Date().toISOString().slice(0, 10),
  active: true,
  roomId: ""
};

const sharingLabel = {
  ONE: "1 Sharing",
  TWO: "2 Sharing",
  THREE: "3 Sharing"
};

function App() {
  const [tab, setTab] = useState("dashboard");
  const [sharingFilter, setSharingFilter] = useState("ALL");
  const [rooms, setRooms] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [fees, setFees] = useState([]);
  const [roomForm, setRoomForm] = useState(EMPTY_ROOM);
  const [candidateForm, setCandidateForm] = useState(EMPTY_CANDIDATE);
  const [idProof, setIdProof] = useState(null);
  const [feeForm, setFeeForm] = useState({
    candidateId: "",
    amount: "",
    dueDate: ""
  });
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const [r, c, f] = await Promise.all([
        roomApi.getAll(),
        candidateApi.getAll(),
        feeApi.getAll()
      ]);
      setRooms(r.data);
      setCandidates(c.data);
      setFees(f.data);
    } catch {
      showMessage("Could not connect to Spring Boot backend.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2500);
  };

  const filteredRooms = useMemo(() => {
    if (sharingFilter === "ALL") return rooms;
    return rooms.filter(r => r.sharingType === sharingFilter);
  }, [rooms, sharingFilter]);

  const stats = useMemo(() => {
    const capacity = rooms.reduce((x, r) => x + r.capacity, 0);
    const occupied = rooms.reduce((x, r) => x + r.occupied, 0);

    return {
      totalRooms: rooms.length,
      totalCandidates: candidates.length,
      occupiedBeds: occupied,
      availableBeds: capacity - occupied,
      one: rooms.filter(r => r.sharingType === "ONE").length,
      two: rooms.filter(r => r.sharingType === "TWO").length,
      three: rooms.filter(r => r.sharingType === "THREE").length
    };
  }, [rooms, candidates]);

  const saveRoom = async (e) => {
    e.preventDefault();

    try {
      if (editingRoom) {
        await roomApi.update(editingRoom.id, roomForm);
        showMessage("Room updated successfully.");
      } else {
        await roomApi.create(roomForm);
        showMessage("Room added successfully.");
      }

      setRoomForm(EMPTY_ROOM);
      setEditingRoom(null);
      await load();
    } catch (error) {
      showMessage(error.response?.data?.message || "Room operation failed.");
    }
  };

  const editRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      roomNumber: room.roomNumber,
      sharingType: room.sharingType,
      rent: room.rent
    });
    setTab("rooms");
  };

  const deleteRoom = async (id) => {
    if (!confirm("Delete this room?")) return;

    try {
      await roomApi.delete(id);
      showMessage("Room deleted.");
      load();
    } catch (error) {
      showMessage(error.response?.data?.message || "Cannot delete this room.");
    }
  };

  const saveCandidate = async (e) => {
    e.preventDefault();

    if (!candidateForm.roomId) {
      showMessage("Select a room.");
      return;
    }

    try {
      const data = new FormData();

      const candidate = {
        name: candidateForm.name,
        phone: candidateForm.phone,
        email: candidateForm.email,
        gender: candidateForm.gender,
        address: candidateForm.address,
        admissionDate: candidateForm.admissionDate,
        active: candidateForm.active
      };

      data.append(
        "candidate",
        new Blob([JSON.stringify(candidate)], {
          type: "application/json"
        })
      );

      data.append("roomId", candidateForm.roomId);

      if (idProof) {
        data.append("idProof", idProof);
      }

      if (editingCandidate) {
        await candidateApi.update(editingCandidate.id, data);
        showMessage("Candidate updated.");
      } else {
        await candidateApi.create(data);
        showMessage("Candidate added.");
      }

      setCandidateForm(EMPTY_CANDIDATE);
      setEditingCandidate(null);
      setIdProof(null);
      await load();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Candidate operation failed."
      );
    }
  };

  const editCandidate = (candidate) => {
    setEditingCandidate(candidate);
    setCandidateForm({
      name: candidate.name || "",
      phone: candidate.phone || "",
      email: candidate.email || "",
      gender: candidate.gender || "",
      address: candidate.address || "",
      admissionDate: candidate.admissionDate || "",
      active: candidate.active ?? true,
      roomId: candidate.room?.id || ""
    });
    setTab("candidates");
  };

  const deleteCandidate = async (id) => {
    if (!confirm("Delete this candidate?")) return;

    try {
      await candidateApi.delete(id);
      showMessage("Candidate deleted.");
      load();
    } catch {
      showMessage("Candidate deletion failed.");
    }
  };

  const createFee = async (e) => {
    e.preventDefault();

    try {
      await feeApi.create(feeForm.candidateId, {
        amount: Number(feeForm.amount),
        dueDate: feeForm.dueDate,
        status: "PENDING"
      });

      setFeeForm({
        candidateId: "",
        amount: "",
        dueDate: ""
      });

      showMessage("Fee record created.");
      load();
    } catch {
      showMessage("Fee creation failed.");
    }
  };

  const uploadPayment = async (feeId, file) => {
    if (!file) return;

    try {
      await feeApi.uploadPayment(feeId, file);
      showMessage("Payment receipt uploaded.");
      load();
    } catch {
      showMessage("Payment upload failed.");
    }
  };

  const Sidebar = () => (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandIcon">⌂</div>
        <div>
          <strong>PG Hostel</strong>
          <small>Management System</small>
        </div>
      </div>

      {[
        ["dashboard", "Dashboard", "⌂"],
        ["rooms", "Rooms", "▣"],
        ["candidates", "Candidates", "♟"],
        ["fees", "Hostel Fees", "▤"],
        ["reports", "Reports", "▥"],
        ["settings", "Settings", "⚙"]
      ].map(([key, label, icon]) => (
        <button
          key={key}
          className={tab === key ? "nav active" : "nav"}
          onClick={() => setTab(key)}
        >
          <span>{icon}</span>{label}
        </button>
      ))}
    </aside>
  );

  const Header = () => (
    <header className="header">
      <button className="menu">☰</button>
      <div className="headerRight">
        <span>♧</span>
        <div className="avatar">A</div>
        <strong>Admin</strong>
        <span>⌄</span>
      </div>
    </header>
  );

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Header />

        {message && <div className="toast">{message}</div>}

        {tab === "dashboard" && (
          <main className="page">
            <section className="hero">
              <div>
                <p className="eyebrow">HOSTEL ADMINISTRATION</p>
                <h1>Welcome to<br /><b>PG Hostel Management System</b></h1>
                <p>Manage rooms, candidates and hostel fees easily in one place.</p>
              </div>
              <div className="heroBuilding">PG<br />HOSTEL</div>
            </section>

            <div className="featureRow">
              <div>🛏️ <span>Room Management</span></div>
              <div>👥 <span>Candidate Management</span></div>
              <div>▣ <span>Fee Management</span></div>
              <div>▤ <span>Reports & Records</span></div>
            </div>

            <div className="stats">
              <div><span>🛏️</span><p>Total Rooms</p><strong>{stats.totalRooms}</strong></div>
              <div><span>👥</span><p>Total Candidates</p><strong>{stats.totalCandidates}</strong></div>
              <div><span>🏢</span><p>Occupied Beds</p><strong>{stats.occupiedBeds}</strong></div>
              <div><span>🚪</span><p>Available Beds</p><strong>{stats.availableBeds}</strong></div>
            </div>

            <div className="dashboardGrid">
              <section className="panel">
                <div className="panelTitle">
                  <h2>Recent Candidates</h2>
                  <button onClick={() => setTab("candidates")}>View All</button>
                </div>

                <Table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Room</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Joined On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.slice(0, 5).map(c => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.room?.roomNumber || "-"}</td>
                        <td>{c.phone}</td>
                        <td><Badge text={c.active ? "Active" : "Inactive"} /></td>
                        <td>{c.admissionDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </section>

              <section className="panel occupancy">
                <h2>Room Sharing Distribution</h2>
                <div className="sharingChart">
                  <div className="donut">
                    <strong>{stats.totalRooms}</strong>
                    <small>Rooms</small>
                  </div>
                </div>
                <div className="legend">
                  <span>● 1 Sharing ({stats.one})</span>
                  <span>● 2 Sharing ({stats.two})</span>
                  <span>● 3 Sharing ({stats.three})</span>
                </div>
              </section>
            </div>
          </main>
        )}

        {tab === "rooms" && (
          <main className="page">
            <div className="pageHeading">
              <div>
                <h1>Rooms</h1>
                <p>Manage rooms by sharing type</p>
              </div>
              <button className="primary" onClick={() => {
                setEditingRoom(null);
                setRoomForm(EMPTY_ROOM);
              }}>+ Add Room</button>
            </div>

            <div className="sharingTabs">
              {[
                ["ALL", "All Rooms"],
                ["ONE", "1 Sharing"],
                ["TWO", "2 Sharing"],
                ["THREE", "3 Sharing"]
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={sharingFilter === key ? "selected" : ""}
                  onClick={() => setSharingFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <section className="roomCards">
              {filteredRooms.map(room => (
                <article className="roomCard" key={room.id}>
                  <div className="roomTop">
                    <div>
                      <span className="roomNumber">Room {room.roomNumber}</span>
                      <h2>{sharingLabel[room.sharingType]}</h2>
                    </div>
                    <Badge text={room.status} danger={room.status === "FULL"} />
                  </div>

                  <div className="roomInfo">
                    <div><small>Capacity</small><strong>{room.capacity}</strong></div>
                    <div><small>Occupied</small><strong>{room.occupied}</strong></div>
                    <div><small>Available</small><strong>{room.capacity - room.occupied}</strong></div>
                    <div><small>Monthly Rent</small><strong>₹{room.rent}</strong></div>
                  </div>

                  <div className="roomActions">
                    <button onClick={() => editRoom(room)}>Edit</button>
                    <button onClick={() => deleteRoom(room.id)} className="delete">Delete</button>
                  </div>
                </article>
              ))}
            </section>

            <section className="panel formPanel">
              <h2>{editingRoom ? "Edit Room" : "Add Room"}</h2>

              <form onSubmit={saveRoom} className="formGrid">
                <label>
                  Room Number
                  <input required value={roomForm.roomNumber}
                    onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})}
                    placeholder="e.g. 101" />
                </label>

                <label>
                  Sharing Type
                  <select value={roomForm.sharingType}
                    onChange={e => setRoomForm({...roomForm, sharingType: e.target.value})}>
                    <option value="ONE">1 Sharing</option>
                    <option value="TWO">2 Sharing</option>
                    <option value="THREE">3 Sharing</option>
                  </select>
                </label>

                <label>
                  Capacity
                  <input readOnly value={
                    roomForm.sharingType === "ONE" ? 1 :
                    roomForm.sharingType === "TWO" ? 2 : 3
                  } />
                </label>

                <label>
                  Monthly Rent (₹)
                  <input required type="number" min="0"
                    value={roomForm.rent}
                    onChange={e => setRoomForm({...roomForm, rent: e.target.value})} />
                </label>

                <div className="formButtons">
                  <button type="submit" className="primary">
                    {editingRoom ? "Update Room" : "Save Room"}
                  </button>
                  <button type="button" onClick={() => {
                    setEditingRoom(null);
                    setRoomForm(EMPTY_ROOM);
                  }}>Reset</button>
                </div>
              </form>
            </section>
          </main>
        )}

        {tab === "candidates" && (
          <main className="page">
            <div className="pageHeading">
              <div>
                <h1>Candidates</h1>
                <p>Register candidates and assign available rooms</p>
              </div>
            </div>

            <section className="panel formPanel">
              <h2>{editingCandidate ? "Edit Candidate" : "Add Candidate"}</h2>

              <form onSubmit={saveCandidate} className="formGrid">
                <label>Full Name
                  <input required value={candidateForm.name}
                    onChange={e => setCandidateForm({...candidateForm, name: e.target.value})}
                    placeholder="Candidate name" />
                </label>

                <label>Contact Number
                  <input required value={candidateForm.phone}
                    onChange={e => setCandidateForm({...candidateForm, phone: e.target.value})}
                    placeholder="10 digit number" />
                </label>

                <label>Email
                  <input type="email" value={candidateForm.email}
                    onChange={e => setCandidateForm({...candidateForm, email: e.target.value})}
                    placeholder="email@example.com" />
                </label>

                <label>Gender
                  <select value={candidateForm.gender}
                    onChange={e => setCandidateForm({...candidateForm, gender: e.target.value})}>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>Room
                  <select required value={candidateForm.roomId}
                    onChange={e => setCandidateForm({...candidateForm, roomId: e.target.value})}>
                    <option value="">Select available room</option>
                    {rooms.filter(r => r.status !== "FULL").map(r => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} — {sharingLabel[r.sharingType]} — {r.occupied}/{r.capacity}
                      </option>
                    ))}
                  </select>
                </label>

                <label>Admission Date
                  <input type="date" value={candidateForm.admissionDate}
                    onChange={e => setCandidateForm({...candidateForm, admissionDate: e.target.value})}/>
                </label>

                <label className="full">Address
                  <textarea value={candidateForm.address}
                    onChange={e => setCandidateForm({...candidateForm, address: e.target.value})}/>
                </label>

                <label>ID Proof
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setIdProof(e.target.files[0] || null)} />
                </label>

                <div className="formButtons">
                  <button className="primary">
                    {editingCandidate ? "Update Candidate" : "Save Candidate"}
                  </button>
                  <button type="button" onClick={() => {
                    setEditingCandidate(null);
                    setCandidateForm(EMPTY_CANDIDATE);
                  }}>Reset</button>
                </div>
              </form>
            </section>

            <section className="panel">
              <div className="panelTitle">
                <h2>Candidate List</h2>
                <span>{candidates.length} candidates</span>
              </div>

              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Room</th>
                    <th>Sharing</th>
                    <th>Admission</th>
                    <th>ID Proof</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.phone}</td>
                      <td>{c.room?.roomNumber || "-"}</td>
                      <td>{c.room ? sharingLabel[c.room.sharingType] : "-"}</td>
                      <td>{c.admissionDate}</td>
                      <td>{c.idProofFile ? "Available" : "Not uploaded"}</td>
                      <td>
                        <button onClick={() => editCandidate(c)}>Edit</button>
                        <button className="delete" onClick={() => deleteCandidate(c.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </section>
          </main>
        )}

        {tab === "fees" && (
          <main className="page">
            <div className="pageHeading">
              <div>
                <h1>Hostel Fees</h1>
                <p>Manage monthly hostel payments</p>
              </div>
            </div>

            <section className="panel formPanel">
              <h2>Create Fee</h2>
              <form onSubmit={createFee} className="formGrid">
                <label>Candidate
                  <select required value={feeForm.candidateId}
                    onChange={e => setFeeForm({...feeForm, candidateId: e.target.value})}>
                    <option value="">Select candidate</option>
                    {candidates.map(c => (
                      <option key={c.id} value={c.id}>{c.name} — Room {c.room?.roomNumber}</option>
                    ))}
                  </select>
                </label>

                <label>Amount
                  <input required type="number" min="0" value={feeForm.amount}
                    onChange={e => setFeeForm({...feeForm, amount: e.target.value})}/>
                </label>

                <label>Due Date
                  <input required type="date" value={feeForm.dueDate}
                    onChange={e => setFeeForm({...feeForm, dueDate: e.target.value})}/>
                </label>

                <div className="formButtons">
                  <button className="primary">Create Fee</button>
                </div>
              </form>
            </section>

            <section className="panel">
              <Table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Room</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Payment Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map(f => (
                    <tr key={f.id}>
                      <td>{f.candidate?.name}</td>
                      <td>{f.candidate?.room?.roomNumber || "-"}</td>
                      <td>₹{f.amount}</td>
                      <td>{f.dueDate}</td>
                      <td><Badge text={f.status} danger={f.status !== "PAID"} /></td>
                      <td>
                        {f.paymentFile ? (
                          <a href={`http://localhost:8080${f.paymentFile}`} target="_blank">View Receipt</a>
                        ) : (
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                            onChange={e => uploadPayment(f.id, e.target.files[0])}/>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </section>
          </main>
        )}

        {tab === "reports" && (
          <main className="page">
            <div className="pageHeading">
              <div>
                <h1>Reports</h1>
                <p>Hostel occupancy and sharing analysis</p>
              </div>
            </div>

            <div className="stats">
              <div><p>1 Sharing Rooms</p><strong>{stats.one}</strong></div>
              <div><p>2 Sharing Rooms</p><strong>{stats.two}</strong></div>
              <div><p>3 Sharing Rooms</p><strong>{stats.three}</strong></div>
              <div><p>Available Beds</p><strong>{stats.availableBeds}</strong></div>
            </div>

            <section className="panel report">
              <h2>Sharing Type Summary</h2>
              <div className="barRow"><span>1 Sharing</span><div><i style={{width: `${Math.min(100, stats.one * 10)}%`}} /></div><b>{stats.one}</b></div>
              <div className="barRow"><span>2 Sharing</span><div><i style={{width: `${Math.min(100, stats.two * 10)}%`}} /></div><b>{stats.two}</b></div>
              <div className="barRow"><span>3 Sharing</span><div><i style={{width: `${Math.min(100, stats.three * 10)}%`}} /></div><b>{stats.three}</b></div>
            </section>
          </main>
        )}

        {tab === "settings" && (
          <main className="page">
            <div className="pageHeading">
              <div>
                <h1>Settings</h1>
                <p>Manage hostel administrator settings</p>
              </div>
            </div>

            <section className="panel formPanel">
              <h2>Hostel Information</h2>
              <div className="formGrid">
                <label>Hostel Name<input value="PG Hostel" readOnly /></label>
                <label>Contact Number<input value="9876543210" readOnly /></label>
                <label>Email<input value="admin@pghostel.com" readOnly /></label>
                <label>Address<input value="Kakinada, Andhra Pradesh" readOnly /></label>
              </div>
            </section>
          </main>
        )}
      </div>
    </div>
  );
}

function Badge({ text, danger = false }) {
  return <span className={danger ? "badge danger" : "badge"}>{text}</span>;
}

function Table({ children }) {
  return <div className="tableWrap"><table>{children}</table></div>;
}

export default App;
