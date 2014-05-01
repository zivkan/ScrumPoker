using System;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Microsoft.Owin;
using Microsoft.Owin.Security.Provider;
using Owin;
using ScrumPoker.Hubs;
using SimpleInjector;

[assembly: OwinStartup(typeof(ScrumPoker.Startup))]

namespace ScrumPoker
{
    public class Startup
    {
        private class MyHubActivator : IHubActivator
        {
            private readonly Container _container;

            public MyHubActivator(Container container)
            {
                _container = container;
            }

            public IHub Create(HubDescriptor descriptor)
            {
                return _container.GetInstance(descriptor.HubType) as IHub;
            }
        }

        public void Configuration(IAppBuilder app)
        {
            GlobalHost.DependencyResolver.Register(typeof(IHubActivator), ()=>new MyHubActivator(ConfigureDependancyInjector()));
            app.MapSignalR();
        }

        private Container ConfigureDependancyInjector()
        {
            var container = new Container();
            container.RegisterSingle<Lobby>(()=>new Lobby(GlobalHost.ConnectionManager.GetHubContext<LobbyHub>()));
            return container;
        }
    }
}
