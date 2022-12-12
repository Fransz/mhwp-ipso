window.addEventListener("DOMContentLoaded", function () {

	let tabs = document.querySelectorAll("ul.nav-tabs > li");

	/**
	 * Make the tabs in the admin dashboard work.
	 */
	function switchTab(event) {
		event.preventDefault();

		// close earlier notices.
		document.querySelector("#setting-error-mhwp-ipso-error")?.remove();

		document.querySelector("ul.nav-tabs > li.active").classList.remove("active");
		document.querySelector("div.tab-content > div.tab-pane.active").classList.remove("active");

		let clickedTab = event.currentTarget;
		let anchor = event.target;
		let activePaneId = anchor.getAttribute("href");

		clickedTab.classList.add("active");
		document.querySelector(activePaneId).classList.add("active");
	}

	// add the switchTab handler to all tabs.
	for(let i = 0; i < tabs.length; i++) {
		tabs[i].addEventListener("click", switchTab);
	}
});
