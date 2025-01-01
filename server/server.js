const express = require("express");
const path = require("path");
const app = express();

const distFolder = path.join(__dirname);

// 1. Віддаємо статичні файли з dist
app.use(express.static(distFolder));

// 2. Будь-які інші маршрути -> index.html
app.get("*", (req, res) => {
	res.sendFile(path.join(distFolder, "index.html"));
});

const PORT = process.env.PORT || 4200;
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
