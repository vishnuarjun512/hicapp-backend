export const BodyReader = async(req) => {
    let body = "";

    for await (const chunk of req) {
      body += chunk;
    }

    const data = JSON.parse(body);
    return data;
}