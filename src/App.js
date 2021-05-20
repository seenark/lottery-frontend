import { useEffect, useState } from "react";

import "./App.css";
import web3 from "./web3";
import lottery from "./contracts/lottery";

function App() {
  const [manager, setManager] = useState("");
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState("");
  const [amountOfEther, setAmountOfEther] = useState("");
  const [accounts, setAccount] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    web3.eth.getAccounts().then((accs) => {
      setAccount(accs);
      console.log(accs);
    });
  }, []);

  useEffect(() => {
    async function getManager() {
      const mng = await lottery.methods.manager().call();
      const players = await lottery.methods.getPlayers().call();
      const balanceInWei = await web3.eth.getBalance(lottery.options.address);
      const balanceInEther = web3.utils.fromWei(balanceInWei, "ether");
      setManager(mng);
      setPlayers(players);
      setBalance(balanceInEther);
    }
    getManager();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();

    setMessage("Waiting a transaction success...");

    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(amountOfEther, "ether"),
      });
      setMessage("You have been entered!");
    } catch (error) {
      console.log("error", error);
      setMessage("You have been rejected!");
    }
  };

  const onClickPickWinner = async () => {
    setMessage("Waiting a transaction success...");
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[0],
      });
      setMessage("Winner was Picked, please check on your Metamask account!");
    } catch (error) {
      setMessage("Pick winner -> You have been rejected!");
    }
  };

  return (
    <div className="App">
      <h2>Lottery Contract</h2>
      <h2>Manager: {manager}</h2>
      <p>
        There are currently {players.length} people enter competing to win {balance} ether!
      </p>
      <hr></hr>
      <div>
        <h4>Want to try your luck?</h4>
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="buyLottery">Amount of Ether to enter </label>
            <input id="buyLottery" value={amountOfEther} onChange={(e) => setAmountOfEther(e.target.value)}></input>
            <button type="submit">Enter</button>
          </div>
        </form>
      </div>
      {accounts[0] === manager && (
        <>
          <hr />
          <div>
            <h3>Pick a Winner</h3>
            <button onClick={onClickPickWinner}>Pick a Winner</button>
          </div>
        </>
      )}

      <hr />
      <h3>{message}</h3>
    </div>
  );
}

export default App;
