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
user: IUser | null;
}

interface IUserOnQueryArguments {
id?: string | null;
}

interface IUser {
__typename: "User";
id: string;
email: string;
email_confirmed: boolean | null;
password: string;
domain: string | null;
}

interface IMutation {
__typename: "Mutation";
register: Array<IResponse> | null;
}

interface IRegisterOnMutationArguments {
email: string;
password: string;
}

interface IResponse {
__typename: "Response";
status: number;
path: string | null;
message: string;
}
}

// tslint:enable
