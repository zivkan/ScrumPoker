namespace ScrumPoker.Model
{
    public class Voter
    {
        public string ConnectionId { get; private set; }
        public string Name { get; private set; }
        public string Bet { get; set; }

        public Voter(string connectionId, string name)
        {
            ConnectionId = connectionId;
            Name = name;
            Bet = null;
        }
    }
}