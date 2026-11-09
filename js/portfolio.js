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
	// "Aug 2021" -> absolute month index. "Present" -> current month.
	var MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
	function monthIndex(str) {
		if (str == null) return null;
		var s = String(str).trim();
		if (/^present|current|actualidad$/i.test(s)) {
			var now = new Date();
			return now.getFullYear() * 12 + now.getMonth();
		}
		var m = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
		if (!m) return null;
		var mi = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
		if (mi < 0) return null;
		return parseInt(m[2], 10) * 12 + mi;
	}
	// -> "3 years 4 months" | "1 year" | "8 months" | '' when dates are unparseable
	function duration(start, end) {
		var a = monthIndex(start), b = monthIndex(end);
		if (a == null || b == null) return '';
		var months = b - a;
		if (months < 1) months = 1;
		var years = Math.floor(months / 12), rest = months % 12;
		var parts = [];
		if (years) parts.push(years + (years === 1 ? ' year' : ' years'));
		if (rest) parts.push(rest + (rest === 1 ? ' month' : ' months'));
		return parts.join(' ');
	}
	function metaLine(e) {
		var d = duration(e.start_date, e.end_date);
		return esc(e.start_date) + ' — ' + esc(e.end_date) +
			(d ? ' <span class="duration">' + esc(d) + '</span>' : '') +
			(e.location ? ' · ' + esc(e.location) : '');
	}
	function loadJSON(path) {
		return fetch(path).then(function (r) {
			if (!r.ok) throw new Error('Failed: ' + path);
			return r.json();
		});
	}

	// Project story: expands inside the card. In json/projects.json each project can have
	// "summary" (always visible) and "story": [{ heading, text } | { heading, items: [] }].
	function storyHTML(blocks) {
		if (!blocks || !blocks.length) return '';
		return '<details class="project-story"><summary><span class="cert-arrow">›</span> <span class="label-closed">Read the story</span><span class="label-open">Show less</span></summary>' +
			blocks.map(function (b) {
				var body = b.items
					? '<ul>' + b.items.map(function (it) { return '<li>' + esc(it) + '</li>'; }).join('') + '</ul>'
					: '<p>' + esc(b.text) + '</p>';
				return '<div class="story-block"><h4>' + esc(b.heading) + '</h4>' + body + '</div>';
			}).join('') +
			'</details>';
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
						(p.summary ? '<p class="project-summary">' + esc(p.summary) + '</p>' : '') +
						storyHTML(p.story) +
					'</div>' +
				'</div>';
		}).join('');
	}).catch(function (err) {
		console.error('Projects:', err);
		var c = document.getElementById('projects-container');
		if (c) c.innerHTML = '<p class="muted">Could not load projects.</p>';
	});

	// ---------- Skills (grouped) ----------
	// json/technologies.json: [{ category, items: [{ name, image? }] }]
	// To add a skill, append { "name": "..." } to a category ("image" is an optional logo URL).
	loadJSON('json/technologies.json').then(function (groups) {
		var c = document.getElementById('technologies-container');
		if (!c) return;
		c.innerHTML = groups.map(function (g) {
			var chips = (g.items || []).map(function (t) {
				var mark = t.image
					? '<img src="' + esc(t.image) + '" alt="" />'
					: '<span class="chip-dot"></span>';
				return '<div class="tech-chip">' + mark + '<span>' + esc(t.name) + '</span></div>';
			}).join('');
			return '' +
				'<div class="skill-row">' +
					'<h3 class="skill-row-title">' + esc(g.category) + '</h3>' +
					'<div class="tech-grid">' + chips + '</div>' +
				'</div>';
		}).join('');
	}).catch(function (err) {
		console.error('Skills:', err);
		var c = document.getElementById('technologies-container');
		if (c) c.innerHTML = '<p class="muted">Could not load skills.</p>';
	});

	// ---------- Experience ----------
	loadJSON('json/experience.json').then(function (items) {
		var c = document.getElementById('experience-container');
		if (!c) return;
		// Consecutive entries with the same company are grouped (LinkedIn-style),
		// so promotions / internal moves show as roles under one company.
		var groups = [];
		items.forEach(function (e) {
			var last = groups[groups.length - 1];
			if (last && last.company === e.company) last.roles.push(e);
			else groups.push({ company: e.company, roles: [e] });
		});
		function bullets(e) {
			var li = (e.description || []).map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('');
			return li ? '<ul>' + li + '</ul>' : '';
		}
		c.innerHTML = groups.map(function (g) {
			var e = g.roles[0];
			var logo = e.image
				? '<img src="' + esc(e.image) + '" alt="' + esc(e.company) + '" />'
				: '<span class="logo-fallback"><i class="' + esc(e.icon || 'fa-solid fa-briefcase') + '"></i></span>';
			var body;
			if (g.roles.length === 1) {
				body = '' +
					'<h3>' + esc(e.title) + '</h3>' +
					'<p class="company">' + esc(e.company) + '</p>' +
					'<p class="meta">' + metaLine(e) + '</p>' +
					bullets(e);
			} else {
				var oldest = g.roles[g.roles.length - 1];
				body = '' +
					'<h3>' + esc(g.company) + '</h3>' +
					'<p class="meta">' + metaLine({ start_date: oldest.start_date, end_date: e.end_date, location: e.location }) + '</p>' +
					'<div class="roles">' + g.roles.map(function (r) {
						var d = duration(r.start_date, r.end_date);
						return '' +
							'<div class="role">' +
								'<h4>' + esc(r.title) + '</h4>' +
								'<p class="meta">' + esc(r.start_date) + ' — ' + esc(r.end_date) +
									(d ? ' <span class="duration">' + esc(d) + '</span>' : '') + '</p>' +
								bullets(r) +
							'</div>';
					}).join('') + '</div>';
			}
			return '' +
				'<div class="exp-item">' +
					'<div class="logo-box">' + logo + '</div>' +
					'<div class="exp-body">' + body + '</div>' +
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
			var logo = e.image
				? '<img src="' + esc(e.image) + '" alt="' + esc(e.school) + '" />'
				: '<span class="logo-fallback"><i class="' + esc(e.icon || 'fa-solid fa-graduation-cap') + '"></i></span>';

			var bullets = (e.description || []).map(function (d) {
				return '<li>' + esc(d) + '</li>';
			}).join('');

			return '' +
				'<div class="exp-item">' +
					'<div class="logo-box">' + logo + '</div>' +
					'<div class="exp-body">' +
						'<h3>' + esc(e.degree) + '</h3>' +
						'<p class="company">' + esc(e.school) + '</p>' +
						'<p class="meta">' + esc(e.start_date) + ' — ' + esc(e.end_date) + ' · ' + esc(e.location) + '</p>' +
						(bullets ? '<ul>' + bullets + '</ul>' : '') +
					'</div>' +
				'</div>';
		}).join('');
	}).catch(function (err) {
		console.error('Education:', err);
		var c = document.getElementById('education-container');
		if (c) c.innerHTML = '<p class="muted">Could not load education.</p>';
	});

	// ---------- Licenses & Certifications ----------
	loadJSON('json/certifications.json').then(function (items) {
		var c = document.getElementById('certifications-container');
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
		console.error('Certifications:', err);
		var c = document.getElementById('certifications-container');
		if (c) c.innerHTML = '<p class="muted">Could not load certifications.</p>';
	});
})();
