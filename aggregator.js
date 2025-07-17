function extractCommentBodies(commentNodes, commentsArray) {
  if (!Array.isArray(commentNodes)) {
    return;
  }

  for (const node of commentNodes) {
    if (node.kind === "t1" && node.data && node.data.body) {
      if (node.data.body !== "[deleted]" && node.data.body !== "[removed]") {
        commentsArray.push(node.data.body);
      }
    }

    if (node.data?.replies?.data?.children) {
      extractCommentBodies(node.data.replies.data.children, commentsArray);
    }
  }
}

export async function aggregate(links) {
  const allComments = [];

  for (const link of links) {
    try {
      const response = await fetch(link, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
        }
      });

      if (!response.ok) {
        continue;
      }

      const parsedData = await response.json();
      const topLevelComments = parsedData[1]?.data?.children;

      if (topLevelComments) {
        extractCommentBodies(topLevelComments, allComments);
      } else {
      }
    } catch (error) {}
  }

  return allComments.join("\n\n---\n\n");
}
