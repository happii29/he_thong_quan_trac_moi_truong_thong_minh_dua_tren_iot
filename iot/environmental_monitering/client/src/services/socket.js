import io from "socket.io-client";
import { atom } from "jotai";

const socket = io("http://localhost:5000");

export const socketAtom = atom(socket);
