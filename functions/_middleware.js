// Global lock state (in-memory, resets on redeploy but works)
let IS_LOCKED = false;

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // ===== ADMIN CONTROL =====
  if (url.pathname === "/admin-control") {
    const action = url.searchParams.get("do");
    
    if (action === "lock") {
      IS_LOCKED = true;
      return new Response("LOCKED - All users blocked", {
        headers: { "Content-Type": "text/plain" }
      });
    }
    
    if (action === "unlock") {
      IS_LOCKED = false;
      return new Response("UNLOCKED - All users allowed", {
        headers: { "Content-Type": "text/plain" }
      });
    }
    
    if (action === "status") {
      return new Response(IS_LOCKED ? "LOCKED" : "UNLOCKED", {
        headers: { "Content-Type": "text/plain" }
      });
    }
    
    return new Response("Use ?do=lock, unlock, or status");
  }
  
  // ===== CHECK LOCK STATE =====
  if (IS_LOCKED) {
    // Simple lock page
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Classroom Locked</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 100px 20px;
            background: #f0f0f0;
          }
          .box {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            max-width: 500px;
            margin: 0 auto;
          }
          h1 {
            color: red;
            margin-bottom: 20px;
          }
          p {
            color: #333;
            font-size: 18px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h1> EXAM LOCKED</h1>
          <p>This exam is temporarily locked by the teacher.</strong></p>
                    <p style="color: #666; margin-top: 30px;"></p>
        </div>
        <script>
          // Auto-refresh
          setTimeout(() => location.reload(), 10000);
        </script>
      </body>
      </html>
    `, {
      status: 403,
      headers: { "Content-Type": "text/html" }
    });
  }
  
  // ===== NORMAL ACCESS =====
  return next();
}
