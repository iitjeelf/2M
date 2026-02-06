// middleware.js - KV Storage Version
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const hostname = url.hostname;
  
  // KV namespace - bound in Cloudflare Dashboard
  const KV = env.CLASS_STATES;
  
  // === ADMIN CONTROL ===
  if (url.pathname === "/admin-control") {
    const action = url.searchParams.get("do");
    
    // LOCK
    if (action === "lock") {
      try {
        await KV.put(hostname, "LOCKED");
        return new Response("LOCKED", {
          headers: { 
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response("ERROR", { status: 500 });
      }
    }
    
    // UNLOCK
    if (action === "unlock") {
      try {
        await KV.put(hostname, "UNLOCKED");
        return new Response("UNLOCKED", {
          headers: { 
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response("ERROR", { status: 500 });
      }
    }
    
    // STATUS
    if (action === "status") {
      try {
        const state = await KV.get(hostname);
        return new Response(state === "LOCKED" ? "LOCKED" : "UNLOCKED", {
          headers: { 
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response("ERROR", { status: 500 });
      }
    }
    
    return new Response("Use ?do=lock, unlock, or status");
  }
  
  // === CHECK IF LOCKED ===
  try {
    const state = await KV.get(hostname);
    if (state === "LOCKED") {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Class Locked</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 50px;
              background: linear-gradient(135deg, #ff6b6b 0%, #c62828 100%);
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
            }
            .lock-box {
              background: white;
              padding: 40px;
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.3);
              border: 4px solid red;
              max-width: 500px;
            }
            h1 { color: red; }
          </style>
        </head>
        <body>
          <div class="lock-box">
            <h1>🔒 EXAM LOCKED </h1>
            <p><strong>This EXAM is locked by the teacher.</strong></p>
                     </div>
        </body>
        </html>
      `, { 
        status: 403,
        headers: { "Content-Type": "text/html" }
      });
    }
  } catch (error) {
    // If KV fails, allow access
    console.error("KV error:", error);
  }
  
  // === NORMAL ACCESS ===
  return next();
}
