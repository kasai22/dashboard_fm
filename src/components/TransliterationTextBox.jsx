"use client";

import React, { useState, useRef, useEffect } from "react";
import googleTransliterate from "google-input-tool";

const TransliterationTextBox = ({
  value = "",
  onChange,
  placeholder = "Type here...",
  lang = "te-t-i0-und",
  limit = 5,
  isEditing = true,
}) => {
  const [text, setText] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [enabled] = useState(true);
  const [caretPos, setCaretPos] = useState({ top: 0, left: 0 });

  const textareaRef = useRef(null);
  const fetchTimer = useRef(null);
  const lastFetchedWord = useRef("");
  const applyingRef = useRef(false);

  /* ---------------- Sync external value ---------------- */
  useEffect(() => {
    setText(value ?? "");
  }, [value]);

  /* ---------------- Helpers ---------------- */
  const getCurrentWord = (input, cursorIndex) => {
    if (!input || cursorIndex == null) return "";
    const before = input.substring(0, cursorIndex);
    const match = before.match(/[^\s\n]*$/);
    return match?.[0] || "";
  };

  const getCaretCoordinates = (element, position) => {
    const div = document.createElement("div");
    const style = getComputedStyle(element);

    // Copy relevant styles
    [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "padding",
      "border",
      "boxSizing",
      "whiteSpace",
      "wordWrap",
    ].forEach((prop) => {
      div.style[prop] = style[prop];
    });

    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.width = element.offsetWidth + "px";

    const textContent = element.value.substring(0, position);
    div.textContent = textContent;

    const span = document.createElement("span");
    span.textContent = element.value.substring(position) || ".";
    div.appendChild(span);

    document.body.appendChild(div);

    const coordinates = {
      top: span.offsetTop,
      left: span.offsetLeft,
    };

    document.body.removeChild(div);
    return coordinates;
  };

  const updateCaretPosition = () => {
    if (textareaRef.current) {
      const pos = getCaretCoordinates(
        textareaRef.current,
        textareaRef.current.selectionStart
      );
      setCaretPos(pos);
    }
  };

  const fetchSuggestions = async (input, cursorIndex) => {
    if (!enabled || !isEditing) return;

    const word = getCurrentWord(input, cursorIndex).trim();
    if (!word || word === lastFetchedWord.current) return;

    lastFetchedWord.current = word;

    try {
      const resp = await googleTransliterate(
        new XMLHttpRequest(),
        word,
        lang,
        limit
      );
      // Extract first element from each array pair [word, word] -> word
      const uniqueSuggestions = (resp || [])
        .map((item) => (Array.isArray(item) ? item[0] : item))
        .filter(Boolean)
        .slice(0, limit);
      setSuggestions(uniqueSuggestions);
      setSelectedIndex(-1);
      updateCaretPosition();
    } catch {
      setSuggestions([]);
    }
  };

  const scheduleFetch = (input, cursorIndex) => {
    clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(
      () => fetchSuggestions(input, cursorIndex),
      140
    );
  };

  /* ---------------- Apply suggestion ---------------- */
  const applySuggestion = (word) => {
    if (!textareaRef.current || applyingRef.current) return;
    applyingRef.current = true;

    // Clear suggestions immediately
    setSuggestions([]);
    lastFetchedWord.current = "";

    const cursorIndex = textareaRef.current.selectionStart;
    const before = text.substring(0, cursorIndex);
    const after = text.substring(cursorIndex);

    // Find where the current word starts
    const beforeWords = before.match(/^(.*?)([^\s\n]*)$/);
    const prefix = beforeWords ? beforeWords[1] : "";

    // Build new text
    const newText = prefix + word + " " + after;
    const newCursorPos = prefix.length + word.length + 1;

    setText(newText);
    onChange?.(newText);

    // Set cursor position after state update
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        applyingRef.current = false;
      }
    });
  };

  /* ---------------- Events ---------------- */
  const handleChange = (e) => {
    if (!isEditing || applyingRef.current) return;

    const newText = e.target.value;
    setText(newText);
    onChange?.(newText);

    scheduleFetch(newText, e.target.selectionStart);
  };

  const handleKeyDown = (e) => {
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const choice =
        selectedIndex >= 0 ? suggestions[selectedIndex] : suggestions[0];
      if (choice) applySuggestion(choice);
    }
  };

  const handleClick = () => {
    updateCaretPosition();
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        readOnly={!isEditing}
        placeholder={placeholder}
        rows={6}
        className="w-full border border-gray-400 text-black rounded-lg p-4 text-lg bg-white focus:ring-2 focus:ring-blue-500 resize-none"
      />

      {suggestions.length > 0 && isEditing && (
        <ul
          className="absolute z-50 bg-white border text-black rounded shadow-md max-h-40 overflow-auto"
          style={{
            top: `${caretPos.top + 30}px`,
            left: `${caretPos.left}px`,
            minWidth: "150px",
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s + i}
              onMouseDown={(e) => {
                e.preventDefault();
                applySuggestion(s);
              }}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`px-3 py-2 cursor-pointer ${
                i === selectedIndex ? "bg-gray-200" : ""
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransliterationTextBox;
