import '../styles.css';
export const metadata={title:'InstituteConnect · Outreach workspace',description:'Institutional outreach, event approval, participation and outcomes in one secure workspace.'};
export default function RootLayout({children}){
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ic-theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
