import { atom } from 'jotai';


const accessTokenAtom = atom<string | null>(null);

const refreshTokenAtom = atom<string | null>(null);


export { accessTokenAtom, refreshTokenAtom };