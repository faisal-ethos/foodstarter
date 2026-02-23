import { useEffect, useRef } from "react";

export function MatrixRain() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas size
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		// Matrix characters - katakana, latin letters, numbers
		const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";
		const charArray = chars.split("");

		const fontSize = 14;
		const columns = canvas.width / fontSize;

		// Array to track y position of each column
		const drops: number[] = [];
		for (let i = 0; i < columns; i++) {
			drops[i] = Math.random() * -100;
		}

		function draw() {
			if (!ctx || !canvas) return;

			// Semi-transparent black to create fade effect
			ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Green text
			ctx.fillStyle = "#00FF00";
			ctx.font = `${fontSize}px monospace`;

			// Draw characters
			for (let i = 0; i < drops.length; i++) {
				const char = charArray[Math.floor(Math.random() * charArray.length)];
				const x = i * fontSize;
				const y = drops[i] * fontSize;

				ctx.fillText(char, x, y);

				// Reset drop to top randomly
				if (y > canvas.height && Math.random() > 0.975) {
					drops[i] = 0;
				}

				drops[i]++;
			}
		}

		const interval = setInterval(draw, 33);

		// Handle window resize
		const handleResize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		window.addEventListener("resize", handleResize);

		return () => {
			clearInterval(interval);
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="fixed inset-0 pointer-events-none opacity-20"
			style={{ zIndex: 0 }}
		/>
	);
}
