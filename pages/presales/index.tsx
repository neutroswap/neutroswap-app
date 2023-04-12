import { Button, Table, Fieldset, Input, Link, Note, Text, Toggle } from "@geist-ui/core";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

// WARNING: REMOVE THIS WHEN PRODUCTION READY
export function getStaticProps() {
  return {
    // returns the default 404 page with a status code of 404 in production
    notFound: process.env.NODE_ENV === 'production'
  }
}

export default function Presales() {
  const router = useRouter();

  const [isReceiverNotOwner, setReceiverNotOwner] = useState(false);
  const [isVesting, setVesting] = useState(false);

  const dataSource = [
    { property: 'type', description: 'Content type', operation: '' },
    { property: 'Component', description: 'DOM element to use', operation: '' },
    { property: <Text b>bold</Text>, description: 'Bold style', operation: '' },
  ]

  const [data, setData] = useState(dataSource);

  const renderAction = (value: any, rowData: any, rowIndex: any) => {
    const updateHandler = () => {
      setData(last => {
        return last.map((item, dataIndex) => {
          if (dataIndex !== rowIndex) return item
          return {
            ...item,
            property: Math.random().toString(16).slice(-5)
          }
        })
      })
    }
    return (
      <Button type="secondary" auto scale={1 / 3} font="12px" onClick={updateHandler}>Update</Button>
    )
  }

  return (
    <div className="min-h-screen py-10">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div>
          <Text h2 height={3}>Presales</Text>
          <Text type="secondary" p>Lock your token</Text>
        </div>
        <Button
          type="secondary"
          onClick={() => router.push('/presales/create')}
        >
          List my token
        </Button>
      </div>
      <div className="max-w-7xl mx-auto">
        <Table data={data} onChange={value => setData(value)}>
          <Table.Column prop="property" label="property" />
          <Table.Column prop="description" label="description" />
          <Table.Column prop="operation" label="operation" width={150} render={renderAction} />
        </Table>
      </div>
    </div>
  )
}
