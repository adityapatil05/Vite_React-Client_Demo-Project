import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import "./dashboard.css";
import API_URL from "./api";

const sections = {
    products: {
        label: "Manage Products",
        icon: "Products",
        id: "id",
        fields: [
            ["name", "Name"], ["price", "Price", "number"], ["total_stock", "Total stock", "number"],
            ["available_stock", "Available stock", "number"], ["image_url", "Product image URL"]
        ],
        columns: ["id", "name", "price", "total_stock", "available_stock", "image_url"],
        columnLabels: { id: "Product ID", name: "Product name", price: "Price", total_stock: "Total stock", available_stock: "Available stock", image_url: "Product image" }
    },
    customers: {
        label: "Manage Customers",
        icon: "Customers",
        id: "id",
        fields: [
            ["name", "Name"], ["contact", "Contact"], ["email", "Email", "email"],
            ["bill_date", "Bill date", "date"],
            ["amount_paid", "Amount paid", "number"], ["amount_pending", "Amount pending", "number"]
        ],
        columns: ["id", "name", "contact", "email", "bill_date", "amount_paid", "amount_pending"],
        columnLabels: { id: "Customer ID", name: "Customer name", contact: "Contact", email: "Email", bill_date: "Bill date", amount_paid: "Amount paid", amount_pending: "Amount pending" }
    },
    agents: {
        label: "Manage Agents",
        icon: "Agents",
        id: "No",
        fields: [["Name", "Name"], ["Address", "Address"], ["Contact", "Contact"], ["CustomerProvided", "Customer provided"]],
        columns: ["No", "Name", "Address", "Contact", "CustomerProvided"],
        columnLabels: { No: "Agent ID", Name: "Agent name", Address: "Address", Contact: "Contact", CustomerProvided: "Customers provided" }
    },
    suppliers: {
        label: "Manage Suppliers",
        icon: "Suppliers",
        id: "id",
        fields: [
            ["name", "Name"], ["address", "Address"], ["contact", "Contact"],
            ["amount_paid", "Amount paid", "number"], ["amount_pending", "Amount pending", "number"]
        ],
        columns: ["id", "name", "address", "contact", "amount_paid", "amount_pending"],
        columnLabels: { id: "Supplier ID", name: "Supplier name", address: "Address", contact: "Contact", amount_paid: "Amount paid", amount_pending: "Amount pending" }
    },
    finance: {
        label: "Manage Finance",
        icon: "Finance",
        id: "id",
        fields: [
            ["direction", "Type", "select", ["receivable", "payable"]],
            ["party_name", "Party name"], ["amount", "Amount", "number"],
            ["due_date", "Due date", "date"], ["status", "Status"],
            ["notes", "Notes"]
        ],
        columns: ["id", "direction", "party_name", "amount", "due_date", "status", "notes"],
        columnLabels: { id: "Finance ID", direction: "Transaction type", party_name: "Party", amount: "Amount", due_date: "Due date", status: "Status", notes: "Notes" }
    }
};

const emptyRecord = (section) => Object.fromEntries(
    sections[section].fields.map(([name]) => [name, ""])
);

function CustomerDashboard() {
    const token = sessionStorage.getItem("token");
    const headers = { Authorization: `bearer ${token}` };
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [order, setOrder] = useState({ quantity: 1, paymentMethod: "cod", deliveryAddress: "", contact: "" });
    const [message, setMessage] = useState("");

    const loadData = () => {
        axios.get(`${API_URL}/orders/products`, { headers }).then((result) => setProducts(result.data));
        axios.get(`${API_URL}/orders/mine`, { headers }).then((result) => setOrders(result.data));
    };

    useEffect(() => {
        loadData();
    }, []);

    const placeOrder = () => axios.post(`${API_URL}/orders`, {
        productId: selectedProduct.id,
        ...order,
    }, { headers }).then(() => {
        setMessage("Order placed successfully.");
        setSelectedProduct(null);
        loadData();
    }).catch((error) => setMessage(error.response?.data?.message || "Could not place order."));

    return (
        <>
            <h1>Shop Products</h1>
            {message && <div className="alert alert-warning">{message}</div>}
            <div className="product-card-grid">
                {products.map((product) => (
                    <article className="product-card" key={product.id}>
                        <img src={product.image_url || "https://via.placeholder.com/300x180?text=Product"} alt={product.name} />
                        <h3>{product.name}</h3>
                        <strong>₹{Number(product.price).toFixed(2)}</strong>
                        <p>{product.available_stock} available</p>
                        <button className="btn btn-outline-info btn-sm" disabled={product.available_stock < 1}
                            onClick={() => setSelectedProduct(product)}>Order now</button>
                    </article>
                ))}
            </div>
            {selectedProduct && <div className="order-panel">
                <h2>Order {selectedProduct.name}</h2>
                <input className="form-field" type="number" min="1" max={selectedProduct.available_stock}
                    value={order.quantity} onChange={(event) => setOrder({ ...order, quantity: event.target.value })} placeholder="Quantity" />
                <select className="form-field" value={order.paymentMethod}
                    onChange={(event) => setOrder({ ...order, paymentMethod: event.target.value })}>
                    <option value="cod">Cash on delivery</option>
                    <option value="online">Online payment (recorded)</option>
                </select>
                <input className="form-field" value={order.contact}
                    onChange={(event) => setOrder({ ...order, contact: event.target.value })} placeholder="Contact number" />
                <textarea className="form-field" value={order.deliveryAddress}
                    onChange={(event) => setOrder({ ...order, deliveryAddress: event.target.value })} placeholder="Delivery address" />
                <button className="btn btn-outline-success btn-sm" onClick={placeOrder}>Place order</button>
            </div>}
            <h2>My orders</h2>
            <div className="table-responsive"><table className="table table-bordered text-center">
                <thead><tr><th>Product</th><th>Quantity</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
                <tbody>{orders.map((item) => <tr key={item.id}>
                    <td>{item.product_name}</td><td>{item.quantity}</td><td>₹{item.total_amount}</td>
                    <td>{item.payment_method}</td><td>{item.status}</td>
                </tr>)}</tbody>
            </table></div>
        </>
    );
}

function Dashboard() {
    const token = sessionStorage.getItem("token");
    const profile = useMemo(() => JSON.parse(atob(token.split(".")[1])), [token]);
    const [activeSection, setActiveSection] = useState("products");
    const [rows, setRows] = useState([]);
    const [record, setRecord] = useState(emptyRecord("products"));
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [financeSummary, setFinanceSummary] = useState([]);
    const [retailerOrders, setRetailerOrders] = useState([]);
    const [showOrders, setShowOrders] = useState(false);
    const section = sections[activeSection];
    const headers = { Authorization: `bearer ${token}` };
    const endpoint = `${API_URL}/business/${activeSection}`;

    useEffect(() => {
        if (!message) {
            return undefined;
        }
        const timer = setTimeout(() => setMessage(""), 3000);
        return () => clearTimeout(timer);
    }, [message]);

    const loadRows = () => axios.get(endpoint, { headers })
        .then((result) => setRows(result.data))
        .catch(() => setMessage("Could not load records."));

    const loadFinanceSummary = () => axios.get(`${API_URL}/business/finance/summary`, { headers })
        .then((result) => setFinanceSummary(result.data))
        .catch(() => setMessage("Could not load finance summary."));

    useEffect(() => {
        loadRows();
        axios.get(`${API_URL}/orders/incoming`, { headers })
            .then((result) => setRetailerOrders(result.data))
            .catch(() => setMessage("Could not load orders."));
        if (activeSection === "finance") {
            loadFinanceSummary();
        }
    }, [activeSection]);

    const selectSection = (sectionName) => {
        setActiveSection(sectionName);
        setRecord(emptyRecord(sectionName));
        setSearch("");
    };

    const save = () => {
        const id = record[section.id];
        const request = id
            ? axios.put(`${endpoint}/${id}`, record, { headers })
            : axios.post(endpoint, record, { headers });
        request.then(() => {
            setMessage("Record saved successfully.");
            setRecord(emptyRecord(activeSection));
            loadRows();
            if (activeSection === "finance") {
                loadFinanceSummary();
            }
        }).catch(() => setMessage("Could not save record."));
    };

    const remove = (id) => axios.delete(`${endpoint}/${id}`, { headers })
        .then(() => {
            setMessage("Record deleted successfully.");
            loadRows();
            if (activeSection === "finance") {
                loadFinanceSummary();
            }
        })
        .catch(() => setMessage("Could not delete record."));

    const updateOrderStatus = (id, status) => axios.patch(`${API_URL}/orders/${id}/status`, { status }, { headers })
        .then(() => axios.get(`${API_URL}/orders/incoming`, { headers }))
        .then((result) => setRetailerOrders(result.data))
        .catch(() => setMessage("Could not update order."));

    const visibleRows = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));

    if (profile.role === "customer") {
        return <CustomerDashboard />;
    }

    return (
        <>
            <h1>Dashboard</h1>
            <nav className="dashboard-sections">
                {Object.entries(sections).map(([key, value]) => (
                    <button
                        key={key}
                        className={`btn btn-outline-info btn-sm dashboard-section-button ${activeSection === key ? "active" : ""}`}
                        onClick={() => selectSection(key)}
                    >
                        <span>{value.label}</span>
                    </button>
                ))}
                <button className={`btn btn-outline-info btn-sm dashboard-section-button ${showOrders ? "active" : ""}`}
                    onClick={() => setShowOrders(!showOrders)}>Orders</button>
            </nav>
            {showOrders && <section className="orders-panel">
                <h2>Customer orders</h2>
                <div className="table-responsive"><table className="table table-bordered text-center">
                    <thead><tr><th>Product</th><th>Customer</th><th>Quantity</th><th>Total</th><th>Payment</th><th>Address</th><th>Status</th></tr></thead>
                    <tbody>{retailerOrders.map((item) => <tr key={item.id}>
                        <td>{item.product_name}</td><td>{item.customer_username}</td><td>{item.quantity}</td>
                        <td>₹{item.total_amount}</td><td>{item.payment_method}</td><td>{item.delivery_address}</td>
                        <td><select value={item.status} onChange={(event) => updateOrderStatus(item.id, event.target.value)}>
                            <option value="pending">Pending</option><option value="confirmed">Confirmed</option>
                            <option value="fulfilled">Fulfilled</option><option value="cancelled">Cancelled</option>
                        </select></td>
                    </tr>)}</tbody>
                </table></div>
            </section>}
            <h2>{section.label}</h2>
            {activeSection === "finance" && <div className="finance-summary">
                <h3>Financial overview</h3>
                <div className="finance-summary-grid">
                    {financeSummary.length === 0 && <p>No financial records available yet.</p>}
                    {financeSummary.map((summary) => (
                        <div className="finance-year-card" key={summary.year}>
                            <strong>{summary.year}</strong>
                            <span>Inventory value: ₹{Number(summary.inventory_value).toFixed(2)}</span>
                            <span>Customer pending: ₹{Number(summary.customer_receivables).toFixed(2)}</span>
                            <span>Supplier pending: ₹{Number(summary.supplier_payables).toFixed(2)}</span>
                            <span>Finance claims: ₹{Number(summary.finance_claims).toFixed(2)}</span>
                            <span>Finance payments: ₹{Number(summary.finance_payments).toFixed(2)}</span>
                            <strong>Net worth: ₹{Number(summary.net_worth).toFixed(2)}</strong>
                        </div>
                    ))}
                </div>
            </div>}
            <div className="business-form">
                {section.fields.map(([name, label, type, options]) => (
                    <label key={name}>
                        {label}
                        {type === "select" ? (
                            <select className="form-field" value={record[name]} onChange={(event) => setRecord({ ...record, [name]: event.target.value })}>
                                <option value="">Select</option>
                                {options.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                        ) : (
                            <input className="form-field" type={type || "text"} value={record[name]}
                                onChange={(event) => setRecord({ ...record, [name]: event.target.value })} />
                        )}
                    </label>
                ))}
                <button className="btn btn-outline-success btn-sm" onClick={save}>{record[section.id] ? "Update" : "Add"}</button>
            </div>
            {message && <div className="alert alert-warning">{message}</div>}
            <input className="form-field business-search" placeholder="Search records" value={search} onChange={(event) => setSearch(event.target.value)} />
            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead><tr>{section.columns.map((column) => <th key={column}>{section.columnLabels[column]}</th>)}{profile.role === "admin" && <th>Owner</th>}<th>Actions</th></tr></thead>
                    <tbody>{visibleRows.map((row) => <tr key={row[section.id]}>
                        {section.columns.map((column) => <td key={column}>{String(row[column] ?? "")}</td>)}
                        {profile.role === "admin" && <td>{row.owner_username || "Unassigned"}</td>}
                        <td>
                            <button className="btn btn-sm btn-outline-dark" onClick={() => setRecord(row)}>Edit</button>{" "}
                            <button className="btn btn-sm btn-outline-danger" onClick={() => remove(row[section.id])}>Delete</button>
                        </td>
                    </tr>)}</tbody>
                </table>
            </div>
        </>
    );
}

export default Dashboard;
