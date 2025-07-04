import $ from 'jquery';
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrollSmoother from 'gsap/ScrollSmoother';

// Expose jQuery globally for legacy code sections
window.$ = $;

// Register GSAP plugins once
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Mobile Detection and Handling
function detectMobileAndHandle() {
	const isMobile = () => {
		// Check screen width (tablets and smaller)
		if (window.innerWidth <= 1024) return true;

		// Check user agent for mobile devices
		const userAgent = navigator.userAgent.toLowerCase();
		const mobileKeywords = [
			'mobile', 'android', 'iphone', 'ipad', 'ipod',
			'blackberry', 'windows phone', 'opera mini'
		];

		return mobileKeywords.some(keyword => userAgent.includes(keyword));
	};

	const handleMobileDisplay = () => {
		const mobileWarning = document.getElementById('mobile-warning');
		const mainContent = document.getElementById('main-content');

		if (isMobile()) {
			// Show mobile warning, hide main content
			if (mobileWarning) mobileWarning.style.display = 'flex';
			if (mainContent) mainContent.style.display = 'none';

			// Prevent scroll on mobile warning screen
			document.body.style.overflow = 'hidden';

			return true; // Is mobile
		} else {
			// Hide mobile warning, show main content
			if (mobileWarning) mobileWarning.style.display = 'none';
			if (mainContent) mainContent.style.display = 'block';

			// Allow scroll for desktop
			document.body.style.overflow = '';

			return false; // Is desktop
		}
	};

	// Initial check
	const isMobileDevice = handleMobileDisplay();

	// Check on window resize
	let resizeTimeout;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			handleMobileDisplay();
		}, 250);
	});

	return isMobileDevice;
}

// Run mobile detection immediately
const isMobileDevice = detectMobileAndHandle();

// Custom Cursor Implementation
function initCustomCursor() {
	const cursor = document.querySelector('.custom-cursor');
	if (!cursor) return;

	let mouseX = 0;
	let mouseY = 0;
	let cursorX = 0;
	let cursorY = 0;

	// Maximum z-index for cursor
	const MAX_CURSOR_Z_INDEX = 2147483647;

	// Ensure cursor is always on top with aggressive approach
	function ensureCursorOnTop() {
		// Force cursor styles
		cursor.style.setProperty('z-index', MAX_CURSOR_Z_INDEX.toString(), 'important');
		cursor.style.setProperty('position', 'fixed', 'important');
		cursor.style.setProperty('pointer-events', 'none', 'important');
		cursor.style.setProperty('visibility', 'visible', 'important');

		// Move cursor to the very end of body to ensure DOM order
		if (cursor.parentNode !== document.body || cursor !== document.body.lastElementChild) {
			document.body.appendChild(cursor);
		}

		// Ensure other potentially interfering elements have lower z-index
		const potentiallyInterferingElements = document.querySelectorAll([
			'.chart-preview',
			'.mobile-warning',
			'[style*="z-index"]',
			'[style*="position: fixed"]',
			'[style*="position: absolute"]'
		].join(','));

		potentiallyInterferingElements.forEach(element => {
			if (element !== cursor) {
				const currentZIndex = window.getComputedStyle(element).zIndex;
				if (currentZIndex !== 'auto' && parseInt(currentZIndex) >= MAX_CURSOR_Z_INDEX - 1000) {
					element.style.setProperty('z-index', (MAX_CURSOR_Z_INDEX - 1000).toString(), 'important');
				}
			}
		});
	}

	// Track mouse movement with high performance
	document.addEventListener('mousemove', (e) => {
		mouseX = e.clientX;
		mouseY = e.clientY;
	}, { passive: true });

	// Smooth cursor following with forced positioning
	function updateCursor() {
		// Faster cursor movement with improved easing
		cursorX += (mouseX - cursorX) * 0.25;
		cursorY += (mouseY - cursorY) * 0.25;

		// Force positioning with important styles
		cursor.style.setProperty('left', cursorX + 'px', 'important');
		cursor.style.setProperty('top', cursorY + 'px', 'important');
		cursor.style.setProperty('transform', 'translate(-50%, -50%)', 'important');

		requestAnimationFrame(updateCursor);
	}
	updateCursor();

	// Initial setup
	ensureCursorOnTop();

	// Aggressive DOM monitoring for any changes
	const observer = new MutationObserver((mutations) => {
		let needsRecheck = false;

		mutations.forEach(mutation => {
			if (mutation.type === 'childList') {
				mutation.addedNodes.forEach(node => {
					if (node.nodeType === Node.ELEMENT_NODE) {
						needsRecheck = true;
					}
				});
			}
			if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
				needsRecheck = true;
			}
		});

		if (needsRecheck) {
			setTimeout(ensureCursorOnTop, 0);
		}
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ['style', 'class']
	});

	// Force cursor on top every 100ms as fallback
	const forceInterval = setInterval(ensureCursorOnTop, 100);

	// Add hover effects for interactive elements
	const updateInteractiveElements = () => {
		const interactiveElements = document.querySelectorAll('a, button, .defines .left-box ul li:not(:last-child), .stacked .stack-list li, [onclick], [onmouseover], [data-link]');

		interactiveElements.forEach(element => {
			// Remove existing listeners to avoid duplicates
			element.removeEventListener('mouseenter', handleMouseEnter);
			element.removeEventListener('mouseleave', handleMouseLeave);

			// Add new listeners
			element.addEventListener('mouseenter', handleMouseEnter);
			element.addEventListener('mouseleave', handleMouseLeave);
		});
	};

	const handleMouseEnter = (e) => {
		// Hide custom cursor for clickable elements
		cursor.style.setProperty('opacity', '0', 'important');
		// Show default cursor
		e.target.style.cursor = 'pointer';
	};

	const handleMouseLeave = (e) => {
		// Show custom cursor again
		cursor.style.setProperty('opacity', '1', 'important');
		ensureCursorOnTop();
	};

	updateInteractiveElements();

	// Add click effect
	document.addEventListener('mousedown', () => {
		cursor.classList.add('click');
		ensureCursorOnTop();
	});

	document.addEventListener('mouseup', () => {
		cursor.classList.remove('click');
		ensureCursorOnTop();
	});

	// Hide cursor when mouse leaves window
	document.addEventListener('mouseleave', () => {
		cursor.style.setProperty('opacity', '0', 'important');
	});

	// Show cursor when mouse enters window
	document.addEventListener('mouseenter', () => {
		cursor.style.setProperty('opacity', '1', 'important');
		ensureCursorOnTop();
	});

	// Handle various events that might affect stacking
	const events = ['scroll', 'resize', 'focus', 'blur', 'load'];
	events.forEach(eventName => {
		document.addEventListener(eventName, ensureCursorOnTop, { passive: true });
		window.addEventListener(eventName, ensureCursorOnTop, { passive: true });
	});

	// Return cleanup function
	return () => {
		observer.disconnect();
		clearInterval(forceInterval);
		events.forEach(eventName => {
			document.removeEventListener(eventName, ensureCursorOnTop);
			window.removeEventListener(eventName, ensureCursorOnTop);
		});
	};
}

// Initialize custom cursor only for desktop
if (!isMobileDevice) {
	const cursorCleanup = initCustomCursor();

	// Protect cursor from GSAP animations
	gsap.set('.custom-cursor', {
		clearProps: 'none',
		autoCSS: false
	});

	// Override any GSAP attempts to modify cursor
	gsap.registerPlugin({
		name: 'cursorProtection',
		init: function (target) {
			if (target.classList && target.classList.contains('custom-cursor')) {
				return false; // Prevent GSAP from animating cursor
			}
		}
	});
}

$(document).ready(function () {
	// Skip all animations and setup if on mobile
	if (isMobileDevice) {
		return;
	}

	// Preload critical images for animations
	function preloadImages() {
		const criticalImages = [
			'./images/symbol.png',
			'./images/seovereign.png',
			'./texts/texts_introduce_pc.svg',
			'./texts/text_niladmiraria.svg',
			'./texts/text_nostos.svg',
			'./texts/text_eunoia.svg'
		];

		criticalImages.forEach(src => {
			const img = new Image();
			img.src = src;
		});
	}

	// Call preload immediately
	preloadImages();

	// 섹션 간 부드러운 전환 및 브레이크 포인트 추가
	function setupSmoothSections() {
		// ScrollTrigger를 각 섹션에 적용
		const sections = document.querySelectorAll('main section');

		// 섹션 간 스냅 기능 활성화
		ScrollTrigger.config({
			autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize',
			limitCallbacks: true,
			syncInterval: 500
		});

		// ScrollTrigger 스냅 설정
		ScrollTrigger.snapDirectional(1 / (sections.length - 1));

		// 스크롤 이벤트 최적화
		let lastScrollTime = 0;
		const scrollCooldown = 800; // 밀리초

		window.addEventListener('wheel', function (e) {
			const now = Date.now();
			if (now - lastScrollTime < scrollCooldown) {
				e.preventDefault();
				return false;
			}
			lastScrollTime = now;
		}, { passive: false });
	}

	// 페이지 로드 시 스크롤 설정 초기화
	setupSmoothSections();

	// 애니메이션 시작 시 스크롤 가능하도록 약간의 지연 추가
	setTimeout(function () {
		document.body.classList.add('scroll-enabled');
	}, 1000);

	// 'what defines us' 텍스트와 상하단 hr 초기 상태 설정 - 페이지 로드 시 바로 적용
	gsap.set('.defines .right-box .title-text', { x: '-100%', opacity: 0 });
	gsap.set('.defines .right-box .top-hr', { x: '-100%', opacity: 0 });
	gsap.set('.defines .right-box .second-hr', { x: '-100%', opacity: 0 });
	gsap.set('.defines .right-box .bottom-hr', { x: '-100%', opacity: 0 });

	// Initial logo scale setup (start with normal size, scale down during animation)
	gsap.set('.intro .intro-symbol img, .intro .seovereign img', {
		scale: 1,
		transformOrigin: 'center center'
	});

	// Make logos visible (override CSS defaults)
	gsap.set('.intro .intro-symbol', {
		opacity: 1,
		visibility: 'visible'
	});

	gsap.set('.intro .seovereign', {
		opacity: 1,
		visibility: 'visible'
	});

	// Make sure elements start at their correct offscreen positions
	gsap.set('.introduce .x-right', {
		x: '100%',
		opacity: 0
	});

	gsap.set('.introduce .x-left', {
		x: '-100%',
		opacity: 0
	});

	gsap.set('.introduce .y-down', {
		y: '-100%',
		opacity: 0
	});

	gsap.set('.introduce .y-up', {
		y: '-100%',
		opacity: 0
	});

	// 마키 애니메이션이 처음에 아래에 위치하도록 설정
	gsap.set('.introduce .vertical-slide', {
		y: '100%',
		opacity: 0
	});

	// 텍스트 마키 초기 설정 - 처음에는 보이지 않게
	gsap.set('.introduce .texts', {
		opacity: 0
	});

	/* ------------------------------------------------------------------
	   New, high-performance marquee builder
	   ------------------------------------------------------------------ */
	const initIntroduceTextMarquee = () => {
		const MARQUEE_SELECTOR = '.introduce .text-marquee';
		const marquees = document.querySelectorAll(MARQUEE_SELECTOR);
		if (!marquees.length) return;

		// 원하는 단어들을 자유롭게 추가/수정하면 됨
		const WORDS = [
			'EUNOIA', 'OBLIVION', 'EPHEMERA', 'SERAPHIM', 'LACUNA', 'SAUDADE', 'VELLICHOR',
			'HALCYON', 'CELESTIA', 'LIMERENCE', 'NOSTOS', 'NIL ADMIRARI', 'AURORA',
			'SYZYGY', 'PARADOX', 'ECLIPSE', 'SOLITUDE', 'INFINITY', 'PHANTASM', 'MIRAGE',
			'REVERIE', 'ETHEREAL', 'COSMOS', 'LUCID', 'CHIMERA', 'NEBULA', 'SERENITY',
			'VOYAGER', 'EPIPHANY', 'MEMENTO'
		];

		marquees.forEach(marquee => {
			// Ensure the inner container exists or create it
			let innerContainer = marquee.querySelector('.text-marquee-inner');
			if (!innerContainer) {
				innerContainer = document.createElement('div');
				innerContainer.className = 'text-marquee-inner';
				marquee.appendChild(innerContainer);
			}
			innerContainer.innerHTML = ''; // Clear previous content

			marquee.style.position = 'relative';
			const containerWidth = marquee.offsetWidth;
			const containerHeight = marquee.offsetHeight || 300; // fallback height

			const WORD_COUNT = 20; // Increased word count significantly
			for (let i = 0; i < WORD_COUNT; i++) {
				const word = document.createElement('span');
				word.className = 'text-item';
				word.textContent = WORDS[Math.floor(Math.random() * WORDS.length)];

				const minSize = 6, maxSize = 30; // Much larger font size range
				const size = (Math.random() * (maxSize - minSize) + minSize).toFixed(1);
				word.style.fontSize = size + 'rem';
				word.style.opacity = (Math.random() * 0.6 + 0.4).toFixed(2); // Adjusted opacity
				word.style.fontWeight = '900'; // Bolder font
				word.style.position = 'absolute';
				word.style.whiteSpace = 'nowrap';
				const randY = Math.random() * (containerHeight - (size * 16 * 0.8)); // Adjust Y based on font size
				word.style.top = randY + 'px';
				innerContainer.appendChild(word); // Append to inner container

				const wordWidth = word.offsetWidth;
				const startX = -wordWidth - Math.random() * containerWidth * 0.5; // Adjusted start
				const endX = containerWidth + Math.random() * 200 + 200; // Adjusted end for more variance
				const distance = endX - startX;
				const speedPxPerSec = gsap.utils.random(40, 100); // Slower speed for larger text
				const dur = distance / speedPxPerSec;
				const delay = gsap.utils.random(0, 8); // Increased delay range

				gsap.fromTo(word, { x: startX }, {
					x: endX,
					duration: dur,
					delay: delay,
					ease: 'none',
					repeat: -1,
					force3D: true
				});
			}
		});
	};

	// 초기화 호출
	initIntroduceTextMarquee();

	/* ------------------------------------------------------------------
	   (Legacy) 기존 하드코딩된 마키 애니메이션 비활성화
	   ------------------------------------------------------------------ */
	/*
	gsap.fromTo('.text-marquee-inner:first-child',
		{ x: '-100%' },
		{ x: '100%', repeat: -1, duration: 20, ease: 'none' }
	);

	gsap.fromTo('.text-marquee-inner:last-child',
		{ x: '-100%' },
		{ x: '100%', repeat: -1, duration: 25, ease: 'none', delay: 0.5 }
	);
	*/

	// Add will-change property to elements that will animate
	gsap.set('.intro .seovereign, .intro, .introduce .inner, .introduce .top-text, .introduce .bottom-text, .introduce .top-text p, .introduce .bottom-text p, .introduce .row, .introduce .vertical-slide, .introduce .y-up, .introduce .y-down, .introduce .texts, .introduce .x-right, .introduce .x-left', {
		willChange: 'transform, opacity'
	});

	const smoother = ScrollSmoother.create({
		wrapper: '.smoother-wrapper',
		content: '.smoother-contents',
		smooth: 1.5, // Increased for smoother scrolling
		effects: true,
		normalizeScroll: true, // Normalize scroll across devices
		ignoreMobileResize: true // Prevent jumps on mobile resize
	});

	// Optimize memory by cleaning up will-change after animations complete
	function cleanupWillChange() {
		ScrollTrigger.addEventListener("scrollEnd", () => {
			gsap.set('.intro .seovereign, .intro, .introduce .inner, .introduce .top-text, .introduce .bottom-text, .introduce .top-text p, .introduce .bottom-text p', {
				willChange: 'auto'
			});
		});
	}

	cleanupWillChange();

	let pinDistance = $('section').outerHeight();

	// Responsive pin distance calculation
	function updatePinDistance() {
		pinDistance = $('section').outerHeight();
		ScrollTrigger.refresh(true);
	}

	$(window).on('resize', updatePinDistance);

	const introduceAni = gsap.timeline({
		defaults: {
			ease: 'power2.inOut', // Changed from 'none' for smoother transitions
			stagger: 0.2 // Reduced stagger time for faster response
		}
	})
		// Add scaling for logo animation
		.to('.intro .intro-symbol img', {
			scale: 0.85,
			duration: 0.3
		}, 'go')
		.to('.intro .seovereign img', {
			scale: 0.9,
			duration: 0.3
		}, 'go')
		.to('.intro .seovereign', {
			opacity: 0,
			duration: 0.5
		}, 'go+=0.1')
		.to('.intro', {
			className: 'intro off',
			duration: 0.7
		}, '>')
		.to('.introduce .inner', {
			className: 'inner contents-on',
			duration: 0.7
		}, '>')
		// Group related animations to execute in parallel with '<' for better performance
		.to('.introduce .top-text', {
			y: '0',
			duration: 0.8,
			ease: 'power3.out'
		}, '<')
		.to('.introduce .bottom-text', {
			y: '0',
			duration: 0.8,
			ease: 'power3.out'
		}, '<')
		// Text slides happen in sequence after background is positioned
		.to('.introduce .top-text p', {
			x: '0',
			duration: 0.7,
			ease: 'power2.out'
		}, '>')
		.to('.introduce .bottom-text p', {
			x: '0',
			duration: 0.7,
			ease: 'power2.out'
		}, '<')
		.to('.intro', {
			left: '-50%',
			duration: 0.8,
			ease: 'power1.inOut'
		}, '>')
		// 폰트 크기와 높이 변경을 분리하여 애니메이션 적용
		.to('.introduce .top-text', {
			fontSize: '3.25rem', /* 52px @16px root */
			duration: 0.6
		}, '>')
		.to('.introduce .top-text', {
			height: 'auto',
			duration: 0.2
		}, '>')
		.to('.introduce .row', {
			className: 'row row-on',
			duration: 0.5
		}, '>')
		.to('.introduce .vertical-slide', {
			className: 'vertical-slide on',
			y: 0, // y값을 0으로 변경하여 위로 이동
			opacity: 1,
			duration: 0.7,
			ease: 'power2.out',
			onStart: function () {
				// Add animation for vertical text sliding
				gsap.to('.introduce .to-up .inner', {
					y: '-50%',
					duration: 30,
					repeat: -1,
					ease: 'none'
				});
			}
		}, '>')
		// 라인 애니메이션을 먼저 실행하도록 이동
		.to('.introduce .top-text', {
			className: 'top-text line',
			duration: 0.4
		}, '>')
		.to('.introduce .bottom-text', {
			className: 'bottom-text line',
			duration: 0.4
		}, '<')
		// 이미지 슬라이드인 애니메이션을 라인 애니메이션 이후로 이동
		.to('.introduce .y-down', {
			y: 0,
			opacity: 1,
			duration: 1.2,
			ease: 'power2.out',
			onStart: function () {
				$('.introduce .y-down').addClass('visible');
			}
		}, '>')
		.to('.introduce .texts', {
			left: 0,
			opacity: 1,
			duration: 1.2,
			ease: 'power2.out'
		}, '<')
		// Fix the slide-in animation directions
		.to('.introduce .x-left', {
			x: 0,
			opacity: 1,
			duration: 1.2,
			ease: 'power2.out',
			onStart: function () {
				$('.introduce .x-left').addClass('visible');
			}
		}, '<')
		.to('.introduce .x-right', {
			x: 0,
			opacity: 1,
			duration: 1.2,
			ease: 'power2.out',
			onStart: function () {
				$('.introduce .x-right').addClass('visible');
			}
		}, '<')
		.to('.introduce', {
			left: '-100%',
			duration: 1,
			ease: 'power1.inOut'
		}, '>')

	ScrollTrigger.create({
		trigger: '.introduce',
		animation: introduceAni,
		pin: '.introduce',
		start: 'top top',
		end: '+=' + (pinDistance * 3),
		scrub: 1, // 스크롤 속도 완화
		anticipatePin: 1, // Improves performance by preparing for pin
		fastScrollEnd: true, // Improves performance during fast scrolling
	});

	// Ensure SVGs in defines section are visible against black background
	document.addEventListener('DOMContentLoaded', function () {
		// Target SVGs in the defines section
		const svgs = document.querySelectorAll('.defines .left-box .top-texts svg, .defines .left-box .bottom-texts svg');

		// Apply white fill to SVGs in the black background
		svgs.forEach(svg => {
			// Get all paths within each SVG
			const paths = svg.querySelectorAll('path');
			paths.forEach(path => {
				path.setAttribute('fill', '#ffffff');
				path.style.fill = '#ffffff'; // Force fill style 
			});

			// Apply a filter to ensure visibility
			svg.style.filter = 'brightness(1) invert(1)';
		});

		// Make the symbol image visible against black background
		const symbolImg = document.querySelector('.defines .left-box .symbol img');
		if (symbolImg) {
			symbolImg.style.filter = 'brightness(1) invert(1)';
		}

		// 명확한 초기 상태 설정
		const leftBox = document.querySelector('.defines .left-box');
		if (leftBox) {
			leftBox.style.left = '100%';
		}

		// defines 섹션에 position 속성 추가
		const definesSection = document.querySelector('.defines');
		if (definesSection) {
			definesSection.style.position = 'relative';
			definesSection.style.zIndex = '1';
		}

		// Make sure elements in the left-box are properly initialized
		gsap.set('.defines .left-box .x-left', { x: '-100%', opacity: 0 });
		gsap.set('.defines .left-box .y-up', { y: '-100%', opacity: 0 });
		gsap.set('.defines .left-box .y-down', { y: '100%', opacity: 0 });

		// Explicitly set the specific elements we want to customize animations for
		gsap.set('.defines .left-box ul.x-left', { x: '100%', opacity: 0 });
		gsap.set('.defines .left-box .bottom-texts.y-down', { y: '100%', opacity: 0 });

		// 'what defines us' 텍스트와 상하단 hr 초기 상태 다시 적용
		gsap.set('.defines .right-box .title-text', { x: '-100%', opacity: 0 });
		gsap.set('.defines .right-box .top-hr', { x: '-100%', opacity: 0 });
		gsap.set('.defines .right-box .second-hr', { x: '-100%', opacity: 0 });
		gsap.set('.defines .right-box .bottom-hr', { x: '-100%', opacity: 0 });

		// left-box 초기 상태 설정
		gsap.set('.defines .left-box', {
			left: '100%', // 초기 위치 설정 - 오른쪽에 위치
			width: '50%', // 초기 너비 설정
			top: '80px', // 명확한 초기 top 값 설정
			bottom: '80px', // 명확한 초기 bottom 값 설정
			height: 'calc(100% - 160px)', // 초기 높이 명시적 설정
			zIndex: '5' // z-index 설정으로 stacked 섹션에 덮히도록 함
		});
	});

	const definesAni = gsap.timeline({
		defaults: {
			ease: 'power2.inOut',
		}
	});

	// 첫 번째 텍스트 항목을 활성화하기 위한 초기 설정
	document.addEventListener('DOMContentLoaded', function () {
		// 첫 번째 항목 활성화 상태 설정
		const firstLi = document.querySelector('.defines .left-box ul li:first-child');
		if (firstLi) {
			firstLi.classList.add('on');
		}

		// left-box 초기 상태 설정
		gsap.set('.defines .left-box', {
			left: '100%', // 초기 위치 설정 - 오른쪽에 위치
			width: '50%', // 초기 너비 설정
			top: '80px', // 명확한 초기 top 값 설정
			bottom: '80px', // 명확한 초기 bottom 값 설정
			height: 'calc(100% - 160px)', // 초기 높이 명시적 설정
			zIndex: '5' // z-index 설정으로 stacked 섹션에 덮히도록 함
		});
	});

	// defines 섹션의 텍스트 항목 호버 효과 추가
	$('.defines .left-box ul li').on('mouseenter', function () {
		// get in touch 항목(마지막 항목)이 아닌 경우에만 호버 효과 적용
		if (!$(this).is(':last-child')) {
			$(this).addClass('hover');
		}
	}).on('mouseleave', function () {
		$(this).removeClass('hover');
	});

	// get in touch 항목 클릭 시 contact 섹션으로 스크롤
	$('.defines .left-box ul li:last-child').on('click', function () {
		// contact 섹션 위치로 스크롤
		const contactSection = document.querySelector('.contact');
		if (contactSection) {
			contactSection.scrollIntoView({ behavior: 'smooth' });
		}
	});

	// 섹션 활성화 상태 설정
	function setupSectionActivation() {
		// 각 섹션에 대한 ScrollTrigger 설정
		const sections = ['introduce', 'defines', 'stacked', 'charts'];

		sections.forEach(section => {
			ScrollTrigger.create({
				trigger: `.${section}`,
				start: 'top bottom',
				end: 'bottom center',
				onEnter: () => document.body.classList.add(`section-${section}`),
				onLeaveBack: () => document.body.classList.remove(`section-${section}`),
				onLeave: () => document.body.classList.remove(`section-${section}`),
				onEnterBack: () => document.body.classList.add(`section-${section}`)
			});
		});
	}

	// 섹션 활성화 설정 실행
	setupSectionActivation();

	definesAni
		// left-box 컨테이너를 오른쪽에서 왼쪽으로 슬라이드인
		.to('.defines .left-box', {
			left: '0%',
			duration: 0.8,
			ease: 'power2.out',
		}, 'go')
		// 'what defines us' 텍스트와 상하단 hr slide in 애니메이션 - 별도 라벨로 구분
		.to('.defines .right-box .top-hr', {
			x: '0%',
			opacity: 1,
			duration: 0.8,
			ease: 'power2.out'
		}, 'text-in')
		.to('.defines .right-box .title-text', {
			x: '0%',
			opacity: 1,
			duration: 0.8,
			ease: 'power2.out'
		}, 'text-in+=0.1')
		.to('.defines .right-box .second-hr', {
			x: '0%',
			opacity: 1,
			duration: 0.8,
			ease: 'power2.out'
		}, 'text-in+=0.2')
		.to('.defines .right-box .bottom-hr', {
			x: '0%',
			opacity: 1,
			duration: 0.8,
			ease: 'power2.out'
		}, 'text-in+=0.2')
		// Animation for ul.x-left - right to left slide
		.to('.defines .left-box ul.x-left', {
			x: 0,
			opacity: 1,
			duration: 0.8,
			ease: 'power2.out',
			onStart: function () {
				$('.defines .left-box ul.x-left').addClass('visible');
			}
		}, '>+0.1')
		// Animation for bottom-texts.y-down - bottom to top slide 
		.to('.defines .left-box .bottom-texts.y-down', {
			y: 0,
			opacity: 1,
			duration: 0.8,
			ease: 'power2.out',
			onStart: function () {
				$('.defines .left-box .bottom-texts.y-down').addClass('visible');
			}
		}, '<')
		// Other animations preserved
		.to('.defines .left-box .x-left:not(ul)', {
			x: 0,
			opacity: 1,
			duration: 0.8,
			onStart: function () {
				$('.defines .left-box .x-left:not(ul)').addClass('visible');
			}
		}, '<')
		.to('.defines .left-box .y-up', {
			y: 0,
			opacity: 1,
			duration: 0.8,
			onStart: function () {
				$('.defines .left-box .y-up').addClass('visible');
			}
		}, '<')
		.to('.defines .left-box .y-down:not(.bottom-texts)', {
			y: 0,
			opacity: 1,
			duration: 0.8,
			onStart: function () {
				$('.defines .left-box .y-down:not(.bottom-texts)').addClass('visible');
			}
		}, '<')
		.to('.defines .text-box .text hr', { x: 0 }, '>+0.1');

	for (let i = 1; i <= 4; i++) {
		const current = `.defines .text-box .text${i}`;
		const currentLi = `.defines .left-box ul li:nth-child(${i})`;
		if (i > 1) {
			const prev = `.defines .text-box .text${i - 1}`;

			definesAni
				.to(`${prev} h4`, { x: '-100%', duration: 0.6, ease: 'power2.inOut' }, '>')
				.to(`${prev} p`, { x: '-100%', duration: 0.6, ease: 'power2.inOut' }, '<')
				.to(`${prev} span`, { opacity: 0, duration: 0.3 }, '<')
		}

		definesAni
			.to(`${current} h4`, { x: 0, duration: 0.6, ease: 'power2.inOut' }, '>')
			.to(`${current} p`, { x: 0, duration: 0.6, ease: 'power2.inOut' }, '<')
			.to(`${current} span`, { opacity: 1, duration: 0.3 }, '<')
			.to({}, {
				duration: 0.2,
				onStart: () => {
					// 모든 항목에서 클래스 제거
					document.querySelectorAll('.defines .left-box ul li').forEach(li => {
						li.classList.remove('on');
					});

					// 현재 항목에 클래스 추가
					const currentElement = document.querySelector(currentLi);
					if (currentElement) {
						currentElement.classList.add('on');
					}
				},
				onReverseComplete: () => {
					document.querySelectorAll('.defines .left-box ul li').forEach(li => li.classList.remove('on'));
					document.querySelector(currentLi)?.classList.add('on');
				}
			}, '<');

		if (i === 3) {
			// HR 태그 슬라이드 아웃 애니메이션을 제거
			// definesAni.to('.defines .text-box .text hr', { x: '-100%', duration: 0.6, ease: 'power2.inOut' }, '<');
		}
		if (i === 4) {
			// 포트폴리오 섹션 직전에 HR 태그 슬라이드 아웃 애니메이션 추가
			definesAni.to('.defines .text-box .text hr', { x: '-100%', duration: 0.6, ease: 'power2.inOut' }, '<');

			// 포트폴리오 텍스트(LET US SHOW YOU WHAT WE'RE MADE OF. KEEP UP :)가 왼쪽으로 슬라이드 아웃
			definesAni.to('.defines .text-box .text4 h4', {
				x: '-100%',
				duration: 0.8,
				ease: 'power2.inOut'
			}, '>');

			// 애니메이션이 끝나면 right-box도 슬라이드 아웃 되도록 추가
			definesAni.to('.defines .right-box', {
				x: '-100%',
				opacity: 0,
				duration: 0.8,
				ease: 'power2.inOut'
			}, '>')

			// left-box 너비 감소 애니메이션 추가
			definesAni.to('.defines .left-box', {
				width: '520px',
				height: 'calc(60vh)',  // 화면 높이의 60%로 설정
				top: '40px',           // 상단 위치 유지
				bottom: 'auto',        // 바닥 위치는 자동 조정
				left: '0',             // 왼쪽 위치 유지
				padding: '40px 0',     // 패딩 줄이기
				duration: 0.8,
				ease: 'power3.inOut',
				onUpdate: function () {
					// 내부 요소들도 비례하여 줄어들도록 scale 계산
					const leftBox = document.querySelector('.defines .left-box');
					if (leftBox) {
						const progress = definesAni.progress();
						const symbolEl = document.querySelector('.defines .left-box .symbol');
						const topTextsEl = document.querySelector('.defines .left-box .top-texts');
						const bottomTextsEl = document.querySelector('.defines .left-box .bottom-texts');
						const menuItems = document.querySelectorAll('.defines .left-box ul li');
						const menuEl = document.querySelector('.defines .left-box ul');

						// 실제 너비에 기반한 scale 계산 (더 정확)
						const scale = leftBox.offsetWidth / (window.innerWidth * 0.5);
						const scaleFactor = Math.max(0.6, Math.min(1, scale)); // 최소 60%, 최대 100%

						// 내부 요소들에 scale 적용
						if (symbolEl) {
							// symbol은 항상 left-box 중앙에 위치하도록
							symbolEl.style.transform = `translate(-50%, -50%) scale(${scaleFactor})`;
						}

						if (topTextsEl) {
							topTextsEl.style.transform = `scale(${scaleFactor})`;
						}

						if (bottomTextsEl) {
							bottomTextsEl.style.transform = `scale(${scaleFactor})`;
						}

						// 메뉴 위치 및 크기 조정
						if (menuEl) {
							const menuOffset = 40 * scaleFactor;
							menuEl.style.top = menuOffset + 'px';
							menuEl.style.transform = `scale(${Math.max(0.85, scaleFactor)})`;
						}

						// 메뉴 폰트 크기 조정
						menuItems.forEach(item => {
							if (item.classList.contains('on')) {
								item.style.fontSize = 2.4 * scaleFactor + 'rem';
							} else {
								item.style.fontSize = 1.6 * scaleFactor + 'rem';
							}
						});
					}
				},
				// 역방향 애니메이션이 완료될 때 초기 상태로 복원
				onReverseComplete: function () {
					// 모든 요소를 원래 상태로 복원
					const symbolEl = document.querySelector('.defines .left-box .symbol');
					const topTextsEl = document.querySelector('.defines .left-box .top-texts');
					const bottomTextsEl = document.querySelector('.defines .left-box .bottom-texts');
					const menuItems = document.querySelectorAll('.defines .left-box ul li');
					const menuEl = document.querySelector('.defines .left-box ul');

					// CSS 기본값으로 초기화
					if (symbolEl) symbolEl.style.transform = 'translate(-50%, -50%)';
					if (topTextsEl) topTextsEl.style.transform = '';
					if (bottomTextsEl) bottomTextsEl.style.transform = '';
					if (menuEl) {
						menuEl.style.top = '40px';
						menuEl.style.transform = '';
					}

					// 메뉴 아이템 폰트 크기 복원
					menuItems.forEach(item => {
						item.style.fontSize = '';
					});
				}
			}, '>')

			definesAni.to('.defines .inner', { className: 'inner off', duration: 0.6 }, '>');
		}

		// 각 항목 사이에 약간의 지연 추가 (브레이크 포인트 역할)
		if (i < 4) {
			definesAni.to({}, { duration: 0.5 }, '>');
		}
	}

	ScrollTrigger.create({
		trigger: '.defines',
		animation: definesAni,
		pin: '.defines',
		start: 'top top',
		end: '+=' + (pinDistance * 3), // 스크롤 거리 증가로 더 자연스러운 전환
		scrub: 1, // 스크롤 속도 완화
		anticipatePin: 1,
		pinSpacing: false // 핀 고정된 요소에 대한 여백 제거
	});

	// stacked 섹션이 defines 섹션을 자연스럽게 덮도록 초기 스타일 설정
	document.addEventListener('DOMContentLoaded', function () {
		const stackedSection = document.querySelector('.stacked');
		if (stackedSection) {
			// z-index를 설정하여 defines 섹션 위에 위치하도록 함
			stackedSection.style.position = 'relative';
			stackedSection.style.zIndex = '10';
		}
	});

	/* ------------------------------------------------------------------
	   Contact Image Animation
	   ------------------------------------------------------------------ */
	function setupContactImageAnimation() {
		const leftImage = document.querySelector('.contact-image .left-image');
		const rightImage = document.querySelector('.contact-image .right-image');
		const contactText = document.querySelector('.contact-text');
		const contactMarquee = document.querySelector('.contact-image .marquee-top');
		const verticalSlide = document.querySelector('.contact-image .vertical-slide');

		if (!leftImage || !rightImage) return;

		// 마키 애니메이션 초기 상태 설정
		if (contactMarquee) {
			gsap.set(contactMarquee, { opacity: 0, x: '-100%' });
		}

		// vertical slide 초기 설정
		if (verticalSlide) {
			gsap.set(verticalSlide, {
				y: '100%',
				opacity: 0
			});
		}

		// Remove fade-in for rightImage and marquee; set their initial opacities to 1
		if (rightImage) {
			// Keep it off-screen to the right but fully opaque
			gsap.set(rightImage, { opacity: 0, x: 50 });
		}
		if (contactMarquee) {
			gsap.set(contactMarquee, { opacity: 0 });
		}

		// Pin the entire contact-image section
		ScrollTrigger.create({
			trigger: '.contact-image',
			start: 'top top',
			end: 'bottom top',
			pin: true,
			pinSpacing: true,
			onEnter: () => {
				// 섹션 진입 시 실행되는 콜백
			},
			markers: false
		});

		// Create animations for image expansion and text reveal
		// that happen at different scroll positions while section is pinned
		const contactTimeline = gsap.timeline({
			scrollTrigger: {
				trigger: '.contact-image',
				start: 'top top',
				end: 'bottom top',
				scrub: true,
				markers: false
			}
		});

		// Set initial state for middle-box
		const middleBox = document.querySelector('.contact-image .middle-box');
		if (middleBox) {
			gsap.set(middleBox, { opacity: 0, x: '-100%' });
		}

		// Add animations to the timeline in the new order
		contactTimeline
			// Expand the left image at the beginning of the timeline
			.to(leftImage, {
				width: '48%',
				duration: 0.3,
				onStart: () => {
					leftImage.classList.add('expanded');
				},
				onReverseComplete: () => {
					leftImage.classList.remove('expanded');
				}
			})
			// 1. Show the contact text first
			.to(contactText, {
				right: '0%',
				duration: 0.3,
				onStart: () => {
					contactText.classList.add('visible');
				},
				onReverseComplete: () => {
					contactText.classList.remove('visible');
				}
			})
			// Add a small delay
			.to({}, { duration: 0.1 })
			// 2. Fade in the right image
			.to(rightImage, {
				x: 0,
				opacity: 1,
				duration: 0.3,
				onStart: () => {
					rightImage.classList.add('visible');
				},
				onReverseComplete: () => {
					rightImage.classList.remove('visible');
				}
			})
			// 3. Show vertical slide
			.to(verticalSlide, {
				y: 0,
				opacity: 1,
				duration: 0.3,
				onStart: () => {
					verticalSlide.classList.add('on');
					// 애니메이션 설정
					gsap.to('.contact-image .to-up .inner', {
						y: '-50%',
						duration: 30,
						repeat: -1,
						ease: 'none'
					});
				}
			})
			// 4. Fade in the marquee animation (opacity already 1, only init)
			.to(contactMarquee, {
				opacity: 1,
				x: 0,
				duration: 0.4,
				ease: 'power2.out',
				onStart: () => {
					// 마키 초기화 호출 (no fade)
					initContactMarquee();
				}
			})
			// 5. Show the middle box last (slide in from left)
			.to(middleBox, {
				x: 0,
				opacity: 1,
				duration: 0.3,
				onStart: () => {
					middleBox.classList.add('visible');
				}
			});
	}

	// 마키 애니메이션 함수 추가
	function initContactMarquee() {
		const marquees = document.querySelectorAll('.contact-image .text-marquee');
		if (!marquees.length) return;

		// 원하는 단어들을 자유롭게 추가/수정하면 됨
		const WORDS = [
			'CONTACT', 'SEOVEREIGN', 'MESSAGE', 'REACH OUT', 'CONNECT',
			'HELLO', 'WELCOME', 'INQUIRY', 'SUPPORT', 'TEAM',
			'PARTNERSHIP', 'COLLABORATION', 'QUESTIONS', 'ANSWERS', 'HELP',
			'EMAIL', 'CALL', 'VISIT', 'MEET', 'DISCUSS'
		];

		marquees.forEach(marquee => {
			const container = marquee.querySelector('.text-marquee-inner');
			if (!container) return;

			container.innerHTML = ''; // 내용 초기화

			const containerWidth = marquee.offsetWidth;
			const containerHeight = marquee.offsetHeight || 100;

			const WORD_COUNT = 40; // Increased word count from 10 to 20
			for (let i = 0; i < WORD_COUNT; i++) {
				const word = document.createElement('span');
				word.className = 'text-item';
				word.textContent = WORDS[Math.floor(Math.random() * WORDS.length)];

				const minSize = 1.5, maxSize = 3;
				const size = (Math.random() * (maxSize - minSize) + minSize).toFixed(1);
				word.style.fontSize = size + 'rem';
				word.style.opacity = (Math.random() * 0.7 + 0.3).toFixed(2);
				word.style.fontWeight = '700';
				word.style.position = 'absolute';
				word.style.whiteSpace = 'nowrap';
				const randY = Math.random() * (containerHeight - (size * 16 * 0.8)); // Adjust Y based on font size
				word.style.top = randY + 'px';
				container.appendChild(word);

				const wordWidth = word.offsetWidth || 100;
				const startX = -wordWidth - Math.random() * containerWidth * 0.5; // Adjusted start
				const endX = containerWidth + Math.random() * 100 + 100; // Adjusted end
				const distance = endX - startX;
				const speedPxPerSec = gsap.utils.random(30, 80);
				const dur = distance / speedPxPerSec;
				const delay = gsap.utils.random(0, 3);

				gsap.fromTo(word, { x: startX }, {
					x: endX,
					duration: dur,
					delay: delay,
					ease: 'none',
					repeat: -1,
					force3D: true
				});
			}
		});
	}

	// Initialize the contact image animation
	setupContactImageAnimation();

	// img to svg
	document.querySelectorAll('img.svg').forEach(function (img) {
		var imgID = img.id;
		var imgClass = img.className;
		var imgURL = img.src;

		fetch(imgURL).then(function (response) {
			return response.text();
		}).then(function (text) {
			var parser = new DOMParser();
			var xmlDoc = parser.parseFromString(text, "text/xml");
			var svg = xmlDoc.getElementsByTagName('svg')[0];
			if (typeof imgID !== 'undefined') {
				svg.setAttribute('id', imgID);
			}
			if (typeof imgClass !== 'undefined') {
				svg.setAttribute('class', imgClass + ' replaced-svg');
			}
			svg.removeAttribute('xmlns:a');
			if (!svg.getAttribute('viewBox') && svg.getAttribute('height') && svg.getAttribute('width')) {
				svg.setAttribute('viewBox', '0 0 ' + svg.getAttribute('height') + ' ' + svg.getAttribute('width'))
			}
			img.parentNode.replaceChild(svg, img);
		});
	});

	///////////////////////////////////////////////
	// Stacked section chart preview hover effect
	///////////////////////////////////////////////
	const previewFigure = document.querySelector('.chart-preview');
	const currentImg = previewFigure?.querySelector('.current-image');
	const nextImg = previewFigure?.querySelector('.next-image');

	if (previewFigure && currentImg && nextImg) {
		const stackedItems = document.querySelectorAll('.stacked .stack-list li');
		const stackedSection = document.querySelector('.stacked');

		// Helper to show image with layered scale-in transition
		const showPreview = (src) => {
			// Show container
			previewFigure.classList.add('visible');

			// If first load, hide base current image until first zoom completes
			if (!currentImg.src) {
				gsap.set(currentImg, { opacity: 0 });
			}

			// Create a fresh img element for this zoom so overlaps are possible
			const tempImg = document.createElement('img');
			tempImg.className = 'zoom-img';
			tempImg.src = src;
			previewFigure.querySelector('.image-container').appendChild(tempImg);

			// Prepare initial state
			gsap.set(tempImg, { scale: 0, opacity: 1, transformOrigin: 'center center' });

			// When image fully loads, animate
			tempImg.onload = () => {
				gsap.to(tempImg, {
					scale: 1,
					duration: 0.9,
					ease: 'power3.out',
					onComplete: () => {
						// Set as new background
						currentImg.src = src;
						gsap.set(currentImg, { opacity: 1 });

						// Fade out and remove temp image to cleanup
						gsap.to(tempImg, {
							opacity: 0,
							duration: 0.3,
							onComplete: () => tempImg.remove(),
						});
					},
				});
			};
		};

		// Helper to hide preview
		const hidePreview = () => {
			previewFigure.classList.remove('visible');
			// Reset images state so that next showPreview starts clean
			gsap.set([currentImg, nextImg], { opacity: 0 });
		};

		// util to mark active item
		const setActiveItem = (idx) => {
			stackedItems.forEach((it, i) => {
				if (i === idx) {
					it.classList.add('centered');
				} else {
					it.classList.remove('centered');
				}
			});
		};

		// NEW: Ensure zoom-in triggers even on fast scroll using ScrollTrigger per item
		stackedItems.forEach((item, index) => {
			ScrollTrigger.create({
				trigger: item,
				// Trigger when item center passes 60% (from top) of viewport when scrolling down
				start: "center 60%",
				// Trigger when item center passes 40% (from top) of viewport when scrolling up
				end: "center 40%",
				onToggle: (self) => {
					if (self.isActive) {
						const indexStr = String(index + 1).padStart(2, '0');
						const imgSrc = `./images/img_chart_${indexStr}.png`;
						showPreview(imgSrc);
						setActiveItem(index);
					}
				}
			});
		});

		// Hide preview when leaving stacked section entirely
		ScrollTrigger.create({
			trigger: stackedSection,
			start: 'top bottom',
			end: 'bottom top',
			onLeave: hidePreview,
			onLeaveBack: hidePreview,
		});
	}

	// Add click functionality to stack items
	function setupStackedClickEvents() {
		const stackItems = document.querySelectorAll('.stacked .stack-list li');
		const links = [
			'https://www.tradingview.com/chart/BTCUSDT/Gun52pQy/',
			'https://www.tradingview.com/chart/BTCUSDT/yKahV5QT/',
			'https://kr.tradingview.com/chart/BTCUSDT/vsj1FgzR/',
			'https://kr.tradingview.com/chart/BTCUSDT/ztFqkB5H/',
			'https://www.tradingview.com/chart/BTCUSDT/fqcC93vJ/',
			'https://www.tradingview.com/chart/ETHUSDT/C1RWt9fF/',
			'https://www.tradingview.com/chart/SOLUSDT/p557TVSo/',
			'https://kr.tradingview.com/chart/BTCUSDT/xs1X0Qnd/',
			'https://www.tradingview.com/chart/ANIMEUSDT/fvQDXtst/',
			'https://kr.tradingview.com/chart/XRPUSDT/Hh1S7Tbz/'
		];

		stackItems.forEach((item, index) => {
			if (index < links.length) {
				// Add data attribute for styling purposes
				item.setAttribute('data-link', links[index]);

				// Add click event listener
				item.addEventListener('click', (e) => {
					e.preventDefault();
					window.open(links[index], '_blank');
				});

				// Add cursor pointer styling
				item.style.cursor = 'pointer';
			}
		});
	}

	// Call the function to setup click events
	setupStackedClickEvents();
})