import { Link } from "react-router-dom";
import "./public.css";

function Home() {
    return (
        <main className="public-page home-page">
            <section className="public-hero">
                <div className="hero-orb hero-orb-one" />
                <div className="hero-orb hero-orb-two" />
                <span className="eyebrow">SMARTER BUSINESS. BETTER GROWTH.</span>
                <h1>Run your retail business with confidence.</h1>
                <p>
                    A focused workspace for managing products, customers, orders,
                    inventory, and financial performance in one connected platform.
                </p>
                <div className="public-actions">
                    <Link className="btn btn-info btn-sm public-button-primary" to="/login">
                        Log in to your account
                    </Link>
                    <Link className="btn btn-outline-light btn-sm public-button-secondary" to="/signup">
                        Create an account
                    </Link>
                </div>
            </section>
            <section className="feature-grid" aria-label="Platform features">
                <article className="feature-card">
                    <span className="feature-number">01</span>
                    <h2>Organise everything</h2>
                    <p>Keep products, customers, suppliers, agents, and records in one reliable workspace.</p>
                </article>
                <article className="feature-card">
                    <span className="feature-number">02</span>
                    <h2>Serve customers better</h2>
                    <p>Share a simple storefront where customers can discover products and place orders.</p>
                </article>
                <article className="feature-card">
                    <span className="feature-number">03</span>
                    <h2>Understand your numbers</h2>
                    <p>Track receivables, payables, inventory value, and yearly net worth at a glance.</p>
                </article>
            </section>
            <section className="public-callout">
                <div>
                    <span className="eyebrow">BUILT FOR MOMENTUM</span>
                    <h2>Less time switching tools. More time growing your business.</h2>
                </div>
                <Link className="btn btn-outline-success btn-sm" to="/about">Explore the platform</Link>
            </section>
        </main>
    );
}

export default Home;