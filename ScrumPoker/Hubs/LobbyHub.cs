using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;

namespace ScrumPoker.Hubs
{
    public class LobbyHub : Hub
    {
        // This hub has no inbound API. It is used only for client notifications.

        public void click()
        {
            Clients.All.newMessage("clicked: " + Context.ConnectionId);
        }

        public override Task OnConnected()
        {
            Clients.All.newMessage("connection: " + Context.ConnectionId);
            return base.OnConnected();
        }

        public override Task OnDisconnected()
        {
            Clients.All.newMessage("disconnection: " + Context.ConnectionId);
            return base.OnDisconnected();
        }

        public override Task OnReconnected()
        {
            Clients.All.newMessage("reconnection: " + Context.ConnectionId);
            return base.OnReconnected();
        }

    }
}
