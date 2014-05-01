using System.EnterpriseServices;

namespace ScrumPoker.Hubs
{
    public class Participant
    {
        public string ConnectionId { get; private set; }
        public string Name { get; private set; }

        public Participant(string connectionId, string name)
        {
            ConnectionId = connectionId;
            Name = name;
        }
    }
}