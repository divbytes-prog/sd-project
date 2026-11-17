export default {
 poweredByHeader:false,
 serverExternalPackages:['pg'],
 experimental:{cpus:2,agentUpgrade:'security'},
 async headers(){return [{source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'same-origin'},{key:'X-Frame-Options',value:'DENY'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'}]}]}
};
