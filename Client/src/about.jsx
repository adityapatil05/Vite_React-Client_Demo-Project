import { Link } from "react-router-dom";
import "./public.css";

function AboutUs() {
    return (
        <main className="public-page content-page">
            <section className="content-intro">
                <span className="eyebrow">ABOUT THE PLATFORM</span>
                <h1>Simple tools for ambitious businesses.</h1>
                <p>
                    This platform brings day-to-day operations and business insight
                    together, helping retailers work with clarity from first product
                    entry to completed customer order.
                </p>
            </section>
            <section className="story-grid">
                <article className="story-card story-card-highlight">
                    <span className="feature-number">01</span>
                    <h2>One connected view</h2>
                    <p>
                        Manage your catalogue, relationships, orders, stock, and
                        financial records without losing the bigger picture.
                    </p>
                </article>
                <article className="story-card">
                    <span className="feature-number">02</span>
                    <h2>Designed around trust</h2>
                    <p>
                        Account verification, password protection, role-based access,
                        and private business records keep each workspace focused.
                    </p>
                </article>
                <article className="story-card">
                    <span className="feature-number">03</span>
                    <h2>Ready to grow with you</h2>
                    <p>
                        From a first product catalogue to a growing order pipeline,
                        the platform keeps essential operations easy to understand.
                    </p>
                </article>
            </section>
            <div className="content-footer">
                <p>Want to see your business in one place?</p>
                <Link className="btn btn-outline-info btn-sm" to="/signup">Get started</Link>
            </div>
        </main>
    );
}

export default AboutUs;