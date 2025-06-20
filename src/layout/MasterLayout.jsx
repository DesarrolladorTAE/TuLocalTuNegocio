


import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const MasterLayout = ({ children }) => {

    let [active, setActive] = useState(false)
    let [show, setShow] = useState(false)
    let dashboardControl = () => {
        setActive(!active)
    }
    let showProfileControl = () => {
        setShow(!show)
    }



    return (
        <>

            <div className="mobile-menu d-lg-none d-block" >
                <button type="button" className="close-button text-body hover-text-main" >
                    {" "}
                    <i className="las la-times" />{" "}
                </button>
                <div className="mobile-menu__inner">
                    <Link to="/" className="mobile-menu__logo">
                        <img
                            src="assets/images/logo/logo.png"
                            alt="Logo"
                            className="white-version"
                        />
                        <img
                            src="assets/images/logo/white-logo-two.png"
                            alt="Logo"
                            className="dark-version"
                        />
                    </Link>
                    <div className="mobile-menu__menu">
                        <ul className="nav-menu flx-align nav-menu--mobile">
                            <li className="nav-menu__item has-submenu">
                                <Link to="#" className="nav-menu__link">
                                    Home
                                </Link>
                                <ul className="nav-submenu">
                                    <li className="nav-submenu__item">
                                        <Link to="/" className="nav-submenu__link">
                                            {" "}
                                            Home One
                                        </Link>
                                    </li>
                                    <li className="nav-submenu__item">
                                        <Link to="/index-two" className="nav-submenu__link">
                                            {" "}
                                            Home Two
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-menu__item has-submenu">
                                <Link to="/#" className="nav-menu__link">
                                    Products
                                </Link>
                                <ul className="nav-submenu">
                                    <li className="nav-submenu__item">
                                        <Link to="/all-product" className="nav-submenu__link">
                                            {" "}
                                            All Products
                                        </Link>
                                    </li>
                                    <li className="nav-submenu__item">
                                        <Link to="/product-details" className="nav-submenu__link">
                                            {" "}
                                            Product Details
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-menu__item has-submenu">
                                <Link to="/#" className="nav-menu__link">
                                    Pages
                                </Link>
                                <ul className="nav-submenu">
                                    <li className="nav-submenu__item">
                                        <Link to="/profile" className="nav-submenu__link">
                                            {" "}
                                            Profile
                                        </Link>
                                    </li>
                                    <li className="nav-submenu__item">
                                        <Link to="/cart" className="nav-submenu__link">
                                            {" "}
                                            Shopping Cart
                                        </Link>
                                    </li>
                                    <li className="nav-submenu__item">
                                        <Link to="/cart-personal" className="nav-submenu__link">
                                            {" "}
                                            Mailing Address
                                        </Link>
                                    </li>
                                    <li className="nav-submenu__item">
                                        <Link to="/cart-payment" className="nav-submenu__link">
                                            {" "}
                                            Payment Method
                                        </Link>
                                    </li>
                                    <li className="nav-submenu__item">
                                        <Link to="/cart-thank-you" className="nav-submenu__link">
                                            {" "}
                                            Preview Order
                                        </Link>
                                    </li>
                                    <li className="nav-submenu__item">
                                        <Link to="/dashboard" className="nav-submenu__link">
                                            {" "}
                                            Dashboard
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-menu__item has-submenu">
                                <Link to="/#" className="nav-menu__link">
                                    Blog
                                </Link>
                                <ul className="nav-submenu">
                                    <li className="nav-submenu__item">
                                        <Link to="/blog" className="nav-submenu__link">
                                            {" "}
                                            Blog
                                        </Link>
                                    </li>
                                    <li className="nav-submenu__item">
                                        <Link to="/blog-details" className="nav-submenu__link">
                                            {" "}
                                            Blog Details
                                        </Link>
                                    </li>
                                    <li className="nav-submenu__item">
                                        <Link to="/blog-details-sidebar" className="nav-submenu__link">
                                            {" "}
                                            Blog Details Sidebar
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-menu__item">
                                <Link to="/contact" className="nav-menu__link">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                        <div className="header-right__inner d-lg-none my-3 gap-1 d-flex flx-align">
                            <Link to="/register" className="btn btn-main pill">
                                <span className="icon-left icon">
                                    <img src="assets/images/icons/user.svg" alt="" />
                                </span>
                                Create Account
                            </Link>
                            <div className="language-select flx-align select-has-icon">
                                <img
                                    src="assets/images/icons/globe.svg"
                                    alt=""
                                    className="globe-icon white-version"
                                />
                                <img
                                    src="assets/images/icons/globe-white.svg"
                                    alt=""
                                    className="globe-icon dark-version"
                                />
                                <select className="select py-0 ps-2 border-0 fw-500">
                                    <option value={1}>Eng</option>
                                    <option value={2}>Bn</option>
                                    <option value={3}>Eur</option>
                                    <option value={4}>Urd</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <section className={`dashboard ${active && "active"}`} onClick={() => show === true && setShow(false)}>
                <div className="dashboard__inner d-flex">
                    {/* Dashboard Sidebar Start */}
                    <div className={`dashboard-sidebar ${active && "active"}`}>
                        <button
                            type="button"
                            className="dashboard-sidebar__close d-lg-none d-flex text-body hover-text-main" onClick={dashboardControl}
                        >
                            <i className="las la-times" />
                        </button>
                        <div className="dashboard-sidebar__inner">
                            <Link to="/" className="logo mb-48">
                                <img
                                    src="assets/images/logo/logo.png"
                                    alt=""
                                    className="white-version"
                                />
                                <img
                                    src="assets/images/logo/white-logo-two.png"
                                    alt=""
                                    className="dark-version"
                                />
                            </Link>
                            <Link to="/" className="logo favicon mb-48">
                                <img src="assets/images/logo/favicon.png" alt="" />
                            </Link>
                            {/* Sidebar List Start */}
                            <ul className="sidebar-list">
                                <li className="sidebar-list__item">
                                    <NavLink to="/dashboard" className={(navData) =>
                                        navData.isActive ? "sidebar-list__link activePage" : "sidebar-list__link"
                                    }  >
                                        <span className="sidebar-list__icon">
                                            <img
                                                src="assets/images/icons/sidebar-icon1.svg"
                                                alt=""
                                                className="icon"
                                            />
                                            <img
                                                src="assets/images/icons/sidebar-icon-active1.svg"
                                                alt=""
                                                className="icon icon-active"
                                            />
                                        </span>
                                        <span className="text">Dashboard</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-list__item">
                                    <NavLink to="/dashboard-profile" className={(navData) =>
                                        navData.isActive ? "sidebar-list__link activePage" : "sidebar-list__link"
                                    }>
                                        <span className="sidebar-list__icon">
                                            <img
                                                src="assets/images/icons/sidebar-icon2.svg"
                                                alt=""
                                                className="icon"
                                            />
                                            <img
                                                src="assets/images/icons/sidebar-icon-active2.svg"
                                                alt=""
                                                className="icon icon-active"
                                            />
                                        </span>
                                        <span className="text">Profile</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-list__item">
                                    <NavLink to="/follower" className={(navData) =>
                                        navData.isActive ? "sidebar-list__link activePage" : "sidebar-list__link"
                                    }>
                                        <span className="sidebar-list__icon">
                                            <img
                                                src="assets/images/icons/sidebar-icon4.svg"
                                                alt=""
                                                className="icon"
                                            />
                                            <img
                                                src="assets/images/icons/sidebar-icon-active4.svg"
                                                alt=""
                                                className="icon icon-active"
                                            />
                                        </span>
                                        <span className="text">Followers</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-list__item">
                                    <NavLink to="/following" className={(navData) =>
                                        navData.isActive ? "sidebar-list__link activePage" : "sidebar-list__link"
                                    }>
                                        <span className="sidebar-list__icon">
                                            <img
                                                src="assets/images/icons/sidebar-icon5.svg"
                                                alt=""
                                                className="icon"
                                            />
                                            <img
                                                src="assets/images/icons/sidebar-icon-active5.svg"
                                                alt=""
                                                className="icon icon-active"
                                            />
                                        </span>
                                        <span className="text">Followings</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-list__item">
                                    <NavLink to="/setting" className={(navData) =>
                                        navData.isActive ? "sidebar-list__link activePage" : "sidebar-list__link"
                                    }>
                                        <span className="sidebar-list__icon">
                                            <img
                                                src="assets/images/icons/sidebar-icon10.svg"
                                                alt=""
                                                className="icon"
                                            />
                                            <img
                                                src="assets/images/icons/sidebar-icon-active10.svg"
                                                alt=""
                                                className="icon icon-active"
                                            />
                                        </span>
                                        <span className="text">Settings</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-list__item">
                                    <NavLink to="/statement" className={(navData) =>
                                        navData.isActive ? "sidebar-list__link activePage" : "sidebar-list__link"
                                    }>
                                        <span className="sidebar-list__icon">
                                            <img
                                                src="assets/images/icons/sidebar-icon12.svg"
                                                alt=""
                                                className="icon"
                                            />
                                            <img
                                                src="assets/images/icons/sidebar-icon-active12.svg"
                                                alt=""
                                                className="icon icon-active"
                                            />
                                        </span>
                                        <span className="text">Statements</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-list__item">
                                    <NavLink to="/earning" className={(navData) =>
                                        navData.isActive ? "sidebar-list__link activePage" : "sidebar-list__link"
                                    }>
                                        <span className="sidebar-list__icon">
                                            <img
                                                src="assets/images/icons/sidebar-icon11.svg"
                                                alt=""
                                                className="icon"
                                            />
                                            <img
                                                src="assets/images/icons/sidebar-icon-active11.svg"
                                                alt=""
                                                className="icon icon-active"
                                            />
                                        </span>
                                        <span className="text">Earnings</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-list__item">
                                    <NavLink to="/review" className={(navData) =>
                                        navData.isActive ? "sidebar-list__link activePage" : "sidebar-list__link"
                                    }>
                                        <span className="sidebar-list__icon">
                                            <img
                                                src="assets/images/icons/sidebar-icon7.svg"
                                                alt=""
                                                className="icon"
                                            />
                                            <img
                                                src="assets/images/icons/sidebar-icon-active7.svg"
                                                alt=""
                                                className="icon icon-active"
                                            />
                                        </span>
                                        <span className="text">Reviews</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-list__item">
                                    <NavLink to="/download" className={(navData) =>
                                        navData.isActive ? "sidebar-list__link activePage" : "sidebar-list__link"
                                    }>
                                        <span className="sidebar-list__icon">
                                            <img
                                                src="assets/images/icons/sidebar-icon6.svg"
                                                alt=""
                                                className="icon"
                                            />
                                            <img
                                                src="assets/images/icons/sidebar-icon-active6.svg"
                                                alt=""
                                                className="icon icon-active"
                                            />
                                        </span>
                                        <span className="text">Downloads</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-list__item">
                                    <NavLink to="/refund" className={(navData) =>
                                        navData.isActive ? "sidebar-list__link activePage" : "sidebar-list__link"
                                    }>
                                        <span className="sidebar-list__icon">
                                            <img
                                                src="assets/images/icons/sidebar-icon8.svg"
                                                alt=""
                                                className="icon"
                                            />
                                            <img
                                                src="assets/images/icons/sidebar-icon-active8.svg"
                                                alt=""
                                                className="icon icon-active"
                                            />
                                        </span>
                                        <span className="text">Refunds</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-list__item">
                                    <NavLink to="/login" className={(navData) =>
                                        navData.isActive ? "sidebar-list__link activePage" : "sidebar-list__link"
                                    }>
                                        <span className="sidebar-list__icon">
                                            <img
                                                src="assets/images/icons/sidebar-icon13.svg"
                                                alt=""
                                                className="icon"
                                            />
                                            <img
                                                src="assets/images/icons/sidebar-icon-active13.svg"
                                                alt=""
                                                className="icon icon-active"
                                            />
                                        </span>
                                        <span className="text">Logout</span>
                                    </NavLink>
                                </li>
                            </ul>
                            {/* Sidebar List End */}
                        </div>
                    </div>

                    <div className="dashboard-body">
                        {/* Dashboard Nav Start */}
                        <div className="dashboard-nav bg-white flx-between gap-md-3 gap-2">
                            <div className="dashboard-nav__left flx-align gap-md-3 gap-2">
                                <button onClick={dashboardControl}
                                    type="button"
                                    className="icon-btn bar-icon text-heading bg-gray-seven flx-center"
                                >
                                    <i className="las la-bars" />
                                </button>
                                <button onClick={dashboardControl}
                                    type="button"
                                    className="icon-btn arrow-icon text-heading bg-gray-seven flx-center"
                                >
                                    <img src="assets/images/icons/angle-right.svg" alt="" />
                                </button>
                                <form action="#" className="search-input d-sm-block d-none">
                                    <span className="icon">
                                        <img
                                            src="assets/images/icons/search-dark.svg"
                                            alt=""
                                            className="white-version"
                                        />
                                        <img
                                            src="assets/images/icons/search-dark-white.svg"
                                            alt=""
                                            className="dark-version"
                                        />
                                    </span>
                                    <input
                                        type="text"
                                        className="common-input common-input--md common-input--bg pill w-100"
                                        placeholder="Search here..."
                                    />
                                </form>
                            </div>
                            <div className="dashboard-nav__right" >
                                <div className="header-right flx-align">
                                    <div className="header-right__inner gap-sm-3 gap-2 flx-align d-flex">
                                        {/* Light Dark Mode */}
                                        <ThemeToggle />
                                        <div className="user-profile">
                                            <button className="user-profile__button flex-align" onClick={showProfileControl}>
                                                <span className="user-profile__thumb">
                                                    <img
                                                        src="assets/images/thumbs/user-profile.png"
                                                        className="cover-img"
                                                        alt=""
                                                    />
                                                </span>
                                            </button>
                                            <ul className={`user-profile-dropdown ${show && "show"} `}>
                                                <li className="sidebar-list__item">
                                                    <Link to="/dashboard-profile" className="sidebar-list__link">
                                                        <span className="sidebar-list__icon">
                                                            <img
                                                                src="assets/images/icons/sidebar-icon2.svg"
                                                                alt=""
                                                                className="icon"
                                                            />
                                                            <img
                                                                src="assets/images/icons/sidebar-icon-active2.svg"
                                                                alt=""
                                                                className="icon icon-active"
                                                            />
                                                        </span>
                                                        <span className="text">Profile</span>
                                                    </Link>
                                                </li>
                                                <li className="sidebar-list__item">
                                                    <Link to="/setting" className="sidebar-list__link">
                                                        <span className="sidebar-list__icon">
                                                            <img
                                                                src="assets/images/icons/sidebar-icon10.svg"
                                                                alt=""
                                                                className="icon"
                                                            />
                                                            <img
                                                                src="assets/images/icons/sidebar-icon-active10.svg"
                                                                alt=""
                                                                className="icon icon-active"
                                                            />
                                                        </span>
                                                        <span className="text">Settings</span>
                                                    </Link>
                                                </li>
                                                <li className="sidebar-list__item">
                                                    <Link to="/login" className="sidebar-list__link">
                                                        <span className="sidebar-list__icon">
                                                            <img
                                                                src="assets/images/icons/sidebar-icon13.svg"
                                                                alt=""
                                                                className="icon"
                                                            />
                                                            <img
                                                                src="assets/images/icons/sidebar-icon-active13.svg"
                                                                alt=""
                                                                className="icon icon-active"
                                                            />
                                                        </span>
                                                        <span className="text">Logout</span>
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="language-select flx-align select-has-icon">
                                            <img
                                                src="assets/images/icons/globe.svg"
                                                alt=""
                                                className="globe-icon white-version"
                                            />
                                            <img
                                                src="assets/images/icons/globe-white.svg"
                                                alt=""
                                                className="globe-icon dark-version"
                                            />
                                            <select className="select py-0 ps-2 border-0 fw-500">
                                                <option value={1}>Eng</option>
                                                <option value={2}>Bn</option>
                                                <option value={3}>Eur</option>
                                                <option value={4}>Urd</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* children */}
                        {children}
                        {/* Dashboard Footer */}
                        <div className="dashboard-footer bottom-footer-two mt-32 border-0 bg-white">
                            <div className="bottom-footer__inner flx-between gap-3">
                                <p className="bottom-footer__text font-14">
                                    {" "}
                                    Copyright © 2024 DPmarket, All rights reserved.
                                </p>
                                <div className="footer-links gap-4">
                                    <Link to="/#" className="footer-link hover-text-heading font-14">
                                        Terms of service
                                    </Link>
                                    <Link to="/#" className="footer-link hover-text-heading font-14">
                                        Privacy Policy
                                    </Link>
                                    <Link to="/#" className="footer-link hover-text-heading font-14">
                                        cookies
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </section>




        </>
    );
}

export default MasterLayout;