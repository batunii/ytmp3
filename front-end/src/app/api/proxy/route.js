// For Next.js App Router: /app/api/proxy/[...path]/route.js
export async function GET(request, { params }) {
    const { path } = params;
    const url = `http://192.168.133.195:8080/${path.join('/')}${request.url.includes('?') ? '?' + request.url.split('?')[1] : ''}`;
    
    const response = await fetch(url);
    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  }
  
  export async function POST(request, { params }) {
    // Similar implementation for POST requests
  }