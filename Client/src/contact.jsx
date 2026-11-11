import "./public.css";

function ContactUs() {
    return (
        <main className="public-page content-page">
            <section className="content-intro">
                <span className="eyebrow">WE ARE HERE TO HELP</span>
                <h1>Let’s make your workflow simpler.</h1>
                <p>
                    Whether you are setting up your first catalogue or improving an
                    established retail operation, our team is ready to help you find
                    the right next step.
                </p>
            </section>
            <section className="contact-grid">
                <article className="contact-card">
                    <span className="contact-icon">@</span>
                    <h2>Email support</h2>
                    <p>Send your questions and we will help you move forward.</p>
                    <a href="mailto:work.adityamhatarmare@gmail.com">work.adityamhatarmare@gmail.com</a>
                </article>
                <article className="contact-card">
                    <span className="contact-icon">?</span>
                    <h2>Product guidance</h2>
                    <p>Need help understanding orders, finance, or account roles?</p>
                    <span className="contact-detail">Monday - Friday · 9:00 - 18:00 IST</span>
                </article>
                <article className="contact-card">
                    <span className="contact-icon">↗</span>
                    <h2>Start a conversation</h2>
                    <p>Tell us what you want to improve and we will point you in the right direction.</p>
                    <a href="mailto:work.adityamhatarmare@gmail.com?subject=Platform%20question">Contact our team</a>
                </article>
            </section>
        </main>
    );
}

export default ContactUs;