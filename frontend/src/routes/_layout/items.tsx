import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Input,
  Table,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FiSearch } from "react-icons/fi"
import { useEffect, useState } from "react"
import { z } from "zod"

import { ItemsService } from "@/client"
import { ItemActionsMenu } from "@/components/Common/ItemActionsMenu"
import AddItem from "@/components/Items/AddItem"
import PendingItems from "@/components/Pending/PendingItems"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"
import { InputGroup } from "@/components/ui/input-group"

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
  q: z.string().optional(),
})

const PER_PAGE = 5

function getItemsQueryOptions({ page, q }: { page: number; q?: string }) {
  return {
    queryFn: () => {
      if (q && q.trim()) {
        return ItemsService.searchItems({ 
          q: q.trim(), 
          skip: (page - 1) * PER_PAGE, 
          limit: PER_PAGE 
        })
      }
      return ItemsService.readItems({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE })
    },
    queryKey: ["items", { page, q }],
  }
}

export const Route = createFileRoute("/_layout/items")({
  component: Items,
  validateSearch: (search) => itemsSearchSchema.parse(search),
})

function ItemsTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page, q } = Route.useSearch()
  const [searchInput, setSearchInput] = useState(q || "")

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getItemsQueryOptions({ page, q }),
    placeholderData: (prevData) => prevData,
  })

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== (q || "")) {
        navigate({
          search: (prev: any) => ({ 
            ...prev, 
            q: searchInput || undefined, 
            page: 1 
          }),
        })
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchInput, q, navigate])

  useEffect(() => {
    setSearchInput(q || "")
  }, [q])

  const setPage = (page: number) =>
    navigate({
      search: (prev: any) => ({ ...prev, page }),
    })

  const items = data?.data ?? []
  const count = data?.count ?? 0

  return (
    <>
      <Flex mb={4}>
        <InputGroup w="100%" maxW="md" startElement={<FiSearch />}>
          <Input
            placeholder="Search items by title or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </InputGroup>
      </Flex>
      
      {isLoading ? (
        <PendingItems />
      ) : items.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <FiSearch />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>
                {q ? `No items found for "${q}"` : "You don't have any items yet"}
              </EmptyState.Title>
              <EmptyState.Description>
                {q ? "Try adjusting your search terms" : "Add a new item to get started"}
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
        <>
          <Table.Root size={{ base: "sm", md: "md" }}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
                <Table.ColumnHeader w="sm">Title</Table.ColumnHeader>
                <Table.ColumnHeader w="sm">Description</Table.ColumnHeader>
                <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items?.map((item) => (
                <Table.Row key={item.id} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Table.Cell truncate maxW="sm">
                    {item.id}
                  </Table.Cell>
                  <Table.Cell truncate maxW="sm">
                    {item.title}
                  </Table.Cell>
                  <Table.Cell
                    color={!item.description ? "gray" : "inherit"}
                    truncate
                    maxW="30%"
                  >
                    {item.description || "N/A"}
                  </Table.Cell>
                  <Table.Cell>
                    <ItemActionsMenu item={item} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
          <Flex justifyContent="flex-end" mt={4}>
            <PaginationRoot
              count={count}
              pageSize={PER_PAGE}
              onPageChange={({ page }) => setPage(page)}
            >
              <Flex>
                <PaginationPrevTrigger />
                <PaginationItems />
                <PaginationNextTrigger />
              </Flex>
            </PaginationRoot>
          </Flex>
        </>
      )}
    </>
  )
}

function Items() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Items Management
      </Heading>
      <AddItem />
      <ItemsTable />
    </Container>
  )
}
