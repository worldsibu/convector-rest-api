# conv-rest-api

This project is under development and will soon be integrated into the [Convector CLI](https://github.com/worldsibu/convector-cli).

This project aims to provide an easy way for generating automatically client API for Convector projects.

## How to use

To generate an API, you first need a Convector CLI generated project. Since the `conv-rest-api` is based on the Convector CLI standards and conventions, so manually projects generated may not work with it.

In the **root of your project** create a json file called `api.json`. This structure will map the smart contract to the Express API.

```json
[
    {
        "function": "<function-name>",
        "controller": "<controller-class-name>",
        "verb": "get|post|put|delete"
    },
    {
        ...
    }
]
```

### Example

If your smart contract project has the following structure:

* `./packages/participants/src/participant.controller.ts`
* `./packages/person/src/person.controller.ts`

And the controller files look like this:

#### participant.controller.ts

```ts
@Controller('participant')
export class ParticipantController extends ConvectorController {
  get fullIdentity(): ClientIdentity {
    const stub = (BaseStorage.current as any).stubHelper;
    return new ClientIdentity(stub.getStub());
  };

  @Invokable()
  public async register(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    name: string,
  ) {
      //...
  }
}
```

#### person.controller.ts

```ts
@Controller('person')
export class PersonController extends ConvectorController<ChaincodeTx> {
  @GetAll('Person')
  @Invokable()
  public async getone(
    @Param(Person)
    id: string) {
        // ...
  }
  @Create('Person')
  @Invokable()
  public async create(
    @Param(Person)
    person: Person
  ) {
      // ...
  }
}
```

Then your `api.json`

```json
[
    {
        "function": "register",
        "controller": "ParticipantController"
    },
    {
        "function": "create",
        "verb": "post",
        "controller": "PersonController"
    },
    {
        "function": "getone",
        "verb": "get",
        "controller": "PersonController"
    }
]
```

Once that's ready, globally install the `conv-rest-api` util and generate your API!

> Beware that it will *remove* and recreate a folder in your root `./packages/` folder called `server`.

```bash
npm i -g @worldsibu/conv-rest-api

# Inside your Convector CLI generated project's root
conv-rest-api generate api -c <chaincode-project-name> -f ./<chaincode-config-file>
# I.e.: conv-rest-api generate api -c person -f ./org1.person.config.json

# Compile everything
[npx] lerna bootstrap

# Start the server
[npx] lerna run start --scope server --stream
```

## Support

* For recommendations, feature requests, or bugs go to our [issues section](/issues).
* News on Convector, subscribe to our [Newsletter](https://worldsibu.tech/subscribe/).
* Need support? Chat directly with our team and the growing community, join our [Discord](https://discord.gg/twRwpWt).

## Contributions

Special thanks to Luca Tamburrano for starting this amazingly useful project for the community.
