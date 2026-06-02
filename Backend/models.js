import axios from "axios";
import fs from "fs/promises";

(async () => {
    try {
        const response = await axios.get("https://integrate.api.nvidia.com/v1/models", {
            headers: {
                "Authorization": "Bearer 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"
            }
        });
        const models = response.data.data;
        const llamaModels = models.filter(m => m.id.includes("llama")).map(m => m.id);
        await fs.writeFile("llama_models.json", JSON.stringify(llamaModels, null, 2));
        console.log("Wrote llama_models.json");
    } catch (e) {
        console.error(e);
    }
})();
