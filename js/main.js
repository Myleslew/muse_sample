
window.onload = () => {
	const SECONDS = 0.25;
	const BUFFER_SIZE = SECONDS * 256;
	const WEIGHT = 0.95;

	let buffer = new Array();
	let weighted = {
		alpha: -1,
		beta: -1,
		theta: -1,
		gamma: -1,
		engagement: -1
	};

	window.Device = new BCIDevice({
		dataHandler: data => {
			data.data.forEach(el => {
				if (buffer.length > BUFFER_SIZE) buffer.shift();
				buffer.push(el);
			});

			if (buffer.length < BUFFER_SIZE) return;
			console.log(buffer)

			let psd = window.bci.signal.getPSD(BUFFER_SIZE, buffer);

			let alpha = window.bci.signal.getBandPower(BUFFER_SIZE, psd, 256, "alpha");
			let beta  = window.bci.signal.getBandPower(BUFFER_SIZE,psd, 256, "beta");
			let theta = window.bci.signal.getBandPower(BUFFER_SIZE,psd, 256, "theta");
			let gamma = window.bci.signal.getBandPower(BUFFER_SIZE,psd, 256, "gamma");
			let engagement = beta / (alpha + theta);
			let sum = alpha + beta + theta + gamma;

			let w_alpha = alpha / sum;
			let w_beta = beta / sum;
			let w_theta = theta / sum;
			let w_gamma = gamma / sum;

			if (weighted.alpha < 0) {
				weighted.alpha = w_alpha || 0;
				weighted.beta = w_beta || 0;
				weighted.theta = w_theta || 0;
				weighted.gamma = w_gamma || 0;
				weighted.engagement = engagement || 0;
			} else {
				weighted.alpha = weighted.alpha * WEIGHT + (w_alpha || 0) * (1 - WEIGHT);
				weighted.beta =  weighted.beta  * WEIGHT + (w_beta  || 0)  * (1 - WEIGHT);
				weighted.theta = weighted.theta * WEIGHT + (w_theta || 0) * (1 - WEIGHT);
				weighted.gamma = weighted.gamma * WEIGHT + (w_gamma || 0) * (1 - WEIGHT);
				weighted.engagement = weighted.engagement * WEIGHT + (engagement || 0) * (1 - WEIGHT);
			}

			// if (window.gameInstance.__ready == true) {
			// 	window.gameInstance.SendMessage("Drone", "SetSpeed", (weighted.gamma/weighted.alpha));
			// 	dataManager.bands = weighted;
			// 	// console.log((weighted.gamma/weighted.alpha));

			// 	document.getElementById("pre-start").style.display = "none";
			// 	document.getElementById("footer").style.display = "flex";
			// }
		},
		statusHandler: status => {
			console.log(status)
		},
		connectionHandler: connected => {
			if (!connected) {
				alert("Device connection lost. Please reconnect.")
				window.location.reload()
			}else{
				console.log('connected!')
			}
		}
	});

	let connect = async() => {
		try {
			console.log('here')
			await window.Device.connect();
		} catch (e) {
			console.log("connect/load error. retrying...");
			connect();
		}
	}

	window.addEventListener("keydown", (e) => {
		setTimeout(() => {
			if (window.started && !dataManager.running) {
				dataManager.running = true;
				dataManager.startTimer();
			}
		}, 1000);
	});

	// document.getElementById("gameContainer").addEventListener("click", (e) => {
	// 	setTimeout(() => {
	// 		if (window.started && !dataManager.running) {
	// 			dataManager.running = true;
	// 			dataManager.startTimer();
	// 		}
	// 	}, 1000);
	// });

	var el = document.getElementById("connect")
	if(el) {
		el.addEventListener('click', connect)
	}

	// $("#submit").on("click", () => {
	// 	if (dataManager.roundNumber > 1) {
	// 		dataManager.writeUserData(fb, localStorage.getItem("name"));
	// 	} else {
	// 		Swal.fire({
	// 			title: 'Sorry!',
	// 			text: 'You have not completed any rounds yet. Your score cannot be submitted.',
	// 			type: 'error',
	// 			confirmButtonText: 'OK'
	// 		});
	// 	}
	// });

	// $("#fullscreen").on("click", () => {
	// 	window.gameInstance.SetFullscreen(1);
	// });

	// $("#plot-button").on("click", () => {
	// 	Swal.fire({
	// 		title: '<strong>EEG Plot</strong>',
	// 		type: 'info',
	// 		html: '<div id="plot"></div>',
	// 		showCloseButton: true,
	// 		focusConfirm: false,
	// 		confirmButtonText:
	// 			'OK!',
	// 		onClose: () => {
	// 			dataManager.popup = false;
	// 		}
	// 	});

	// 	dataManager.popup = true;

	// 	var y_eeg_data = {
	// 		type: 'bar',
	// 		x: ["Alpha", "Beta", "Theta", "Gamma"],
	// 		y: [0, 0, 0, 0],
	// 		marker: {
	// 			color: '#C8A2C8',
	// 		}
	// 	};
	// 	Plotly.newPlot('plot', [y_eeg_data]);
	// });

	// $("#instructions-btn").on("click", () => {
	// 	Swal.fire({
	// 		title: '<strong>Instructions</strong>',
	// 		type: 'info',
	// 		html: 'Start by pressing "Connect", select your Muse device, then press any key to start the simulator!',
	// 		showCloseButton: true,
	// 		focusConfirm: false,
	// 		confirmButtonText:
	// 			'OK!'
	// 	});
	// });
}