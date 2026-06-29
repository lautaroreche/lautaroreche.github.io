/* Portfolio — Lautaro Reche
   Loads JSON data, handles mobile menu, smooth scroll and active nav link. */
(function () {
	'use strict';

	// Year
	var y = document.getElementById('year');
	if (y) y.textContent = new Date().getFullYear();

	// ---------- Mobile menu ----------
	var toggle = document.getElementById('menu-toggle');
	var menu = document.getElementById('nav-menu');
	if (toggle && menu) {
		toggle.addEventListener('click', function () { menu.classList.toggle('open'); });
		menu.querySelectorAll('.nav-link').forEach(function (l) {
			l.addEventListener('click', function () { menu.classList.remove('open'); });
		});
	}

	// ---------- Active link on scroll ----------
	var navLinks = document.querySelectorAll('#nav .nav-link');
	function setActive(id) {
		navLinks.forEach(function (l) {
			l.classList.toggle('active-link', l.getAttribute('href') === '#' + id);
		});
	}
	if ('IntersectionObserver' in window) {
		var obs = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
		}, { rootMargin: '-30% 0px -60% 0px' });
		document.querySelectorAll('section[id]').forEach(function (s) { obs.observe(s); });
	}

	// ---------- Smooth scroll ----------
	document.addEventListener('click', function (e) {
		var a = e.target.closest && e.target.closest('a[href^="#"]');
		if (!a) return;
		var href = a.getAttribute('href');
		if (!href || href === '#') return;
		var target = document.querySelector(href);
		if (!target) return;
		e.preventDefault();
		target.scrollIntoView({ behavior: 'smooth' });
	});

	// ---------- Helpers ----------
	function esc(str) {
		if (str == null) return '';
		return String(str)
			.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
	}
	function loadJSON(path) {
		return fetch(path).then(function (r) {
			if (!r.ok) throw new Error('Failed: ' + path);
			return r.json();
		});
	}

	// ---------- Projects ----------
	loadJSON('json/projects.json').then(function (projects) {
		var c = document.getElementById('projects-container');
		if (!c) return;
		c.innerHTML = projects.map(function (p) {
			var isPowerBI = p.public_url && /powerbi\.com/i.test(p.public_url);
			var publicLink = '';
			if (p.public_url) {
				if (isPowerBI) {
					publicLink = '<a class="pbi-link" href="' + esc(p.public_url) + '" target="_blank" rel="noopener" title="Open Power BI dashboard">' +
						'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
							'<defs><linearGradient id="pbi-grad" x1="0" y1="0" x2="0" y2="1">' +
								'<stop offset="0" stop-color="#FFE17F"/><stop offset="1" stop-color="#F2C811"/>' +
							'</linearGradient></defs>' +
							'<rect x="14.5" y="2"  width="6" height="20" rx="1" fill="url(#pbi-grad)"/>' +
							'<rect x="8"    y="7"  width="6" height="15" rx="1" fill="url(#pbi-grad)" opacity="0.85"/>' +
							'<rect x="1.5"  y="12" width="6" height="10" rx="1" fill="url(#pbi-grad)" opacity="0.7"/>' +
						'</svg></a>';
				} else {
					publicLink = '<a href="' + esc(p.public_url) + '" target="_blank" rel="noopener" title="Open project"><i class="fas fa-arrow-up-right-from-square"></i></a>';
				}
			}
			var repoLink = p.repo_url
				? '<a href="' + esc(p.repo_url) + '" target="_blank" rel="noopener" title="Repository"><i class="fa-brands fa-github"></i></a>'
				: '';
			var imgHref = p.public_url || p.repo_url || '#';
			var titleLink = p.public_url
				? '<a href="' + esc(p.public_url) + '" target="_blank" rel="noopener">' + esc(p.title) + '</a>'
				: esc(p.title);
			return '' +
				'<div class="project-card">' +
					'<div class="image-wrap">' +
						'<a href="' + esc(imgHref) + '" target="_blank" rel="noopener">' +
							'<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy" />' +
						'</a>' +
						'<div class="card-icons">' + publicLink + repoLink + '</div>' +
					'</div>' +
					'<div class="card-body">' +
						'<h3>' + titleLink + '</h3>' +
						'<div class="project-type"><span class="cert-arrow">›</span> ' + esc(p.type) + '</div>' +
						'<div class="tags">' + esc(p.tags) + '</div>' +
					'</div>' +
				'</div>';
		}).join('');
	}).catch(function (err) {
		console.error('Projects:', err);
		var c = document.getElementById('projects-container');
		if (c) c.innerHTML = '<p class="muted">Could not load projects.</p>';
	});

	// ---------- Technologies ----------
	loadJSON('json/technologies.json').then(function (techs) {
		var c = document.getElementById('technologies-container');
		if (!c) return;
		c.innerHTML = techs.map(function (t) {
			return '' +
				'<div class="tech-chip">' +
					'<img src="' + esc(t.image) + '" alt="" />' +
					'<span>' + esc(t.name) + '</span>' +
				'</div>';
		}).join('');
	}).catch(function (err) {
		console.error('Technologies:', err);
		var c = document.getElementById('technologies-container');
		if (c) c.innerHTML = '<p class="muted">Could not load technologies.</p>';
	});

	// ---------- Experience ----------
	loadJSON('json/experience.json').then(function (items) {
		var c = document.getElementById('experience-container');
		if (!c) return;
		c.innerHTML = items.map(function (e) {
			var logo = e.image
				? '<img src="' + esc(e.image) + '" alt="' + esc(e.company) + '" />'
				: '<span class="logo-fallback"><i class="' + esc(e.icon || 'fa-solid fa-briefcase') + '"></i></span>';

			// Multi-role group (same company, several positions)
			if (Array.isArray(e.roles) && e.roles.length) {
				var rolesHtml = e.roles.map(function (r) {
					var bullets = (r.description || []).map(function (d) {
						return '<li>' + esc(d) + '</li>';
					}).join('');
					return '' +
						'<div class="role-item">' +
							'<h4>' + esc(r.title) + '</h4>' +
							'<p class="meta">' + esc(r.start_date) + ' — ' + esc(r.end_date) + '</p>' +
							(bullets ? '<ul>' + bullets + '</ul>' : '') +
						'</div>';
				}).join('');
				return '' +
					'<div class="exp-item exp-group">' +
						'<div class="logo-box">' + logo + '</div>' +
						'<div class="exp-body">' +
							'<h3>' + esc(e.company) + '</h3>' +
							'<p class="meta">' + esc(e.start_date) + ' — ' + esc(e.end_date) + ' · ' + esc(e.location) + '</p>' +
							'<div class="roles">' + rolesHtml + '</div>' +
						'</div>' +
					'</div>';
			}

			// Single-role item
			var bullets = (e.description || []).map(function (d) {
				return '<li>' + esc(d) + '</li>';
			}).join('');
			return '' +
				'<div class="exp-item">' +
					'<div class="logo-box">' + logo + '</div>' +
					'<div class="exp-body">' +
						'<h3>' + esc(e.title) + '</h3>' +
						'<p class="company">' + esc(e.company) + '</p>' +
						'<p class="meta">' + esc(e.start_date) + ' — ' + esc(e.end_date) + ' · ' + esc(e.location) + '</p>' +
						(bullets ? '<ul>' + bullets + '</ul>' : '') +
					'</div>' +
				'</div>';
		}).join('');
	}).catch(function (err) {
		console.error('Experience:', err);
		var c = document.getElementById('experience-container');
		if (c) c.innerHTML = '<p class="muted">Could not load experience.</p>';
	});

	// ---------- Education ----------
	loadJSON('json/education.json').then(function (items) {
		var c = document.getElementById('education-container');
		if (!c) return;
		c.innerHTML = items.map(function (e) {
			var link = e.credential_url
				? '<a class="cert-link" href="' + esc(e.credential_url) + '" target="_blank" rel="noopener"><span class="cert-arrow">›</span> View Certificate</a>'
				: '';
			return '' +
				'<div class="edu-card">' +
					'<div class="logo"><img src="' + esc(e.image) + '" alt="' + esc(e.institution) + '" /></div>' +
					'<div>' +
						'<h3>' + esc(e.title) + '</h3>' +
						'<p class="institution">' + esc(e.institution) + '</p>' +
						'<p class="year">' + esc(e.year) + '</p>' +
						link +
					'</div>' +
				'</div>';
		}).join('');
	}).catch(function (err) {
		console.error('Education:', err);
		var c = document.getElementById('education-container');
		if (c) c.innerHTML = '<p class="muted">Could not load education.</p>';
	});
})();
