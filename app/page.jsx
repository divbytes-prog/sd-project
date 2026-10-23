'use client';
import {useEffect} from 'react';
export default function Page(){useEffect(()=>{import('../app.mjs')},[]);return <><div id="app"><div className="empty">Connecting to InstituteConnect…</div></div><dialog id="modal"><div id="modal-content"/></dialog><div id="toast" role="status" aria-live="polite"/></>}
