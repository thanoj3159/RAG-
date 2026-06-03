async function run() {
    try {
        console.log("Sending first request...");
        let res = await fetch("http://localhost:3002/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "hi my name is thanoj" })
        });

        let text1 = "";
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            text1 += decoder.decode(value);
        }
        console.log("Response 1:", text1);

        console.log("Sending second request...");
        let res2 = await fetch("http://localhost:3002/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "what is my name?" })
        });
        let text2 = "";
        const reader2 = res2.body.getReader();
        const decoder2 = new TextDecoder();
        while (true) {
            const { done, value } = await reader2.read();
            if (done) break;
            text2 += decoder2.decode(value);
        }
        console.log("Response 2:", text2);
    } catch (e) { console.error(e); }
}
run();
