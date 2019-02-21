/** @module convector-core-controller */
/** @hidden */
export const getByIdMetadataKey = Symbol('getById');

/**
 * The controller decorator is used to pass the namespace context
 * to the [[Chaincode]] class.
 *
 * It's used at chaincode initialization to declare all the methods and avoid
 * method collision between controllers
 *
 * @decorator
 */
export function GetById(className:string) {
  return function (target, propertyKey, descriptor) {
    return descriptor;
  }
}
