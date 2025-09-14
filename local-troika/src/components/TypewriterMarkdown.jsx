import React, { useState, useEffect, useRef } from "react";

const TypewriterMarkdown = ({ text, onComplete, speed = 20 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Function to parse markdown and create segments with their types
  const parseMarkdown = (text) => {
    const segments = [];
    const lines = text.split("\n");
    let charPosition = 0;

    lines.forEach((line, lineIndex) => {
      // Add newline character for all lines except the first
      if (lineIndex > 0) {
        segments.push({
          type: "newline",
          content: "\n",
          start: charPosition,
          end: charPosition + 1,
        });
        charPosition += 1;
      }

      const trimmedLine = line.trim();

      // Check for bullet points (*, -, +)
      const bulletMatch = trimmedLine.match(/^[\*\-\+]\s+(.+)$/);
      if (bulletMatch) {
        segments.push({
          type: "list-item",
          content: bulletMatch[1],
          bullet: trimmedLine[0],
          start: charPosition,
          end: charPosition + bulletMatch[1].length,
        });
        charPosition += bulletMatch[1].length;
        return;
      }

      // Check for numbered lists
      const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (numberedMatch) {
        segments.push({
          type: "numbered-item",
          content: numberedMatch[1],
          number: numberedMatch[0].match(/^(\d+)\./)[1],
          start: charPosition,
          end: charPosition + numberedMatch[1].length,
        });
        charPosition += numberedMatch[1].length;
        return;
      }

      // Process regular text with inline markdown
      if (line.length > 0) {
        const inlineSegments = parseInlineMarkdown(line, charPosition);
        segments.push(...inlineSegments);
        // Update charPosition based on the actual content length (excluding markdown syntax)
        const contentLength = line
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
          .replace(/`(.*?)`/g, "$1").length;
        charPosition += contentLength;
      }
    });

    return segments;
  };

  // Function to parse inline markdown (bold, italic, links, code)
  const parseInlineMarkdown = (text, startOffset = 0) => {
    const segments = [];
    let currentPos = 0;

    // Regex patterns for different markdown elements - ordered by priority
    const patterns = [
      { type: "bold", regex: /\*\*(.*?)\*\*/g },
      { type: "italic", regex: /(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)/g }, // Negative lookbehind/lookahead to avoid bold conflicts
      { type: "link", regex: /\[(.*?)\]\((.*?)\)/g },
      { type: "code", regex: /`(.*?)`/g },
    ];

    const matches = [];

    // Find all markdown patterns
    patterns.forEach((pattern) => {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          type: pattern.type,
          start: match.index,
          end: match.index + match[0].length,
          full: match[0],
          content: match[1],
          url: match[2], // for links
        });
      }
    });

    // Remove overlapping matches (keep the first one found)
    const filteredMatches = [];
    matches.forEach((match) => {
      const hasOverlap = filteredMatches.some(
        (existing) => match.start < existing.end && match.end > existing.start
      );
      if (!hasOverlap) {
        filteredMatches.push(match);
      }
    });

    // Sort matches by position
    filteredMatches.sort((a, b) => a.start - b.start);

    // Create segments
    filteredMatches.forEach((match) => {
      // Add text before this match
      if (match.start > currentPos) {
        segments.push({
          type: "text",
          content: text.slice(currentPos, match.start),
          start: startOffset + currentPos,
          end: startOffset + match.start,
        });
      }

      // Add the markdown element
      segments.push({
        type: match.type,
        content: match.content,
        full: match.full,
        url: match.url,
        start: startOffset + match.start,
        end: startOffset + match.end,
      });

      currentPos = match.end;
    });

    // Add remaining text
    if (currentPos < text.length) {
      segments.push({
        type: "text",
        content: text.slice(currentPos),
        start: startOffset + currentPos,
        end: startOffset + text.length,
      });
    }

    // If no matches found, return the entire text as a single segment
    if (filteredMatches.length === 0) {
      return [
        {
          type: "text",
          content: text,
          start: startOffset,
          end: startOffset + text.length,
        },
      ];
    }

    return segments;
  };

  // Get the visible content based on current typing position
  const getVisibleContent = (segments, targetLength) => {
    let currentLength = 0;
    const visibleSegments = [];

    for (const segment of segments) {
      if (segment.type === "newline") {
        if (currentLength < targetLength) {
          visibleSegments.push(segment);
          currentLength += 1;
        }
        continue;
      }

      const segmentContentLength = segment.content.length;
      const segmentStart = currentLength;
      const segmentEnd = currentLength + segmentContentLength;

      if (targetLength <= segmentStart) {
        break; // We haven't reached this segment yet
      }

      if (targetLength >= segmentEnd) {
        // Entire segment is visible
        visibleSegments.push(segment);
        currentLength = segmentEnd;
      } else {
        // Partial segment is visible
        const partialLength = targetLength - segmentStart;
        visibleSegments.push({
          ...segment,
          content: segment.content.substring(0, partialLength),
          partial: true,
        });
        break;
      }
    }

    return visibleSegments;
  };

  // Render the segments as JSX
  const renderSegments = (segments) => {
    return segments.map((segment, index) => {
      switch (segment.type) {
        case "bold":
          return <strong key={index}>{segment.content}</strong>;
        case "italic":
          return <em key={index}>{segment.content}</em>;
        case "link":
          return (
            <a
              key={index}
              href={segment.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#1e90ff",
                textDecoration: "none",
                transition: "all 0.2s ease-in-out",
              }}
            >
              {segment.content}
            </a>
          );
        case "code":
          return (
            <code
              key={index}
              style={{
                backgroundColor: "#f0f0f0",
                padding: "2px 4px",
                borderRadius: "3px",
                fontSize: "0.9em",
              }}
            >
              {segment.content}
            </code>
          );
        case "list-item":
          // Parse inline markdown within list items
          const listInlineSegments = parseInlineMarkdown(segment.content, 0);
          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: "4px",
              }}
            >
              <span
                style={{ marginRight: "8px", minWidth: "16px", color: "#666" }}
              >
                •
              </span>
              <span>{renderSegments(listInlineSegments)}</span>
            </div>
          );
        case "numbered-item":
          // Parse inline markdown within numbered list items
          const numberedInlineSegments = parseInlineMarkdown(
            segment.content,
            0
          );
          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: "4px",
              }}
            >
              <span
                style={{ marginRight: "8px", minWidth: "20px", color: "#666" }}
              >
                {segment.number}.
              </span>
              <span>{renderSegments(numberedInlineSegments)}</span>
            </div>
          );
        case "newline":
          return <br key={index} />;
        default:
          return <span key={index}>{segment.content}</span>;
      }
    });
  };

  // Calculate total visible text length (excluding markdown syntax)
  const getTotalTextLength = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold syntax
      .replace(/\*(.*?)\*/g, "$1") // Remove italic syntax
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // Remove link syntax
      .replace(/`(.*?)`/g, "$1") // Remove code syntax
      .replace(/^[\*\-\+]\s+/gm, "") // Remove bullet points
      .replace(/^\d+\.\s+/gm, "").length; // Remove numbered list syntax
  };

  const segments = parseMarkdown(text);
  const totalLength = getTotalTextLength(text);

  useEffect(() => {
    if (currentIndex < totalLength) {
      intervalRef.current = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, speed);
    } else if (currentIndex >= totalLength && onComplete) {
      setTimeout(() => onComplete(), 100);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [currentIndex, totalLength, speed, onComplete]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [text]);

  const visibleSegments = getVisibleContent(segments, currentIndex);

  return (
    <div style={{ minHeight: "1.5em" }}>
      <div style={{ margin: "0", padding: "0" }}>
        {renderSegments(visibleSegments)}
      </div>
    </div>
  );
};

export default TypewriterMarkdown;
