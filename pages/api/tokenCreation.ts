import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

const abiCoder = new ethers.AbiCoder();
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Define the init contract bytecode
  const initBytecode = "0x60806040526040516200127c3803806200127c8339810160408190526200002691620003f0565b620000313362000128565b85516200004690600390602089019062000297565b5084516200005c90600490602088019062000297565b506005805460ff191660ff86161790556200008a620000836000546001600160a01b031690565b8462000178565b306200009e6000546001600160a01b031690565b6001600160a01b03167f56358b41df5fa59f5639228f0930994cbdde383c8a8fd74e06c04e1deebe356260006001604051620000dc929190620004a3565b60405180910390a36040516001600160a01b0383169082156108fc029083906000818181858888f193505050501580156200011b573d6000803e3d6000fd5b5050505050505062000548565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6001600160a01b038216620001d35760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015260640160405180910390fd5b620001ef816006546200028260201b6200061a1790919060201c565b6006556001600160a01b038216600090815260016020908152604090912054620002249183906200061a62000282821b17901c565b6001600160a01b0383166000818152600160205260408082209390935591519091907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef90620002769085815260200190565b60405180910390a35050565b6000620002908284620004d0565b9392505050565b828054620002a590620004f5565b90600052602060002090601f016020900481019282620002c9576000855562000314565b82601f10620002e457805160ff191683800117855562000314565b8280016001018555821562000314579182015b8281111562000314578251825591602001919060010190620002f7565b506200032292915062000326565b5090565b5b8082111562000322576000815560010162000327565b600082601f8301126200034e578081fd5b81516001600160401b03808211156200036b576200036b62000532565b604051601f8301601f19908116603f0116810190828211818310171562000396576200039662000532565b81604052838152602092508683858801011115620003b2578485fd5b8491505b83821015620003d55785820183015181830184015290820190620003b6565b83821115620003e657848385830101525b9695505050505050565b60008060008060008060c0878903121562000409578182fd5b86516001600160401b038082111562000420578384fd5b6200042e8a838b016200033d565b9750602089015191508082111562000444578384fd5b506200045389828a016200033d565b955050604087015160ff811681146200046a578283fd5b6060880151608089015191955093506001600160a01b03811681146200048e578283fd5b8092505060a087015190509295509295509295565b6040810160088410620004c657634e487b7160e01b600052602160045260246000fd5b9281526020015290565b60008219821115620004f057634e487b7160e01b81526011600452602481fd5b500190565b600181811c908216806200050a57607f821691505b602082108114156200052c57634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052604160045260246000fd5b610d2480620005586000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c8063715018a611610097578063a9059cbb11610066578063a9059cbb1461020b578063dd62ed3e1461021e578063f2fde38b14610264578063ffa1ad741461027757600080fd5b8063715018a6146101be5780638da5cb5b146101c857806395d89b41146101f0578063a457c2d7146101f857600080fd5b806323b872dd116100d357806323b872dd1461014d578063313ce56714610160578063395093511461017557806370a082311461018857600080fd5b806306fdde03146100fa578063095ea7b31461011857806318160ddd1461013b575b600080fd5b61010261027f565b60405161010f9190610ba2565b60405180910390f35b61012b610126366004610b79565b610311565b604051901515815260200161010f565b6006545b60405190815260200161010f565b61012b61015b366004610b3e565b610327565b60055460405160ff909116815260200161010f565b61012b610183366004610b79565b61039d565b61013f610196366004610af2565b73ffffffffffffffffffffffffffffffffffffffff1660009081526001602052604090205490565b6101c66103e0565b005b60005460405173ffffffffffffffffffffffffffffffffffffffff909116815260200161010f565b610102610472565b61012b610206366004610b79565b610481565b61012b610219366004610b79565b6104dd565b61013f61022c366004610b0c565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260026020908152604080832093909416825291909152205490565b6101c6610272366004610af2565b6104ea565b61013f600181565b60606003805461028e90610c50565b80601f01602080910402602001604051908101604052809291908181526020018280546102ba90610c50565b80156103075780601f106102dc57610100808354040283529160200191610307565b820191906000526020600020905b8154815290600101906020018083116102ea57829003601f168201915b5050505050905090565b600061031e33848461062d565b50600192915050565b60006103348484846107e1565b610393843361038e85604051806060016040528060288152602001610ccb6028913973ffffffffffffffffffffffffffffffffffffffff8a1660009081526002602090815260408083203384529091529020549190610a0e565b61062d565b5060019392505050565b33600081815260026020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168452909152812054909161031e91859061038e908661061a565b60005473ffffffffffffffffffffffffffffffffffffffff163314610466576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064015b60405180910390fd5b6104706000610a54565b565b60606004805461028e90610c50565b600061031e338461038e85604051806060016040528060258152602001610cf36025913933600090815260026020908152604080832073ffffffffffffffffffffffffffffffffffffffff8d1684529091529020549190610a0e565b600061031e3384846107e1565b60005473ffffffffffffffffffffffffffffffffffffffff16331461056b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015260640161045d565b73ffffffffffffffffffffffffffffffffffffffff811661060e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f6464726573730000000000000000000000000000000000000000000000000000606482015260840161045d565b61061781610a54565b50565b60006106268284610c13565b9392505050565b73ffffffffffffffffffffffffffffffffffffffff83166106cf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460448201527f7265737300000000000000000000000000000000000000000000000000000000606482015260840161045d565b73ffffffffffffffffffffffffffffffffffffffff8216610772576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560448201527f7373000000000000000000000000000000000000000000000000000000000000606482015260840161045d565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526002602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b73ffffffffffffffffffffffffffffffffffffffff8316610884576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f6472657373000000000000000000000000000000000000000000000000000000606482015260840161045d565b73ffffffffffffffffffffffffffffffffffffffff8216610927576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201527f6573730000000000000000000000000000000000000000000000000000000000606482015260840161045d565b61097181604051806060016040528060268152602001610ca56026913973ffffffffffffffffffffffffffffffffffffffff86166000908152600160205260409020549190610a0e565b73ffffffffffffffffffffffffffffffffffffffff80851660009081526001602052604080822093909355908416815220546109ad908261061a565b73ffffffffffffffffffffffffffffffffffffffff80841660008181526001602052604090819020939093559151908516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef906107d49085815260200190565b60008184841115610a4c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161045d9190610ba2565b505050900390565b6000805473ffffffffffffffffffffffffffffffffffffffff8381167fffffffffffffffffffffffff0000000000000000000000000000000000000000831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b803573ffffffffffffffffffffffffffffffffffffffff81168114610aed57600080fd5b919050565b600060208284031215610b03578081fd5b61062682610ac9565b60008060408385031215610b1e578081fd5b610b2783610ac9565b9150610b3560208401610ac9565b90509250929050565b600080600060608486031215610b52578081fd5b610b5b84610ac9565b9250610b6960208501610ac9565b9150604084013590509250925092565b60008060408385031215610b8b578182fd5b610b9483610ac9565b946020939093013593505050565b6000602080835283518082850152825b81811015610bce57858101830151858201604001528201610bb2565b81811115610bdf5783604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016929092016040019392505050565b60008219821115610c4b577f4e487b710000000000000000000000000000000000000000000000000000000081526011600452602481fd5b500190565b600181811c90821680610c6457607f821691505b60208210811415610c9e577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b5091905056fe45524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e636545524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636545524332303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726fa164736f6c6343000804000a"

  // Get the contract constructor arguments from the request query parameters
  const name = req.query.name as string;
  const symbol = req.query.symbol as string;
  const totalSupply = req.query.totalSupply as string;

  // Check that all parameters are present and valid
  if (!name || !symbol || !totalSupply) {
    res.status(400).json({ error: 'Missing or invalid parameters' });
    return;
  }

  // encoded the constructor argumenst
  const constructorArgs = abiCoder.encode(
    ["string", "string", "uint", "uint", "address", "uint"],
    [name, symbol, "18", totalSupply, "0x222Da5f13D800Ff94947C20e8714E103822Ff716", "5000000000000000"]
  );

  // Combine the bytecode and encoded constructor arguments => Creation Bytecode
  const bytecode = initBytecode + constructorArgs.slice(2);

  // Return the input as a response
  res.status(200).json({ bytecode });
}
