import "xterm/css/xterm.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Terminal } from "xterm";
import { AttachAddon } from "xterm-addon-attach";
import { SearchAddon } from "xterm-addon-search";
import { FitAddon } from "xterm-addon-fit";
import { WebSocketConnection, createConnection } from "./Connection";

export default function Home() {
  const terminalWrapperRef = useRef(null);
  const terminal = useMemo(
    () =>
      new Terminal({
        cursorBlink: true,
        scrollback: 1000,
        convertEol: true,
      }),
    []
  );
  const searchAddon = useRef<SearchAddon | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const socket = useRef<WebSocketConnection | null>(null);
  const websocketUrl = "ws://localhost:8088/console";

  const [search, setSearch] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    searchAddon.current?.findNext(e.target.value);
    setSearch(e.target.value);
  }

  function handleSearch() {
    if (!terminal) return;
    const arrLength = terminal?.buffer.active?.length;
    console.log(`arrLength: ${arrLength}`);

    const arr = [];
    if (!arrLength) return;
    for (let i = 0; i < arrLength; i++) {
      const line = terminal.buffer.active?.getLine(i);
      if (!line) return;
      console.log(line.translateToString());
      if (line.translateToString().toLowerCase().includes(search.toLowerCase()))
        arr.push(line.translateToString());
    }
    terminal.reset();
    for (let i = 0; i < arr.length; i++) {
      terminal.write(arr[i]);
    }
  }

  function handleReconnect() {
    if (!terminal) return;
    socket.current?.disconnect();
    // clear terminal
    terminal?.reset();
    socket.current = createConnection(websocketUrl);
    const attachAddon = new AttachAddon(socket.current.connect());
    fitAddon.current = new FitAddon();
    searchAddon.current = new SearchAddon();
    terminal.loadAddon(attachAddon);
    terminal.loadAddon(searchAddon.current);
    terminal.loadAddon(fitAddon.current);
    terminal.onResize((size) => {
      console.log(`im being resized to ${size.cols}x${size.rows}`);
    });
  }

  useEffect(() => {
    if (terminalWrapperRef.current) {
      socket.current = createConnection(websocketUrl);
      const attachAddon = new AttachAddon(socket.current.connect());
      fitAddon.current = new FitAddon();
      searchAddon.current = new SearchAddon();
      terminal.loadAddon(attachAddon);
      terminal.loadAddon(searchAddon.current);
      terminal.loadAddon(fitAddon.current);
      console.log(terminalWrapperRef.current);
      console.log(terminal);

      terminal.open(terminalWrapperRef?.current);

      window.onresize = function () {
        console.log("resize");
        fitAddon.current?.fit();
      };
    }

    return () => {
      socket.current?.disconnect();
      terminal?.dispose();
    };
  }, [terminal]);

  return (
    <div className="p-5">
      <p>search me</p>
      <input
        className="border-2 border-black p-2"
        type="text"
        value={search}
        onChange={handleChange}
      />
      <button className="border-2 border-black p-2" onClick={handleSearch}>
        search
      </button>
      <button className="border-2 border-black p-2" onClick={handleReconnect}>
        reconnect
      </button>
      <div className="flex justify-center flex-col">
        <div ref={terminalWrapperRef} />
      </div>
    </div>
  );
}
