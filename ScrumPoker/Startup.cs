using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(ScrumPoker.Startup))]

namespace ScrumPoker
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}
