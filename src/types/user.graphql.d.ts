// tslint:disable
// graphql typescript definitions

declare namespace GQL {
interface IGraphQLResponseRoot {
data?: IQuery | IMutation;
errors?: Array<IGraphQLResponseError>;
}

interface IGraphQLResponseError {
/** Required for all errors */
message: string;
locations?: Array<IGraphQLResponseErrorLocation>;
/** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
[propName: string]: any;
}

interface IGraphQLResponseErrorLocation {
line: number;
column: number;
}

interface IQuery {
__typename: "Query";
user: IResponse;
users: IMultipleUsersResponse;
}

interface IUserOnQueryArguments {
_id?: string | null;
}

interface IUsersOnQueryArguments {
page?: number | null;
}

interface IResponse {
__typename: "Response";
status: number;
errors: Array<IError | null> | null;
user: IUser | null;
}

interface IError {
__typename: "Error";
path: string | null;
message: string | null;
}

interface IUser {
__typename: "User";
_id: string;
email: string;
email_confirmed: boolean;
domain: string | null;
}

interface IMultipleUsersResponse {
__typename: "MultipleUsersResponse";
status: number;
errors: Array<IError | null> | null;
users: Array<IUser | null> | null;
}

interface IMutation {
__typename: "Mutation";
register: IResponse;
}

interface IRegisterOnMutationArguments {
email: string;
password: string;
}
}

// tslint:enable
