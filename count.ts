export type Count = {
  _id: string;
  key: string;
  value: number;
};

export async function findCount(key: string) {
  const query = `
      query($key: String!){
        findCountByKey(key: $key) {
          key
          _id
          value
        }
      }
    `;

  const { findCountByKey } = await queryFauna(query, { key }) as {
    findCountByKey: Count | null;
  };

  return findCountByKey;
}

export async function createCount(key: string) {
  const query = `
      mutation($key: String!) {
        createCount(data: { key: $key, value:0 }) {
          _id
          key
          value
        }
      }
    `;

  const { createCount } = await queryFauna(query, { key }) as {
    createCount: Count;
  };

  return createCount;
}

export async function updateCount({ _id, key, value }: Count) {
  const query = `
      mutation($_id: ID!, $key: String!, $value: Int!) {
        updateCount(id: $_id, data: { key: $key, value: $value }) {
          _id
          key
          value
        }
      }
    `;

  const { updateCount } = await queryFauna(query, { _id, key, value }) as {
    updateCount: Count;
  };
  return updateCount;
}

/** Query FaunaDB GraphQL endpoint with the provided query and variables. */
export async function queryFauna(
  query: string,
  variables: { [key: string]: unknown },
): Promise<unknown> {
  const token = Deno.env.get("FAUNA_SECRET");
  if (!token) {
    throw new Error("environment variable FAUNA_SECRET not set");
  }

  const res = await fetch("https://graphql.fauna.com/graphql", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const { data, errors } = await res.json();
  if (errors) {
    console.error(errors);
    throw new Error(errors.map((x: Error) => x.message).join("\n"));
  }

  return data;
}
